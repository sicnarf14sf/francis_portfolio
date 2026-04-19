import type { ExperienceItem } from "../types";

type ModelOverride = NonNullable<ExperienceItem["models"]>;

export const MODEL_OVERRIDES: Record<string, ModelOverride> = {
  "embraceMabida": [
    {
      title: "Diagramma melanacrum",
      glbSrc: "../../public/models/EMBRACE/Diagrammamelanacrum.glb", // or full URL if hosted elsewhere
      notes: "High-res scan for documentation.",
    },
    {
      title: "Sargocentron rubrum",
      glbSrc: "../../public/models/EMBRACE/Sargocentronrubrum.glb", // or full URL if hosted elsewhere
      notes: "High-res scan for documentation.",
    },
  ],
  "gtalab": [
    {
      title: "Sargocentron rubrum",
      glbSrc: "../../public/models/GTALAB/Sargocentronrubrum.glb",
      notes: "Optimized for viewing (still large).",
    },
  ],
};