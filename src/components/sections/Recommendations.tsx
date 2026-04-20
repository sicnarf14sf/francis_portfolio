import { type JSX } from "react";
import { FaQuoteLeft, FaRegCommentDots } from "react-icons/fa6";
import SectionHeader from "../layout/SectionHeader";
import type { RecommendationItem } from "../../types";

type RecommendationsProps = {
  recommendations: RecommendationItem[];
  compact?: boolean;
};

export default function Recommendations({
  recommendations,
  compact = false,
}: RecommendationsProps): JSX.Element | null {
  if (recommendations.length === 0) return null;

  return (
    <section className={compact ? "" : "py-1"} id="recommendations">
      <SectionHeader
        title="Recommendations"
        subtitle="A few words from collaborators, mentors, and teams I have worked with."
        icon={FaRegCommentDots}
        variant="default"
        compact={compact}
      />

      <div className={`grid grid-cols-1 gap-3 ${compact ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}>
        {recommendations.map((item) => (
          <article key={item.id} className={`border bg-card shadow-sm transition hover:shadow-md ${compact ? "p-3" : "p-4"}`}>
            <FaQuoteLeft className="h-4 w-4 text-foreground/45" />
            <p className={`text-foreground/85 ${compact ? "mt-2 text-sm leading-5" : "mt-3 text-sm leading-6"}`}>
              {item.recommendation}
            </p>
            <div className={`${compact ? "mt-3 pt-2" : "mt-4 pt-3"} border-t`}>
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <p className="mt-1 text-xs text-foreground/65">
                {[item.role, item.organization].filter(Boolean).join(" | ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
