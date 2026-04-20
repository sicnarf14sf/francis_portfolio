const MB = 1024 * 1024;

const IMAGE_MIME_PREFIX = "image/";
const MODEL_MIME_TYPES = new Set([
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
]);
const MODEL_EXTENSIONS = [".glb", ".gltf"];

const MAX_IMAGE_FILE_SIZE_BYTES = 8 * MB;
const MAX_MODEL_FILE_SIZE_BYTES = 80 * MB;

// These checks improve admin UX and prevent obviously bad uploads early.
// Real protection still comes from Supabase storage policies.
type ValidationResult<T> =
  | { ok: true; files: T }
  | { ok: false; error: string };

const hasAllowedModelExtension = (fileName: string): boolean =>
  MODEL_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));

export const validateImageFiles = (
  files: File[],
  label: string,
): ValidationResult<File[]> => {
  if (files.length === 0) {
    return { ok: true, files };
  }

  for (const file of files) {
    if (!file.type.startsWith(IMAGE_MIME_PREFIX)) {
      return {
        ok: false,
        error: `${label} must be an image file.`,
      };
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      return {
        ok: false,
        error: `${label} must be 8 MB or smaller per file.`,
      };
    }
  }

  return { ok: true, files };
};

export const validateModelFile = (
  file: File | null,
  label: string,
): ValidationResult<File | null> => {
  if (!file) {
    return { ok: true, files: null };
  }

  if (!hasAllowedModelExtension(file.name) && !MODEL_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: `${label} must be a .glb or .gltf file.`,
    };
  }

  if (file.size > MAX_MODEL_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `${label} must be 80 MB or smaller.`,
    };
  }

  return { ok: true, files: file };
};
