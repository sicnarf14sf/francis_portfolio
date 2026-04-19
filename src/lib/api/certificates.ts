// src/lib/api/certificates.ts
import { supabase } from "../supabaseClient";
import { getPublicUrl } from "../storage";
import type { CertificateItem } from "../../types";

type DbCert = {
  id: string;
  title: string;
  org: string;
  year: number;
  subtitle: string | null;
  location: string | null;
  image_path: string;
  sort_order: number;
};

export const fetchCertificates = async (): Promise<CertificateItem[]> => {
  const { data, error } = await supabase
    .from("certificates")
    .select("id, title, org, year, subtitle, location, image_path, sort_order")
    .order("year", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as DbCert[];
  return rows.map((r) => ({
    title: r.title,
    org: r.org,
    year: r.year,
    subtitle: r.subtitle ?? undefined,
    location: r.location ?? undefined,
    imageSrc: getPublicUrl("certificates", r.image_path),
    imageAlt: `${r.title} (${r.year})`,
  }));
};