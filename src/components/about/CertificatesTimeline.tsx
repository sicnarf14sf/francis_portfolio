import { useEffect, useState, type JSX } from "react";
import type { CertificateItem } from "../../types";
import SectionHeader from "../layout/SectionHeader";

type CertificatesTimelineProps = {
  certificates: CertificateItem[];
};

export default function CertificatesTimeline({
  certificates,
}: CertificatesTimelineProps): JSX.Element {
  const sorted: CertificateItem[] = [...certificates].sort(
    (a: CertificateItem, b: CertificateItem) => a.year - b.year,
  );
  const [activeCertificate, setActiveCertificate] = useState<CertificateItem | null>(
    null,
  );

  useEffect((): (() => void) => {
    if (activeCertificate) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return (): void => {
      document.body.style.overflow = "";
    };
  }, [activeCertificate]);

  return (
    <section id="certificates">
      <div className="mb-4">
        <SectionHeader
          title="Certificates & Training"
          subtitle="Certifications, training, and recognitions that support my work in research, software, and 3D technologies."
          variant="aboutPage"
        />
      </div>

      <div className="space-y-3">
        {sorted.map((item: CertificateItem, idx: number) => (
          <article
            key={`${item.title}-${item.year}-${idx}`}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border bg-card p-3 shadow-sm md:grid-cols-[4.5rem_minmax(0,1fr)_4rem]"
          >
            <button
              type="button"
              onClick={(): void => setActiveCertificate(item)}
              className="flex items-center justify-center overflow-hidden border bg-muted transition hover:opacity-90"
              aria-label={`View certificate image for ${item.title}`}
            >
              <img
                src={item.imageSrc}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-[5.5rem] w-full object-contain"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </button>

            <div className="min-w-0">
              <h3 className="text-sm font-bold md:text-[15px]">{item.title}</h3>
              <p className="mt-1 text-sm font-medium text-foreground">{item.org}</p>

              {item.subtitle ? (
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {item.subtitle}
                </p>
              ) : null}

              {item.location ? (
                <p className="mt-1.5 text-xs text-muted-foreground">{item.location}</p>
              ) : null}
            </div>

            <div className="col-span-2 flex items-start justify-end md:col-span-1">
              <span className="border bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                {item.year}
              </span>
            </div>
          </article>
        ))}
      </div>

      {activeCertificate ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 p-4">
          <div className="mx-auto mt-8 max-w-4xl overflow-hidden border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h4 className="text-sm font-bold md:text-base">
                  {activeCertificate.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeCertificate.org} | {activeCertificate.year}
                </p>
              </div>

              <button
                type="button"
                onClick={(): void => setActiveCertificate(null)}
                className="border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <div className="overflow-hidden border bg-muted">
                <img
                  src={activeCertificate.imageSrc}
                  alt={activeCertificate.imageAlt}
                  decoding="async"
                  className="max-h-[75vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
