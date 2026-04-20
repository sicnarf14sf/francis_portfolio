import { useEffect, useState, type JSX } from "react";
import {
  FaLocationDot,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaUserTie,
} from "react-icons/fa6";
import { getHomeHeroImageUrl } from "../../lib/storage";

const fallbackHeroImage: string = new URL(
  "../../assets/hero_image.JPG",
  import.meta.url,
).href;

export default function Home({
  onGetToKnowMe,
}: {
  onGetToKnowMe: () => void;
}): JSX.Element {
  const [showContent, setShowContent] = useState<boolean>(false);
  const [heroImageSrc, setHeroImageSrc] = useState<string>(() =>
    getHomeHeroImageUrl(true),
  );

  useEffect((): void => {
    setShowContent(true);
    setHeroImageSrc(getHomeHeroImageUrl(true));
  }, []);

  if (!showContent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <section
      className="grid grid-cols-1 items-center gap-4 pt-5 md:grid-cols-[16rem_minmax(0,1fr)] md:items-stretch md:gap-5"
      id="home"
    >
      <div className="order-1 flex justify-center md:order-1 md:justify-start">
        <img
          src={heroImageSrc}
          alt="Francis working on projects"
          className="h-auto w-full max-w-[12rem] object-cover md:h-full md:max-w-none md:object-cover"
          onError={(): void => {
            setHeroImageSrc(fallbackHeroImage);
          }}
        />
      </div>

      <div className="order-2 flex min-w-0 flex-col justify-center md:order-2">
        <div className="order-2 mt-3 flex items-center justify-center md:order-1 md:mt-0 md:justify-start">
          <span className="rounded-sm border border-foreground/10 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Portfolio Overview
          </span>
        </div>

        <div className="order-1 mt-4 flex flex-col items-center gap-2 md:order-3 md:mt-4 md:items-start">
          <div className="grid w-full max-w-md grid-cols-2 gap-2 md:flex md:max-w-none md:flex-wrap md:justify-start">
            <button
              onClick={onGetToKnowMe}
              className="group inline-flex min-h-10 items-center justify-center gap-2 border border-foreground/10 bg-foreground px-3 py-2 text-xs font-semibold text-background shadow-[0_14px_30px_-22px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-20px_rgba(15,23,42,0.85)] md:px-5 md:py-2.5 md:text-sm"
            >
              <FaUserTie className="h-4 w-4" />
              <span>Get to know me</span>
            </button>

            <a
              href="mailto:francis14sf@gmail.com"
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-foreground/15 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted md:px-5 md:py-2.5 md:text-sm"
            >
              <FaEnvelope className="h-4 w-4" />
              <span>Send email</span>
            </a>

            <a
              href="https://github.com/sicnarf14sf"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-foreground/15 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted md:px-4 md:py-2.5 md:text-sm"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/feceleste"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-foreground/15 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted md:px-4 md:py-2.5 md:text-sm"
            >
              <FaLinkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </div>

          <p className="text-center text-xs text-foreground/70 md:text-left">
            A quick look at my background, selected work, and certifications.
          </p>
        </div>

        <div className="order-3 md:order-2">
          <h1 className="mt-2 text-center text-3xl font-bold leading-tight md:text-left md:text-[2.85rem]">
            Hi, I&apos;m Francis
          </h1>
          <h2 className="mt-1.5 flex flex-col items-center gap-1 text-center text-base text-foreground/80 md:items-start md:text-left md:text-lg">
            <span className="inline-flex items-center gap-2">
              <FaLocationDot className="h-4 w-4" />
              <span>Davao City, Philippines</span>
            </span>
            <span>Software Developer | 3D Artist | Researcher</span>
          </h2>
          <p className="mt-2.5 text-center text-sm leading-6 text-foreground/75 md:text-left md:text-[14px]">
            I create solutions at the intersection of marine science, education,
            and technology - from marine biodiversity databases to gamified
            learning apps. Skilled in research, software development, and 3D
            design, I excel in hybrid team environments and deliver results with
            efficiency and precision.
          </p>
        </div>
      </div>
    </section>
  );
}
