import { type JSX } from "react";
import { FaBriefcase } from "react-icons/fa";
import SectionHeader from "../layout/SectionHeader";
import type { ExperienceItem } from "../../types";

type ExperienceSectionProps = {
  experiences: ExperienceItem[];
  onReadMore: (exp: ExperienceItem) => void;
  compact?: boolean;
};

export default function Experience({
  experiences,
  onReadMore,
  compact = false,
}: ExperienceSectionProps): JSX.Element {
  return (
    <section className={compact ? "" : "py-1"} id="experience">
      <SectionHeader
        title="Experience"
        subtitle='Selected projects. Open "Read more" for full context.'
        icon={FaBriefcase}
        variant="experience"
        compact={compact}
      />

      <div className={`grid grid-cols-1 gap-3 ${compact ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
        {experiences.map((exp) => (
          <div key={exp.id} className="overflow-hidden border bg-card shadow-sm transition hover:shadow-md">
            <div className={`${compact ? "h-28" : "h-40"} w-full bg-muted`}>
              <img
                src={exp.thumbnailSrc ?? exp.images[0]?.src ?? ""}
                alt={exp.thumbnailAlt ?? exp.images[0]?.alt ?? exp.title}
                className={`${compact ? "h-28" : "h-40"} w-full object-contain md:object-scale-down`}
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className={compact ? "p-3" : "p-4"}>
              <h3 className="text-sm font-bold md:text-base">{exp.title}</h3>
              <p className="mt-1 text-xs text-foreground/70">
                {exp.org} | {exp.date}
              </p>

              {exp.tags.length > 0 ? (
                <div className={`${compact ? "mt-2" : "mt-3"} flex flex-wrap gap-2`}>
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className={compact ? "mt-3" : "mt-4"}>
                <button
                  onClick={(): void => onReadMore(exp)}
                  className="w-full border bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  Read more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
