import { type JSX } from "react";
import type { CertificateItem } from "../../types/index.ts";
import SectionHeader from "../layout/SectionHeader";
import { AiFillSafetyCertificate } from "react-icons/ai";

export default function CertificatesTimeline(): JSX.Element {
  const CERTIFICATES: CertificateItem[] = [
    // 2024
    {
      title: "Drone Operations Training",
      org: "University of the Philippines Mindanao",
      year: 2024,
      subtitle: "Drone Operations Training on the MABIDA Project",
      imageSrc: "/src/assets/certificates/drone_ops_2024.jpg",
      imageAlt: "Drone Operations Training Certificate (2024)",
    },

    // 2025
    {
      title:
        "Finalist — Gawad Pangulo Para sa Natatanging Inobasyon: Paglalahad ng mga Likha",
      org: "University of the Philippines System",
      year: 2025,
      subtitle: "Marine Fish Laboratory Application (Team Leader)",
      imageSrc: "/src/assets/certificates/gawad_pangulo_finalist_2025.jpg",
      imageAlt: "Gawad Pangulo Finalist Certificate (2025)",
    },
    {
      title: "18th National Symposium on Marine Science",
      org: "Philippine Association of Marine Science (PAMS)",
      year: 2025,
      subtitle:
        "Oral Presenter and Participant — Mobile Learning Application: Fish Taxonomy",
      imageSrc: "/src/assets/certificates/pams_symposium_2025.jpg",
      imageAlt: "PAMS Symposium Certificate (2025)",
    },
    {
      title: "Open Water Diving Course Certification",
      org: "SDI Open Water Scuba Diver — Carabao Dive Center",
      year: 2025,
      location: "Davao City",
      imageSrc: "/src/assets/certificates/sdi_open_water_2025.jpg",
      imageAlt: "SDI Open Water Scuba Diver Certificate (2025)",
    },
    {
      title: "Resource Speaker — 3D Scanning and Modelling",
      org: "Department of Agriculture: BFAR",
      year: 2025,
      subtitle: "Davao Gulf Oceanographic Survey and Exploratory Fishing",
      imageSrc: "/src/assets/certificates/bfar_resource_speaker_2025.jpg",
      imageAlt: "BFAR Resource Speaker Certificate (2025)",
    },
  ];

  // 3) Chronological order (oldest -> newest)
  const sorted: CertificateItem[] = [...CERTIFICATES].sort(
    (a: CertificateItem, b: CertificateItem) => a.year - b.year,
  );

  return (
    <section className="py-8 md:py-10" id="certificates">
      <SectionHeader
        title="Certificates & Training"
        subtitle="Certifications, training, and recognitions that support my work in
          research, software, and 3D technologies.."
        icon={AiFillSafetyCertificate}
        variant="default"
      />

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[10px] top-0 h-full w-[2px] bg-gray-200 md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-6">
          {sorted.map((item: CertificateItem, idx: number) => {
            const isRight: boolean = idx % 2 === 1;

            return (
              <div
                key={`${item.title}-${item.year}-${idx}`}
                className="relative md:grid md:grid-cols-2 md:gap-6"
              >
                {/* Dot */}
                <div className="absolute left-[3px] top-6 h-4 w-4 rounded-full border-2 border-gray-900 bg-white md:left-1/2 md:-translate-x-1/2" />

                {/* Card column (mobile: full width; desktop: alternate) */}
                <div
                  className={[
                    "pl-10 md:pl-0",
                    isRight
                      ? "md:col-start-2 md:pl-8"
                      : "md:col-start-1 md:pr-8",
                  ].join(" ")}
                >
                  <div className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition">
                    {/* Certificate Image */}
                    <div className="h-48 w-full bg-gray-100">
                      <img
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        className="h-48 w-full object-contain md:object-scale-down"
                        onError={(e): void => {
                          // If image not found, hide it (you can replace with placeholder if you want)
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold md:text-lg">
                          {item.title}
                        </h3>
                        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {item.year}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-gray-800 md:text-base">
                        {item.org}
                      </p>

                      {item.subtitle ? (
                        <p className="mt-1 text-sm text-gray-600">
                          {item.subtitle}
                        </p>
                      ) : null}

                      {item.location ? (
                        <p className="mt-2 text-xs text-gray-500">
                          {item.location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Empty desktop column to preserve spacing */}
                <div className="hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
