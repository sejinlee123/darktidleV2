import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/site-origin";

/** Indexable public routes only (auth/account pages use noindex). */
const paths = [
  "/",
  "/heardle",
  "/wordle",
  "/library",
  "/leaderboard",
  "/about",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const lastModified = new Date();

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
