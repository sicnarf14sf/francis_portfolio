import { type JSX } from "react";
import SectionHeader from "../layout/SectionHeader";
import { FaGraduationCap } from "react-icons/fa6";

type EducationItem = {
  school: string;
  program: string;
  year: string;
  details: string[];
  honorsReceived?: string; // optional so it won't break if empty
};

export default function Education(): JSX.Element {
  const EDUCATION: EducationItem[] = [
    {
      school: "University of the Philippines Mindanao",
      program: "BS Computer Science",
      year: "2020–2025",
      details: [
        "Thesis: Mobile-Learning Application: Marine Fish Laboratory",
        "Relevant work: Marine biodiversity database, LLM-powered chatbot, 3D asset workflows",
      ],
      honorsReceived: "Cum Laude",
    },
    // Add more items here later
  ];

  return (
    <section className="py-1" id="education">
      <SectionHeader
        title="Education"
        subtitle="Academic background and training that supports my work in software, AI, and 3D."
        icon={FaGraduationCap}
        variant="education"
      />

      <div className="grid grid-cols-1 gap-4">
        {EDUCATION.map((edu) => (
          <div
            key={`${edu.school}-${edu.program}-${edu.year}`}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Top row: School + Honors badge */}
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-base font-bold md:text-lg">{edu.school}</h3>
                <p className="mt-1 text-sm text-gray-700 md:text-base">
                  <span className="font-medium">{edu.program}</span>
                  <span className="text-gray-500"> • {edu.year}</span>
                </p>
              </div>

              {edu.honorsReceived ? (
                <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Honors: {edu.honorsReceived}
                </span>
              ) : null}
            </div>

            {/* Divider */}
            <div className="my-4 h-px w-full bg-gray-100" />

            {/* Details */}
            <ul className="space-y-2 text-sm text-gray-700 md:text-base">
              {edu.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}