import { useEffect, useState, type JSX } from "react";
import type { ExperienceDetailsProps } from "../../types/index.ts";

export default function ExperienceDetails({
  experience,
  onBack,
}: ExperienceDetailsProps): JSX.Element {
  useEffect((): void => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [experience.id]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const imagesCount: number = experience.images.length;
  const hasImages: boolean = imagesCount > 0;

  const goPrev = (): void => {
    setActiveImageIndex((i: number) => (i - 1 + imagesCount) % imagesCount);
  };

  const goNext = (): void => {
    setActiveImageIndex((i: number) => (i + 1) % imagesCount);
  };

  const activeImage = hasImages ? experience.images[activeImageIndex] : null;

  return (
    <div className="min-h-screen bg-background px-5 py-8 text-foreground page-enter md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <h2 className="text-2xl font-bold md:text-[2rem]">{experience.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{experience.org}</span>
            <span className="text-muted-foreground"> • {experience.details.role}</span>
            <span className="text-muted-foreground"> • {experience.date}</span>
          </p>
        </div>

        <div className="rounded-md border bg-card p-4 shadow-sm">
          <div className="overflow-hidden rounded-md border bg-muted">
            {activeImage ? (
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="h-64 w-full object-contain md:h-72 md:object-scale-down"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground md:h-72">
                Add experience images to enable the carousel.
              </div>
            )}
          </div>

          {imagesCount > 1 ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                className="rounded-md border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Prev
              </button>

              <div className="text-xs text-muted-foreground">
                {activeImageIndex + 1} / {imagesCount}
              </div>

              <button
                onClick={goNext}
                className="rounded-md border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Next
              </button>
            </div>
          ) : null}

          {imagesCount > 1 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {experience.images.map((img, idx) => (
                <button
                  key={`${img.src}-${idx}`}
                  onClick={(): void => setActiveImageIndex(idx)}
                  className={`h-14 w-20 overflow-hidden rounded-md border transition ${
                    idx === activeImageIndex
                      ? "border-foreground"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          {experience.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {experience.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5">
            <h4 className="text-sm font-bold text-foreground md:text-base">
              What I did
            </h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              {experience.details.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-muted-foreground" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <button
              onClick={onBack}
              className="rounded-md border bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Back to project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
