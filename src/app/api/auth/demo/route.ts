import { UserRepository } from "@/db/repository";
import { DemoLoginInputSchema } from "@/lib/auth/schemas";
import { createSessionToken } from "@/lib/auth/security";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = DemoLoginInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid role specified", details: parseResult.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { role } = parseResult.data;
    const user = UserRepository.getUserByRole(role);

    if (!user) {
      return NextResponse.json(
        { error: `Demo account for role "${role}" not found.` },
        { status: 404 },
      );
    }

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
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Demo login API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
