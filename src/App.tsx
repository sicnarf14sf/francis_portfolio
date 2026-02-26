import React, { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { AiFillHome } from "react-icons/ai";
import { FiMenu, FiX } from "react-icons/fi";
import { FaGear } from "react-icons/fa6";
import { FaGraduationCap } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaRegCopyright,
} from "react-icons/fa";
import "./App.css";

/** -----------------------------
 * Types (no `any`)
 * ----------------------------- */

type Page = "home" | "about";

type CarouselImage = {
  src: string;
  alt: string;
};

type ImageCarouselProps = {
  images: CarouselImage[];
};


type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type FooterProps = {
  githubUrl: string;
  linkedinUrl: string;
  emailAddress: string;
};

type ExperienceDetailsData = {
  role: string;
  highlights: string[];
};

type ExperienceItem = {
  id: string;
  title: string;
  org: string;
  date: string;

  /** Ready for a carousel: multiple images */
  images: Array<{
    src: string;
    alt: string;
  }>;

  /** Skills / tech stack chips */
  tags: string[];

  /** Detail text content */
  details: ExperienceDetailsData;

  /**
   * Ready for "sample 3D models" documentation.
   * You can embed viewers, iframes, or links (e.g., Sketchfab) later.
   */
  models?: Array<{
    title: string;
    previewSrc?: string; // thumbnail image for model card
    embedUrl?: string; // iframe embed url (optional)
    linkUrl?: string; // external link url (optional)
    notes?: string;
  }>;
};

type NavBarMobileProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type ExperienceProps = {
  onReadMore: (exp: ExperienceItem) => void;
};

type ExperienceDetailsProps = {
  experience: ExperienceItem;
  onBack: () => void;
};

type AboutPageProps = {
  onBack: () => void;
};

/** -----------------------------
 * Data
 * ----------------------------- */
const LINKS: NavLink[] = [
  { href: "#home", label: "Home", icon: AiFillHome },
  { href: "#skills", label: "Skills", icon: FaGear },
  { href: "#education", label: "Education", icon: FaGraduationCap },
  { href: "#experience", label: "Experience", icon: FaBriefcase },
];

const EXPERIENCES: ExperienceItem[] = [
  {
    id: "embrace-mabida-phase-2",
    title: "EMBRACE MABIDA Project Phase 2",
    org: "University of the Philippines Mindanao",
    date: "Jan – Dec 2025",
    images: [
      {
        src: "/src/assets/experience/embrace_mabida_1.png",
        alt: "EMBRACE MABIDA Phase 2 - screenshot 1",
      },
      {
        src: "/src/assets/experience/embrace_mabida_2.png",
        alt: "EMBRACE MABIDA Phase 2 - screenshot 2",
      },
      // Add more images here
    ],
    tags: [
      "LLM Chatbot",
      "RAG",
      "Python",
      "Django",
      "Database",
      "3D Scanning",
      "3D Printing",
    ],
    details: {
      role: "Project Staff / Developer",
      highlights: [
        "Designed and deployed an LLM-powered chatbot to automate website inquiries and improve user access to marine biodiversity information.",
        "Curated, validated, and populated the project database with 50+ high-quality 3D-scanned marine species models.",
        "Fabricated 50+ accurate 3D-printed marine species models for research activities and educational demonstrations.",
        "Conducted underwater reef data collection contributing to biodiversity assessments and LGU policy references across multiple areas in Mindanao.",
        "Coordinated academic collaborations with partner HEIs to support project implementation and research objectives.",
      ],
    },
    models: [
      {
        title: "Sample 3D Model A",
        previewSrc: "/src/assets/models/sample_model_a.png",
        // embedUrl: "https://sketchfab.com/models/<id>/embed",
        // linkUrl: "https://sketchfab.com/3d-models/<id>",
        notes: "Replace with your real model preview and embed/link.",
      },
    ],
  },
  {
    id: "gta-lab",
    title: "GTA Lab: Gamified Taxonomy Laboratory App",
    org: "University of the Philippines Mindanao",
    date: "Jul – Sept 2024",
    images: [
      {
        src: "/src/assets/experience/gta_lab_1.png",
        alt: "GTA Lab - screenshot 1",
      },
      {
        src: "/src/assets/experience/gta_lab_2.png",
        alt: "GTA Lab - screenshot 2",
      },
    ],
    tags: [
      "3D Scanning",
      "3D Asset Pipeline",
      "Post-processing",
      "Mobile App",
      "Education Tech",
    ],
    details: {
      role: "3D Asset Developer",
      highlights: [
        "Produced 20 high-quality 3D-scanned marine species assets using professional scanning and post-processing tools.",
        "Prepared and optimized assets for integration into a gamified educational mobile application.",
      ],
    },
    models: [],
  },
];

const scrollToId = (hash: string): void => {
  const id: string = hash.replace("#", "");
  const el: HTMLElement | null = document.getElementById(id);
  if (!el) return;

  // Smooth scroll (accounts for sticky header)
  const headerOffset: number = 64; // your header is h-16 = 64px
  const y: number =
    el.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
};

/** -----------------------------
 * Components
 * ----------------------------- */
function NavBarDesktop(): JSX.Element {
  return (
    <nav className="hidden md:flex h-16 items-center">
      <ul className="flex items-center gap-8 text-sm font-medium">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <a
              href={href}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                e.preventDefault();
                scrollToId(href);
              }}
              className="inline-flex items-center gap-2 hover:opacity-80 transition"
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavBarMobile({ open, setOpen }: NavBarMobileProps): JSX.Element {
  useEffect((): (() => void) => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return (): void => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 rounded-lg border"
        onClick={(): void => setOpen((v: boolean) => !v)}
      >
        {open ? <FiX className="size-6" /> : <FiMenu className="size-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-end px-4 border-b">
            <button
              aria-label="Close menu"
              className="p-2 rounded-lg border"
              onClick={(): void => setOpen(false)}
            >
              <FiX className="size-6" />
            </button>
          </div>

          <nav className="mx-auto max-w-6xl px-6 py-8">
            <ul className="space-y-4 text-lg font-medium">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="flex items-center gap-3 rounded-xl p-4 border hover:bg-gray-50"
                    onClick={(): void => setOpen(false)}
                  >
                    <Icon className="size-6" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

function Home({ onGetToKnowMe }: { onGetToKnowMe: () => void }): JSX.Element {
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect((): void => {
    setShowContent(true);
  }, []);

  if (!showContent) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <section
      className="grid grid-cols-1 items-center gap-5 pt-10 md:grid-cols-2"
      id="home"
    >
      <div>
        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
          Hi, I’m Francis.
        </h1>
        <h2 className="mt-2 text-lg text-gray-600 md:text-2xl">
          Software Developer | 3D Artist | Researcher
        </h2>
        <p className="mt-4 text-base md:text-lg">
          I create solutions at the intersection of marine science, education,
          and technology — from marine biodiversity databases to gamified
          learning apps. Skilled in research, software development, and 3D
          design, I excel in hybrid team environments and deliver results with
          efficiency and precision.
        </p>
      </div>

      <div className="flex justify-center md:justify-end">
        <img
          src="/src/assets/hero_image.png"
          alt="Francis working on projects"
          className="h-auto w-full max-w-sm rounded-xl md:max-w-md"
        />
      </div>

      <div className="mt-0">
        <button
          onClick={onGetToKnowMe}
          className="w-full rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Get to know me
        </button>
      </div>
    </section>
  );
}

function AboutPage({ onBack }: AboutPageProps): JSX.Element {
  const images: CarouselImage[] = [
    { src: "/src/assets/about/me_1.jpg", alt: "Francis photo 1" },
    { src: "/src/assets/about/me_2.jpg", alt: "Francis photo 2" },
    { src: "/src/assets/about/me_3.jpg", alt: "Francis photo 3" },
  ];

  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold md:text-4xl">About Me</h1>

        {/* Carousel below title */}
        <div className="mt-5">
          <ImageCarousel images={images} />
        </div>

        <p className="mt-6 text-sm text-gray-700 md:text-base">
          I’m Francis — I build web apps, AI chatbots (RAG), and 3D workflows for
          research and education.
        </p>

        <div className="mt-8">
          <button
            onClick={onBack}
            className="rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageCarousel({ images }: ImageCarouselProps): JSX.Element {
  const [index, setIndex] = useState<number>(0);

  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef<number>(0);

  const count: number = images.length;
  const safeIndex: number = Math.min(Math.max(index, 0), Math.max(count - 1, 0));

  useEffect((): void => {
    if (index !== safeIndex) setIndex(safeIndex);
  }, [index, safeIndex]);

  const goPrev = (): void => {
    if (count === 0) return;
    setIndex((i: number) => (i - 1 + count) % count);
  };

  const goNext = (): void => {
    if (count === 0) return;
    setIndex((i: number) => (i + 1) % count);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    startXRef.current = e.touches[0]?.clientX ?? null;
    deltaXRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    const startX: number | null = startXRef.current;
    const currentX: number = e.touches[0]?.clientX ?? 0;
    if (startX === null) return;
    deltaXRef.current = currentX - startX;
  };

  const onTouchEnd = (): void => {
    const dx: number = deltaXRef.current;

    // Threshold: swipe at least 50px
    if (dx > 50) goPrev();
    else if (dx < -50) goNext();

    startXRef.current = null;
    deltaXRef.current = 0;
  };

  if (count === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border bg-gray-50 text-sm text-gray-500">
        Add 3–5 images to display here.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Swipe area */}
      <div
        className="relative overflow-hidden rounded-xl border bg-gray-50"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Track */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {images.map((img: CarouselImage) => (
            <div key={img.src} className="w-full shrink-0">
              <img
                src={img.src}
                alt={img.alt}
                className="h-72 w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl border bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white transition"
              aria-label="Previous image"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border bg-white/90 px-3 py-2 text-sm font-semibold hover:bg-white transition"
              aria-label="Next image"
            >
              Next
            </button>
          </>
        ) : null}
      </div>

      {/* Dots */}
      {count > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {images.map((_: CarouselImage, i: number) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={(): void => setIndex(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === safeIndex ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* Small hint (mobile) */}
      {count > 1 ? (
        <p className="mt-2 text-center text-xs text-gray-500">
          Swipe left/right to browse photos
        </p>
      ) : null}
    </div>
  );
}

function Skills(): JSX.Element {
  const SKILLS: Array<{ title: string; items: string[] }> = [
    {
      title: "Web & Application Development",
      items: [
        "Frontend: HTML, CSS, JavaScript, React, React Native",
        "Backend: Python, Django",
        "Database-backed systems: build and maintain structured data apps",
      ],
    },
    {
      title: "AI & Intelligent Systems",
      items: [
        "LLM-powered chatbots for FAQ and website assistance",
        "RAG (Retrieval-Augmented Generation) using curated knowledge bases",
        "AI-driven UX: designing user flows around AI features",
      ],
    },
    {
      title: "3D Technologies",
      items: [
        "3D scanning and post-processing for clean, usable assets",
        "3D modeling and optimization for web, apps, and printing",
        "3D printing and prototyping for research and demonstrations",
      ],
    },
    {
      title: "Game & Interactive Development",
      items: [
        "Godot 4 for 2D/3D interactive applications",
        "Educational and simulation apps for learning experiences",
      ],
    },
    {
      title: "Research & Technical Support",
      items: [
        "Data curation and validation for research datasets",
        "Technical documentation: proposals, reports, and project docs",
        "Applied research support for science/education projects",
      ],
    },
  ];

  return (
    <section className="py-5" id="skills">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">Skills</h2>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          Tools and strengths I use to build web, AI, and 3D-focused projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SKILLS.map((group) => (
          <div
            key={group.title}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-base font-bold md:text-lg">{group.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 md:text-base">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Education(): JSX.Element {
  const EDUCATION: Array<{
    school: string;
    program: string;
    year: string;
    details: string[];
  }> = [
    {
      school: "University of the Philippines Mindanao",
      program: "BS Computer Science",
      year: "2020-2025",
      details: [
        "Thesis: Mobile-Learning Application: Marine Fish Laboratory",
        "Relevant work: Marine biodiversity database, LLM-powered chatbot, 3D asset workflows",
      ],
    },
  ];

  return (
    <section className="py-5" id="education">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">Education</h2>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          Academic background and training that supports my work in software,
          AI, and 3D.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {EDUCATION.map((edu) => (
          <div
            key={`${edu.school}-${edu.program}`}
            className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <h3 className="text-base font-bold md:text-lg">{edu.school}</h3>
            </div>

            <p className="mt-2 font-medium text-gray-800">
              {edu.program} • {edu.year}
            </p>

            <ul className="mt-3 space-y-2 text-sm text-gray-700 md:text-base">
              {edu.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** -----------------------------
 * Experience (Card Grid)
 * - Only image, tech stack, and Read more.
 * ----------------------------- */
function Experience({ onReadMore }: ExperienceProps): JSX.Element {
  return (
    <section className="py-10" id="experience">
      <div className="mb-6">
        <h2 className="text-2xl font-bold md:text-3xl">Experience</h2>
        <p className="mt-1 text-sm text-gray-600 md:text-base">
          Selected projects. Tap “Read more” to view full details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {EXPERIENCES.map((exp) => (
          <div
            key={exp.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="h-44 w-full bg-gray-100">
              <img
                src={exp.images[0]?.src ?? ""}
                alt={exp.images[0]?.alt ?? exp.title}
                className="h-44 w-full object-cover"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div className="p-5">
              <h3 className="text-base font-bold md:text-lg">{exp.title}</h3>
              <p className="mt-1 text-xs text-gray-600">
                {exp.org} • {exp.date}
              </p>

              {exp.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exp.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <button
                  onClick={(): void => onReadMore(exp)}
                  className="w-full rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Read more
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** -----------------------------
 * Experience Details (FULL PAGE)
 * - No top-right "Back to project" button (only bottom one).
 * - Includes:
 *    1) Carousel-ready image area (prev/next)
 *    2) 3D Models section (cards with placeholders)
 * ----------------------------- */
function ExperienceDetails({
  experience,
  onBack,
}: ExperienceDetailsProps): JSX.Element {
  // Carousel-ready state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const imagesCount: number = experience.images.length;
  const hasImages: boolean = imagesCount > 0;

  const goPrev = (): void => {
    setActiveImageIndex((i: number) => (i - 1 + imagesCount) % imagesCount);
  };

  const goNext = (): void => {
    setActiveImageIndex((i: number) => (i + 1) % imagesCount);
  };

  const activeImage = hasImages ? experience.images[activeImageIndex] : null;

  return (
    <div className="min-h-screen px-5 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">{experience.title}</h2>
          <p className="mt-1 text-sm text-gray-600 md:text-base">
            <span className="font-medium text-gray-800">{experience.org}</span>
            <span className="text-gray-500"> • {experience.details.role}</span>
            <span className="text-gray-500"> • {experience.date}</span>
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          {/* Carousel-ready image area */}
          <div className="overflow-hidden rounded-xl border bg-gray-50">
            {activeImage ? (
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="h-72 w-full object-cover"
                onError={(e): void => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                Add experience images to enable the carousel.
              </div>
            )}
          </div>

          {/* Carousel controls (shown only if there are 2+ images) */}
          {imagesCount > 1 ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Prev
              </button>

              <div className="text-xs text-gray-600">
                {activeImageIndex + 1} / {imagesCount}
              </div>

              <button
                onClick={goNext}
                className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          ) : null}

          {/* Thumbnails (optional; good for carousel later) */}
          {imagesCount > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.images.map((img, idx) => (
                <button
                  key={`${img.src}-${idx}`}
                  onClick={(): void => setActiveImageIndex(idx)}
                  className={`h-14 w-20 overflow-hidden rounded-lg border transition ${
                    idx === activeImageIndex
                      ? "border-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          {/* Tech stack */}
          {experience.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {experience.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          {/* Details */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-gray-800 md:text-base">
              What I did
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-700 md:text-base">
              {experience.details.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-gray-400" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3D Models section (documentation-ready) */}
          <div className="mt-8">
            <h4 className="text-sm font-bold text-gray-800 md:text-base">
              Sample 3D Models
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Add previews, embeds, or links to showcase models produced in this
              experience.
            </p>

            {experience.models && experience.models.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {experience.models.map((m) => (
                  <div
                    key={m.title}
                    className="rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="font-semibold text-gray-800">{m.title}</h5>
                    </div>

                    {/* Optional thumbnail preview */}
                    {m.previewSrc ? (
                      <div className="mt-3 overflow-hidden rounded-lg border bg-gray-50">
                        <img
                          src={m.previewSrc}
                          alt={m.title}
                          className="h-40 w-full object-cover"
                          onError={(e): void => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="mt-3 flex h-40 items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-500">
                        Add a model preview image
                      </div>
                    )}

                    {/* Optional embed (kept off by default; enable when you have a valid embed URL) */}
                    {m.embedUrl ? (
                      <div className="mt-3 overflow-hidden rounded-lg border">
                        <iframe
                          title={m.title}
                          src={m.embedUrl}
                          className="h-64 w-full"
                          allow="autoplay; fullscreen; xr-spatial-tracking"
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {/* Optional link */}
                    {m.linkUrl ? (
                      <a
                        href={m.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-semibold text-gray-900 underline hover:opacity-80"
                      >
                        View model
                      </a>
                    ) : null}

                    {m.notes ? (
                      <p className="mt-2 text-sm text-gray-600">{m.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm text-gray-600">
                No models added yet. Populate{" "}
                <span className="font-mono">experience.models</span> to show
                them here.
              </div>
            )}
          </div>

          {/* Back button (only one, at the bottom) */}
          <div className="mt-8">
            <button
              onClick={onBack}
              className="rounded-xl border bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Back to project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer({
  githubUrl,
  linkedinUrl,
  emailAddress,
}: FooterProps): JSX.Element {
  const year: number = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaRegCopyright className="size-4" />
          <span>{year} Francis Albert E. Celeste. All rights reserved.</span>
        </p>

        <div className="flex items-center gap-4">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaGithub className="size-5" />
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaLinkedin className="size-5" />
          </a>

          <a
            href={`mailto:${emailAddress}`}
            aria-label="Email"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaEnvelope className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

/** -----------------------------
 * App
 * - When active experience is set, hide EVERYTHING including navbar.
 * ----------------------------- */
export default function App(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [page, setPage] = useState<Page>("home");

  // Full-page Experience detail view state
  const [activeExperience, setActiveExperience] =
    useState<ExperienceItem | null>(null);

  if (activeExperience) {
    return (
      <ExperienceDetails
        experience={activeExperience}
        onBack={(): void => setActiveExperience(null)}
      />
    );
  }

  // If About page is active, hide everything else (acts like a new page)
  if (page === "about") {
    return (
      <AboutPage
        onBack={(): void => {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          setPage("home");
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col pr-5 pl-5">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <NavBarDesktop />
          <div className="ml-auto">
            <NavBarMobile open={mobileOpen} setOpen={setMobileOpen} />
          </div>
        </div>
      </header>

      {!mobileOpen && (
        <>
          <main className="mx-auto w-full max-w-6xl px-4">
            {/* Controls vertical gap between sections */}
            <div className="space-y-6 md:space-y-10">
              <Home
                onGetToKnowMe={(): void => {
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  setPage("about");
                }}
              />
              <Skills />
              <Education />
              <Experience
                onReadMore={(exp: ExperienceItem): void => {
                  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                  setActiveExperience(exp);
                }}
              />
            </div>
          </main>
          <Footer
            githubUrl="https://github.com/YOUR_USERNAME"
            linkedinUrl="https://www.linkedin.com/in/YOUR_PROFILE/"
            emailAddress="YOUR_EMAIL@gmail.com"
          />
        </>
      )}
    </div>
  );
}
