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
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import { ProfileNameForm } from "@/components/profile/ProfileNameForm";
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
        <CardContent className="flex flex-col gap-4">
          <ProfileNameForm initialName={user.name ?? ""} />
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Home
            </Link>
            <SignOutButton />
          </div>
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs text-muted-foreground">
              Remove your account and all associated data from this site.
            </p>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
