import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
} from "react";
import {
  getImageLoadSnapshot,
  preloadImage,
  subscribeImageLoad,
} from "../../lib/imagePreloader";

type ProgressiveImageProps = {
  src: string;
  alt: string;
  containerClassName?: string;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  imgWrapperClassName?: string;
  loadingLabel?: string;
  fallbackLabel?: string;
  onClick?: () => void;
  onReady?: (meta: { naturalWidth: number; naturalHeight: number }) => void;
  draggable?: boolean;
  startLoad?: boolean;
};

type LoadState = "idle" | "loading" | "loaded" | "error";

export default function ProgressiveImage({
  src,
  alt,
  containerClassName,
  imgClassName,
  imgStyle,
  imgWrapperClassName,
  loadingLabel = "Loading image",
  fallbackLabel = "Image unavailable",
  onClick,
  onReady,
  draggable = false,
  startLoad = true,
}: ProgressiveImageProps): JSX.Element {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  const wrapperClassName = useMemo(
    () => `relative overflow-hidden ${containerClassName ?? ""}`.trim(),
    [containerClassName],
  );
  const circleRadius = 24;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const normalizedProgress = progress === null ? 0.72 : Math.max(0, Math.min(1, progress / 100));
  const dashOffset = circleCircumference * (1 - normalizedProgress);

  useEffect(() => {
    let cancelled = false;

    if (!src) {
      setResolvedSrc(null);
      setProgress(null);
      setLoadState("error");
      return (): void => {
        cancelled = true;
      };
    }

    const applySnapshot = (snapshot: {
      status: LoadState;
      progress: number | null;
      resolvedSrc: string | null;
    }): void => {
      if (cancelled) return;

      if (snapshot.status === "loaded" && snapshot.resolvedSrc) {
        setResolvedSrc(snapshot.resolvedSrc);
        setProgress(100);
        setLoadState("loaded");
        return;
      }

      if (snapshot.status === "error") {
        setResolvedSrc(src);
        setProgress(null);
        setLoadState("loaded");
        return;
      }

      setResolvedSrc(null);
      setProgress(snapshot.progress ?? null);
      setLoadState("loading");
    };

    setResolvedSrc(null);
    setProgress(getImageLoadSnapshot(src)?.progress ?? 0);
    setLoadState("loading");

    const unsubscribe = subscribeImageLoad(src, applySnapshot);

    if (startLoad) {
      void preloadImage(src).catch(() => {
        if (cancelled) return;
        setResolvedSrc(src);
        setProgress(null);
        setLoadState("loaded");
      });
    }

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [src, startLoad]);

  return (
    <div className={wrapperClassName}>
      {resolvedSrc
        ? imgWrapperClassName
          ? (
              <div className={imgWrapperClassName}>
                <img
                  src={resolvedSrc}
                  alt={alt}
                  decoding="async"
                  draggable={draggable}
                  className={imgClassName}
                  style={imgStyle}
                  onClick={onClick}
                  onLoad={(event): void => {
                    onReady?.({
                      naturalWidth: event.currentTarget.naturalWidth,
                      naturalHeight: event.currentTarget.naturalHeight,
                    });
                  }}
                  onError={(): void => {
                    setLoadState("error");
                  }}
                />
              </div>
            )
          : (
              <img
                src={resolvedSrc}
                alt={alt}
                decoding="async"
                draggable={draggable}
                className={imgClassName}
                style={imgStyle}
                onClick={onClick}
                onLoad={(event): void => {
                  onReady?.({
                    naturalWidth: event.currentTarget.naturalWidth,
                    naturalHeight: event.currentTarget.naturalHeight,
                  });
                }}
                onError={(): void => {
                  setLoadState("error");
                }}
              />
            )
        : null}

      {loadState === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/82">
          <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.14),rgba(255,255,255,0.34),rgba(255,255,255,0.14))] bg-[length:220%_100%]" />
          <div className="relative flex max-w-[calc(100%-1.5rem)] scale-[0.78] flex-col items-center justify-center gap-1.5 rounded-full bg-background/92 px-2.5 py-2.5 shadow-sm backdrop-blur sm:max-w-[calc(100%-1rem)] sm:scale-100 sm:gap-3 sm:px-5 sm:py-5">
            <div className="relative flex h-12 w-12 items-center justify-center sm:h-16 sm:w-16">
              <svg
                className="-rotate-90"
                width="48"
                height="48"
                viewBox="0 0 64 64"
                aria-hidden="true"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: "visible" }}
              >
                <circle
                  cx="32"
                  cy="32"
                  r={circleRadius}
                  fill="none"
                  stroke="rgba(148,163,184,0.28)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={circleRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className={`${progress === null ? "animate-pulse" : ""} text-foreground transition-[stroke-dashoffset] duration-200`}
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <span className="absolute text-[9px] font-semibold text-foreground sm:text-[11px]">
                {progress === null ? "..." : `${progress}%`}
              </span>
            </div>
            <div className="max-w-[7.5rem] text-center sm:max-w-[11rem]">
              <div className="text-[9px] font-medium leading-3.5 text-foreground sm:text-[11px] sm:leading-4">
                {loadingLabel}
              </div>
              <div className="mt-0.5 text-[8px] leading-3.5 text-muted-foreground sm:mt-1 sm:text-[10px] sm:leading-4">
                {progress === null ? "Preparing image..." : "Rendering preview..."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {loadState === "error" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted px-4 text-center text-sm text-muted-foreground">
          {fallbackLabel}
        </div>
      ) : null}
    </div>
  );
}
