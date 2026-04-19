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
        <h1 className="text-center text-2xl font-bold md:text-3xl">
          {content.title}
        </h1>
        {loading ? (
          <div className="py-10 text-sm text-muted-foreground">
            Loading content...
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
            <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.7fr)] lg:items-center">
              <div className="order-2 lg:order-1">
                <ImageCarousel images={images} />
              </div>

              <div className="order-1 rounded-lg border bg-card/70 p-5 text-center shadow-sm backdrop-blur lg:order-2 lg:p-6 lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Professional Profile
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {content.intro}
                </p>
              </div>
            </section>

            <div className="mt-6">
              <SampleOutputs outputs={outputs} />
            </div>

            <div className="mt-6">
              <CertificatesTimeline certificates={certificates} />
            </div>
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
