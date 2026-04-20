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

    if (dx > 50) goPrev();
    else if (dx < -50) goNext();

    startXRef.current = null;
    deltaXRef.current = 0;
  };

  if (count === 0) {
    return (
      <div className="mx-auto flex h-[24rem] w-full max-w-sm items-center justify-center border bg-muted text-sm text-muted-foreground md:h-[27rem]">
        Add 3-5 images to display here.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm md:max-w-md">
      <div
        className="relative overflow-hidden border bg-card shadow-sm"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {images.map((img: CarouselImage) => (
            <div
              key={img.src}
              className="flex w-full shrink-0 justify-center bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_60%)] p-2.5 md:p-3"
            >
              <div className="w-full overflow-hidden border bg-muted/80">
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  loading={safeIndex === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-[22rem] w-full object-cover object-top bg-muted md:h-[25rem]"
                />
              </div>
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 border bg-card/90 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-muted md:left-3"
              aria-label="Previous image"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 border bg-card/90 px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-muted md:right-3"
              aria-label="Next image"
            >
              Next
            </button>
          </>
        ) : null}
      </div>

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
                  ? "bg-foreground"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      ) : null}

      {count > 1 ? (
        <p className="mt-2 text-center text-xs text-muted-foreground md:hidden">
          Swipe left/right to browse photos
        </p>
      ) : null}
    </div>
  );
}
