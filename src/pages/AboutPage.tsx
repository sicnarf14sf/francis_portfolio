import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import type { CarouselImage } from "../types/index.ts";
import ImageCarousel from "../components/about/ImageCarousel.tsx";
import CertificatesTimeline from "../components/about/CertificatesTimeline.tsx";

export default function AboutPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect((): void => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const images: CarouselImage[] = [
    { src: "/src/assets/about/me_1.jpg", alt: "Francis photo 1" },
    { src: "/src/assets/about/me_2.jpg", alt: "Francis photo 2" },
    { src: "/src/assets/about/me_3.jpg", alt: "Francis photo 3" },
  ];

  return (
    <div className="min-h-screen px-5 py-10 md:px-8 page-enter">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold md:text-4xl">About Me</h1>

        {/* Carousel below title */}
        <div className="mt-5">
          <ImageCarousel images={images} />
        </div>

        <p className="mt-6 text-sm text-gray-700 md:text-base">
          I’m Francis Albert E. Celeste — a computer science graduate with
          hands-on experience in web development, AI-enabled systems, and 3D
          technologies in academic and research-driven environments. I build
          database-backed web applications, LLM-powered chatbot solutions (RAG),
          and interactive educational tools, and I’ve contributed to
          interdisciplinary projects in marine biodiversity, digital
          fabrication, and educational technology.
        </p>

        <div>
          <CertificatesTimeline />
        </div>

        <div>
          <button
            onClick={() => navigate("/")}
            className="rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition mt-6"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
