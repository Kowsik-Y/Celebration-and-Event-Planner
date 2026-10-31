"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { Avatar, AvatarFallback, AvatarImage, Button, Chip } from "@heroui/react";
import { CalendarHeart, LogOut, PlusCircle, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AppNavbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  async function handleLogout() {
    await dispatch(logoutUser());
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-md">
            <CalendarHeart className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground">
              Celebration &amp; Wedding Planner
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-accent font-semibold" : "text-muted hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-surface-secondary border border-border px-2.5 py-1.5 rounded-xl shadow-xs">
              <Avatar size="sm" className="w-7 h-7 ring-1 ring-border">
                {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name} />}
                <AvatarFallback>
                  <User className="w-3.5 h-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xs font-semibold text-foreground">{user.name}</span>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={
                      user.role === "planner"
                        ? "accent"
                        : user.role === "couple"
                          ? "warning"
                          : user.role === "host"
                            ? "success"
                            : "default"
                    }
                    className="h-4 text-[9px] uppercase font-bold px-1"
                  >
                    {user.role}
                  </Chip>
                </div>
                <span className="text-[10px] text-muted">{user.email}</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onClick={handleLogout}
                className="h-7 w-7 text-muted hover:text-danger cursor-pointer ml-1"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                variant="outline"
                className="font-medium text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Sign In &bull; Demo Access</span>
              </Button>
            </Link>
          )}

          <Link href="/events/new">
            <Button variant="primary" size="sm" className="font-medium shadow text-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
