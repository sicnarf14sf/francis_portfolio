import { useEffect, useState } from "react";
import { type JSX } from "react";

export default function Home({ onGetToKnowMe }: { onGetToKnowMe: () => void }): JSX.Element {
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
            Software Developer | 3D Artist | Researcher | Philippine Based
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