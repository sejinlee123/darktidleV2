import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/SignOutButton";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const { user } = session;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12 sm:px-6">
      <Card className="border-border ring-1 ring-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Profile</CardTitle>
          <CardDescription>
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {user.name ? (
            <p className="text-sm text-muted-foreground">
              Display name:{" "}
              <span className="font-medium text-foreground">{user.name}</span>
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            User id:{" "}
            <span className="font-mono text-xs text-foreground">{user.id}</span>
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Home
            </Link>
            <SignOutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
