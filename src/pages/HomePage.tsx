import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

import NavBarMobile from "../components/nav/NavBarMobile";
import Home from "../components/sections/Home";
import Skills from "../components/sections/Skills";
import Education from "../components/sections/Education";
import Experience from "../components/sections/Experience";
import Recommendations from "../components/sections/Recommendations";
import Footer from "../components/layout/Footer";

import type { ExperienceItem, RecommendationItem } from "../types";
import { fetchExperiences } from "../lib/api/experience";
import { fetchEducation, type EducationItem } from "../lib/api/education";
import { fetchRecommendations } from "../lib/api/recommendations";

export default function HomePage(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async (): Promise<void> => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [exp, edu, recs] = await Promise.all([
          fetchExperiences(),
          fetchEducation(),
          fetchRecommendations(),
        ]);
        if (cancelled) return;

        setExperiences(exp);
        setEducation(edu);
        setRecommendations(recs);
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(err instanceof Error ? err.message : "Failed to load content.");
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
    <div className="flex min-h-screen flex-col pr-5 pl-5 bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <div className="flex-1">
            <NavBarMobile open={mobileOpen} setOpen={setMobileOpen} />
          </div>
        </div>
      </header>

      {!mobileOpen && (
        <>
          <main className="mx-auto w-full max-w-6xl px-4 page-enter md:pt-4">
            {loading ? (
              <div className="py-10 text-sm text-muted-foreground">
                Loading content…
              </div>
            ) : errorMsg ? (
              <div className="py-10">
                <p className="text-sm text-red-600">{errorMsg}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Check your Supabase env vars and table policies (RLS).
                </p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-5">
                <Home onGetToKnowMe={() => navigate("/about")} />

                <div className="space-y-5 xl:hidden">
                  <Skills />
                  <Recommendations recommendations={recommendations} />
                  <Education education={education} />
                  <Experience
                    experiences={experiences}
                    onReadMore={(exp) => navigate(`/experience/${exp.id}`)}
                  />
                </div>

                <div className="hidden xl:grid xl:grid-cols-[1.02fr_0.98fr] xl:items-start xl:gap-4">
                  <div className="space-y-4 border bg-card/60 p-4 shadow-sm rounded-md">
                    <Skills compact />
                    <Education education={education} compact />
                  </div>

                  <div className="space-y-4 border bg-card/60 p-4 shadow-sm rounded-md">
                    <Recommendations recommendations={recommendations} compact />
                    <Experience
                      experiences={experiences}
                      onReadMore={(exp) => navigate(`/experience/${exp.id}`)}
                      compact
                    />
                  </div>
                </div>
              </div>
            )}
          </main>

          <Footer
            githubUrl="https://github.com/sicnarf14sf"
            linkedinUrl="https://linkedin.com/in/feceleste"
            emailAddress="francis14sf@gmail.com"
          />
        </>
      )}
    </div>
  );
}
