import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

import type {
  AboutPageContent,
  CarouselImage,
  CertificateItem,
  SampleOutputItem,
} from "../types";
import ImageCarousel from "../components/about/ImageCarousel";
import CertificatesTimeline from "../components/about/CertificatesTimeline";
import SampleOutputs from "../components/about/SampleOutputs";
import {
  fetchAboutOutputs,
  fetchAboutPageContent,
  fetchAboutPhotos,
} from "../lib/api/about";
import { fetchCertificates } from "../lib/api/certificates";

export default function AboutPage(): JSX.Element {
  const navigate = useNavigate();

  const [content, setContent] = useState<AboutPageContent>({
    title: "About Me",
    intro: "",
  });
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [outputs, setOutputs] = useState<SampleOutputItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect((): void => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect((): (() => void) => {
    let cancelled = false;

    (async (): Promise<void> => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [pageContent, photos, aboutOutputs, certs] = await Promise.all([
          fetchAboutPageContent(),
          fetchAboutPhotos(),
          fetchAboutOutputs(),
          fetchCertificates(),
        ]);

        if (cancelled) return;

        setContent(pageContent);
        setImages(photos);
        setOutputs(aboutOutputs);
        setCertificates(certs);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Failed to load About page content.",
        );
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return (): void => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-5 py-8 text-foreground page-enter md:px-8">
      <div className="mx-auto max-w-6xl">
        {loading ? (
          <div className="py-12">
            <div className="mx-auto max-w-xl rounded-md border bg-card p-5 shadow-sm">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/70" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Loading About page content...
              </p>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="py-10">
            <p className="text-sm text-red-600">{errorMsg}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Check your Supabase env vars, table policies (RLS), and bucket
              names.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-bold md:text-3xl">
              {content.title}
            </h1>

            <section className="mt-5 space-y-5 xl:grid xl:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)] xl:items-start xl:gap-5 xl:space-y-0">
              <div className="xl:space-y-5">
                <div>
                  <ImageCarousel images={images} />
                </div>
                <div className="hidden xl:block">
                  <SampleOutputs outputs={outputs} loading={loading} />
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-3 rounded-md border bg-card/70 p-4 shadow-sm backdrop-blur lg:grid-cols-[minmax(0,1.2fr)_minmax(10rem,0.8fr)] lg:items-start">
                  <div className="text-center lg:text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Professional Profile
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {content.intro}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="rounded-sm border bg-background/70 p-2.5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Focus
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        Web, AI, 3D
                      </div>
                    </div>
                    <div className="rounded-sm border bg-background/70 p-2.5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Strength
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        Research-driven
                      </div>
                    </div>
                    <div className="rounded-sm border bg-background/70 p-2.5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Work Style
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        Cross-functional
                      </div>
                    </div>
                    <div className="rounded-sm border bg-background/70 p-2.5">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        Location
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        Philippines
                      </div>
                    </div>
                  </div>
                </div>

                <div className="xl:hidden">
                  <SampleOutputs outputs={outputs} loading={loading} />
                </div>

                <div>
                  <CertificatesTimeline certificates={certificates} />
                </div>
              </div>
            </section>
          </>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={(): void => {
              navigate("/");
            }}
            className="mt-5 rounded-md border bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
