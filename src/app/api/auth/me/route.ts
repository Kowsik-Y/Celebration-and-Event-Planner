import { UserRepository } from "@/db/repository";
import { verifySessionToken } from "@/lib/auth/security";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("celebrate_session")?.value;

    if (!token) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = UserRepository.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const safeUser = UserRepository.sanitizeUser(user);
    return NextResponse.json({ authenticated: true, user: safeUser }, { status: 200 });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
