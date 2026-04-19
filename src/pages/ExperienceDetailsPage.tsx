import { useEffect, useState, type JSX } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ExperienceDetails from "../components/sections/ExperienceDetails";
import type { ExperienceItem } from "../types";
import { fetchExperienceById } from "../lib/api/experience";
import { MODEL_OVERRIDES } from "../data/modelOverrides";

export default function ExperienceDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<ExperienceItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect((): (() => void) => {
    let cancelled = false;

    (async (): Promise<void> => {
      if (!id) {
        setExperience(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const exp = await fetchExperienceById(id);
        if (cancelled) return;

        if (!exp) {
          setExperience(null);
          return;
        }

        // ✅ hardcode only models (GLBs) from public/
        const overrides = MODEL_OVERRIDES[exp.id];
        setExperience({
          ...exp,
          models: overrides,
        });
      } finally { 
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return (): void => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen px-5 py-10 md:px-8">
        <div className="mx-auto max-w-6xl text-sm text-gray-600">Loading…</div>
      </div>
    );
  }

  if (!experience) return <Navigate to="/" replace />;

  return (
    <ExperienceDetails
      experience={experience}
      onBack={(): void => {
        navigate(-1);
      }}
    />
  );
}