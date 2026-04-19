import { useEffect, useState, type JSX } from "react";
import GLBViewer from "../three/GLBViewer";
import SectionHeader from "../layout/SectionHeader";
import type {
  SampleOutput3D,
  SampleOutputApp,
  SampleOutputImage,
  SampleOutputItem,
  SampleOutputKind,
} from "../../types";

const is3D = (output: SampleOutputItem): output is SampleOutput3D =>
  output.kind === "3d";

const isImage = (output: SampleOutputItem): output is SampleOutputImage =>
  output.kind === "image";

const isApp = (output: SampleOutputItem): output is SampleOutputApp =>
  output.kind === "app";

export default function SampleOutputs({
  outputs,
  loading = false,
}: {
  outputs: SampleOutputItem[];
  loading?: boolean;
}): JSX.Element {
  const [tab, setTab] = useState<SampleOutputKind>("3d");
  const [active3D, setActive3D] = useState<SampleOutput3D | null>(null);
  const [activeImage, setActiveImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  useEffect((): (() => void) => {
    if (active3D || activeImage) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return (): void => {
      document.body.style.overflow = "";
    };
  }, [active3D, activeImage]);

  const models: SampleOutput3D[] = outputs.filter(is3D);
  const images: SampleOutputImage[] = outputs.filter(isImage);
  const apps: SampleOutputApp[] = outputs.filter(isApp);

  const visible: SampleOutputItem[] =
    tab === "3d" ? models : tab === "image" ? images : apps;

  return (
    <section>
      <SectionHeader
        title="Sample Outputs"
        subtitle="Selected outputs - 3D models, designs, and application work."
        variant="aboutPage"
      />

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <TabButton active={tab === "3d"} onClick={(): void => setTab("3d")}>
          3D Models
        </TabButton>
        <TabButton active={tab === "image"} onClick={(): void => setTab("image")}>
          Images / Designs
        </TabButton>
        <TabButton active={tab === "app"} onClick={(): void => setTab("app")}>
          Apps / Projects
        </TabButton>
      </div>

      <div
        className={`mt-4 grid gap-3 ${
          tab === "3d" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {loading ? (
          <div className="border bg-card p-4 md:col-span-2">
            <div className="h-2 w-full overflow-hidden bg-muted">
              <div className="h-full w-1/2 animate-pulse bg-foreground/70" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Loading sample outputs...
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="border bg-muted p-4 text-sm text-muted-foreground md:col-span-2">
            {tab === "3d"
              ? "3D models are not available yet."
              : tab === "image"
                ? "No images or designs available yet."
                : "No apps or project links available yet."}
          </div>
        ) : (
          visible.map((item) => {
            if (item.kind === "3d") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(): void => setActive3D(item)}
                  className="w-full overflow-hidden border bg-card text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-square w-full bg-muted p-3">
                    {item.previewSrc ? (
                      <img
                        src={item.previewSrc}
                        alt={item.title}
                        className="h-full w-full object-contain"
                        onError={(e): void => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
                        Click to preview 3D model
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    {item.description ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}

                    {item.tags?.length ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-2.5 inline-flex w-full justify-center bg-foreground px-4 py-2 text-sm font-semibold text-background">
                      Open viewer
                    </div>
                  </div>
                </button>
              );
            }

            if (item.kind === "image") {
              return (
                <div key={item.id} className="overflow-hidden border bg-card shadow-sm">
                  <button
                    type="button"
                    onClick={(): void =>
                      setActiveImage({
                        src: item.imageSrc,
                        alt: item.imageAlt,
                        title: item.title,
                      })
                    }
                    className="block h-44 w-full bg-muted p-3 transition hover:bg-muted/80"
                  >
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      className="h-full w-full object-contain"
                      onError={(e): void => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </button>

                  <div className="p-4">
                    <h4 className="text-sm font-bold md:text-base">{item.title}</h4>
                    {item.description ? (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}

                    {item.tags?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={(): void =>
                        setActiveImage({
                          src: item.imageSrc,
                          alt: item.imageAlt,
                          title: item.title,
                        })
                      }
                      className="mt-3 inline-flex w-full justify-center border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                    >
                      View image
                    </button>

                    {item.linkUrl ? (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex w-full justify-center border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="overflow-hidden border bg-card shadow-sm">
                <div className="h-44 w-full bg-muted p-3">
                  {item.imageSrc ? (
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt ?? item.title}
                      className="h-full w-full object-contain"
                      onError={(e): void => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Add screenshot
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-bold md:text-base">{item.title}</h4>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}

                  {item.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {item.linkUrl ? (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex w-full justify-center bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
                    >
                      Open project
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {active3D ? (
        <div className="fixed inset-0 z-[9999] bg-black/50 p-4">
          <div className="mx-auto mt-8 max-w-5xl overflow-hidden border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h4 className="text-base font-bold">{active3D.title}</h4>
                {active3D.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {active3D.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={(): void => setActive3D(null)}
                className="border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <div className="h-[70vh] overflow-hidden border">
                <GLBViewer src={active3D.glbSrc} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeImage ? (
        <div className="fixed inset-0 z-[9999] bg-black/60 p-4">
          <div className="mx-auto mt-6 max-w-5xl overflow-hidden border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h4 className="text-base font-bold">{activeImage.title}</h4>
              <button
                type="button"
                onClick={(): void => setActiveImage(null)}
                className="border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="flex max-h-[80vh] items-center justify-center bg-muted p-4">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-foreground text-background" : "bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
