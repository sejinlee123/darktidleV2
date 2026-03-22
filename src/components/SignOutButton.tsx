"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await authClient.signOut();
          router.push("/login");
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Signing out…" : "Log out"}
    </Button>
  );
}
