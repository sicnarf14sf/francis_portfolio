import { useEffect, useMemo, useState, type JSX } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getPublicUrl } from "../../lib/storage";

type DbExperience = {
  id: string;
  title: string;
  org: string;
  role: string;
  date_start: string | null;
  date_end: string | null;
  thumbnail_image: string | null;
  tags: unknown;
  highlights: unknown;
  sort_order: number;
  created_at?: string;
};

type DbExperienceImage = {
  id: string;
  experience_id: string;
  path: string;
  alt: string | null;
  sort_order: number;
};

type ImageMetaUpdate = {
  alt?: string;
  sort_order?: number;
};

type UploadProgress = {
  label: string;
  percent: number;
};

const STORAGE_BUCKET = "experience-images";

const toStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? (v.filter((x) => typeof x === "string") as string[]) : [];

const slugify = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const isStoragePath = (value: string): boolean =>
  !value.startsWith("/") &&
  !value.startsWith("http://") &&
  !value.startsWith("https://");

const getImageUrl = (path: string): string => getPublicUrl(STORAGE_BUCKET, path);

export default function ExperienceAdmin(): JSX.Element {
  const [items, setItems] = useState<DbExperience[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [images, setImages] = useState<DbExperienceImage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [imgLoading, setImgLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const [title, setTitle] = useState<string>("");
  const [org, setOrg] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [dateStart, setDateStart] = useState<string>("");
  const [dateEnd, setDateEnd] = useState<string>("");
  const [isPresent, setIsPresent] = useState<boolean>(false);
  const [tagsText, setTagsText] = useState<string>("");
  const [highlightsText, setHighlightsText] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<number>(0);

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) ?? null,
    [items, selectedId],
  );

  const loadExperiences = async (): Promise<void> => {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("experience")
      .select(
        "id, title, org, role, date_start, date_end, thumbnail_image, tags, highlights, sort_order, created_at",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const rows = (data ?? []) as DbExperience[];
    setItems(rows);
    if (selectedId && !rows.some((r) => r.id === selectedId)) {
      setSelectedId(null);
    }
  };

  const loadImages = async (experienceId: string): Promise<void> => {
    setImgLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from("experience_images")
      .select("id, experience_id, path, alt, sort_order")
      .eq("experience_id", experienceId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    setImgLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setImages((data ?? []) as DbExperienceImage[]);
  };

  useEffect((): void => {
    void loadExperiences();
  }, []);

  useEffect((): void => {
    if (selectedId) {
      void loadImages(selectedId);
    } else {
      setImages([]);
      setPendingFiles([]);
      setPendingThumbnailFile(null);
      setUploadProgress(null);
    }
  }, [selectedId]);

  const uploadFileToStorage = async (
    path: string,
    file: File,
    onProgress: (percent: number) => void,
  ): Promise<void> => {
    const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL ?? "";
    const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token ?? supabaseAnonKey;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${path}`;

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);
      xhr.setRequestHeader("apikey", supabaseAnonKey);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("cache-control", "3600");
      xhr.setRequestHeader("x-upsert", "false");
      xhr.setRequestHeader(
        "Content-Type",
        file.type || "application/octet-stream",
      );

      xhr.upload.onprogress = (event: ProgressEvent<EventTarget>): void => {
        if (!event.lengthComputable) return;
        onProgress(Math.min(100, (event.loaded / event.total) * 100));
      };

      xhr.onerror = (): void => {
        reject(new Error("Upload failed while sending the file."));
      };

      xhr.onload = (): void => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve();
          return;
        }

        let message = `Upload failed with status ${xhr.status}.`;
        if (xhr.responseText) {
          try {
            const parsed = JSON.parse(xhr.responseText) as {
              error?: string;
              message?: string;
            };
            message = parsed.error ?? parsed.message ?? message;
          } catch {
            message = xhr.responseText;
          }
        }

        reject(new Error(message));
      };

      xhr.send(file);
    });
  };

  const removeStorageObject = async (path: string | null | undefined): Promise<void> => {
    if (!path || !isStoragePath(path)) return;

    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      console.warn("Storage delete failed:", error.message);
    }
  };

  const onCreate = async (): Promise<void> => {
    setErrorMsg(null);

    if (!canAddExperience) {
      setErrorMsg(
        "Please fill in Title, Organization, and Role before adding.",
      );
      return;
    }

    if (!confirmAddExperience()) return;

    const tagsArr: string[] = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const highlightsArr: string[] = highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("experience").insert({
      title: title.trim(),
      org: org.trim(),
      role: role.trim(),
      date_start: dateStart.trim() ? dateStart.trim() : null,
      date_end: isPresent ? null : dateEnd.trim() ? dateEnd.trim() : null,
      thumbnail_image: null,
      tags: tagsArr,
      highlights: highlightsArr,
      sort_order: sortOrder,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    clearForm();
    await loadExperiences();
  };

  const confirmDeleteExperience = (expTitle: string): boolean => {
    return window.confirm(
      `Delete this experience?\n\n"${expTitle}"\n\nThis will also delete its image records and thumbnail reference. This cannot be undone.`,
    );
  };

  const confirmDeleteImage = (): boolean => {
    return window.confirm(
      "Delete this image?\n\nThis will remove the database record and attempt to delete the file from storage. This cannot be undone.",
    );
  };

  const onDeleteExperience = async (id: string): Promise<void> => {
    const exp = items.find((x) => x.id === id);
    const expTitle = exp?.title ?? "Untitled";

    if (!confirmDeleteExperience(expTitle)) return;

    setErrorMsg(null);

    const imagePaths = images
      .filter((img) => img.experience_id === id && isStoragePath(img.path))
      .map((img) => img.path);

    const { error } = await supabase.from("experience").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (imagePaths.length > 0) {
      const { error: removeError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(imagePaths);
      if (removeError) {
        console.warn("Storage delete failed:", removeError.message);
      }
    }

    await removeStorageObject(exp?.thumbnail_image);

    if (selectedId === id) {
      setSelectedId(null);
    }
    await loadExperiences();
  };

  const onUploadImages = async (): Promise<void> => {
    if (!selected || pendingFiles.length === 0) return;

    setErrorMsg(null);
    setImgLoading(true);
    setUploadProgress({ label: "Uploading gallery images", percent: 0 });

    try {
      const currentMax = images.reduce(
        (max, img) => Math.max(max, img.sort_order),
        0,
      );
      let nextSort = images.length === 0 ? 1 : currentMax + 1;

      const folder = `experience/${selected.id}/${slugify(selected.title) || "images"}`;
      const totalBytes = pendingFiles.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;

      for (const file of pendingFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const path = `${folder}/${filename}`;

        await uploadFileToStorage(path, file, (percent): void => {
          const currentBytes = uploadedBytes + file.size * (percent / 100);
          const overallPercent =
            totalBytes > 0 ? (currentBytes / totalBytes) * 100 : 100;
          setUploadProgress({
            label: "Uploading gallery images",
            percent: overallPercent,
          });
        });

        const { error: insertError } = await supabase
          .from("experience_images")
          .insert({
            experience_id: selected.id,
            path,
            alt: `${selected.title} image`,
            sort_order: nextSort,
          });

        if (insertError) throw insertError;

        uploadedBytes += file.size;
        nextSort += 1;
      }

      await loadImages(selected.id);
      setPendingFiles([]);
      setUploadProgress({ label: "Uploading gallery images", percent: 100 });
    } catch (err) {
      console.error("UPLOAD ERROR FULL:", err);
      setErrorMsg(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setImgLoading(false);
      window.setTimeout(() => setUploadProgress(null), 400);
    }
  };

  const onUploadThumbnail = async (): Promise<void> => {
    if (!selected || !pendingThumbnailFile) return;

    setErrorMsg(null);
    setImgLoading(true);
    setUploadProgress({ label: "Uploading thumbnail", percent: 0 });

    const oldThumbnailPath = selected.thumbnail_image;

    try {
      const ext =
        pendingThumbnailFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `thumbnail-${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
      const path = `experience/${selected.id}/${slugify(selected.title) || "images"}/thumbnail/${filename}`;

      await uploadFileToStorage(path, pendingThumbnailFile, (percent): void => {
        setUploadProgress({ label: "Uploading thumbnail", percent });
      });

      const { error } = await supabase
        .from("experience")
        .update({ thumbnail_image: path })
        .eq("id", selected.id);

      if (error) throw error;

      if (oldThumbnailPath && oldThumbnailPath !== path) {
        await removeStorageObject(oldThumbnailPath);
      }

      setPendingThumbnailFile(null);
      await loadExperiences();
      setUploadProgress({ label: "Uploading thumbnail", percent: 100 });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Thumbnail upload failed.");
    } finally {
      setImgLoading(false);
      window.setTimeout(() => setUploadProgress(null), 400);
    }
  };

  const onRemoveThumbnail = async (): Promise<void> => {
    if (!selected?.thumbnail_image) return;

    const confirmed = window.confirm(
      `Remove the thumbnail for "${selected.title}"?\n\nThis will clear the thumbnail field and attempt to delete the file from storage.`,
    );
    if (!confirmed) return;

    setErrorMsg(null);
    setImgLoading(true);

    try {
      const currentThumbnail = selected.thumbnail_image;
      const { error } = await supabase
        .from("experience")
        .update({ thumbnail_image: null })
        .eq("id", selected.id);

      if (error) throw error;

      await removeStorageObject(currentThumbnail);
      await loadExperiences();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to remove thumbnail.");
    } finally {
      setImgLoading(false);
    }
  };

  const onDeleteImage = async (img: DbExperienceImage): Promise<void> => {
    if (!confirmDeleteImage()) return;
    if (!selected) return;

    setErrorMsg(null);
    setImgLoading(true);

    try {
      const { error: delRowErr } = await supabase
        .from("experience_images")
        .delete()
        .eq("id", img.id);

      if (delRowErr) throw delRowErr;

      await removeStorageObject(img.path);
      await loadImages(selected.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const loadSelectedIntoForm = (): void => {
    if (!selected) return;

    setTitle(selected.title);
    setOrg(selected.org);
    setRole(selected.role);
    setDateStart(selected.date_start ?? "");
    setDateEnd(selected.date_end ?? "");
    setIsPresent(selected.date_end === null);
    setTagsText(toStringArray(selected.tags).join(", "));
    setHighlightsText(toStringArray(selected.highlights).join("\n"));
    setSortOrder(selected.sort_order ?? 0);
    setEditLoaded(true);
    setErrorMsg(null);
  };

  const onUpdateSelected = async (): Promise<void> => {
    if (!selected) return;

    if (!editLoaded) {
      setErrorMsg('Click "Load selected into form" before updating.');
      return;
    }

    if (!hasExperienceChanges()) {
      setErrorMsg("No changes detected. Edit the fields first before updating.");
      return;
    }

    if (!confirmUpdateExperience(selected.title)) return;

    setErrorMsg(null);

    const tagsArr: string[] = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const highlightsArr: string[] = highlightsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("experience")
      .update({
        title: title.trim(),
        org: org.trim(),
        role: role.trim(),
        date_start: dateStart.trim() ? dateStart.trim() : null,
        date_end: isPresent ? null : dateEnd.trim() ? dateEnd.trim() : null,
        tags: tagsArr,
        highlights: highlightsArr,
        sort_order: sortOrder,
      })
      .eq("id", selected.id);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await loadExperiences();
    setErrorMsg("Experience updated successfully.");
    setEditLoaded(false);
  };

  const onUpdateImageMeta = async (
    imageId: string,
    patch: ImageMetaUpdate,
  ): Promise<void> => {
    if (!selected) return;
    setErrorMsg(null);

    const payload: Record<string, unknown> = {};
    if (patch.alt !== undefined) {
      payload.alt = patch.alt.trim() ? patch.alt.trim() : null;
    }
    if (patch.sort_order !== undefined && Number.isFinite(patch.sort_order)) {
      payload.sort_order = patch.sort_order;
    }

    const { error } = await supabase
      .from("experience_images")
      .update(payload)
      .eq("id", imageId);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await loadImages(selected.id);
  };

  const swapImageOrder = async (
    a: DbExperienceImage,
    b: DbExperienceImage,
  ): Promise<void> => {
    if (!selected) return;
    setErrorMsg(null);
    setImgLoading(true);

    try {
      const { error: errA } = await supabase
        .from("experience_images")
        .update({ sort_order: b.sort_order })
        .eq("id", a.id);

      if (errA) throw errA;

      const { error: errB } = await supabase
        .from("experience_images")
        .update({ sort_order: a.sort_order })
        .eq("id", b.id);

      if (errB) throw errB;

      await loadImages(selected.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Reorder failed.");
    } finally {
      setImgLoading(false);
    }
  };

  const confirmUpdateExperience = (expTitle: string): boolean => {
    return window.confirm(
      `Update this experience?\n\n"${expTitle}"\n\nThis will overwrite the saved record.`,
    );
  };

  const clearForm = (): void => {
    setTitle("");
    setOrg("");
    setRole("");
    setDateStart("");
    setDateEnd("");
    setIsPresent(false);
    setTagsText("");
    setHighlightsText("");
    setSortOrder(0);
    setPendingFiles([]);
    setPendingThumbnailFile(null);
    setEditLoaded(false);
    setErrorMsg(null);
  };

  const normalizeCsv = (s: string): string =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .join(",");

  const normalizeLines = (s: string): string =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .join("\n");

  const hasExperienceChanges = (): boolean => {
    if (!selected) return false;

    const selectedTags = toStringArray(selected.tags).join(",");
    const selectedHighlights = toStringArray(selected.highlights).join("\n");

    return (
      title.trim() !== selected.title.trim() ||
      org.trim() !== selected.org.trim() ||
      role.trim() !== selected.role.trim() ||
      (dateStart.trim() || "") !== (selected.date_start ?? "") ||
      isPresent !== (selected.date_end === null) ||
      (!isPresent && (dateEnd.trim() || "") !== (selected.date_end ?? "")) ||
      normalizeCsv(tagsText) !== selectedTags ||
      normalizeLines(highlightsText) !== selectedHighlights ||
      Number(sortOrder) !== Number(selected.sort_order)
    );
  };

  const [editLoaded, setEditLoaded] = useState<boolean>(false);
  const canUpdate: boolean =
    Boolean(selected) && editLoaded && hasExperienceChanges();

  useEffect((): void => {
    setEditLoaded(false);
  }, [selectedId]);

  const isBlank = (s: string): boolean => s.trim().length === 0;
  const canAddExperience: boolean =
    !isBlank(title) && !isBlank(org) && !isBlank(role);

  const confirmAddExperience = (): boolean => {
    return window.confirm(
      `Add this experience?\n\nTitle: ${title || "(empty)"}\nOrg: ${org || "(empty)"}\nRole: ${role || "(empty)"}\nEnd date: ${isPresent ? "Present" : dateEnd || "(empty)"}\n\nThis will create a new record.`,
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Add / Edit Experience</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tags: comma-separated. Highlights: one per line.
          </p>

          {errorMsg ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMsg}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e): void => setTitle(e.target.value)}
            />
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Organization"
              value={org}
              onChange={(e): void => setOrg(e.target.value)}
            />
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Role"
              value={role}
              onChange={(e): void => setRole(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-xl border px-3 py-2 text-sm"
                type="date"
                value={dateStart}
                onChange={(e): void => setDateStart(e.target.value)}
              />
              <input
                className="w-full rounded-xl border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                type="date"
                value={dateEnd}
                disabled={isPresent}
                onChange={(e): void => setDateEnd(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isPresent}
                onChange={(e): void => {
                  const checked = e.target.checked;
                  setIsPresent(checked);
                  if (checked) setDateEnd("");
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>Mark this experience as Present</span>
            </label>

            <textarea
              className="w-full rounded-xl border px-3 py-2 text-sm"
              rows={3}
              placeholder="Tags (comma-separated) e.g. React, Django, RAG"
              value={tagsText}
              onChange={(e): void => setTagsText(e.target.value)}
            />

            <textarea
              className="w-full rounded-xl border px-3 py-2 text-sm"
              rows={6}
              placeholder={
                "Highlights (one per line)\nDesigned...\nBuilt...\nDeployed..."
              }
              value={highlightsText}
              onChange={(e): void => setHighlightsText(e.target.value)}
            />

            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              type="number"
              placeholder="Sort order"
              value={sortOrder}
              onChange={(e): void => setSortOrder(Number(e.target.value))}
            />

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <button
                disabled={!canAddExperience}
                onClick={(): void => void onCreate()}
                className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  canAddExperience
                    ? "bg-gray-900 text-white hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                Add Experience
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="w-full rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Clear form
              </button>

              <button
                type="button"
                onClick={loadSelectedIntoForm}
                className="w-full rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              >
                Load selected into form
              </button>

              <button
                type="button"
                disabled={!canUpdate}
                onClick={(): void => void onUpdateSelected()}
                className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition md:col-span-2 ${
                  canUpdate
                    ? "bg-gray-900 text-white hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {!selected
                  ? "Select an experience to edit"
                  : !editLoaded
                    ? "Load selected into form first"
                    : !hasExperienceChanges()
                      ? "No changes to update"
                      : "Update selected experience"}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Experiences</h2>
              <p className="mt-1 text-sm text-gray-600">
                Select one to manage its images.
              </p>
            </div>
            <button
              onClick={(): void => void loadExperiences()}
              className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-4 text-sm text-gray-600">Loading...</div>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((it) => {
                const active = it.id === selectedId;
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={(): void =>
                      setSelectedId((prev) => (prev === it.id ? null : it.id))
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active ? "border-gray-900 bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{it.title}</div>
                        <div className="text-sm text-gray-600">
                          {it.org} • {it.role}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {it.thumbnail_image ? (
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Thumbnail set
                            </span>
                          ) : (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              No thumbnail
                            </span>
                          )}
                          {toStringArray(it.tags)
                            .slice(0, 8)
                            .map((t) => (
                              <span
                                key={t}
                                className="rounded-full border bg-white px-2 py-0.5 text-xs font-medium text-gray-700"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e): void => {
                          e.stopPropagation();
                          void onDeleteExperience(it.id);
                        }}
                        className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Experience Media</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage the separate thumbnail and the detail gallery images.
        </p>

        {!selected ? (
          <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
            Select an experience to manage its media.
          </div>
        ) : (
          <>
            <div className="mt-4">
              <div className="text-sm font-semibold text-gray-800">
                Selected:
              </div>
              <div className="text-sm text-gray-700">{selected.title}</div>
            </div>

            <div className="mt-5 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Thumbnail image
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Used only for the experience card preview on the public site.
                  </p>
                </div>
                {selected.thumbnail_image ? (
                  <button
                    type="button"
                    onClick={(): void => void onRemoveThumbnail()}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Remove thumbnail
                  </button>
                ) : null}
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border bg-gray-50">
                {selected.thumbnail_image ? (
                  <img
                    src={getImageUrl(selected.thumbnail_image)}
                    alt={`${selected.title} thumbnail`}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-gray-500">
                    No thumbnail uploaded yet.
                  </div>
                )}
              </div>

              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e): void =>
                    setPendingThumbnailFile(e.target.files?.[0] ?? null)
                  }
                />
                {pendingThumbnailFile
                  ? pendingThumbnailFile.name
                  : "Choose thumbnail image"}
              </label>

              <button
                type="button"
                disabled={!pendingThumbnailFile || imgLoading}
                onClick={(): void => void onUploadThumbnail()}
                className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  pendingThumbnailFile && !imgLoading
                    ? "bg-gray-900 text-white shadow-sm hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {imgLoading && pendingThumbnailFile
                  ? "Uploading thumbnail..."
                  : "Upload thumbnail"}
              </button>
            </div>

            <div className="mt-5 rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Gallery images
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                These images appear in the experience detail page carousel.
              </p>

              <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e): void =>
                    setPendingFiles(e.target.files ? Array.from(e.target.files) : [])
                  }
                />
                {pendingFiles.length > 0
                  ? `${pendingFiles.length} image${pendingFiles.length === 1 ? "" : "s"} selected`
                  : "Choose gallery files"}
              </label>

              <button
                type="button"
                disabled={pendingFiles.length === 0 || imgLoading}
                onClick={(): void => void onUploadImages()}
                className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  pendingFiles.length > 0 && !imgLoading
                    ? "bg-gray-900 text-white shadow-sm hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                {imgLoading && pendingFiles.length > 0
                  ? "Uploading gallery..."
                  : "Upload gallery images"}
              </button>

              {pendingFiles.length > 0 ? (
                <div className="mt-2 rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  {pendingFiles.map((file) => file.name).join(", ")}
                </div>
              ) : null}

              <p className="mt-2 text-xs text-gray-500">
                Stored in <span className="font-mono">{STORAGE_BUCKET}</span>.
              </p>
            </div>

            {uploadProgress ? (
              <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                  <span>{uploadProgress.label}</span>
                  <span>{Math.round(uploadProgress.percent)}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
              </div>
            ) : null}

            {imgLoading && !uploadProgress ? (
              <div className="mt-4 text-sm text-gray-600">Working...</div>
            ) : null}

            <div className="mt-4 space-y-3">
              {images.length === 0 ? (
                <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                  No gallery images yet.
                </div>
              ) : (
                images.map((img, idx) => (
                  <div key={img.id} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-600">
                        Order: <span className="font-semibold">{img.sort_order}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(): void =>
                            void swapImageOrder(img, images[idx - 1])
                          }
                          className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={(): void =>
                            void swapImageOrder(img, images[idx + 1])
                          }
                          className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={(): void => void onDeleteImage(img)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 overflow-hidden rounded-lg border bg-gray-50">
                      <img
                        src={getImageUrl(img.path)}
                        alt={img.alt ?? "Experience image"}
                        className="h-40 w-full object-cover"
                        onError={(e): void => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <input
                      className="mt-2 w-full rounded-lg border px-3 py-2 text-xs"
                      defaultValue={img.alt ?? ""}
                      placeholder="Alt text"
                      onBlur={(e): void =>
                        void onUpdateImageMeta(img.id, { alt: e.target.value })
                      }
                    />

                    <input
                      className="mt-2 w-full rounded-lg border px-3 py-2 text-xs"
                      type="number"
                      defaultValue={img.sort_order}
                      placeholder="Sort order"
                      onBlur={(e): void =>
                        void onUpdateImageMeta(img.id, {
                          sort_order: Number(e.target.value),
                        })
                      }
                    />

                    <div className="mt-2 break-all text-xs text-gray-500">
                      {img.path}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
