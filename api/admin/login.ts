import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createSessionToken,
  isAuthed,
  isConfigured,
  passwordMatches,
  setSessionCookie,
} from "../_lib/adminAuth.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // GET → report whether the caller is already signed in (and configured)
  if (req.method === "GET") {
    res.status(200).json({ configured: isConfigured(), authed: isAuthed(req) });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin backend not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Vercel." });
    return;
  }
  const password = (req.body as { password?: unknown } | undefined)?.password;
  if (!passwordMatches(password)) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }
  setSessionCookie(res, createSessionToken());
  res.status(200).json({ ok: true });
}
