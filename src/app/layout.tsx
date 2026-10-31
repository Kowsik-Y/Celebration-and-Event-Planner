import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Celebration & Event Planner | AI Concierge & Run-of-Show Logistics",
    template: "%s | Celebration & Event Planner",
  },
  description:
    "Intelligent planning assistant for luxury weddings, milestone birthdays, and community galas with calibrated budgets, minute-by-minute run-of-show timelines, and vendor HQ.",
  applicationName: "Celebration & Event Planner",
  keywords: [
    "event planner",
    "wedding planning",
    "budget sequencer",
    "run of show",
    "vendor management",
    "Aria AI concierge",
    "gala orchestrator",
  ],
  authors: [{ name: "Celebration Studio & Co." }],
  creator: "Celebration AI Studio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Celebration & Event Planner • High-Stakes Logistics & AI Concierge",
    description:
      "Flawless celebrations built on ruthless logistics. Calibrated budgets, minute-by-minute run-of-show sequencer, vendor pipeline, and Aria AI concierge.",
    siteName: "Celebration & Event Planner",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Celebration & Event Planner • Flawless Celebrations Built on Ruthless Logistics",
    description:
      "Intelligent planning assistant with calibrated budgets, minute-by-minute timeline sequencing, and Aria AI Concierge.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
