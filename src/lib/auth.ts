import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";

const SESSION_COOKIE = "kna_admin_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a high-entropy, single-use password reset token.
 * Returns both the raw token (put in the email link — never stored) and its
 * SHA-256 hash (stored in the database). Even if the database were somehow
 * exposed, the raw token could not be recovered from the stored hash.
 */
export function generateResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  // Next.js 15+ made cookies() async — must be awaited.
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
