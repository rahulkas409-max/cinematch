import type { Metadata } from "next";
import { PassView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Date voucher", description: "A little voucher, redeemable anytime." };

export default function Page() {
  return <PassView />;
}
