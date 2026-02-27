import { useEffect, useState, type JSX } from "react";
import type { ExperienceDetailsProps } from "../../types/index.ts";
import GLBViewer from "../three/GLBViewer";

export default function ExperienceDetails({
  experience,
  onBack,
}: ExperienceDetailsProps): JSX.Element {
  useEffect((): void => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [experience.id]);

  // Carousel-ready state
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
    <div className="min-h-screen px-5 py-10 md:px-8 page-enter">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">{experience.title}</h2>
          <p className="mt-1 text-sm text-gray-600 md:text-base">
            <span className="font-medium text-gray-800">{experience.org}</span>
            <span className="text-gray-500"> • {experience.details.role}</span>
            <span className="text-gray-500"> • {experience.date}</span>
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          {/* Carousel-ready image area */}
          <div className="overflow-hidden rounded-xl border bg-gray-50">
            {activeImage ? (
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="h-72 w-full object-contain md:object-scale-down"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                Add experience images to enable the carousel.
              </div>
            )}
          </div>

          {/* Carousel controls (shown only if there are 2+ images) */}
          {imagesCount > 1 ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Prev
              </button>

              <div className="text-xs text-gray-600">
                {activeImageIndex + 1} / {imagesCount}
              </div>

              <button
                onClick={goNext}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          ) : null}

          {/* Thumbnails (optional; good for carousel later) */}
          {imagesCount > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.images.map((img, idx) => (
                <button
                  key={`${img.src}-${idx}`}
                  onClick={(): void => setActiveImageIndex(idx)}
                  className={`h-14 w-20 overflow-hidden rounded-lg border transition ${
                    idx === activeImageIndex
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
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

          {/* Tech stack */}
          {experience.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {/* Details */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-800 md:text-base">
              What I did
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 md:text-base">
              {experience.details.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3D Models section (documentation-ready) */}
          <div className="mt-8">
            <h4 className="text-sm font-bold text-gray-800 md:text-base">
              Sample 3D Models
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Add previews, embeds, or links to showcase models produced in this
              experience.
            </p>

            {experience.models && experience.models.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {experience.models.map((m) => (
                  <div
                    key={m.title}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-semibold text-gray-800">{m.title}</h5>
                    </div>

                    {/* If GLB is provided, render ThreeJS viewer */}
                    {m.glbSrc ? (
                      <div className="mt-3 overflow-hidden rounded-lg border bg-gray-50">
                        {/* Viewer frame */}
                        <div className="h-64 w-full">
                          <GLBViewer src={m.glbSrc} enableAutoRotate />
                        </div>
                      </div>
                    ) : m.previewSrc ? (
                      /* Fallback to thumbnail image */
                      <div className="mt-3 overflow-hidden rounded-lg border bg-gray-50">
                        <img
                          src={m.previewSrc}
                          alt={m.title}
                          className="h-64 w-full object-cover"
                          onError={(e): void => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-3 flex h-64 items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-500">
                        Add a .glb file or preview image
                      </div>
                    )}

                    {/* Optional link */}
                    {m.linkUrl ? (
                      <a
                        href={m.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-gray-900 underline hover:opacity-80"
                      >
                        View model
                      </a>
                    ) : null}

                    {m.scientificName ? (
                      <p className="italic  mt-2 text-sm text-gray-600">{m.scientificName}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                No models added yet. Populate{" "}
                <span className="font-mono">experience.models</span> to show
                them here.
              </div>
            )}
          </div>

          {/* Back button (only one, at the bottom) */}
          <div className="mt-8">
            <button
              onClick={onBack}
              className="rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Back to project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
