import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { Backdrop } from "@/components/ui/Backdrop";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: {
    default: "TwoFold · closer, together",
    template: "%s · TwoFold",
  },
  description:
    "A free, playful relationship space for couples and crushes: date invites, flashcards, games, shared money tools, family harmony and future plans. No logins, no paywalls.",
  applicationName: "TwoFold",
  appleWebApp: { capable: true, title: "TwoFold", statusBarStyle: "default" },
  openGraph: {
    title: "TwoFold · closer, together",
    description: "Date invites, deep-talk flashcards, games and shared tools for two. 100% free.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable} ${caveat.variable} h-full antialiased`}>
      <body className="relative min-h-full">
        <Backdrop />
        {children}
      </body>
    </html>
  );
}
