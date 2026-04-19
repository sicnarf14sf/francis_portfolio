import { type JSX } from "react";
import type { FooterProps } from "../../types/index.ts";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaRegCopyright,
} from "react-icons/fa";
import { useTheme } from "../../theme/ThemeProvider";

export default function Footer({
  githubUrl,
  linkedinUrl,
  emailAddress,
}: FooterProps): JSX.Element {
  const year: number = new Date().getFullYear();
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer className="mt-10 border-t bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FaRegCopyright className="size-4" />
          <span>{year} Francis Albert E. Celeste. All rights reserved.</span>
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-semibold transition hover:bg-muted"
          >
            <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="rounded-lg border p-2 transition hover:bg-muted"
          >
            <FaGithub className="size-5" />
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="rounded-lg border p-2 transition hover:bg-muted"
          >
            <FaLinkedin className="size-5" />
          </a>

          <a
            href={`mailto:${emailAddress}`}
            aria-label="Email"
            className="rounded-lg border p-2 transition hover:bg-muted"
          >
            <FaEnvelope className="size-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
