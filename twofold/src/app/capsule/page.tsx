import type { Metadata } from "next";
import { CapsuleView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Time capsule 🔒", description: "A sealed letter that unlocks on a special day." };

export default function Page() {
  return <CapsuleView />;
}
