// src/data/navLinks.ts
import { AiFillHome } from "react-icons/ai";
import { FaGear } from "react-icons/fa6";
import { FaGraduationCap } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa";
import type { NavLink } from "../types";

export const LINKS: NavLink[] = [
  { href: "#home", label: "Home", icon: AiFillHome },
  { href: "#skills", label: "Skills", icon: FaGear },
  { href: "#education", label: "Education", icon: FaGraduationCap },
  { href: "#experience", label: "Experience", icon: FaBriefcase },
];