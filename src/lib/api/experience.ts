// src/lib/api/experience.ts
import { supabase } from "../supabaseClient";
import { getPublicUrl } from "../storage";
import type { ExperienceItem } from "../../types";

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
  experience_images?: Array<{
    id: string;
    path: string;
    alt: string | null;
    sort_order: number;
  }>;
};

const asStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val.filter((x) => typeof x === "string") as string[];
};

const formatDateRange = (start: string | null, end: string | null): string => {
  if (!start && !end) return "";
  if (start && !end) return `${start} - Present`;
  if (!start && end) return end;
  return `${start} - ${end}`;
};

const resolveAssetUrl = (bucket: string, value: string): string => {
  if (value.startsWith("/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return getPublicUrl(bucket, value);
};

const mapExperience = (row: DbExperience): ExperienceItem => {
  const images = (row.experience_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      src: resolveAssetUrl("experience-images", img.path),
      alt: img.alt ?? row.title,
    }));

  return {
    id: row.id,
    title: row.title,
    org: row.org,
    date: formatDateRange(row.date_start, row.date_end),
    thumbnailSrc: row.thumbnail_image
      ? resolveAssetUrl("experience-images", row.thumbnail_image)
      : undefined,
    thumbnailAlt: `${row.title} thumbnail`,
    images,
    tags: asStringArray(row.tags),
    details: {
      role: row.role,
      highlights: asStringArray(row.highlights),
    },
  };
};

export const fetchExperiences = async (): Promise<ExperienceItem[]> => {
  const { data, error } = await supabase
    .from("experience")
    .select(
      `
      id,
      title,
      org,
      role,
      date_start,
      date_end,
      thumbnail_image,
      tags,
      highlights,
      sort_order,
      experience_images (
        id,
        path,
        alt,
        sort_order
      )
    `,
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows: DbExperience[] = (data ?? []) as DbExperience[];
  return rows.map(mapExperience);
};

export const fetchExperienceById = async (
  id: string,
): Promise<ExperienceItem | null> => {
  const { data, error } = await supabase
    .from("experience")
    .select(
      `
      id,
      title,
      org,
      role,
      date_start,
      date_end,
      thumbnail_image,
      tags,
      highlights,
      sort_order,
      experience_images (
        id,
        path,
        alt,
        sort_order
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapExperience(data as unknown as DbExperience);
};
