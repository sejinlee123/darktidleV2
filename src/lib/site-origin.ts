/** Strip trailing slashes so origins match browser `Origin` headers. */
export function normalizeOrigin(url: string | undefined | null): string | null {
  if (!url) return null;
  const t = url.trim().replace(/\/+$/, "");
  return t.length > 0 ? t : null;
}

const port = process.env.PORT ?? "3000";
const defaultLocal = `http://localhost:${port}`;

/** Canonical site origin for absolute URLs (sitemap, robots, auth baseURL). */
export function getSiteOrigin(): string {
  return (
    normalizeOrigin(process.env.BETTER_AUTH_URL) ||
    normalizeOrigin(
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : defaultLocal,
    ) ||
    defaultLocal
  );
}
