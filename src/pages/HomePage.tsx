import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

import NavBarDesktop from "../components/nav/NavBarDesktop";
import NavBarMobile from "../components/nav/NavBarMobile";
import Home from "../components/sections/Home";
import Skills from "../components/sections/Skills";
import Education from "../components/sections/Education";
import Experience from "../components/sections/Experience";
import Footer from "../components/layout/Footer";
import type { ExperienceItem } from "../types";

export default function HomePage(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const navigate = useNavigate();

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
          <main className="mx-auto w-full max-w-6xl px-4 page-enter">
            <div className="space-y-6 md:space-y-10">
              <Home onGetToKnowMe={() => navigate("/about")} />

              <Skills />
              <Education />

              <Experience
                onReadMore={(exp: ExperienceItem): void => {
                  // navigate to a real route for details
                  navigate(`/experience/${exp.id}`);
                }}
              />
            </div>
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