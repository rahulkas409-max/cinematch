import type { Metadata } from "next";
import { InviteView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "You're invited 💌", description: "Someone made you a little date invitation. Open it?" };

export default function Page() {
  return <InviteView />;
}
