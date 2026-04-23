import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from "react";

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
}: ProgressiveImageProps): JSX.Element {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState<number | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

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
    const controller = new AbortController();

    const revokeObjectUrl = (): void => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };

    const loadImage = async (): Promise<void> => {
      if (!src) {
        revokeObjectUrl();
        setResolvedSrc(null);
        setLoadState("error");
        return;
      }

      setLoadState("loading");
      setProgress(0);
      setResolvedSrc(null);
      revokeObjectUrl();

      try {
        const response = await fetch(src, {
          signal: controller.signal,
          cache: "force-cache",
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        if (!response.body) {
          const blob = await response.blob();
          if (cancelled) return;

          const blobUrl = URL.createObjectURL(blob);
          objectUrlRef.current = blobUrl;
          setResolvedSrc(blobUrl);
          setProgress(100);
          setLoadState("loaded");
          return;
        }

        const total = Number(response.headers.get("content-length") ?? 0);
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;

          chunks.push(value);
          loaded += value.length;

          if (total > 0 && !cancelled) {
            setProgress(Math.min(99, Math.round((loaded / total) * 100)));
          } else if (!cancelled) {
            setProgress(null);
          }
        }

        if (cancelled) return;

        const blob = new Blob(chunks);
        const blobUrl = URL.createObjectURL(blob);
        objectUrlRef.current = blobUrl;
        setResolvedSrc(blobUrl);
        setProgress(100);
        setLoadState("loaded");
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setResolvedSrc(src);
        setProgress(null);
        setLoadState(
          error instanceof Error && error.name === "AbortError" ? "idle" : "loaded",
        );
      }
    };

    void loadImage();

    return () => {
      cancelled = true;
      controller.abort();
      revokeObjectUrl();
    };
  }, [src]);

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
