import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a Darktidle account to sync streaks and save preferences.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
