import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "Celebration & Event Planner | AI Concierge & Run-of-Show Logistics",
    template: "%s | Celebration & Event Planner",
  },
  description:
    "Intelligent planning assistant for weddings, birthdays, and community celebrations with mathematically calibrated budgets, back-scheduled countdown timelines, scalable vendor checklists, and Google Gemini AI.",
  applicationName: "Celebration & Event Planner",
  keywords: [
    "event planner",
    "wedding planning",
    "birthday planner",
    "community gala",
    "readiness score",
    "back-scheduled timeline",
    "budget sequencer",
    "run of show",
    "vendor management",
    "Gemini AI",
  ],
  authors: [{ name: "Celebration Studio & Co." }],
  creator: "Celebration AI Studio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Celebration & Event Planner • High-Stakes Logistics & AI Concierge",
    description:
      "Flawless celebrations built on ruthless logistics. Calibrated budgets, reverse-calculated timelines, scalable vendor checklists, and Gemini AI.",
    siteName: "Celebration & Event Planner",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Celebration & Event Planner • Flawless Celebrations Built on Ruthless Logistics",
    description:
      "Intelligent planning assistant with calibrated budgets, minute-by-minute timeline sequencing, and Gemini AI.",
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
        {/* Skip to Main Content Link for WCAG AA Keyboard Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-rose-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 font-semibold text-xs"
        >
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
