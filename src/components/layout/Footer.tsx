import { type JSX } from "react";
import type { FooterProps } from "../../types/index.ts";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaRegCopyright,
} from "react-icons/fa";

export default function Footer({
  githubUrl,
  linkedinUrl,
  emailAddress,
}: FooterProps): JSX.Element {
  const year: number = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <FaRegCopyright className="size-4" />
          <span>{year} Francis Albert E. Celeste. All rights reserved.</span>
        </p>

        <div className="flex items-center gap-4">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaGithub className="size-5" />
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaLinkedin className="size-5" />
          </a>

          <a
            href={`mailto:${emailAddress}`}
            aria-label="Email"
            className="rounded-lg border p-2 hover:bg-gray-50 transition"
          >
            <FaEnvelope className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
