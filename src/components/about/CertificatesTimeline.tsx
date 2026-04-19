import { type JSX } from "react";
import type { CertificateItem } from "../../types";
import SectionHeader from "../layout/SectionHeader";

type CertificatesTimelineProps = {
  certificates: CertificateItem[];
};

export default function CertificatesTimeline({
  certificates,
}: CertificatesTimelineProps): JSX.Element {
  // Ensure chronological order (oldest -> newest)
  const sorted: CertificateItem[] = [...certificates].sort(
    (a: CertificateItem, b: CertificateItem) => a.year - b.year,
  );

  return (
    <section className="py-1 md:py-2" id="certificates">
      <div className="mb-4">
        <SectionHeader
          title="Certificates & Training"
          subtitle="Certifications, training, and recognitions that support my work in
          research, software, and 3D technologies."
          variant="aboutPage"
        />
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[10px] top-0 h-full w-[2px] bg-border md:left-1/2 md:-translate-x-1/2" />

        <div className="space-y-4">
          {sorted.map((item: CertificateItem, idx: number) => {
            const isRight: boolean = idx % 2 === 1;

            return (
              <div
                key={`${item.title}-${item.year}-${idx}`}
                className="relative md:grid md:grid-cols-2 md:gap-5"
              >
                {/* Dot */}
                <div className="absolute left-[3px] top-6 h-4 w-4 rounded-full border-2 border-foreground bg-background md:left-1/2 md:-translate-x-1/2" />

                <div
                  className={[
                    "pl-10 md:pl-0",
                    isRight
                      ? "md:col-start-2 md:pl-8"
                      : "md:col-start-1 md:pr-8",
                  ].join(" ")}
                >
                  <div className="overflow-hidden rounded-md border bg-card shadow-sm transition hover:shadow-md">
                    {/* Certificate Image */}
                    <div className="h-40 w-full bg-muted">
                      <img
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        className="h-40 w-full object-cover"
                        onError={(e): void => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold md:text-base">
                          {item.title}
                        </h3>
                        <span className="shrink-0 rounded-md bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                          {item.year}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-foreground">
                        {item.org}
                      </p>

                      {item.subtitle ? (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.subtitle}
                        </p>
                      ) : null}

                      {item.location ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {item.location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
