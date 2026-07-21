import { type Catalog } from "@/data/pcParts";

/* Fetch the live product catalog saved by the admin panel. Resolves to
   null when the backend isn't set up or nothing is saved yet — callers
   then fall back to the built-in default parts. Never throws. */
export async function fetchCatalog(): Promise<Catalog | null> {
  try {
    const res = await fetch("/api/products", { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { catalog?: Catalog | null };
    return data.catalog ?? null;
  } catch {
    return null;
  }
}
