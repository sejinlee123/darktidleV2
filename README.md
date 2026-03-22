# Darktidle

A **Darktide**-themed fan site with a **Heardle**-style daily clip game, a **Wordle**-style daily puzzle, a **voice clip library** (likes/dislikes), **accounts**, and a **Heardle leaderboard**—built with Next.js and Postgres.

## Stack

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Prisma** 7 + **PostgreSQL** (local or [Neon](https://neon.tech))
- **Better Auth** (email + password, sessions, optional account deletion)
- **Tailwind CSS** 4, **Vercel Analytics**

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/) (`corepack enable` or install globally)
- A **PostgreSQL** database URL

## Local setup

1. **Clone and install**

   ```bash
   pnpm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | Postgres connection string (add `?sslmode=require` on Neon if needed) |
   | `BETTER_AUTH_SECRET` | At least 32 random bytes (e.g. `openssl rand -base64 32`) |
   | `BETTER_AUTH_URL` | App origin with **no** trailing slash, e.g. `http://localhost:3000` |

3. **Database schema**

   ```bash
   pnpm db:push
   ```

   (Use `pnpm db:migrate` instead if you maintain Prisma migrations.)

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

The dev script runs `prisma generate` before `next dev`. The production **build** also regenerates the voice manifest from `voice-config.json` (see scripts below).

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Prisma generate + Next.js dev server |
| `pnpm build` | Prisma generate + voice manifest + `next build` |
| `pnpm start` | Production server (after `pnpm build`) |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push Prisma schema to the database |
| `pnpm db:migrate` | Create/apply migrations (dev workflow) |
| `pnpm db:generate` | Regenerate Prisma Client |
| `pnpm voices:manifest` | Regenerate `src/data/voice-manifest.json` from `voice-config.json` |
| `pnpm voices:transcribe` | Optional: Python helper for manifest transcription |
| `pnpm wordle:pool` | Regenerate Wordle daily word pool JSON |

## Deploy (Vercel + Neon)

1. Create a **Neon** database and copy `DATABASE_URL`.
2. Apply the schema once (from your machine with prod `DATABASE_URL`, or via Neon SQL if you prefer):

   ```bash
   pnpm db:push
   ```

3. In **Vercel**, import the repo and set **Environment Variables** (Production, and Preview if previews should use a DB):

   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` — your real site URL, e.g. `https://your-app.vercel.app` or your custom domain (no trailing slash)

4. Deploy. Vercel will run `pnpm build` (includes Prisma generate and voice manifest generation).

After you attach a **custom domain**, update `BETTER_AUTH_URL` to match it so auth cookies and redirects stay correct.

## Project notes

- Auth API lives at `/api/auth/*` (`src/app/api/auth/[...all]/route.ts`). Optional edge redirects for login/register/profile use Next.js **`src/proxy.ts`** (see Next 16 “proxy” convention).
- This repo follows workspace guidance in `AGENTS.md` regarding Next.js docs under `node_modules/next/dist/docs/` when APIs differ from older versions.

## License

Private / fan project—respect Fatshark’s IP and community guidelines for **Warhammer 40,000: Darktide** content.
