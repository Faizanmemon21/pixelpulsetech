import { createHmac, timingSafeEqual } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/* ============================================================
   Admin auth — a single shared password gate for the /admin panel.
   On login we set an HttpOnly, signed session cookie; admin API
   routes verify it. No database or user table needed.

   Required environment variables (set in Vercel → Settings → Env):
     ADMIN_PASSWORD        the password you type to log in
     ADMIN_SESSION_SECRET  any long random string (signs the cookie)
   ============================================================ */

export const ADMIN_COOKIE = "ppt_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** True only when the admin backend has been configured with secrets. */
export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

/** Constant-time password comparison. */
export function passwordMatches(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (typeof input !== "string" || expected.length === 0) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Issue a fresh signed session token (payload = expiry timestamp). */
export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(exp);
  return `${payload}.${sign(payload)}`;
}

function tokenValid(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  // constant-time compare of the signatures
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000);
}

function readCookie(req: VercelRequest, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

/** True when the request carries a valid admin session cookie. */
export function isAuthed(req: VercelRequest): boolean {
  return tokenValid(readCookie(req, ADMIN_COOKIE));
}

export function setSessionCookie(res: VercelResponse, token: string): void {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
  );
}

/** Guard for admin-only routes. Returns true if it already sent a 401. */
export function rejectIfUnauthed(req: VercelRequest, res: VercelResponse): boolean {
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin backend not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET." });
    return true;
  }
  if (!isAuthed(req)) {
    res.status(401).json({ error: "Not signed in." });
    return true;
  }
  return false;
}
