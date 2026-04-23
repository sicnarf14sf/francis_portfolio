import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Expand, Minus, Plus, X } from "lucide-react";
import type { ExperienceDetailsProps } from "../../types/index.ts";
import { renderInlineFormatting } from "../../lib/renderInlineFormatting";
import ProgressiveImage from "../ui/ProgressiveImage";

type PanOffset = {
  x: number;
  y: number;
};

export default function ExperienceDetails({
  experience,
  onBack,
}: ExperienceDetailsProps): JSX.Element {
  useEffect((): void => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [experience.id]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [viewerOpen, setViewerOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewerImageSize, setViewerImageSize] = useState<{
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
  }>({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  });

  const imagesCount: number = experience.images.length;
  const hasImages: boolean = imagesCount > 0;

  const goPrev = (): void => {
    setActiveImageIndex((i: number) => (i - 1 + imagesCount) % imagesCount);
  };

  const goNext = (): void => {
    setActiveImageIndex((i: number) => (i + 1) % imagesCount);
  };

  const activeImage = hasImages ? experience.images[activeImageIndex] : null;
  const isCompactViewport = viewportSize.width < 768;
  const zoomStep = isCompactViewport ? 0.08 : 0.15;
  const maxZoom = isCompactViewport ? 6 : 5;
  const dragStateRef = useRef<{
    pointerId: number | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    pointerId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const imageMetrics = useMemo(() => {
    if (!viewerImageSize) return null;

    const availableWidth = Math.max(
      viewportSize.width - (isCompactViewport ? 88 : 48),
      220,
    );
    const availableHeight = Math.max(
      viewportSize.height - (isCompactViewport ? 236 : 184),
      220,
    );
    const widthRatio = availableWidth / viewerImageSize.naturalWidth;
    const heightRatio = availableHeight / viewerImageSize.naturalHeight;
    const fitRatio = Math.min(widthRatio, heightRatio, 1);
    const baseWidth = viewerImageSize.naturalWidth * fitRatio;
    const baseHeight = viewerImageSize.naturalHeight * fitRatio;

    return {
      availableWidth,
      availableHeight,
      renderedWidth: Math.max(baseWidth * zoomLevel, 180),
      renderedHeight: Math.max(baseHeight * zoomLevel, 140),
    };
  }, [isCompactViewport, viewerImageSize, viewportSize.height, viewportSize.width, zoomLevel]);

  const clampPanOffset = useCallback((candidate: PanOffset): PanOffset => {
    if (!imageMetrics) return { x: 0, y: 0 };

    const maxOffsetX = Math.max(
      0,
      (imageMetrics.renderedWidth - imageMetrics.availableWidth) / 2,
    );
    const maxOffsetY = Math.max(
      0,
      (imageMetrics.renderedHeight - imageMetrics.availableHeight) / 2,
    );

    return {
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, candidate.x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, candidate.y)),
    };
  }, [imageMetrics]);

  const viewerImageStyle = useMemo(() => {
    if (!imageMetrics) return undefined;

    return {
      width: `${imageMetrics.renderedWidth}px`,
      height: `${imageMetrics.renderedHeight}px`,
      maxWidth: "none",
      maxHeight: "none",
      transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
      transition: dragStateRef.current.pointerId === null ? "transform 160ms ease-out" : "none",
    } as const;
  }, [imageMetrics, panOffset.x, panOffset.y]);

  useEffect(() => {
    setActiveImageIndex(0);
    setViewerOpen(false);
    setZoomLevel(1);
    setViewerImageSize(null);
    setPanOffset({ x: 0, y: 0 });
  }, [experience.id]);

  useEffect(() => {
    if (!hasImages) return;

    const preloaders = experience.images.map((image) => {
      const img = new Image();
      img.decoding = "async";
      img.src = image.src;
      return img;
    });

    return (): void => {
      preloaders.forEach((img) => {
        img.src = "";
      });
    };
  }, [experience.images, hasImages]);

  useEffect(() => {
    if (!viewerOpen) {
      setZoomLevel(1);
      setViewerImageSize(null);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerOpen]);

  useEffect(() => {
    if (!viewerOpen) return;

    const updateViewportSize = (): void => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return (): void => {
      window.removeEventListener("resize", updateViewportSize);
    };
  }, [viewerOpen]);

  const openViewer = (): void => {
    if (!activeImage) return;
    setZoomLevel(1);
    setViewerImageSize(null);
    setPanOffset({ x: 0, y: 0 });
    setViewerOpen(true);
  };

  const zoomOut = (): void => {
    setZoomLevel((current) => Math.max(1, Number((current - zoomStep).toFixed(2))));
  };

  const zoomIn = (): void => {
    setZoomLevel((current) =>
      Math.min(maxZoom, Number((current + zoomStep).toFixed(2))),
    );
  };

  useEffect(() => {
    if (zoomLevel <= 1) {
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    setPanOffset((current) => clampPanOffset(current));
  }, [clampPanOffset, zoomLevel, imageMetrics]);

  const beginPan = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    if (zoomLevel <= 1) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      initialX: panOffset.x,
      initialY: panOffset.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    setPanOffset(
      clampPanOffset({
        x: dragStateRef.current.initialX + deltaX,
        y: dragStateRef.current.initialY + deltaY,
      }),
    );
  };

  const endPan = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    dragStateRef.current.pointerId = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8 text-foreground page-enter md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <div className="text-center md:hidden">
            <h2 className="text-2xl font-bold">
              {renderInlineFormatting(experience.title)}
            </h2>
            <div className="mt-2 space-y-1 text-sm text-foreground/72">
              <p className="font-medium text-foreground">
                {renderInlineFormatting(experience.org)}
              </p>
              <p>{experience.details.role}</p>
              <p>{experience.date}</p>
            </div>
          </div>

          <div className="hidden text-left md:block">
            <h2 className="text-2xl font-bold md:text-[2rem]">
              {renderInlineFormatting(experience.title)}
            </h2>
            <p className="mt-1 text-sm text-foreground/72">
              <span className="font-medium text-foreground">
                {renderInlineFormatting(experience.org)}
              </span>
              <span> | {experience.details.role}</span>
              <span> | {experience.date}</span>
            </p>
          </div>
        </div>

        <div className="border bg-card p-4 shadow-sm md:p-5">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative w-full max-w-[44rem] border bg-muted">
                  {activeImage ? (
                    <>
                      <ProgressiveImage
                        src={activeImage.src}
                        alt={activeImage.alt}
                        containerClassName="h-64 w-full md:h-72 xl:h-[32rem]"
                        imgClassName="h-full w-full cursor-zoom-in object-contain"
                        loadingLabel="Loading image"
                        fallbackLabel="Image unavailable"
                        onClick={openViewer}
                      />

                      <button
                        type="button"
                        onClick={openViewer}
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center border bg-background/92 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                        aria-label="Open image in fullscreen"
                      >
                        <Expand className="h-4 w-4" />
                      </button>
                    </>
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
                    type="button"
                    onClick={goPrev}
                    className="border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                  >
                    Prev
                  </button>

                  <div className="min-w-16 text-center text-xs text-foreground/62">
                    {activeImageIndex + 1} / {imagesCount}
                  </div>

                  <button
                    type="button"
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
                      type="button"
                      onClick={(): void => setActiveImageIndex(idx)}
                      className={`h-16 w-20 overflow-hidden border transition md:h-20 md:w-24 ${
                        idx === activeImageIndex
                          ? "border-foreground"
                          : "border-border hover:border-foreground/45"
                      }`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <ProgressiveImage
                        src={img.src}
                        alt={img.alt}
                        containerClassName="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                        loadingLabel="Loading"
                        fallbackLabel="Unavailable"
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
              type="button"
              onClick={onBack}
              className="border bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Back to project
            </button>
          </div>
        </div>
      </div>

      {viewerOpen && activeImage ? (
        <div className="fixed inset-0 z-[9999] bg-black/75 p-4">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden border bg-background shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold md:text-base">
                  {renderInlineFormatting(experience.title)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Image {activeImageIndex + 1} of {imagesCount}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="inline-flex h-10 w-10 items-center justify-center border bg-card transition hover:bg-muted"
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-16 text-center text-xs font-semibold text-muted-foreground">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="inline-flex h-10 w-10 items-center justify-center border bg-card transition hover:bg-muted"
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(): void => setZoomLevel(1)}
                  className="border bg-card px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={(): void => setViewerOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center border bg-card transition hover:bg-muted"
                  aria-label="Close fullscreen viewer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-auto bg-muted/40 p-3 md:p-4"
              onWheel={(event): void => {
                if (!event.ctrlKey) return;
                event.preventDefault();
                if (event.deltaY < 0) zoomIn();
                else zoomOut();
              }}
            >
              <div
                className={`flex min-h-full min-w-full items-center justify-center ${
                  zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                onPointerDown={beginPan}
                onPointerMove={movePan}
                onPointerUp={endPan}
                onPointerCancel={endPan}
                onPointerLeave={endPan}
                style={{ touchAction: zoomLevel > 1 ? "none" : "auto" }}
              >
                <ProgressiveImage
                  src={activeImage.src}
                  alt={activeImage.alt}
                  containerClassName="inline-flex items-center justify-center bg-background shadow-sm"
                  imgWrapperClassName="inline-flex items-center justify-center"
                  imgClassName="block select-none"
                  imgStyle={viewerImageStyle}
                  loadingLabel="Loading fullscreen image"
                  fallbackLabel="Image unavailable"
                  onReady={setViewerImageSize}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
