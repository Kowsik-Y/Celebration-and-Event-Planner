"use client";

import { AppNavbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";
import { Spinner } from "@heroui/react";
import { type ReactNode, useEffect } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasCheckedAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect once session verification has definitely finished
    if (hasCheckedAuth && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [hasCheckedAuth, isAuthenticated]);

  // While checking auth on initial mount or unauthenticated, show loading screen
  if (!hasCheckedAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Spinner size="lg" color="accent" />
        <p className="mt-3 text-xs text-muted">
          {!isAuthenticated ? "Signing out..." : "Authenticating celebration session..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <p>High-Stakes Celebration &amp; Event Planner</p>
      </footer>
    </div>
  );
}
