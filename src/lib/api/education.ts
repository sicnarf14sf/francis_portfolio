import { supabase } from "../supabaseClient";

export type EducationItem = {
  id: string;
  school: string;
  program: string;
  year: string;
  details: string[];
  honorsReceived?: string;
};

const asStringArray = (val: unknown): string[] => {
  if (!Array.isArray(val)) return [];
  return val.filter((x) => typeof x === "string") as string[];
};

export const fetchEducation = async (): Promise<EducationItem[]> => {
  const { data, error } = await supabase
    .from("education")
    .select("id, school, program, year_start, year_end, honors, details, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const year =
      row.year_end && row.year_end !== row.year_start
        ? `${row.year_start}-${row.year_end}`
        : `${row.year_start}`;

    return {
      id: row.id,
      school: row.school,
      program: row.program,
      year,
      details: asStringArray(row.details),
      honorsReceived: row.honors ?? undefined,
    };
  });
};
