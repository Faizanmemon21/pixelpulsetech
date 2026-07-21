import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readCatalog } from "./_lib/catalogStore.js";

/* Public endpoint — the PC builder fetches the live product catalog here.
   Returns { catalog: null } when nothing has been saved yet, and the
   builder falls back to its built-in default parts. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const catalog = await readCatalog();
  // brief CDN cache; the admin save invalidates by writing fresh data
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=60");
  res.status(200).json({ catalog });
}
