"use client";

import { AppNavbar } from "@/components/navbar";
import { useAppSelector } from "@/store/hooks";
import { Spinner } from "@heroui/react";
import { type ReactNode, useEffect } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasCheckedAuth, isLoggingOut } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Only redirect once session verification has definitely finished
    if (hasCheckedAuth && !isAuthenticated && !isLoggingOut) {
      window.location.href = "/login";
    }
  }, [hasCheckedAuth, isAuthenticated, isLoggingOut]);

  // While checking auth on initial mount or unauthenticated, show loading screen
  if (!hasCheckedAuth || !isAuthenticated || isLoggingOut) {
    return (
      <output
        className="min-h-screen bg-background flex flex-col items-center justify-center p-4 block"
        aria-live="polite"
      >
        <Spinner size="lg" color="accent" />
        <p className="mt-3 text-xs text-muted">
          {isLoggingOut
            ? "Signing out..."
            : !hasCheckedAuth
              ? "Authenticating celebration session..."
              : "Redirecting to login..."}
        </p>
      </output>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppNavbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 outline-none"
      >
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <p>Celebration &amp; Event Planner • Intelligent Event Logistics &amp; Management</p>
      </footer>
    </div>
  );
}
