// src/data/experiences.ts
import type { ExperienceItem } from "../types";

export const EXPERIENCES: ExperienceItem[] = [
    {
      id: "embrace-mabida-phase-2",
      title: "EMBRACE MABIDA Project Phase 2",
      org: "University of the Philippines Mindanao",
      date: "Jan – Dec 2025",
      images: [
        {
          src: "/src/assets/experience/EM Footer 2.png",
          alt: "EMBRACE MABIDA Phase 2 - screenshot 1",
        },
        {
          src: "/src/assets/experience/embrace_mabida_1.png",
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
          title: "Redmouth grouper",
          glbSrc: "/models/Aethalopercarogaa.glb",
          scientificName: "Aethaloperca rogaa",
        },
        {
          title: "Red squirrelfish",
          glbSrc: "/models/Sargocentronrubrum.glb",
          scientificName: "Sargocentron rubrum",
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
          src: "/src/assets/experience/Colored - GTA and Logo Horizontal.png",
          alt: "GTA Lab - screenshot 1",
        },
        {
          src: "/src/assets/experience/GTA Lab Wallpaper.png",
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
      models: [
        {
          title: "Redmouth grouper",
          glbSrc: "/models/Aethalopercarogaa.glb",
          scientificName: "Aethaloperca rogaa",
        },
        {
          title: "Red squirrelfish",
          glbSrc: "/models/Sargocentronrubrum.glb",
          scientificName: "Sargocentron rubrum",
        },
      ],
    },
  ];