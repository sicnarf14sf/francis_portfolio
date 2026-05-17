type ImageLoadStatus = "idle" | "loading" | "loaded" | "error";

export type ImageLoadSnapshot = {
  status: ImageLoadStatus;
  progress: number | null;
  resolvedSrc: string | null;
};

type ImageLoadListener = (snapshot: ImageLoadSnapshot) => void;

type ImageLoadEntry = {
  src: string;
  status: ImageLoadStatus;
  progress: number | null;
  resolvedSrc: string | null;
  promise: Promise<ImageLoadSnapshot> | null;
  listeners: Set<ImageLoadListener>;
};

type PreloadImagesOptions = {
  concurrency?: number;
};

const imageLoads = new Map<string, ImageLoadEntry>();
const warmedOrigins = new Set<string>();

const toSnapshot = (entry: ImageLoadEntry): ImageLoadSnapshot => ({
  status: entry.status,
  progress: entry.progress,
  resolvedSrc: entry.resolvedSrc,
});

const notify = (entry: ImageLoadEntry): void => {
  const snapshot = toSnapshot(entry);
  entry.listeners.forEach((listener) => listener(snapshot));
};

const getEntry = (src: string): ImageLoadEntry => {
  const existing = imageLoads.get(src);
  if (existing) return existing;

  const entry: ImageLoadEntry = {
    src,
    status: "idle",
    progress: null,
    resolvedSrc: null,
    promise: null,
    listeners: new Set(),
  };
  imageLoads.set(src, entry);
  return entry;
};

export const getImageLoadSnapshot = (
  src: string,
): ImageLoadSnapshot | null => {
  const entry = imageLoads.get(src);
  return entry ? toSnapshot(entry) : null;
};

export const subscribeImageLoad = (
  src: string,
  listener: ImageLoadListener,
): (() => void) => {
  const entry = getEntry(src);
  entry.listeners.add(listener);
  listener(toSnapshot(entry));

  return (): void => {
    entry.listeners.delete(listener);
  };
};

export const warmImageOrigins = (urls: string[]): void => {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    let origin: string;

    try {
      origin = new URL(url, window.location.href).origin;
    } catch {
      return;
    }

    if (origin === window.location.origin || warmedOrigins.has(origin)) return;
    warmedOrigins.add(origin);

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = origin;
    preconnect.crossOrigin = "anonymous";
    document.head.appendChild(preconnect);

    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = origin;
    document.head.appendChild(dnsPrefetch);
  });
};

export const preloadImage = (src: string): Promise<ImageLoadSnapshot> => {
  const entry = getEntry(src);

  if (entry.status === "loaded") {
    return Promise.resolve(toSnapshot(entry));
  }

  if (entry.promise) return entry.promise;

  warmImageOrigins([src]);
  entry.status = "loading";
  entry.progress = entry.progress ?? 0;
  notify(entry);

  entry.promise = (async (): Promise<ImageLoadSnapshot> => {
    try {
      const response = await fetch(src, {
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
      }

      let blob: Blob;
      const contentType = response.headers.get("content-type") ?? undefined;

      if (!response.body) {
        blob = await response.blob();
      } else {
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

          entry.progress =
            total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : null;
          notify(entry);
        }

        blob = new Blob(chunks.map((chunk) => new Uint8Array(chunk)), { type: contentType });
      }

      entry.resolvedSrc = URL.createObjectURL(blob);
      entry.progress = 100;
      entry.status = "loaded";
      notify(entry);
      return toSnapshot(entry);
    } catch (error) {
      entry.progress = null;
      entry.status = "error";
      notify(entry);
      throw error;
    } finally {
      entry.promise = null;
    }
  })();

  return entry.promise;
};

export const preloadImages = async (
  urls: string[],
  options: PreloadImagesOptions = {},
): Promise<void> => {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  if (uniqueUrls.length === 0) return;

  warmImageOrigins(uniqueUrls);

  const concurrency = Math.max(1, options.concurrency ?? 2);
  let nextIndex = 0;
  let activeCount = 0;

  await new Promise<void>((resolve) => {
    const runNext = (): void => {
      if (nextIndex >= uniqueUrls.length && activeCount === 0) {
        resolve();
        return;
      }

      while (activeCount < concurrency && nextIndex < uniqueUrls.length) {
        const url = uniqueUrls[nextIndex];
        nextIndex += 1;
        activeCount += 1;

        void preloadImage(url)
          .catch(() => undefined)
          .finally(() => {
            activeCount -= 1;
            runNext();
          });
      }
    };

    runNext();
  });
};
