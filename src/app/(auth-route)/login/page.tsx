"use client";

import type { UserRole } from "@/db/schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError, loginWithCredentials, loginWithDemo } from "@/store/slices/authSlice";
import { Button, Card, CardContent, Chip, Input, Spinner } from "@heroui/react";
import {
  AlertCircle,
  CalendarHeart,
  Crown,
  Heart,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface DemoAccount {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  badge: string;
  description: string;
  icon: typeof Crown;
  color: "accent" | "success" | "warning" | "default";
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Elena Rostova",
    email: "planner@celebrate.ai",
    role: "planner",
    password: "Planner123!",
    badge: "Lead Luxury Planner",
    description: "Full orchestration, budget allocations, contracts & timeline sequencing.",
    icon: Crown,
    color: "accent",
  },
  {
    name: "Sofia & Matteo Rossi",
    email: "couple@celebrate.ai",
    role: "couple",
    password: "Wedding123!",
    badge: "Amalfi Wedding Couple",
    description: "Villa Cimbrone vows, guest RSVPs, seating charts & aesthetic vision.",
    icon: Heart,
    color: "warning",
  },
  {
    name: "Marcus Vance",
    email: "host@celebrate.ai",
    role: "host",
    password: "Community123!",
    badge: "Community Gala Host",
    description: "Sponsor management, keynote schedules & gala run-of-show.",
    icon: Users,
    color: "success",
  },
  {
    name: "Alexander Cruz",
    email: "admin@celebrate.ai",
    role: "admin",
    password: "Admin123!",
    badge: "System Administrator",
    description: "Full platform governance, AI prompt configuration & audit access.",
    icon: ShieldCheck,
    color: "default",
  },
];

function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const targetUrl = rawCallback && rawCallback !== "/login" ? rawCallback : "/";

  const { error, user, isAuthenticated, hasCheckedAuth } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"demo" | "custom">("demo");
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If already authenticated, immediately route to the dashboard
  useEffect(() => {
    if (mounted && hasCheckedAuth && isAuthenticated && user) {
      router.replace(targetUrl);
    }
  }, [mounted, hasCheckedAuth, isAuthenticated, user, targetUrl, router]);

  async function handleDemoLogin(role: UserRole) {
    setPendingRole(role);
    try {
      const res = await dispatch(loginWithDemo(role));
      if (loginWithDemo.fulfilled.match(res)) {
        router.replace(targetUrl);
      }
    } finally {
      setPendingRole(null);
    }
  }

  async function handleCustomLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmittingCustom(true);
    try {
      const res = await dispatch(loginWithCredentials({ email, password }));
      if (loginWithCredentials.fulfilled.match(res)) {
        router.replace(targetUrl);
      }
    } finally {
      setIsSubmittingCustom(false);
    }
  }

  function fillCredentials(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.password);
    setActiveTab("custom");
    dispatch(clearError());
  }

  // After mounting on the client, if user is already authenticated, show brief loading screen
  if (mounted && hasCheckedAuth && isAuthenticated && user) {
    return (
      <Card className="border border-border p-8 bg-surface shadow-2xl rounded-2xl text-center space-y-4">
        <div className="flex flex-col items-center justify-center py-4">
          <Spinner size="lg" color="accent" />
          <h2 className="text-base font-semibold text-foreground mt-4">Signed in as {user.name}</h2>
          <p className="text-xs text-muted mt-1">Routing to your celebration dashboard...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border p-0 bg-surface shadow-2xl rounded-2xl overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-border bg-surface-secondary/40 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-md">
            <CalendarHeart className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Celebration &amp; Event Planner
          </span>
        </Link>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Sign in to access your event dashboard, budget allocations, run-of-show timeline, and AI
          Concierge.
        </p>

        {/* Tab switch */}
        <div className="flex bg-surface border border-border p-1 rounded-xl text-xs mt-5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("demo")}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "demo"
                ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            1-Click Demo Personas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "custom"
                ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Direct Account Login
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === "demo" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Select a Verified Demo Persona:
              </span>
              <Chip size="sm" variant="soft" color="success" className="text-[10px] h-5">
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                PBKDF2 Verified
              </Chip>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isItemPending = pendingRole === account.role;

                return (
                  <Card
                    key={account.email}
                    className="border border-border bg-surface hover:border-accent transition-all shadow-none"
                  >
                    <CardContent className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-secondary border border-border flex items-center justify-center shrink-0 text-accent mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {account.name}
                            </span>
                            <Chip
                              size="sm"
                              color={account.color}
                              variant="soft"
                              className="h-4 text-[10px] uppercase font-bold"
                            >
                              {account.role}
                            </Chip>
                          </div>
                          <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                            {account.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted font-mono">
                            <span>{account.email}</span>
                            <span>&bull;</span>
                            <span className="text-foreground font-semibold">
                              {account.password}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="primary"
                          isPending={isItemPending}
                          onClick={() => handleDemoLogin(account.role)}
                          className="text-xs font-semibold px-3 py-1 cursor-pointer"
                        >
                          1-Click Login
                        </Button>
                        <button
                          type="button"
                          onClick={() => fillCredentials(account)}
                          className="text-[10px] text-muted hover:text-accent underline text-center cursor-pointer"
                        >
                          Fill Form &rarr;
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-page-email"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-accent" /> Email Address
              </label>
              <Input
                id="login-page-email"
                type="email"
                placeholder="e.g. planner@celebrate.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-page-password"
                className="text-xs font-medium text-foreground flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-accent" /> Password
              </label>
              <Input
                id="login-page-password"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-sm"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full font-semibold shadow"
                isPending={isSubmittingCustom}
              >
                <Lock className="w-4 h-4 mr-1.5" /> Authenticate Securely
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Footer Security Badges */}
      <div className="p-4 border-t border-border bg-surface-secondary/20 flex flex-wrap justify-between items-center text-[11px] text-muted gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" /> HMAC-SHA256 Signed Session Token
        </span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-success" /> Brute-Force Rate Limiting Active
        </span>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-muted">Loading authentication gateway...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
