"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/heardle", label: "Heardle" },
  { href: "/wordle", label: "Wordle" },
  { href: "/library", label: "Library" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
] as const;

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {navItems.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors md:py-1.5 ${
                active
                  ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:border-zinc-800/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          Darktidle
        </Link>

        <nav
          className="hidden md:block"
          aria-label="Main"
        >
          <NavLinks className="flex flex-wrap items-center justify-end gap-1" />
        </nav>

        <div className="flex items-center md:hidden">
          <button
            ref={buttonRef}
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="true"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            {menuOpen ? (
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-zinc-200 px-4 py-3 shadow-lg dark:border-zinc-800 md:hidden"
          role="navigation"
          aria-label="Main"
        >
          <NavLinks
            onNavigate={closeMenu}
            className="flex flex-col gap-0.5"
          />
        </div>
      ) : null}
    </header>
  );
}
