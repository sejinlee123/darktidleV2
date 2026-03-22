"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Home" },
  { href: "/heardle", label: "Heardle" },
  { href: "/wordle", label: "Wordle" },
  { href: "/library", label: "Library" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
] as const;

const navLinkBase =
  "rounded-md px-3 py-2 text-sm font-medium transition-[color,background-color,box-shadow] outline-none md:py-1.5";

const navLinkInactive =
  "text-muted-foreground hover:bg-accent hover:text-accent-foreground";

const navLinkActive =
  "bg-primary/15 text-primary shadow-[inset_0_0_0_1px] shadow-primary/50 ring-2 ring-primary/35 ring-offset-2 ring-offset-background";

const navLinkFocus =
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type NavEntry =
  | { kind: "link"; href: string; label: string }
  | { kind: "logout"; label: string };

function buildNavEntries(loggedIn: boolean): NavEntry[] {
  if (loggedIn) {
    return [
      ...mainNavItems.map((i) => ({ kind: "link" as const, ...i })),
      { kind: "link" as const, href: "/profile", label: "Profile" },
      { kind: "logout" as const, label: "Log out" },
    ];
  }
  return [
    ...mainNavItems.map((i) => ({ kind: "link" as const, ...i })),
    { kind: "link" as const, href: "/login", label: "Login" },
    { kind: "link" as const, href: "/register", label: "Register" },
  ];
}

function NavLinks({
  entries,
  onLogout,
  onNavigate,
  className,
}: {
  entries: NavEntry[];
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {entries.map((entry) => {
        if (entry.kind === "logout") {
          return (
            <li key="logout">
              <button
                type="button"
                onClick={() => {
                  onNavigate?.();
                  onLogout();
                }}
                className={cn(
                  navLinkBase,
                  navLinkFocus,
                  "w-full text-left",
                  navLinkInactive,
                )}
              >
                {entry.label}
              </button>
            </li>
          );
        }

        const active = pathname === entry.href;
        return (
          <li key={entry.href}>
            <Link
              href={entry.href}
              onClick={onNavigate}
              className={cn(
                navLinkBase,
                navLinkFocus,
                "block",
                active ? navLinkActive : navLinkInactive,
              )}
              aria-current={active ? "page" : undefined}
            >
              {entry.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const loggedIn = Boolean(session?.user);
  const entries = buildNavEntries(loggedIn);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogout = useCallback(async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "shrink-0 text-lg font-semibold tracking-tight text-primary",
            "drop-shadow-[0_0_12px_oklch(0.78_0.19_145_/_0.35)]",
            "transition-[color,filter] hover:text-primary/90 hover:drop-shadow-[0_0_14px_oklch(0.78_0.19_145_/_0.45)]",
            "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Darktidle
        </Link>

        <nav className="hidden md:block" aria-label="Main">
          {isPending ? (
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted/60" />
          ) : (
            <NavLinks
              entries={entries}
              onLogout={handleLogout}
              className="flex flex-wrap items-center justify-end gap-1"
            />
          )}
        </nav>

        <div className="flex items-center md:hidden">
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-border bg-background px-4 py-3 shadow-lg md:hidden"
          role="navigation"
          aria-label="Main"
        >
          <NavLinks
            entries={entries}
            onLogout={handleLogout}
            onNavigate={closeMenu}
            className="flex flex-col gap-0.5"
          />
        </div>
      ) : null}
    </header>
  );
}
