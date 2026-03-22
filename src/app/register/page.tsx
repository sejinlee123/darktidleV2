"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Register</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Sign-up will persist to Neon once auth is implemented.
      </p>
      <form
        className="mt-8 flex flex-col gap-4"
        action="#"
        method="post"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="rounded-md border border-zinc-300 bg-background px-3 py-2 text-base text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:ring-zinc-600"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            className="rounded-md border border-zinc-300 bg-background px-3 py-2 text-base text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:ring-zinc-600"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            className="rounded-md border border-zinc-300 bg-background px-3 py-2 text-base text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:ring-zinc-600"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
