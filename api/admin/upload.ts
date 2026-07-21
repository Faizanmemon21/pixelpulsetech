import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthed, isConfigured } from "../_lib/adminAuth";

/* Mints a short-lived upload token so the admin's browser can upload the
   image directly to Vercel Blob (bypassing the serverless body-size limit).
   Only issued to a signed-in admin. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!isConfigured()) {
    res.status(503).json({ error: "Admin backend not configured." });
    return;
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!isAuthed(req)) throw new Error("Not signed in.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB per image
          tokenPayload: null,
        };
      },
      // no onUploadCompleted needed — the client returns the URL directly
    });
    res.status(200).json(jsonResponse);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed." });
  }
}
