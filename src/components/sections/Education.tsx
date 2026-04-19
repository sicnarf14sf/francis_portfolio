import { type JSX } from "react";
import SectionHeader from "../layout/SectionHeader";
import { FaGraduationCap } from "react-icons/fa6";
import type { EducationItem } from "../../lib/api/education";

type EducationSectionProps = {
  education: EducationItem[];
  compact?: boolean;
};

export default function Education({
  education,
  compact = false,
}: EducationSectionProps): JSX.Element {
  return (
    <section className={compact ? "" : "py-1"} id="education">
      <SectionHeader
        title="Education"
        subtitle="Academic background and training that supports my work in software, AI, and 3D."
        icon={FaGraduationCap}
        variant="education"
        compact={compact}
      />

      <div className="grid grid-cols-1 gap-3">
        {education.map((edu) => (
          <div
            key={edu.id}
            className={`border bg-card shadow-sm transition hover:shadow-md ${
              compact ? "rounded-md p-3" : "rounded-lg p-4"
            }`}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-sm font-bold md:text-base">{edu.school}</h3>
                <p className={`mt-1 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                  <span className="font-medium">{edu.program}</span>
                  <span className="text-muted-foreground"> • {edu.year}</span>
                </p>
              </div>

              {edu.honorsReceived ? (
                <span className="w-fit rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Honors: {edu.honorsReceived}
                </span>
              ) : null}
            </div>

            <div className={`${compact ? "my-3" : "my-4"} h-px w-full bg-border`} />

            <ul
              className={`text-sm text-muted-foreground ${
                compact ? "space-y-1.5 leading-5" : "space-y-2 leading-6"
              }`}
            >
              {edu.details.map((detail) => (
                <li key={detail} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
