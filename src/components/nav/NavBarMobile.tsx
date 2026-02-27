import { useEffect, type JSX, type MouseEvent } from "react";
import { LINKS } from "../../data/navLinks";
import type { NavBarMobileProps } from "../../types";
import { FiMenu, FiX } from "react-icons/fi";
import { scrollToId } from "../../utils/scrollToId";

export default function NavBarMobile({ open, setOpen }: NavBarMobileProps): JSX.Element {
  useEffect((): (() => void) => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return (): void => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string): void => {
    e.preventDefault();

    // 1) close menu (this will unlock body scroll in the effect)
    setOpen(false);

    // 2) scroll after the menu closes + overflow is reset
    window.setTimeout((): void => {
      scrollToId(href);
    }, 0);
  };

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 rounded-lg border"
        onClick={(): void => setOpen((v: boolean) => !v)}
      >
        {open ? <FiX className="size-6" /> : <FiMenu className="size-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] bg-white">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-end px-4 border-b">
            <button
              aria-label="Close menu"
              className="p-2 rounded-lg border"
              onClick={(): void => setOpen(false)}
            >
              <FiX className="size-6" />
            </button>
          </div>

          <nav className="mx-auto max-w-6xl px-6 py-8">
            <ul className="space-y-4 text-lg font-medium">
              {LINKS.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="flex items-center gap-3 rounded-xl p-4 border hover:bg-gray-50"
                    onClick={(e): void => handleNavClick(e, href)}
                  >
                    <Icon className="size-6" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}