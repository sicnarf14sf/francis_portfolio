import { useMemo, useState, type JSX } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  getHomeHeroImageUrl,
  HOME_ASSET_BUCKET,
  HOME_HERO_IMAGE_PATH,
} from "../../lib/storage";
import { validateImageFiles } from "../../lib/uploadValidation";

export default function HomeAdmin(): JSX.Element {
  const [pendingHeroImage, setPendingHeroImage] = useState<File | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<number>(Date.now());

  const heroImageUrl = useMemo(
    () => `${getHomeHeroImageUrl(false)}?v=${previewVersion}`,
    [previewVersion],
  );

  const onSelectHeroImage = (file: File | null): void => {
    const result = validateImageFiles(file ? [file] : [], "Hero image");
    if (!result.ok) {
      setErrorMsg(result.error);
      setPendingHeroImage(null);
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingHeroImage(file);
  };

  const onUploadHeroImage = async (): Promise<void> => {
    if (!pendingHeroImage) return;

    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.storage
        .from(HOME_ASSET_BUCKET)
        .upload(HOME_HERO_IMAGE_PATH, pendingHeroImage, {
          upsert: true,
          contentType: pendingHeroImage.type || "application/octet-stream",
        });

      if (error) throw error;

      setPendingHeroImage(null);
      setPreviewVersion(Date.now());
      setSuccessMsg("Hero image uploaded.");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Hero image upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRemoveHeroImage = async (): Promise<void> => {
    setBusy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.storage
        .from(HOME_ASSET_BUCKET)
        .remove([HOME_HERO_IMAGE_PATH]);

      if (error) throw error;

      setPendingHeroImage(null);
      setPreviewVersion(Date.now());
      setSuccessMsg("Custom hero image removed. The site will fall back to the bundled image.");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to remove hero image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Home Hero Image</h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload one public hero image for the homepage. The website reads it from
            one fixed Supabase Storage path.
          </p>
        </div>
        <div className="rounded-xl border bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Bucket: <span className="font-semibold">{HOME_ASSET_BUCKET}</span>
          <br />
          Path: <span className="font-semibold">{HOME_HERO_IMAGE_PATH}</span>
        </div>
      </div>

      {errorMsg ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {successMsg ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMsg}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3 rounded-xl border bg-gray-50/70 p-4">
          <div className="rounded-xl border bg-white p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Upload guidance
            </div>
            <p className="mt-2 text-sm text-gray-700">
              Use a portrait-style image. The current client-side limit is 8 MB and
              image files only.
            </p>
          </div>

          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e): void => onSelectHeroImage(e.target.files?.[0] ?? null)}
            />
            {pendingHeroImage ? pendingHeroImage.name : "Choose hero image"}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!pendingHeroImage || busy}
              onClick={(): void => void onUploadHeroImage()}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                pendingHeroImage && !busy
                  ? "bg-gray-900 text-white hover:opacity-90"
                  : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              Upload hero image
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={(): void => void onRemoveHeroImage()}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              Remove custom image
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">Current preview</div>
          <div className="mt-3 overflow-hidden rounded-xl border bg-white">
            <img
              src={heroImageUrl}
              alt="Homepage hero preview"
              className="h-72 w-full object-cover"
              onError={(e): void => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            If no custom image exists in Supabase Storage, the public website falls
            back to the bundled local image.
          </p>
        </div>
      </div>
    </div>
  );
}
