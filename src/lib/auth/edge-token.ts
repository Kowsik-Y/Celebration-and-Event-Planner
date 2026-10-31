export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// In-memory sliding rate limiter for edge/proxy middleware
const edgeRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 15;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function checkEdgeRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = edgeRateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    edgeRateLimitMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export function clearAllEdgeRateLimits(): void {
  edgeRateLimitMap.clear();
}

// Clear any stale dev rate limits on initialization
clearAllEdgeRateLimits();

/**
 * Edge-compatible session token verification using Web Crypto API
 */
export async function verifyEdgeSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [data, signature] = parts;
    const secret =
      process.env.SESSION_SECRET || "celebration-planner-secret-key-3849102-change-in-prod";

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify", "sign"],
    );

    // Convert base64url signature back to Uint8Array
    const base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binStr = atob(pad);
    const sigBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      sigBytes[i] = binStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    // Decode payload
    const payloadBase64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const payloadPad = payloadBase64.padEnd(
      payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
      "=",
    );
    const decodedStr = atob(payloadPad);
    const payload: SessionPayload = JSON.parse(decodedStr);

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (_err) {
    return null;
  }
}
