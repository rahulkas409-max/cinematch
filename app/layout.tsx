import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Unbounded } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import "./globals.css";

const display = Unbounded({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800"] });
const body = Bricolage_Grotesque({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineMatch — find your next favourite movie",
  description: "Swipe, guess emoji riddles and pick your vibe to get movie picks made for tonight.",
};

export const viewport: Viewport = { themeColor: "#07060d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
