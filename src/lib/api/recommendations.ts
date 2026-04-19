import { supabase } from "../supabaseClient";
import type { RecommendationItem } from "../../types";

type DbRecommendation = {
  id: string;
  name: string;
  role: string | null;
  organization: string | null;
  recommendation: string;
  sort_order: number;
};

export const fetchRecommendations = async (): Promise<RecommendationItem[]> => {
  const { data, error } = await supabase
    .from("recommendations")
    .select("id, name, role, organization, recommendation, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as DbRecommendation[]).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role?.trim() || "",
    organization: row.organization?.trim() || "",
    recommendation: row.recommendation,
  }));
};
