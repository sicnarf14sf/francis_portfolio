import { type JSX } from "react";
import SectionHeader from "../layout/SectionHeader";
import { FaGears } from "react-icons/fa6";

export default function Skills({
  compact = false,
}: {
  compact?: boolean;
}): JSX.Element {
  const SKILLS: Array<{ title: string; items: string[] }> = [
    {
      title: "Web & Application Development",
      items: [
        "Frontend: HTML, CSS, JavaScript, React, React Native",
        "Backend: Python, Django",
        "Database-backed systems: build and maintain structured data apps",
      ],
    },
    {
      title: "AI & Intelligent Systems",
      items: [
        "LLM-powered chatbots for FAQ and website assistance",
        "RAG (Retrieval-Augmented Generation) using curated knowledge bases",
        "AI-driven UX: designing user flows around AI features",
      ],
    },
    {
      title: "3D Technologies",
      items: [
        "3D scanning and post-processing for clean, usable assets",
        "3D modeling and optimization for web, apps, and printing",
        "3D printing and prototyping for research and demonstrations",
      ],
    },
    {
      title: "Game & Interactive Development",
      items: [
        "Godot 4 for 2D/3D interactive applications",
        "Educational and simulation apps for learning experiences",
      ],
    },
    {
      title: "Research & Technical Support",
      items: [
        "Data curation and validation for research datasets",
        "Technical documentation: proposals, reports, and project docs",
        "Applied research support for science/education projects",
      ],
    },
  ];

  return (
    <section className={compact ? "" : "py-1"} id="skills">
      <SectionHeader
        title="Skills"
        subtitle="Tools and strengths I use to build web, AI, and 3D-focused projects."
        icon={FaGears}
        variant="skills"
        compact={compact}
      />

      <div className={`grid grid-cols-1 gap-3 ${compact ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
        {SKILLS.map((group) => (
          <div
            key={group.title}
            className={`border bg-card shadow-sm transition hover:shadow-md ${
              compact ? "rounded-md p-3" : "rounded-lg p-4"
            }`}
          >
            <h3 className="text-sm font-bold md:text-base">{group.title}</h3>
            <ul
              className={`text-sm text-muted-foreground ${
                compact ? "mt-2 space-y-1.5 leading-5" : "mt-3 space-y-2 leading-6"
              }`}
            >
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
