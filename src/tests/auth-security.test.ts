import { UserRepository } from "@/db/repository";
import {
  checkLoginRateLimit,
  clearLoginRateLimit,
  createSessionToken,
  hashPassword,
  sanitizeInput,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth/security";
import { store } from "@/store";
import { clearError, setUserDirect } from "@/store/slices/authSlice";
import { setAuthModalOpen } from "@/store/slices/uiSlice";
import { describe, expect, it } from "vitest";

describe("Security & Cryptographic Authentication", () => {
  it("hashes password with PBKDF2 and verifies valid and invalid passwords correctly", () => {
    const rawPassword = "LuxuryPlannerSecret99!";
    const { hash, salt } = hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(salt).toBeDefined();
    expect(hash.length).toBe(128); // 64 bytes in hex = 128 characters
    expect(salt.length).toBe(32); // 16 bytes in hex = 32 characters

    // Correct password verification
    expect(verifyPassword(rawPassword, salt, hash)).toBe(true);

    // Incorrect password verification
    expect(verifyPassword("WrongPassword123", salt, hash)).toBe(false);
  });

  it("signs tamper-evident HMAC session tokens and validates them", () => {
    const payload = {
      userId: "usr_planner_elena",
      email: "planner@celebrate.ai",
      role: "planner",
    };

    const token = createSessionToken(payload);
    expect(token).toContain(".");

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
    expect(verified?.exp).toBeGreaterThan(Date.now());

    // Tampered token check
    const [data, sig] = token.split(".");
    const tamperedSig = `${sig.slice(0, -2)}xx`;
    expect(verifySessionToken(`${data}.${tamperedSig}`)).toBeNull();

    // Malformed token check
    expect(verifySessionToken("invalid-token-string")).toBeNull();
  });

  it("sanitizes text inputs to prevent XSS injection attacks", () => {
    const dangerousInput = "<script>alert('pwned')</script>planner@celebrate.ai";
    const sanitized = sanitizeInput(dangerousInput);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("</script>");
    expect(sanitized).toBe("alert('pwned')planner@celebrate.ai");
  });

  it("enforces rate-limiting against brute force login attacks", () => {
    const testKey = "rate-limit-test-user@celebrate.ai";
    clearLoginRateLimit(testKey);

    // First 10 attempts allowed
    for (let i = 0; i < 9; i++) {
      const res = checkLoginRateLimit(testKey);
      expect(res.allowed).toBe(true);
    }

    // 10th attempt
    const tenth = checkLoginRateLimit(testKey);
    expect(tenth.allowed).toBe(true);
    expect(tenth.remaining).toBe(0);

    // 11th attempt blocked
    const blocked = checkLoginRateLimit(testKey);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    // Resetting clears limit
    clearLoginRateLimit(testKey);
    const afterReset = checkLoginRateLimit(testKey);
    expect(afterReset.allowed).toBe(true);
  });
});

describe("User Repository & Demo Credentials", () => {
  it("verifies seeded demo users exist and credentials match", () => {
    const demoAccounts = [
      { role: "planner", email: "planner@celebrate.ai", password: "Planner123!" },
      { role: "couple", email: "couple@celebrate.ai", password: "Wedding123!" },
      { role: "host", email: "host@celebrate.ai", password: "Community123!" },
      { role: "admin", email: "admin@celebrate.ai", password: "Admin123!" },
    ];

    for (const demo of demoAccounts) {
      const user = UserRepository.getUserByEmail(demo.email);
      expect(user).not.toBeNull();
      expect(user?.role).toBe(demo.role);

      if (user) {
        const isValid = verifyPassword(demo.password, user.salt, user.password_hash);
        expect(isValid).toBe(true);

        const safe = UserRepository.sanitizeUser(user);
        expect((safe as Record<string, unknown>).password_hash).toBeUndefined();
        expect((safe as Record<string, unknown>).salt).toBeUndefined();
      }
    }
  });
});

describe("Redux State Management Store", () => {
  it("manages authentication and UI slices correctly", () => {
    const initialAuthState = store.getState().auth;
    expect(initialAuthState).toBeDefined();

    // Set demo user direct action
    store.dispatch(
      setUserDirect({
        id: "usr_planner_elena",
        name: "Elena Rostova",
        email: "planner@celebrate.ai",
        role: "planner",
        avatar_url: "https://example.com/avatar.jpg",
        created_at: new Date().toISOString(),
      }),
    );

    let state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user?.name).toBe("Elena Rostova");

    // UI slice toggle
    expect(state.ui.isAuthModalOpen).toBe(false);
    store.dispatch(setAuthModalOpen(true));
    state = store.getState();
    expect(state.ui.isAuthModalOpen).toBe(true);

    // Clear error
    store.dispatch(clearError());
    expect(store.getState().auth.error).toBeNull();
  });
});

describe("Role-Based Event Access & Personalization", () => {
  it("isolates events per user persona while granting planners and admins studio-wide access", async () => {
    const { EventRepository } = await import("@/db/repository");

    // Couple persona only accesses their assigned wedding event
    const coupleEvents = EventRepository.getEventsByUser("usr_couple_sofia", "couple");
    expect(coupleEvents.length).toBe(1);
    expect(coupleEvents[0].id).toBe("evt-wedding-amalfi");
    expect(coupleEvents[0].vertical).toBe("wedding");

    // Host persona only accesses their civic fundraiser gala
    const hostEvents = EventRepository.getEventsByUser("usr_host_marcus", "host");
    expect(hostEvents.length).toBe(1);
    expect(hostEvents[0].id).toBe("evt-comm-tech-arts");
    expect(hostEvents[0].vertical).toBe("community");

    // Lead Planner persona accesses all celebrations in the studio portfolio
    const plannerEvents = EventRepository.getEventsByUser("usr_planner_elena", "planner");
    expect(plannerEvents.length).toBeGreaterThanOrEqual(3);

    // Admin persona accesses all events
    const adminEvents = EventRepository.getEventsByUser("usr_admin_alexander", "admin");
    expect(adminEvents.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Next.js Proxy Middleware & Security Headers", () => {
  it("verifies getSessionSecret returns configured or cached store secret", async () => {
    const { getSessionSecret } = await import("@/lib/auth/security");
    const secret = getSessionSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });
});
