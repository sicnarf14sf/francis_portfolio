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

export type AboutPageContent = {
  title: string;
  intro: string;
};

export type RecommendationItem = {
  id: string;
  name: string;
  role: string;
  organization: string;
  recommendation: string;
};

export type SampleOutputKind = "3d" | "image" | "app";

export type SampleOutputBase = {
  id: string;
  kind: SampleOutputKind;
  title: string;
  description?: string;
  tags?: string[];
};

export type SampleOutput3D = SampleOutputBase & {
  kind: "3d";
  glbSrc: string;
  previewSrc?: string;
};

export type SampleOutputImage = SampleOutputBase & {
  kind: "image";
  imageSrc: string;
  imageAlt: string;
  linkUrl?: string;
};

export type SampleOutputApp = SampleOutputBase & {
  kind: "app";
  imageSrc?: string;
  imageAlt?: string;
  linkUrl?: string;
};

export type SampleOutputItem =
  | SampleOutput3D
  | SampleOutputImage
  | SampleOutputApp;

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
  scientificName?: string;
  notes?: string;
};



export type ExperienceItem = {
  id: string;
  title: string;
  org: string;
  date: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;

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
