import type { Metadata } from "next";

import { LibraryView } from "@/components/library/LibraryView";

export const metadata: Metadata = {
  title: "Vox archive",
  description:
    "Search and filter Darktide voice clips by text, ability, class, and more. Play or download MP3s; like lines or mark heresy when logged in.",
  alternates: { canonical: "/library" },
};

export default function LibraryPage() {
  return <LibraryView />;
}
