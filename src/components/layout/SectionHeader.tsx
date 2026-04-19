import React, { type JSX } from "react";

type SectionVariant = "skills" | "education" | "experience" | "default" | "aboutPage";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: SectionVariant;
  compact?: boolean;
};

const VARIANT_STYLES: Record<
  SectionVariant,
  {
    badge: string;
    accentBar: string | null;
    accentDot: string | null;
    bg: string;
  }
> = {
  default: {
    badge: "bg-card border-border",
    accentBar: "bg-foreground",
    accentDot: "bg-foreground",
    bg: "bg-card border-border",
  },
  skills: {
    badge: "bg-card border-border",
    accentBar: "bg-blue-600",
    accentDot: "bg-blue-600",
    bg: "bg-card border-border",
  },
  education: {
    badge: "bg-card border-border",
    accentBar: "bg-emerald-600",
    accentDot: "bg-emerald-600",
    bg: "bg-card border-border",
  },
  experience: {
    badge: "bg-card border-border",
    accentBar: "bg-violet-600",
    accentDot: "bg-violet-600",
    bg: "bg-card border-border",
  },
  aboutPage: {
    // A bit more "hero" vibe while still consistent
    badge: "bg-card/90 border-border",
    accentBar: null,
    accentDot: null,
    bg: "bg-card border-border",
  },
};

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  variant = "default",
  compact = false,
}: SectionHeaderProps): JSX.Element {
  const styles = VARIANT_STYLES[variant];
  const isAbout: boolean = variant === "aboutPage";

  if (compact) {
    return (
      <div className="mb-3 border-b pb-3">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span
              className={`inline-flex h-8 w-8 items-center justify-center border ${styles.badge}`}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4 text-foreground" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // About page layout: centered, icon above title
  if (isAbout) {
    return (
      <div className={`mb-5 overflow-hidden border ${styles.bg}`}>
        <div className="px-6 py-7 md:px-8 md:py-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {Icon ? (
              <span
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center border shadow-sm ${styles.badge}`}
                aria-hidden="true"
              >
                <Icon className="h-6 w-6 text-foreground" />
              </span>
            ) : null}

            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {title}
            </h2>

            {/* Accent underline */}
            {styles.accentDot && styles.accentBar ? (
              <div className="mt-4 flex items-center gap-3">
                <span className={`h-1.5 w-1.5 rounded-full ${styles.accentDot}`} />
                <span className={`h-[3px] w-20 rounded-full ${styles.accentBar}`} />
                <span className={`h-1.5 w-1.5 rounded-full ${styles.accentDot}`} />
              </div>
            ) : null}

            {subtitle ? (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Default layout (left-aligned, icon on right)
  return (
    <div className={`mb-5 overflow-hidden border ${styles.bg}`}>
      <div className="px-4 py-4 md:px-5 md:py-4">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold md:text-2xl">{title}</h2>

              {Icon ? (
                <span
                  className={`ml-auto inline-flex h-9 w-9 items-center justify-center border shadow-sm ${styles.badge}`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-foreground" />
                </span>
              ) : null}
            </div>

            {/* Accent underline (subtle for normal sections) */}
            {styles.accentDot && styles.accentBar ? (
              <div className="mt-3 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${styles.accentDot}`} />
                <span className={`h-[3px] w-14 rounded-full ${styles.accentBar}`} />
              </div>
            ) : null}

            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
