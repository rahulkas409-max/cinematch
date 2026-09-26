import type { Metadata } from "next";
import { BucketView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Shared bucket list", description: "Dreams for someday, together." };

export default function Page() {
  return <BucketView />;
}
