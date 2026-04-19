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

  return rows.flatMap((row): SampleOutputItem[] => {
    const tags = asStringArray(row.tags);

    if (row.kind === "3d") {
      const modelUrl = resolveAssetUrl(row.model_bucket, row.model_path);
      if (!modelUrl) return [];

      return [
        {
          id: row.id,
          kind: "3d",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          glbSrc: modelUrl,
          previewSrc: row.image_path
            ? getPublicUrl(ABOUT_BUCKET, row.image_path)
            : undefined,
        },
      ];
    }

    if (row.kind === "image") {
      if (!row.image_path) return [];

      return [
        {
          id: row.id,
          kind: "image",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          imageSrc: getPublicUrl(ABOUT_BUCKET, row.image_path),
          imageAlt: row.image_alt ?? row.title,
          linkUrl: row.link_url ?? undefined,
        },
      ];
    }

    if (row.kind === "app") {
      return [
        {
          id: row.id,
          kind: "app",
          title: row.title,
          description: row.description ?? undefined,
          tags,
          imageSrc: row.image_path
            ? getPublicUrl(ABOUT_BUCKET, row.image_path)
            : undefined,
          imageAlt: row.image_alt ?? row.title,
          linkUrl: row.link_url ?? undefined,
        },
      ];
    }

    return [];
  });
};
