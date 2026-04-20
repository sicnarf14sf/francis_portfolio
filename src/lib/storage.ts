import { supabase } from "./supabaseClient";

export const HOME_ASSET_BUCKET = "about";
export const HOME_HERO_IMAGE_PATH = "home/hero-image";

export const getPublicUrl = (bucket: string, path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// The homepage hero image lives at one fixed public path in Supabase Storage.
// That keeps the website side simple: upload in admin, then always read the same URL.
export const getHomeHeroImageUrl = (cacheBust = false): string => {
  const publicUrl = getPublicUrl(HOME_ASSET_BUCKET, HOME_HERO_IMAGE_PATH);
  if (!cacheBust) return publicUrl;

  return `${publicUrl}?v=${Date.now()}`;
};
