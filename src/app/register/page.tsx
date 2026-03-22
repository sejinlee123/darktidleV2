"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const fieldClass =
  "rounded-md border border-zinc-300 bg-background px-3 py-2 text-base text-foreground outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:ring-zinc-600";

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "Agent";
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const emailRaw = (form.elements.namedItem("email") as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const confirm = (
      form.elements.namedItem("confirmPassword") as HTMLInputElement
    ).value;

    const email = emailRaw.trim().toLowerCase();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const { error: signError } = await authClient.signUp.email({
        email,
        password,
        name: displayNameFromEmail(email),
      });
      if (signError) {
        setError(signError.message || "Could not create account.");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Register</h1>

      {error ? (
        <p
          className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="you@example.com"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={fieldClass}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className={fieldClass}
            disabled={pending}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
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
