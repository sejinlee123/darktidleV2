"use client";

import { useLayoutEffect } from "react";

/** Applies `dark` on `<html>` from `prefers-color-scheme` without a `<script>` in the React tree (React 19+). */
export function DarkModeInit() {
  useLayoutEffect(() => {
    try {
      const m = window.matchMedia("(prefers-color-scheme: dark)");
      const sync = () => {
        document.documentElement.classList.toggle("dark", m.matches);
      };
      sync();
      m.addEventListener("change", sync);
      return () => m.removeEventListener("change", sync);
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
