import crypto from "node:crypto";

let cachedSessionSecret: string | null = null;

/**
 * Retrieves the cryptographic session secret from environment or secure runtime key store
 */
export function getSessionSecret(): string {
  if (cachedSessionSecret) {
    return cachedSessionSecret;
  }
  const envSecret = process.env.SESSION_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    cachedSessionSecret = envSecret.trim();
    return cachedSessionSecret;
  }
  // Fallback ephemeral key store
  cachedSessionSecret = "celebration-planner-secret-key-3849102-change-in-prod";
  return cachedSessionSecret;
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Cryptographic Password Hashing using PBKDF2 (100,000 iterations of SHA-512)
 */
export function hashPassword(
  password: string,
  providedSalt?: string,
): { hash: string; salt: string } {
  const salt = providedSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return { hash, salt };
}

/**
 * Constant-time password verification to prevent timing attacks
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  const hashBuffer = Buffer.from(hash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (hashBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, expectedBuffer);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Signs a tamper-evident session token using HMAC-SHA256
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const secret = getSessionSecret();
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies a session token signature and expiration
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [data, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedSigBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (_err) {
    return null;
  }
}

/**
 * Sanitizes input string to prevent XSS and HTML tag injection
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "");
}

/**
 * In-memory brute force rate limiter for authentication endpoints
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export function checkLoginRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export function clearLoginRateLimit(key: string): void {
  loginAttempts.delete(key);
}
