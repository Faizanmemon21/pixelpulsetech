import { list, put } from "@vercel/blob";

/* ============================================================
   Catalog store — the product data managed by the admin panel,
   persisted as a single JSON file in Vercel Blob. No database.

   Shape: { [categoryId]: PartOption[] }
   Category IDs are fixed in src/data/pcParts.ts (cpu, gpu, ...).
   ============================================================ */

const CATALOG_PATH = "catalog/products.json";

export type StoredOption = {
  id: string;
  brand?: string;
  name: string;
  spec: string;
  price: number;
  tag?: string;
  image?: string;
};

export type Catalog = Record<string, StoredOption[]>;

/** Read the current catalog, or null if none has been saved yet. */
export async function readCatalog(): Promise<Catalog | null> {
  try {
    const { blobs } = await list({ prefix: CATALOG_PATH, limit: 1 });
    if (blobs.length === 0) return null;
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Catalog;
  } catch {
    return null;
  }
}

/** Overwrite the catalog with new data. Returns the public blob URL. */
export async function writeCatalog(catalog: Catalog): Promise<string> {
  const { url } = await put(CATALOG_PATH, JSON.stringify(catalog), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
  return url;
}

/** Basic validation/sanitisation of a catalog payload from the admin UI. */
export function sanitizeCatalog(input: unknown): Catalog | null {
  if (typeof input !== "object" || input === null) return null;
  const out: Catalog = {};
  for (const [categoryId, value] of Object.entries(input as Record<string, unknown>)) {
    if (!Array.isArray(value)) return null;
    const options: StoredOption[] = [];
    for (const raw of value) {
      if (typeof raw !== "object" || raw === null) return null;
      const o = raw as Record<string, unknown>;
      if (typeof o.id !== "string" || !o.id.trim()) return null;
      if (typeof o.name !== "string" || !o.name.trim()) return null;
      const price = Number(o.price);
      if (!Number.isFinite(price) || price < 0) return null;
      const option: StoredOption = {
        id: o.id.trim(),
        name: o.name.trim(),
        spec: typeof o.spec === "string" ? o.spec.trim() : "",
        price: Math.round(price),
      };
      if (typeof o.brand === "string" && o.brand.trim()) option.brand = o.brand.trim();
      if (typeof o.tag === "string" && o.tag.trim()) option.tag = o.tag.trim();
      if (typeof o.image === "string" && o.image.trim()) option.image = o.image.trim();
      options.push(option);
    }
    out[categoryId] = options;
  }
  return out;
}
