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
        <div className="mb-5 text-center md:text-left">
          <h2 className="text-2xl font-bold md:text-[2rem]">{experience.title}</h2>
          <p className="mt-1 text-sm text-foreground/72">
            <span className="font-medium text-foreground">{experience.org}</span>
            <span> • {experience.details.role}</span>
            <span> • {experience.date}</span>
          </p>
        </div>

        <div className="border bg-card p-4 shadow-sm md:p-5">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-[44rem] border bg-muted">
                  {activeImage ? (
                    <img
                      src={activeImage.src}
                      alt={activeImage.alt}
                      className="h-64 w-full object-contain md:h-72 xl:h-[32rem]"
                      onError={(e): void => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-foreground/62 md:h-72 xl:h-[32rem]">
                      Add experience images to enable the carousel.
                    </div>
                  )}
                </div>
              </div>

              {imagesCount > 1 ? (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={goPrev}
                    className="border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Prev
                  </button>

                  <div className="min-w-16 text-center text-xs text-foreground/62">
                    {activeImageIndex + 1} / {imagesCount}
                  </div>

                  <button
                    onClick={goNext}
                    className="border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Next
                  </button>
                </div>
              ) : null}

              {imagesCount > 1 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {experience.images.map((img, idx) => (
                    <button
                      key={`${img.src}-${idx}`}
                      onClick={(): void => setActiveImageIndex(idx)}
                      className={`h-16 w-20 overflow-hidden border transition md:h-20 md:w-24 ${
                        idx === activeImageIndex
                          ? "border-foreground"
                          : "border-border hover:border-foreground/45"
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
                <div className="flex flex-wrap justify-center gap-2">
                  {experience.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground/68"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border bg-background/55 p-4 md:p-5">
              <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-foreground md:text-base">
                What I did
              </h4>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground/74">
                {experience.details.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <span className="mt-2 inline-block h-2 w-2 shrink-0 bg-foreground/42" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onBack}
              className="border bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Back to project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
