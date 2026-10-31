import { UserRepository } from "@/db/repository";
import { LoginInputSchema } from "@/lib/auth/schemas";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  createSessionToken,
  sanitizeInput,
  verifyPassword,
} from "@/lib/auth/security";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = LoginInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parseResult.data;
    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Rate limiting check
    const rateCheck = checkLoginRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please wait 5 minutes before trying again." },
        { status: 429 },
      );
    }

    const user = UserRepository.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = verifyPassword(password, user.salt, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Clear rate limit counter on success
    clearLoginRateLimit(cleanEmail);

    const safeUser = UserRepository.sanitizeUser(user);
    const token = createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("celebrate_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
