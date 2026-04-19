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
}: {
  outputs: SampleOutputItem[];
}): JSX.Element {
  const [tab, setTab] = useState<SampleOutputKind>("3d");
  const [active3D, setActive3D] = useState<SampleOutput3D | null>(null);

  useEffect((): (() => void) => {
    if (active3D) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return (): void => {
      document.body.style.overflow = "";
    };
  }, [active3D]);

  const models: SampleOutput3D[] = outputs.filter(is3D);
  const images: SampleOutputImage[] = outputs.filter(isImage);
  const apps: SampleOutputApp[] = outputs.filter(isApp);

  const visible: SampleOutputItem[] =
    tab === "3d" ? models : tab === "image" ? images : apps;

  return (
    <section className="mt-8">
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

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {visible.length === 0 ? (
          <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
            Nothing here yet.
          </div>
        ) : (
          visible.map((item) => {
            if (item.kind === "3d") {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(): void => setActive3D(item)}
                  className="overflow-hidden rounded-md border bg-card text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="h-40 w-full bg-muted">
                    {item.previewSrc ? (
                      <img
                        src={item.previewSrc}
                        alt={item.title}
                        className="h-40 w-full object-cover"
                        onError={(e): void => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                        Click to preview 3D model
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
                            className="rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-3 inline-flex w-full justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background">
                      Open viewer
                    </div>
                  </div>
                </button>
              );
            }

            if (item.kind === "image") {
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-md border bg-card shadow-sm"
                >
                  <div className="h-40 w-full bg-muted">
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      className="h-40 w-full object-cover"
                      onError={(e): void => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
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
                            className="rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
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
                        className="mt-3 inline-flex w-full justify-center rounded-md border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-md border bg-card shadow-sm"
              >
                <div className="h-40 w-full bg-muted">
                  {item.imageSrc ? (
                    <img
                      src={item.imageSrc}
                      alt={item.imageAlt ?? item.title}
                      className="h-40 w-full object-cover"
                      onError={(e): void => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
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
                          className="rounded-md border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
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
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
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
          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg bg-card shadow-xl">
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
                className="rounded-md border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <div className="h-[70vh] overflow-hidden rounded-md border">
                <GLBViewer src={active3D.glbSrc} />
              </div>
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
      className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-foreground text-background" : "bg-card hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
