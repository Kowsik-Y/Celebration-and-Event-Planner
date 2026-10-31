import { checkEdgeRateLimit, verifyEdgeSessionToken } from "@/lib/auth/edge-token";
import { type NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // 1. Maintenance Mode Handler
  if (isMaintenanceMode && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }
  if (!isMaintenanceMode && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Rate Limiting on Sensitive Auth Endpoints (POST only)
  const isSensitiveAuth =
    req.method === "POST" &&
    (pathname === "/login" ||
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/demo"));

  if (isSensitiveAuth) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimitKey = `auth_proxy:${pathname.startsWith("/login") ? "login" : "auth"}:${ip}`;
    const limitResult = checkEdgeRateLimit(rateLimitKey);

    if (!limitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many authentication attempts. Please wait 5 minutes before trying again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "300",
            "X-RateLimit-Remaining": "0",
            "Cache-Control": "no-store",
          },
        },
      );
    }
  }

  // 3. Bypass Auth Verification for Public & Static Routes
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/maintenance" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Token & Session Extraction
  let sessionToken = req.cookies.get("celebrate_session")?.value;
  if (!sessionToken) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      sessionToken = authHeader.substring(7);
    }
  }

  const payload = sessionToken ? await verifyEdgeSessionToken(sessionToken) : null;

  // 5. Require Authentication for Protected Routes
  if (!payload) {
    // If requesting an API route, return 401 JSON
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized. Please sign in." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Redirect browser page requests to /login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Role-Based Access Control
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
