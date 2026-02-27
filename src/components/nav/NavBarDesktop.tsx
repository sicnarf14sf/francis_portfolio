import React, { type JSX } from "react";
import { LINKS } from "../../data/navLinks";
import { scrollToId } from "../../utils/scrollToId";

export default function NavBarDesktop(): JSX.Element {
    return (
      <nav className="hidden md:flex h-16 items-center">
        <ul className="flex items-center gap-8 text-sm font-medium">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                  e.preventDefault();
                  scrollToId(href);
                }}
                className="inline-flex items-center gap-2 hover:opacity-80 transition"
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }