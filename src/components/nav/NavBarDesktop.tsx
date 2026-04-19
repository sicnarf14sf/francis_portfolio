import React, { type JSX } from "react";
import { LINKS } from "../../data/navLinks";
import { scrollToId } from "../../utils/scrollToId";
import { useTheme } from "../../theme/ThemeProvider";

export default function NavBarDesktop(): JSX.Element {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="hidden h-16 items-center md:flex">
      <ul className="flex flex-1 items-center gap-8 text-sm font-medium">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <a
              href={href}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                e.preventDefault();
                scrollToId(href);
              }}
              className="inline-flex items-center gap-2 transition hover:opacity-80"
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </a>
          </li>
        ))}
        <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card text-sm transition hover:bg-accent"
      >
        <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
      </button>
      </ul>

      
    </nav>
  );
}