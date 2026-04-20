import { useEffect, useState, type JSX } from "react";
import { supabase } from "../../lib/supabaseClient";
import { getPublicUrl } from "../../lib/storage";
import { validateImageFiles, validateModelFile } from "../../lib/uploadValidation";
import type { SampleOutputKind } from "../../types";

type DbAboutPageContent = {
  id: number;
  title: string | null;
  intro: string | null;
  updated_at?: string | null;
};

type DbAboutPhoto = {
  id: string;
  path: string;
  alt: string | null;
  sort_order: number;
};

type DbCertificate = {
  id: string;
  title: string;
  org: string;
  year: number;
  subtitle: string | null;
  location: string | null;
  image_path: string;
  sort_order: number;
};

type DbAboutOutput = {
  id: string;
  kind: SampleOutputKind;
  title: string;
  description: string | null;
  tags: unknown;
  image_path: string | null;
  image_alt: string | null;
  link_url: string | null;
  model_key: string | null;
  model_path: string | null;
  model_bucket: string | null;
  sort_order: number;
};

type UploadProgress = {
  label: string;
  percent: number;
};

const ABOUT_BUCKET = "about";
const CERTIFICATES_BUCKET = "certificates";
const ABOUT_PHOTOS_FOLDER = "photos";
const ABOUT_MODELS_FOLDER = "3d_models";
const ABOUT_MEDIA_FOLDER = "images_designs";

const isStoragePath = (value: string): boolean =>
  !value.startsWith("/") &&
  !value.startsWith("http://") &&
  !value.startsWith("https://");

const slugify = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getBucketImageUrl = (bucket: string, path: string): string =>
  getPublicUrl(bucket, path);

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? (value.filter((x) => typeof x === "string") as string[]) : [];

const parseTags = (value: string): string[] =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildOutputId = (kind: SampleOutputKind, title: string): string =>
  `${kind}-${slugify(title) || "item"}`;

const buildAboutFolderPath = (
  folder: string,
  itemId: string,
  filename: string,
): string => `${folder}/${slugify(itemId) || "item"}/${filename}`;

const getOutputActionLabel = (
  kind: SampleOutputKind,
  isEditing: boolean,
): string => {
  if (kind === "3d") {
    return isEditing ? "Save 3D item" : "Create 3D item";
  }

  if (kind === "image") {
    return isEditing ? "Save image/design item" : "Create image/design item";
  }

  return isEditing ? "Save project/app link" : "Create project/app link";
};

const getOutputWorkflowCopy = (kind: SampleOutputKind): string => {
  if (kind === "3d") {
    return "Add the title and details, choose the 3D model file, optionally add a preview image, then click Save 3D item once. The upload and database save happen together.";
  }

  if (kind === "image") {
    return "Add the title and details, choose the image or design file, then save the item. The file upload and database save happen together.";
  }

  return "Add the title and link, then save the item. No file upload is needed for this type.";
};

const getOutputKindLabel = (kind: SampleOutputKind): string => {
  if (kind === "3d") return "3D models";
  if (kind === "image") return "Images / designs";
  return "Project links";
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      error_description?: unknown;
    };

    const parts = [
      maybeError.message,
      maybeError.details,
      maybeError.hint,
      maybeError.error_description,
    ]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .map((part) => part.trim());

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return fallback;
};

export default function AboutAdmin(): JSX.Element {
  const [contentRowId, setContentRowId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [intro, setIntro] = useState<string>("");

  const [photos, setPhotos] = useState<DbAboutPhoto[]>([]);
  const [pendingPhotoFiles, setPendingPhotoFiles] = useState<File[]>([]);

  const [certificates, setCertificates] = useState<DbCertificate[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(
    null,
  );
  const [certificateTitle, setCertificateTitle] = useState<string>("");
  const [certificateOrg, setCertificateOrg] = useState<string>("");
  const [certificateYear, setCertificateYear] = useState<string>("");
  const [certificateSubtitle, setCertificateSubtitle] = useState<string>("");
  const [certificateLocation, setCertificateLocation] = useState<string>("");
  const [certificateSortOrder, setCertificateSortOrder] = useState<number>(0);
  const [certificateImagePath, setCertificateImagePath] = useState<string | null>(
    null,
  );
  const [pendingCertificateImage, setPendingCertificateImage] =
    useState<File | null>(null);

  const [outputs, setOutputs] = useState<DbAboutOutput[]>([]);
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null);
  const [outputId, setOutputId] = useState<string>("");
  const [outputKind, setOutputKind] = useState<SampleOutputKind>("3d");
  const [outputTitle, setOutputTitle] = useState<string>("");
  const [outputDescription, setOutputDescription] = useState<string>("");
  const [outputTags, setOutputTags] = useState<string>("");
  const [outputLinkUrl, setOutputLinkUrl] = useState<string>("");
  const [outputModelPath, setOutputModelPath] = useState<string>("");
  const [pendingModelFile, setPendingModelFile] = useState<File | null>(null);
  const [outputImageAlt, setOutputImageAlt] = useState<string>("");
  const [outputSortOrder, setOutputSortOrder] = useState<number>(0);
  const [outputImagePath, setOutputImagePath] = useState<string | null>(null);
  const [pendingOutputImage, setPendingOutputImage] = useState<File | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [savingContent, setSavingContent] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const filteredOutputs = outputs.filter((output) => output.kind === outputKind);

  const onSelectPhotoFiles = (files: File[]): void => {
    const result = validateImageFiles(files, "About photos");
    if (!result.ok) {
      setErrorMsg(result.error);
      setPendingPhotoFiles([]);
      return;
    }

    setErrorMsg(null);
    setPendingPhotoFiles(files);
  };

  const onSelectCertificateImage = (file: File | null): void => {
    const result = validateImageFiles(file ? [file] : [], "Certificate image");
    if (!result.ok) {
      setErrorMsg(result.error);
      setPendingCertificateImage(null);
      return;
    }

    setErrorMsg(null);
    setPendingCertificateImage(file);
  };

  const onSelectOutputImage = (file: File | null, label: string): void => {
    const result = validateImageFiles(file ? [file] : [], label);
    if (!result.ok) {
      setErrorMsg(result.error);
      setPendingOutputImage(null);
      return;
    }

    setErrorMsg(null);
    setPendingOutputImage(file);
  };

  const onSelectModelFile = (file: File | null): void => {
    const result = validateModelFile(file, "3D model");
    if (!result.ok) {
      setErrorMsg(result.error);
      setPendingModelFile(null);
      return;
    }

    setErrorMsg(null);
    setPendingModelFile(file);
  };

  const loadAboutContent = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("about_page_content")
      .select("id, title, intro, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    const row = data as DbAboutPageContent | null;
    setContentRowId(row?.id ?? null);
    setTitle(row?.title ?? "About Me");
    setIntro(row?.intro ?? "");
  };

  const loadPhotos = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("about_photos")
      .select("id, path, alt, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setPhotos((data ?? []) as DbAboutPhoto[]);
  };

  const loadCertificates = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("certificates")
      .select("id, title, org, year, subtitle, location, image_path, sort_order")
      .order("year", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setCertificates((data ?? []) as DbCertificate[]);
  };

  const loadOutputs = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("about_outputs")
      .select(
        "id, kind, title, description, tags, image_path, image_alt, link_url, model_key, model_path, model_bucket, sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setOutputs((data ?? []) as DbAboutOutput[]);
  };

  useEffect((): void => {
    void (async (): Promise<void> => {
      setLoading(true);
      setErrorMsg(null);
      await Promise.all([
        loadAboutContent(),
        loadPhotos(),
        loadCertificates(),
        loadOutputs(),
      ]);
      setLoading(false);
    })();
  }, []);

  const refreshAll = async (): Promise<void> => {
    setErrorMsg(null);
    setSuccessMsg(null);
    await Promise.all([
      loadAboutContent(),
      loadPhotos(),
      loadCertificates(),
      loadOutputs(),
    ]);
  };

  const uploadFileToBucket = async (
    bucket: string,
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
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

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

  const removeStorageObject = async (
    bucket: string,
    path: string | null | undefined,
  ): Promise<void> => {
    if (!path || !isStoragePath(path)) return;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.warn("Storage delete failed:", error.message);
    }
  };

  const onSaveContent = async (): Promise<void> => {
    setSavingContent(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      title: title.trim() || "About Me",
      intro: intro.trim(),
      updated_at: new Date().toISOString(),
    };

    let error: Error | null = null;

    if (contentRowId !== null) {
      const result = await supabase
        .from("about_page_content")
        .update(payload)
        .eq("id", contentRowId);
      error = result.error;
    } else {
      const result = await supabase
        .from("about_page_content")
        .insert(payload)
        .select("id")
        .single();
      error = result.error;
      if (!result.error && result.data) {
        setContentRowId(result.data.id as number);
      }
    }

    setSavingContent(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("About page content saved.");
    await loadAboutContent();
  };

  const onUploadPhotos = async (): Promise<void> => {
    if (pendingPhotoFiles.length === 0) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUploadProgress({ label: "Uploading About photos", percent: 0 });

    try {
      const currentMax = photos.reduce(
        (max, photo) => Math.max(max, photo.sort_order),
        0,
      );
      let nextSort = photos.length === 0 ? 1 : currentMax + 1;
      const totalBytes = pendingPhotoFiles.reduce((sum, file) => sum + file.size, 0);
      let uploadedBytes = 0;
      const folder = `${ABOUT_PHOTOS_FOLDER}/${slugify(title) || "gallery"}`;

      for (const file of pendingPhotoFiles) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const path = `${folder}/${filename}`;

        await uploadFileToBucket(ABOUT_BUCKET, path, file, (percent): void => {
          const currentBytes = uploadedBytes + file.size * (percent / 100);
          const overallPercent =
            totalBytes > 0 ? (currentBytes / totalBytes) * 100 : 100;
          setUploadProgress({
            label: "Uploading About photos",
            percent: overallPercent,
          });
        });

        const { error: insertError } = await supabase.from("about_photos").insert({
          path,
          alt: file.name.replace(/\.[^.]+$/, ""),
          sort_order: nextSort,
        });

        if (insertError) throw insertError;
        uploadedBytes += file.size;
        nextSort += 1;
      }

      setPendingPhotoFiles([]);
      setSuccessMsg("About photos uploaded.");
      await loadPhotos();
      setUploadProgress({ label: "Uploading About photos", percent: 100 });
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Photo upload failed."));
    } finally {
      setBusy(false);
      window.setTimeout(() => setUploadProgress(null), 400);
    }
  };

  const onDeletePhoto = async (photo: DbAboutPhoto): Promise<void> => {
    const confirmed = window.confirm(
      `Delete this About photo?\n\n"${photo.alt ?? photo.path}"\n\nThis will remove the row and attempt to delete the file from storage.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.from("about_photos").delete().eq("id", photo.id);
      if (error) throw error;

      await removeStorageObject(ABOUT_BUCKET, photo.path);
      await loadPhotos();
      setSuccessMsg("About photo deleted.");
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Delete failed."));
    } finally {
      setBusy(false);
    }
  };

  const onUpdatePhotoMeta = async (
    photoId: string,
    patch: { alt?: string; sort_order?: number },
  ): Promise<void> => {
    const payload: Record<string, unknown> = {};
    if (patch.alt !== undefined) {
      payload.alt = patch.alt.trim() ? patch.alt.trim() : null;
    }
    if (patch.sort_order !== undefined && Number.isFinite(patch.sort_order)) {
      payload.sort_order = patch.sort_order;
    }

    const { error } = await supabase
      .from("about_photos")
      .update(payload)
      .eq("id", photoId);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await loadPhotos();
  };

  const swapPhotoOrder = async (
    first: DbAboutPhoto,
    second: DbAboutPhoto,
  ): Promise<void> => {
    setBusy(true);
    setErrorMsg(null);

    try {
      const { error: firstError } = await supabase
        .from("about_photos")
        .update({ sort_order: second.sort_order })
        .eq("id", first.id);
      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("about_photos")
        .update({ sort_order: first.sort_order })
        .eq("id", second.id);
      if (secondError) throw secondError;

      await loadPhotos();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Reorder failed."));
    } finally {
      setBusy(false);
    }
  };

  const clearCertificateForm = (): void => {
    setSelectedCertificateId(null);
    setCertificateTitle("");
    setCertificateOrg("");
    setCertificateYear("");
    setCertificateSubtitle("");
    setCertificateLocation("");
    setCertificateSortOrder(0);
    setCertificateImagePath(null);
    setPendingCertificateImage(null);
  };

  const loadCertificateIntoForm = (certificate: DbCertificate): void => {
    setSelectedCertificateId(certificate.id);
    setCertificateTitle(certificate.title);
    setCertificateOrg(certificate.org);
    setCertificateYear(String(certificate.year));
    setCertificateSubtitle(certificate.subtitle ?? "");
    setCertificateLocation(certificate.location ?? "");
    setCertificateSortOrder(certificate.sort_order);
    setCertificateImagePath(certificate.image_path);
    setPendingCertificateImage(null);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const onSaveCertificate = async (): Promise<void> => {
    if (!certificateTitle.trim() || !certificateOrg.trim() || !certificateYear.trim()) {
      setErrorMsg("Certificate title, organization, and year are required.");
      return;
    }

    if (!selectedCertificateId && !pendingCertificateImage) {
      setErrorMsg("Choose a certificate image before creating a new row.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let nextImagePath = certificateImagePath;

    try {
      if (pendingCertificateImage) {
        const ext =
          pendingCertificateImage.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const path = `certificates/${slugify(certificateTitle) || "certificate"}/${filename}`;

        setUploadProgress({ label: "Uploading certificate image", percent: 0 });
        await uploadFileToBucket(
          CERTIFICATES_BUCKET,
          path,
          pendingCertificateImage,
          (percent): void => {
            setUploadProgress({ label: "Uploading certificate image", percent });
          },
        );

        if (certificateImagePath && certificateImagePath !== path) {
          await removeStorageObject(CERTIFICATES_BUCKET, certificateImagePath);
        }
        nextImagePath = path;
      }

      const payload = {
        title: certificateTitle.trim(),
        org: certificateOrg.trim(),
        year: Number(certificateYear),
        subtitle: certificateSubtitle.trim() || null,
        location: certificateLocation.trim() || null,
        image_path: nextImagePath,
        sort_order: certificateSortOrder,
      };

      if (!payload.image_path) {
        throw new Error("Certificate image path is required.");
      }

      if (selectedCertificateId) {
        const { error } = await supabase
          .from("certificates")
          .update(payload)
          .eq("id", selectedCertificateId);
        if (error) throw error;
        setSuccessMsg("Certificate updated.");
      } else {
        const { error } = await supabase.from("certificates").insert(payload);
        if (error) throw error;
        setSuccessMsg("Certificate created.");
      }

      clearCertificateForm();
      await loadCertificates();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Certificate save failed."));
    } finally {
      setBusy(false);
      window.setTimeout(() => setUploadProgress(null), 400);
    }
  };

  const onDeleteCertificate = async (certificate: DbCertificate): Promise<void> => {
    const confirmed = window.confirm(
      `Delete this certificate?\n\n"${certificate.title}"\n\nThis will remove the row and attempt to delete the image from storage.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certificate.id);
      if (error) throw error;

      await removeStorageObject(CERTIFICATES_BUCKET, certificate.image_path);
      if (selectedCertificateId === certificate.id) clearCertificateForm();
      await loadCertificates();
      setSuccessMsg("Certificate deleted.");
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Delete failed."));
    } finally {
      setBusy(false);
    }
  };

  const clearOutputForm = (): void => {
    setSelectedOutputId(null);
    setOutputId("");
    setOutputKind("3d");
    setOutputTitle("");
    setOutputDescription("");
    setOutputTags("");
    setOutputLinkUrl("");
    setOutputModelPath("");
    setPendingModelFile(null);
    setOutputImageAlt("");
    setOutputSortOrder(0);
    setOutputImagePath(null);
    setPendingOutputImage(null);
  };

  const loadOutputIntoForm = (output: DbAboutOutput): void => {
    setSelectedOutputId(output.id);
    setOutputId(output.id);
    setOutputKind(output.kind);
    setOutputTitle(output.title);
    setOutputDescription(output.description ?? "");
    setOutputTags(toStringArray(output.tags).join(", "));
    setOutputLinkUrl(output.link_url ?? "");
    setOutputModelPath(output.model_path ?? "");
    setPendingModelFile(null);
    setOutputImageAlt(output.image_alt ?? "");
    setOutputSortOrder(output.sort_order);
    setOutputImagePath(output.image_path);
    setPendingOutputImage(null);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const saveOutputRecord = async (
    input: {
      imagePath?: string | null;
      modelPath?: string | null;
    } = {},
  ): Promise<void> => {
    const resolvedId =
      selectedOutputId ??
      (outputId.trim() || buildOutputId(outputKind, outputTitle));
    const resolvedImagePath =
      input.imagePath !== undefined ? input.imagePath : outputImagePath;
    const resolvedModelPath =
      input.modelPath !== undefined ? input.modelPath : outputModelPath;

    if (!resolvedId || !outputTitle.trim()) {
      throw new Error("A title is required before saving this output.");
    }

    const payload = {
      id: resolvedId,
      kind: outputKind,
      title: outputTitle.trim(),
      description: outputDescription.trim() || null,
      tags: parseTags(outputTags),
      image_path: resolvedImagePath,
      image_alt: outputImageAlt.trim() || null,
      link_url: outputLinkUrl.trim() || null,
      model_key: outputKind === "3d" ? resolvedId : null,
      model_path: outputKind === "3d" ? resolvedModelPath?.trim() || null : null,
      model_bucket:
        outputKind === "3d" &&
        resolvedModelPath &&
        !resolvedModelPath.startsWith("http")
          ? ABOUT_BUCKET
          : null,
      sort_order: outputSortOrder,
    };

    if (selectedOutputId) {
      const { error } = await supabase
        .from("about_outputs")
        .update(payload)
        .eq("id", selectedOutputId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("about_outputs").insert(payload);
      if (error) throw error;
    }
  };

  const onSaveOutput = async (): Promise<void> => {
    if (!outputTitle.trim()) {
      setErrorMsg("A title is required.");
      return;
    }

    if (outputKind === "image" && !pendingOutputImage && !outputImagePath) {
      setErrorMsg("Image/design entries need an image.");
      return;
    }

    if (outputKind === "3d" && !pendingModelFile && !outputModelPath.trim()) {
      setErrorMsg("3D entries need either a chosen model file or an existing model path.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let nextImagePath = outputImagePath;
    let nextModelPath = outputModelPath;

    try {
      if (outputKind === "3d" && pendingModelFile) {
        const ext = pendingModelFile.name.split(".").pop()?.toLowerCase() ?? "glb";
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const resolvedId =
          selectedOutputId ??
          (outputId.trim() || buildOutputId("3d", outputTitle));
        const path = buildAboutFolderPath(
          ABOUT_MODELS_FOLDER,
          resolvedId || "model",
          filename,
        );

        setUploadProgress({ label: "Uploading 3D model", percent: 0 });
        await uploadFileToBucket(
          ABOUT_BUCKET,
          path,
          pendingModelFile,
          (percent): void => {
            setUploadProgress({ label: "Uploading 3D model", percent });
          },
        );

        if (
          outputModelPath &&
          outputModelPath !== path &&
          !outputModelPath.startsWith("http")
        ) {
          await removeStorageObject(ABOUT_BUCKET, outputModelPath);
        }

        nextModelPath = path;
        setOutputModelPath(path);
        setOutputId(resolvedId);
      }

      if (pendingOutputImage) {
        const ext =
          pendingOutputImage.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
        const resolvedId =
          selectedOutputId ??
          (outputId.trim() || buildOutputId(outputKind, outputTitle));
        const path = buildAboutFolderPath(
          ABOUT_MEDIA_FOLDER,
          resolvedId || "output",
          filename,
        );

        setUploadProgress({ label: "Uploading output image", percent: 0 });
        await uploadFileToBucket(ABOUT_BUCKET, path, pendingOutputImage, (percent): void => {
          setUploadProgress({ label: "Uploading output image", percent });
        });

        if (outputImagePath && outputImagePath !== path) {
          await removeStorageObject(ABOUT_BUCKET, outputImagePath);
        }
        nextImagePath = path;
        setOutputImagePath(path);
      }

      await saveOutputRecord({
        imagePath: nextImagePath,
        modelPath: nextModelPath,
      });
      setSuccessMsg(
        outputKind === "3d"
          ? selectedOutputId
            ? "3D item updated."
            : "3D item created."
          : selectedOutputId
            ? "About output updated."
            : "About output created.",
      );

      clearOutputForm();
      await loadOutputs();
    } catch (err) {
      setErrorMsg(
        getErrorMessage(
          err,
          "Output save failed. The file may have uploaded, but the database row could not be saved.",
        ),
      );
    } finally {
      setBusy(false);
      window.setTimeout(() => setUploadProgress(null), 400);
    }
  };

  const onDeleteOutput = async (output: DbAboutOutput): Promise<void> => {
    const confirmed = window.confirm(
      `Delete this About output?\n\n"${output.title}"\n\nThis will remove the row and attempt to delete the preview image from storage.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase
        .from("about_outputs")
        .delete()
        .eq("id", output.id);
      if (error) throw error;

      await removeStorageObject(ABOUT_BUCKET, output.image_path);
      await removeStorageObject(output.model_bucket ?? ABOUT_BUCKET, output.model_path);
      if (selectedOutputId === output.id) clearOutputForm();
      await loadOutputs();
      setSuccessMsg("About output deleted.");
    } catch (err) {
      setErrorMsg(getErrorMessage(err, "Delete failed."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-600">Loading About section...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">About Section</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage the About page text, carousel, certificates, and output cards.
            </p>
          </div>
          <button
            type="button"
            onClick={(): void => {
              void refreshAll();
            }}
            className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {errorMsg ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMsg}
          </div>
        ) : null}

        {successMsg ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {successMsg}
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Photos
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{photos.length}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Certificates
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{certificates.length}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Output items
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">{outputs.length}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Pending uploads
            </div>
            <div className="mt-2 text-sm font-semibold text-gray-900">
              {pendingPhotoFiles.length} photos | {pendingCertificateImage ? "1 certificate" : "0 certificate"} | {pendingModelFile || pendingOutputImage ? "1 output asset" : "0 output asset"}
            </div>
          </div>
        </div>

        {uploadProgress ? (
          <div className="mt-3 rounded-xl border bg-gray-50 p-3">
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

        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                About page content
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                This controls the title and intro paragraph shown on the About page.
              </p>

              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={title}
                  onChange={(e): void => setTitle(e.target.value)}
                  placeholder="About page title"
                />
                <textarea
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  rows={10}
                  value={intro}
                  onChange={(e): void => setIntro(e.target.value)}
                  placeholder="Write the About page introduction"
                />
                <button
                  type="button"
                  disabled={savingContent}
                  onClick={(): void => void onSaveContent()}
                  className={`w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    savingContent
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-gray-900 text-white hover:opacity-90"
                  }`}
                >
                  {savingContent ? "Saving..." : "Save About content"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                About photo carousel
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Upload, review, reorder, and remove the photos shown on the About page carousel.
              </p>

              <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e): void =>
                    onSelectPhotoFiles(
                      e.target.files ? Array.from(e.target.files) : [],
                    )
                  }
                />
                {pendingPhotoFiles.length > 0
                  ? `${pendingPhotoFiles.length} photo${pendingPhotoFiles.length === 1 ? "" : "s"} selected`
                  : "Choose About photos"}
              </label>

              <button
                type="button"
                disabled={pendingPhotoFiles.length === 0 || busy}
                onClick={(): void => void onUploadPhotos()}
                className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  pendingPhotoFiles.length > 0 && !busy
                    ? "bg-gray-900 text-white shadow-sm hover:opacity-90"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                Upload About photos
              </button>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {photos.length === 0 ? (
                  <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600 md:col-span-2">
                    No About photos yet.
                  </div>
                ) : (
                  photos.map((photo, index) => (
                    <div key={photo.id} className="rounded-2xl border bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-600">
                          Order: <span className="font-semibold">{photo.sort_order}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(): void => void swapPhotoOrder(photo, photos[index - 1])}
                            className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            disabled={index === photos.length - 1}
                            onClick={(): void => void swapPhotoOrder(photo, photos[index + 1])}
                            className="rounded-lg border bg-white px-2 py-1 text-xs font-semibold disabled:opacity-40"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            onClick={(): void => void onDeletePhoto(photo)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 mx-auto overflow-hidden rounded-xl border bg-gray-50 max-w-[220px]">
                        <img
                          src={getBucketImageUrl(ABOUT_BUCKET, photo.path)}
                          alt={photo.alt ?? "About photo"}
                          className="h-28 w-full object-cover"
                        />
                      </div>

                      <input
                        className="mt-3 w-full rounded-lg border px-3 py-2 text-xs"
                        defaultValue={photo.alt ?? ""}
                        placeholder="Alt text"
                        onBlur={(e): void =>
                          void onUpdatePhotoMeta(photo.id, { alt: e.target.value })
                        }
                      />

                      <input
                        className="mt-2 w-full rounded-lg border px-3 py-2 text-xs"
                        type="number"
                        defaultValue={photo.sort_order}
                        onBlur={(e): void =>
                          void onUpdatePhotoMeta(photo.id, {
                            sort_order: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Certificates & training
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Add, edit, or remove certificate cards and timeline ordering.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearCertificateForm}
                  className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                >
                  New certificate
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Certificate title"
                  value={certificateTitle}
                  onChange={(e): void => setCertificateTitle(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Organization"
                  value={certificateOrg}
                  onChange={(e): void => setCertificateOrg(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    type="number"
                    placeholder="Year"
                    value={certificateYear}
                    onChange={(e): void => setCertificateYear(e.target.value)}
                  />
                  <input
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    type="number"
                    placeholder="Sort order"
                    value={certificateSortOrder}
                    onChange={(e): void => setCertificateSortOrder(Number(e.target.value))}
                  />
                </div>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Subtitle"
                  value={certificateSubtitle}
                  onChange={(e): void => setCertificateSubtitle(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  placeholder="Location"
                  value={certificateLocation}
                  onChange={(e): void => setCertificateLocation(e.target.value)}
                />

                {certificateImagePath ? (
                  <div className="overflow-hidden rounded-xl border bg-gray-50">
                    <img
                      src={getBucketImageUrl(CERTIFICATES_BUCKET, certificateImagePath)}
                      alt={certificateTitle || "Certificate"}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}

                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e): void =>
                      onSelectCertificateImage(e.target.files?.[0] ?? null)
                    }
                  />
                  {pendingCertificateImage
                    ? pendingCertificateImage.name
                    : "Choose certificate image"}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={(): void => void onSaveCertificate()}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      busy
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "bg-gray-900 text-white hover:opacity-90"
                    }`}
                  >
                    {selectedCertificateId ? "Update certificate" : "Add certificate"}
                  </button>
                  <button
                    type="button"
                    onClick={clearCertificateForm}
                    className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {certificates.map((certificate) => (
                  <div key={certificate.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{certificate.title}</div>
                        <div className="text-sm text-gray-600">
                          {certificate.org} | {certificate.year}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(): void => loadCertificateIntoForm(certificate)}
                          className="rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(): void => void onDeleteCertificate(certificate)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    About outputs library
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Manage 3D models, image and design uploads, and project or app links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearOutputForm}
                  className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                >
                  New item
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-3 rounded-xl border bg-gray-50/70 p-4">
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
                    <div className="text-sm font-semibold text-sky-950">
                      {outputKind === "3d"
                        ? "3D model workflow"
                        : outputKind === "image"
                          ? "Image / design workflow"
                          : "Project / app link workflow"}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-sky-900/80">
                      {getOutputWorkflowCopy(outputKind)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      value={outputKind}
                      onChange={(e): void =>
                        setOutputKind(e.target.value as SampleOutputKind)
                      }
                    >
                      <option value="3d">3D model</option>
                      <option value="image">Image / design</option>
                      <option value="app">Project / app link</option>
                    </select>
                    <input
                      className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      type="number"
                      placeholder="Sort order"
                      value={outputSortOrder}
                      onChange={(e): void => setOutputSortOrder(Number(e.target.value))}
                    />
                  </div>

                  <input
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    placeholder="Title"
                    value={outputTitle}
                    onChange={(e): void => setOutputTitle(e.target.value)}
                  />

                  <textarea
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Description"
                    value={outputDescription}
                    onChange={(e): void => setOutputDescription(e.target.value)}
                  />

                  <input
                    className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    placeholder="Tags (comma-separated)"
                    value={outputTags}
                    onChange={(e): void => setOutputTags(e.target.value)}
                  />

                  {outputKind === "3d" ? (
                    <div className="space-y-3 rounded-xl border bg-white p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          3D model upload
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Saving this form will upload the selected Draco-compressed model to the `about/3d_models` folder and save the Supabase row in one step.
                        </p>
                      </div>

                      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        Storage location: <span className="font-semibold">about/{ABOUT_MODELS_FOLDER}</span>
                      </div>

                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="Model path or full public URL"
                        value={outputModelPath}
                        onChange={(e): void => setOutputModelPath(e.target.value)}
                      />

                      {outputModelPath ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                          Current model path: {outputModelPath}
                        </div>
                      ) : null}

                      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                        <input
                          type="file"
                          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                          className="sr-only"
                          onChange={(e): void =>
                            onSelectModelFile(e.target.files?.[0] ?? null)
                          }
                        />
                        {pendingModelFile
                          ? pendingModelFile.name
                          : "Choose 3D model file"}
                      </label>

                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="Preview image alt text"
                        value={outputImageAlt}
                        onChange={(e): void => setOutputImageAlt(e.target.value)}
                      />

                      {outputImagePath ? (
                        <div className="overflow-hidden rounded-xl border bg-gray-50">
                          <img
                            src={getBucketImageUrl(ABOUT_BUCKET, outputImagePath)}
                            alt={outputImageAlt || outputTitle || "3D preview"}
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e): void =>
                            onSelectOutputImage(
                              e.target.files?.[0] ?? null,
                              "3D preview image",
                            )
                          }
                        />
                        {pendingOutputImage
                          ? pendingOutputImage.name
                          : "Choose 3D preview image"}
                      </label>
                    </div>
                  ) : null}

                  {outputKind === "image" ? (
                    <div className="space-y-3 rounded-xl border bg-white p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Image / design upload
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Upload the actual image or design file that should appear on the About page.
                        </p>
                      </div>

                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="Image alt text"
                        value={outputImageAlt}
                        onChange={(e): void => setOutputImageAlt(e.target.value)}
                      />

                      {outputImagePath ? (
                        <div className="overflow-hidden rounded-xl border bg-gray-50">
                          <img
                            src={getBucketImageUrl(ABOUT_BUCKET, outputImagePath)}
                            alt={outputImageAlt || outputTitle || "Image/design preview"}
                            className="h-40 w-full object-cover"
                          />
                        </div>
                      ) : null}

                      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e): void =>
                            onSelectOutputImage(
                              e.target.files?.[0] ?? null,
                              "Image/design file",
                            )
                          }
                        />
                        {pendingOutputImage
                          ? pendingOutputImage.name
                          : "Choose image/design file"}
                      </label>
                    </div>
                  ) : null}

                  {outputKind === "app" ? (
                    <div className="space-y-3 rounded-xl border bg-white p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Project / app link
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Use this for GitHub repos, live demos, deployed apps, or project pages.
                        </p>
                      </div>

                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="Project / external link"
                        value={outputLinkUrl}
                        onChange={(e): void => setOutputLinkUrl(e.target.value)}
                      />

                      <input
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        placeholder="Thumbnail alt text"
                        value={outputImageAlt}
                        onChange={(e): void => setOutputImageAlt(e.target.value)}
                      />

                      {outputImagePath ? (
                        <div className="overflow-hidden rounded-xl border bg-gray-50">
                          <img
                            src={getBucketImageUrl(ABOUT_BUCKET, outputImagePath)}
                            alt={outputImageAlt || outputTitle || "Project/app thumbnail"}
                            className="h-40 w-full object-contain"
                          />
                        </div>
                      ) : null}

                      <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e): void =>
                            onSelectOutputImage(
                              e.target.files?.[0] ?? null,
                              "Project/app thumbnail",
                            )
                          }
                        />
                        {pendingOutputImage
                          ? pendingOutputImage.name
                          : "Choose project/app thumbnail"}
                      </label>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(): void => void onSaveOutput()}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        busy
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : "bg-gray-900 text-white hover:opacity-90"
                      }`}
                    >
                      {getOutputActionLabel(outputKind, selectedOutputId !== null)}
                    </button>
                    <button
                      type="button"
                      onClick={clearOutputForm}
                      className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border bg-gray-50/70 p-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Current {getOutputKindLabel(outputKind)}
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      This shows the {getOutputKindLabel(outputKind).toLowerCase()} currently stored in Supabase so you can review, edit, or delete them.
                    </p>
                  </div>

                  {filteredOutputs.length === 0 ? (
                    <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                      No {getOutputKindLabel(outputKind).toLowerCase()} saved yet.
                    </div>
                  ) : (
                    filteredOutputs.map((output) => (
                      <div key={output.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-semibold">{output.title}</div>
                              <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                {output.kind.toUpperCase()}
                              </span>
                              <span className="rounded-full border bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">
                                order {output.sort_order}
                              </span>
                            </div>
                            <div className="mt-1 break-all text-xs text-gray-500">
                              id: {output.id}
                            </div>
                            {output.model_path ? (
                          <div className="mt-1 break-all text-xs text-gray-500">
                                model: {output.model_bucket ?? ABOUT_BUCKET} / {output.model_path}
                              </div>
                            ) : null}
                            {output.image_path ? (
                              <div className="mt-1 break-all text-xs text-gray-500">
                                asset: {output.image_path}
                              </div>
                            ) : null}
                            {output.link_url ? (
                              <div className="mt-1 break-all text-xs text-gray-500">
                                link: {output.link_url}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(): void => loadOutputIntoForm(output)}
                              className="rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(): void => void onDeleteOutput(output)}
                              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {output.image_path ? (
                          <div className="mt-3 overflow-hidden rounded-xl border bg-gray-50">
                            <img
                              src={getBucketImageUrl(ABOUT_BUCKET, output.image_path)}
                              alt={output.image_alt ?? output.title}
                              className="h-36 w-full object-contain"
                            />
                          </div>
                        ) : output.kind === "3d" ? (
                          <div className="mt-3 rounded-xl border bg-gray-50 px-3 py-4 text-xs text-gray-500">
                            3D item without preview image
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
