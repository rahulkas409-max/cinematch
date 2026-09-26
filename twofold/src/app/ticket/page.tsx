import type { Metadata } from "next";
import { TicketView } from "@/components/SharedViews";

export const metadata: Metadata = { title: "Confirmed Date Ticket 🎟️", description: "It's official: a date is on the calendar." };

export default function Page() {
  return <TicketView />;
}
