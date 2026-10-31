import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "GenAI Celebration & Wedding Planner",
  description:
    "Intelligent planning assistant for weddings, milestone birthdays, and community galas with budgets, run-of-show timelines, and vendor checklists.",
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
