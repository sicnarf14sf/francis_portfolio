import { supabase } from "../supabaseClient";
import { getPublicUrl } from "../storage";
import type {
  AboutPageContent,
  CarouselImage,
  SampleOutputItem,
  SampleOutputKind,
} from "../../types";

type DbAboutPhoto = {
  id: string;
  path: string;
  alt: string | null;
  sort_order: number;
};

type DbAboutPageContent = {
  title: string | null;
  intro: string | null;
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

const ABOUT_BUCKET = "about";
const ABOUT_DEBUG_PREFIX = "[AboutOutputs]";

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

const resolveAssetUrl = (
  bucket: string | null | undefined,
  path: string | null | undefined,
): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return getPublicUrl(bucket || ABOUT_BUCKET, path);
};

const logAboutDebug = (message: string, details?: unknown): void => {
  if (details === undefined) {
    console.info(`${ABOUT_DEBUG_PREFIX} ${message}`);
    return;
  }

  console.info(`${ABOUT_DEBUG_PREFIX} ${message}`, details);
};

const logAboutWarn = (message: string, details?: unknown): void => {
  if (details === undefined) {
    console.warn(`${ABOUT_DEBUG_PREFIX} ${message}`);
    return;
  }

  console.warn(`${ABOUT_DEBUG_PREFIX} ${message}`, details);
};

export const fetchAboutPhotos = async (): Promise<CarouselImage[]> => {
  const { data, error } = await supabase
    .from("about_photos")
    .select("id, path, alt, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as DbAboutPhoto[];
  return rows.map((row) => ({
    src: getPublicUrl(ABOUT_BUCKET, row.path),
    alt: row.alt ?? "About photo",
  }));
};

export const fetchAboutPageContent = async (): Promise<AboutPageContent> => {
  const { data, error } = await supabase
    .from("about_page_content")
    .select("title, intro")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const row = data as DbAboutPageContent | null;

  return {
    title: row?.title?.trim() || "About Me",
    intro:
      row?.intro?.trim() ||
      "I am Francis Albert E. Celeste, a computer science graduate with hands-on experience in web development, AI-enabled systems, and 3D technologies in academic and research-driven environments.",
  };
};

export const fetchAboutOutputs = async (): Promise<SampleOutputItem[]> => {
  const { data, error } = await supabase
    .from("about_outputs")
    .select(
      "id, kind, title, description, tags, image_path, image_alt, link_url, model_key, model_path, model_bucket, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as DbAboutOutput[];
  logAboutDebug(`Fetched ${rows.length} row(s) from about_outputs.`, rows);

  const outputs = rows.flatMap((row): SampleOutputItem[] => {
    const tags = asStringArray(row.tags);

    if (row.kind === "3d") {
      const modelUrl = resolveAssetUrl(row.model_bucket, row.model_path);
      if (!modelUrl) {
        logAboutWarn(
          `Discarded 3D row "${row.id}" because model_path/model URL could not be resolved.`,
          {
            id: row.id,
            title: row.title,
            model_path: row.model_path,
            model_bucket: row.model_bucket,
            image_path: row.image_path,
          },
        );
        return [];
      }

      const previewSrc = row.image_path
        ? getPublicUrl(ABOUT_BUCKET, row.image_path)
        : undefined;

      logAboutDebug(`Resolved 3D row "${row.id}".`, {
        id: row.id,
        title: row.title,
        previewSrc,
        glbSrc: modelUrl,
        model_bucket: row.model_bucket ?? ABOUT_BUCKET,
      });

      return [
        {
          id: row.id,
          kind: "3d",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          glbSrc: modelUrl,
          previewSrc,
        },
      ];
    }

    if (row.kind === "image") {
      if (!row.image_path) {
        logAboutWarn(
          `Discarded image row "${row.id}" because image_path is empty.`,
          {
            id: row.id,
            title: row.title,
            link_url: row.link_url,
          },
        );
        return [];
      }

      const imageSrc = getPublicUrl(ABOUT_BUCKET, row.image_path);
      logAboutDebug(`Resolved image/design row "${row.id}".`, {
        id: row.id,
        title: row.title,
        imageSrc,
      });

      return [
        {
          id: row.id,
          kind: "image",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          imageSrc,
          imageAlt: row.image_alt ?? row.title,
          linkUrl: row.link_url ?? undefined,
        },
      ];
    }

    if (row.kind === "app") {
      const imageSrc = row.image_path
        ? getPublicUrl(ABOUT_BUCKET, row.image_path)
        : undefined;

      logAboutDebug(`Resolved app/project row "${row.id}".`, {
        id: row.id,
        title: row.title,
        imageSrc,
        linkUrl: row.link_url ?? undefined,
      });

      return [
        {
          id: row.id,
          kind: "app",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          imageSrc,
          imageAlt: row.image_alt ?? row.title,
          linkUrl: row.link_url ?? undefined,
        },
      ];
    }

    logAboutWarn(`Discarded row "${row.id}" because kind "${row.kind}" is unsupported.`, row);
    return [];
  });

  logAboutDebug(`Returning ${outputs.length} About output item(s) after mapping.`, {
    ids: outputs.map((item) => item.id),
    counts: {
      "3d": outputs.filter((item) => item.kind === "3d").length,
      image: outputs.filter((item) => item.kind === "image").length,
      app: outputs.filter((item) => item.kind === "app").length,
    },
  });

  return outputs;
};
