import { type JSX } from "react";
import { FaBriefcase } from "react-icons/fa";
import { EXPERIENCES } from "../../data/experiences";
import type { ExperienceProps } from "../../types";
import SectionHeader from "../layout/SectionHeader";

export default function Experience({ onReadMore }: ExperienceProps): JSX.Element {
  return (
    <section className="py-1" id="experience">
      <SectionHeader
        title="Experience"
        subtitle="Selected projects. Tap “Read more” to view full details."
        icon={FaBriefcase}
        variant="experience"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {EXPERIENCES.map((exp) => (
          <div
            key={exp.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="h-44 w-full bg-gray-100">
              <img
                src={exp.images[0]?.src ?? ""}
                alt={exp.images[0]?.alt ?? exp.title}
                className="h-44 w-full object-contain md:object-scale-down"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold md:text-lg">{exp.title}</h3>
              <p className="mt-1 text-xs text-gray-600">
                {exp.org} • {exp.date}
              </p>

              {exp.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <button
                  onClick={(): void => onReadMore(exp)}
                  className="w-full rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
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