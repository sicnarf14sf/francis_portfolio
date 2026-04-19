// src/lib/storage.ts
import { supabase } from "./supabaseClient";

export const getPublicUrl = (bucket: string, path: string): string => {
  // If path is already a URL, return it unchanged
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};