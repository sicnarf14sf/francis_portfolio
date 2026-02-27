import React, { useEffect, useRef, useState, type JSX } from "react";
import type { CarouselImage, ImageCarouselProps } from "../../types/index.ts";

export default function ImageCarousel({
  images,
}: ImageCarouselProps): JSX.Element {
  const [index, setIndex] = useState<number>(0);

  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef<number>(0);

  const count: number = images.length;
  const safeIndex: number = Math.min(
    Math.max(index, 0),
    Math.max(count - 1, 0),
  );

  useEffect((): void => {
    if (index !== safeIndex) setIndex(safeIndex);
  }, [index, safeIndex]);

  const goPrev = (): void => {
    if (count === 0) return;
    setIndex((i: number) => (i - 1 + count) % count);
  };

  const goNext = (): void => {
    if (count === 0) return;
    setIndex((i: number) => (i + 1) % count);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    startXRef.current = e.touches[0]?.clientX ?? null;
    deltaXRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    const startX: number | null = startXRef.current;
    const currentX: number = e.touches[0]?.clientX ?? 0;
    if (startX === null) return;
    deltaXRef.current = currentX - startX;
  };

  const onTouchEnd = (): void => {
    const dx: number = deltaXRef.current;

    // Threshold: swipe at least 50px
    if (dx > 50) goPrev();
    else if (dx < -50) goNext();

    startXRef.current = null;
    deltaXRef.current = 0;
  };

  if (count === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-500">
        Add 3–5 images to display here.
      </div>
    );
  }

  return (
    <div className="w-full lg:w-1/2 mx-auto">
      {/* Swipe area */}
      <div
        className="relative overflow-hidden rounded-xl border"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {images.map((img: CarouselImage) => (
            <div key={img.src} className="w-full shrink-0 flex justify-center">
              {/* Frame matches the image area exactly (no background) */}
              <div className="w-full lg:w-1/2 aspect-square overflow-hidden rounded-xl border">
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl border bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white transition"
              aria-label="Previous image"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white transition"
              aria-label="Next image"
            >
              Next
            </button>
          </>
        ) : null}
      </div>

      {/* Dots */}
      {count > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {images.map((_: CarouselImage, i: number) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={(): void => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === safeIndex
                  ? "bg-gray-900"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* Small hint (mobile) */}
      {count > 1 ? (
        <p className="mt-2 text-center text-xs text-gray-500">
          Swipe left/right to browse photos
        </p>
      ) : null}
    </div>
  );
}
