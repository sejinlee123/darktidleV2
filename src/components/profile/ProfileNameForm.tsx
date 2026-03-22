"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type ProfileNameFormProps = {
  initialName: string;
};

export function ProfileNameForm({ initialName }: ProfileNameFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await authClient.updateUser({ name: trimmed });
      if (error) {
        setMessage(error.message ?? "Could not update name.");
        return;
      }
      setMessage("Display name saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor="profile-display-name" className="text-sm text-muted-foreground">
        Display name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          id="profile-display-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
          maxLength={120}
          className="sm:min-w-0 sm:flex-1"
        />
        <Button type="submit" disabled={saving} className="shrink-0">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      {message ? (
        <p
          className={
            message.includes("saved")
              ? "text-xs text-green-600 dark:text-green-400"
              : "text-xs text-destructive"
          }
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
