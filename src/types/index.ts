// src/types/index.ts
export type Page = "home" | "about";

export type CertificateItem = {
  title: string;
  org: string;
  year: number; // use number so sorting is clean
  subtitle?: string;
  location?: string;

  // NEW: certificate photo
  imageSrc: string;
  imageAlt: string;
};

export type CarouselImage = {
  src: string;
  alt: string;
};

export type ImageCarouselProps = {
  images: CarouselImage[];
};

export type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type FooterProps = {
  githubUrl: string;
  linkedinUrl: string;
  emailAddress: string;
};

export type ExperienceDetailsData = {
  role: string;
  highlights: string[];
};

export type ExperienceModel = {
  title: string;
  previewSrc?: string;   // optional thumbnail
  glbSrc?: string;       // ✅ local/public URL to the .glb file
  embedUrl?: string;     // optional iframe
  linkUrl?: string;      // optional external link
  scientificName?: string;
};



export type ExperienceItem = {
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

  models?: ExperienceModel[];
};

export type NavBarMobileProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type ExperienceProps = {
  onReadMore: (exp: ExperienceItem) => void;
};

export type ExperienceDetailsProps = {
  experience: ExperienceItem;
  onBack: () => void;
};

export type AboutPageProps = {
  onBack: () => void;
};