import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Guest (no-account) daily usage tracking via a signed, httpOnly cookie.
 * Adapted from the ai-saas-chat project's guest-chat pattern, minus Clerk —
 * this site has no accounts, so every visitor is a "guest" with one shared
 * daily allowance.
 *
 * The cookie value is `{date}.{count}.{hmac}` where the HMAC covers
 * `{date}.{count}` with a server-side secret, so the browser cannot forge
 * a higher allowance. Clearing cookies resets the counter — acceptable for
 * a free support widget; there is no paid tier behind this to protect.
 */

export const GUEST_USAGE_COOKIE = "ppt_chat_usage";
export const GUEST_USAGE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 48; // spans a UTC day rollover

export type GuestUsage = {
  date: string;
  count: number;
};

/**
 * HMAC secret. Set CHAT_COOKIE_SECRET in your Vercel project's environment
 * variables for a real per-deployment secret. The fallback below still
 * prevents casual tampering even if left unset — the only thing at stake
 * is a visitor resetting their own free-message counter, not a security
 * boundary worth blocking launch on.
 */
function getSecret(): string {
  return process.env.CHAT_COOKIE_SECRET || "pixelpulsetech-guest-chat-fallback-secret";
}

export function currentUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function encodeGuestUsage(usage: GuestUsage): string {
  const payload = `${usage.date}.${usage.count}`;
  return `${payload}.${sign(payload, getSecret())}`;
}

export function decodeGuestUsage(value: string | undefined, today: string): GuestUsage {
  const fresh: GuestUsage = { date: today, count: 0 };
  if (!value) return fresh;

  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return fresh;
  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);

  const expected = sign(payload, getSecret());
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return fresh;
  }

  const match = /^(\d{4}-\d{2}-\d{2})\.(\d{1,7})$/.exec(payload);
  if (!match) return fresh;

  const [, date, rawCount] = match;
  if (date !== today) return fresh;

  return { date, count: Number.parseInt(rawCount, 10) };
}

/** Parse a single cookie value out of a raw `Cookie` request header. */
export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}
