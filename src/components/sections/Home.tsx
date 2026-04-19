import { useEffect, useState, type JSX } from "react";
import { FaEnvelope, FaGithub, FaLinkedin, FaUserTie } from "react-icons/fa6";

export default function Home({
  onGetToKnowMe,
}: {
  onGetToKnowMe: () => void;
}): JSX.Element {
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect((): void => {
    setShowContent(true);
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
      <div className="order-2 flex justify-center md:order-1 md:justify-start">
        <img
          src="/src/assets/hero_image.JPG"
          alt="Francis working on projects"
          className="h-auto w-full max-w-[12rem] object-cover md:h-full md:max-w-none md:object-cover"
        />
      </div>

      <div className="order-1 flex min-w-0 flex-col justify-center md:order-2">
        <div className="flex items-center justify-center md:justify-start">
          <span className="rounded-sm border border-foreground/10 bg-muted px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Portfolio Overview
          </span>
        </div>

        <h1 className="mt-2 text-center text-3xl font-bold leading-tight md:text-left md:text-[2.85rem]">
          Hi, I&apos;m Francis.
        </h1>
        <h2 className="mt-1.5 text-center text-base text-muted-foreground md:text-left md:text-lg">
          Software Developer | 3D Artist | Researcher | Philippine Based
        </h2>
        <p className="mt-2.5 text-center text-sm leading-6 text-muted-foreground md:text-left md:text-[14px]">
          I create solutions at the intersection of marine science, education,
          and technology - from marine biodiversity databases to gamified
          learning apps. Skilled in research, software development, and 3D
          design, I excel in hybrid team environments and deliver results with
          efficiency and precision.
        </p>

        <div className="mt-4 flex flex-col items-center gap-2 md:items-start">
          <div className="flex w-full max-w-md flex-wrap justify-center gap-2.5 md:max-w-none md:justify-start">
            <button
              onClick={onGetToKnowMe}
              className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-foreground/10 bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-[0_14px_30px_-22px_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-20px_rgba(15,23,42,0.85)]"
            >
              <FaUserTie className="h-4 w-4" />
              <span>Get to know me</span>
            </button>

            <a
              href="mailto:francis14sf@gmail.com"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-foreground/15 bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <FaEnvelope className="h-4 w-4" />
              <span>Send email</span>
            </a>

            <a
              href="https://github.com/sicnarf14sf"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-foreground/15 bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            <a
              href="https://linkedin.com/in/feceleste"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-foreground/15 bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <FaLinkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </div>

          <p className="text-center text-xs text-muted-foreground md:text-left">
            A quick look at my background, selected work, and certifications.
          </p>
        </div>
      </div>
    </section>
  );
}
