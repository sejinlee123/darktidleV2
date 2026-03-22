import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/site-origin";

const paths = [
  "/",
  "/heardle",
  "/wordle",
  "/library",
  "/leaderboard",
  "/about",
  "/login",
  "/register",
  "/profile",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const lastModified = new Date();

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}
