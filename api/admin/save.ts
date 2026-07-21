import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rejectIfUnauthed } from "../_lib/adminAuth";
import { sanitizeCatalog, writeCatalog } from "../_lib/catalogStore";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (rejectIfUnauthed(req, res)) return;

  const catalog = sanitizeCatalog((req.body as { catalog?: unknown } | undefined)?.catalog);
  if (!catalog) {
    res.status(400).json({ error: "Invalid catalog data. Every product needs an id, name, and price." });
    return;
  }

  try {
    await writeCatalog(catalog);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({
      error:
        "Could not save. Is the Blob store connected? (Vercel → Storage → create a Blob store.) " +
        (err instanceof Error ? err.message : ""),
    });
  }
}
