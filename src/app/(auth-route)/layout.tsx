import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In & Demo Access | Celebration & Event Planner",
  description:
    "Secure authentication and instant 1-click demo personas for Celebration & Event Planner.",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-secondary/20 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
