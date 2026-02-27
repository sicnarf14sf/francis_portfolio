import { useMemo, type JSX } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import ExperienceDetails from "../components/sections/ExperienceDetails";
import { EXPERIENCES } from "../data/experiences";
import type { ExperienceItem } from "../types";

export default function ExperienceDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const experience: ExperienceItem | undefined = useMemo(() => {
    if (!id) return undefined;
    return EXPERIENCES.find((e) => e.id === id);
  }, [id]);

  // ✅ Render a redirect instead of calling navigate() during render
  if (!experience) {
    return <Navigate to="/" replace />;
  }

  return (
    <ExperienceDetails
      experience={experience}
      onBack={(): void => {
        navigate(-1);
      }} // ✅ better UX: go back where they came from
    />
  );
}
