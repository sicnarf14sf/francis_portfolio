import React, { type JSX } from "react";

type SectionVariant = "skills" | "education" | "experience" | "default";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: SectionVariant;
};

const VARIANT_STYLES: Record<
  SectionVariant,
  {
    badge: string;
    accentBar: string;
    accentDot: string;
    bg: string;
  }
> = {
  default: {
    badge: "bg-white border-gray-200",
    accentBar: "bg-gray-900",
    accentDot: "bg-gray-900",
    bg: "bg-gradient-to-b from-gray-50 to-white border-gray-200",
  },
  skills: {
    badge: "bg-white border-blue-200",
    accentBar: "bg-blue-600",
    accentDot: "bg-blue-600",
    bg: "bg-gradient-to-b from-blue-50 to-white border-blue-100",
  },
  education: {
    badge: "bg-white border-emerald-200",
    accentBar: "bg-emerald-600",
    accentDot: "bg-emerald-600",
    bg: "bg-gradient-to-b from-emerald-50 to-white border-emerald-100",
  },
  experience: {
    badge: "bg-white border-violet-200",
    accentBar: "bg-violet-600",
    accentDot: "bg-violet-600",
    bg: "bg-gradient-to-b from-violet-50 to-white border-violet-100",
  },
};

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  variant = "default",
}: SectionHeaderProps): JSX.Element {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={`mb-6 overflow-hidden rounded-2xl border ${styles.bg}`}>
      <div className="px-5 py-4 md:px-6 md:py-5">
        <div className="flex items-start gap-4">

          {/* Title + subtitle */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>

              {/* Icon badge (optional) */}
              {Icon ? (
                <span
                  className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm ${styles.badge}`}
                >
                  {/* Use h/w instead of size to avoid odd rendering */}
                  <Icon className="h-5 w-5 text-gray-900" />
                </span>
              ) : null}
            </div>

            {subtitle ? (
              <p className="mt-2 text-sm text-gray-600 md:text-base">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}