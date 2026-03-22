import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";
import { getSiteOrigin, normalizeOrigin } from "@/lib/site-origin";

/** Browsers treat `localhost` and `127.0.0.1` as different origins; trust both for local HTTP. */
function localHostTwin(origin: string): string | null {
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:") return null;
    const suffix = u.port ? `:${u.port}` : "";
    if (u.hostname === "localhost") return `http://127.0.0.1${suffix}`;
    if (u.hostname === "127.0.0.1") return `http://localhost${suffix}`;
  } catch {
    /* ignore */
  }
  return null;
}

const baseURL = getSiteOrigin();

const trustedOriginsSet = new Set<string>();
const addTrusted = (url: string | undefined | null) => {
  const n = normalizeOrigin(url);
  if (n) {
    trustedOriginsSet.add(n);
    const twin = localHostTwin(n);
    if (twin) trustedOriginsSet.add(twin);
  }
};

function addTrustedFromList(raw: string | undefined) {
  if (!raw) return;
  for (const part of raw.split(",")) {
    addTrusted(part.trim());
  }
}

addTrusted(baseURL);
addTrusted(process.env.BETTER_AUTH_URL);
if (process.env.VERCEL_URL) {
  addTrusted(`https://${process.env.VERCEL_URL}`);
}
addTrustedFromList(process.env.BETTER_AUTH_TRUSTED_ORIGINS);

const trustedOrigins = [...trustedOriginsSet];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
  plugins: [nextCookies()],
});
