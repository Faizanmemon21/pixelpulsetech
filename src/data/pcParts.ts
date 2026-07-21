import {
  Box,
  CircuitBoard,
  Cpu,
  Fan,
  Gpu,
  HardDrive,
  MemoryStick,
  PlugZap,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
   PC BUILDER INVENTORY  —  EDIT THIS FILE TO CHANGE PARTS/PRICES
   ------------------------------------------------------------
   This is the ONLY file you need to touch to manage the Custom
   PC Builder (#/pc-builder). Everything on that page — the option
   cards, the live rig diagram, and the price total — is generated
   from the data below.

   To edit a price:      change the `price` number (whole US dollars).
   To rename a part:     change `name` (and `spec` for the small print).
   To set the brand:     change `brand`, or DELETE the brand line to
                         show just the product name (house items).
   To add a real photo:  drop an image in  public/parts/  (e.g.
                         ryzen-9800x3d.webp) and add  image: "/parts/ryzen-9800x3d.webp"
                         to that option. Without it, the category's
                         default illustration is shown automatically.
   To add a part:        copy any { ... } option line and edit it.
                         Give it a new unique `id`.
   To remove a part:     delete its { ... } line.
   To mark a highlight:  add  tag: "POPULAR"  (or "BEST VALUE" /
                         "ENTHUSIAST"). Optional — remove to hide.

   The part shown selected by default in each category is the one
   tagged "POPULAR" (or the first one if none is tagged).

   ------------------------------------------------------------
   ADD A NEW PRODUCT WITH A PHOTO — 3 steps:

   1) Put the photo in the  public/parts/  folder.
      Example filename:  public/parts/rtx-5080-aorus.webp
      (JPG, PNG, or WebP all work. Square images look best. WebP is smallest.)

   2) Find the category below (e.g. the "gpu" block) and copy this
      line into its `options: [ ... ]` list, then edit the values:

        { id: "gpu-my-new-card", brand: "Gigabyte AORUS", name: "RTX 5080 Master", spec: "1440p / 4K, triple-fan", price: 1149, image: "/parts/rtx-5080-aorus.webp", tag: "POPULAR" },

      - id     : any unique text, no spaces (must differ from every other id)
      - brand  : the maker (or delete this part for unbranded/house items)
      - name   : the product name shown in bold
      - spec   : the small grey one-liner under the name
      - price  : whole US dollars, no "$" and no commas (e.g. 1149)
      - image  : the "/parts/..." path from step 1 (delete it to use the
                 category's default illustration instead)
      - tag    : "POPULAR" / "BEST VALUE" / "ENTHUSIAST" (delete to hide)

   3) Save the file, run  npm run build , and redeploy. Done.
   ============================================================ */

export type PartOption = {
  /** Unique id — must be different from every other option. */
  id: string;
  /** Optional. Omit for house/unbranded parts (shows just the name). */
  brand?: string;
  name: string;
  /** One-line spec shown on the card and in the build summary. */
  spec: string;
  /** Price in whole US dollars. */
  price: number;
  /** Optional highlight badge. */
  tag?: "POPULAR" | "BEST VALUE" | "ENTHUSIAST";
  /** Optional real product photo, e.g. "/parts/ryzen-9800x3d.webp".
      Falls back to the category's default illustration when omitted. */
  image?: string;
};

export type PartCategory = {
  id: string;
  label: string;
  /** Short label used inside the rig diagram slot. */
  slotLabel: string;
  icon: LucideIcon;
  /** Default illustration for parts in this category with no own image. */
  image: string;
  options: PartOption[];
};

/** Resolve the picture to show for an option: its own photo, else the
    category's default illustration. */
export function partImage(category: PartCategory, option: PartOption): string {
  return option.image ?? category.image;
}

export const PC_PARTS: PartCategory[] = [
  {
    id: "cpu",
    label: "Processor",
    slotLabel: "CPU",
    icon: Cpu,
    image: "/parts/cpu.svg",
    options: [
      { id: "cpu-r5-9600x", brand: "AMD", name: "Ryzen 5 9600X", spec: "6-core / 12-thread, 5.4GHz boost", price: 279 },
      { id: "cpu-r7-9800x3d", brand: "AMD", name: "Ryzen 7 9800X3D", spec: "8-core 3D V-Cache, gaming flagship", price: 479, tag: "POPULAR" },
      { id: "cpu-r9-9950x3d", brand: "AMD", name: "Ryzen 9 9950X3D", spec: "16-core 3D V-Cache, creator + gaming", price: 699 },
      { id: "cpu-ultra7-265k", brand: "Intel", name: "Core Ultra 7 265K", spec: "20-core, unlocked", price: 394 },
      { id: "cpu-ultra9-285k", brand: "Intel", name: "Core Ultra 9 285K", spec: "24-core flagship, unlocked", price: 589 },
    ],
  },
  {
    id: "motherboard",
    label: "Motherboard",
    slotLabel: "MOBO",
    icon: CircuitBoard,
    image: "/parts/motherboard.svg",
    options: [
      { id: "mobo-aorus-elite-b650", brand: "Gigabyte AORUS", name: "Elite AX B650", spec: "AM5, WiFi 6E, ATX", price: 189 },
      { id: "mobo-aorus-pro-x870", brand: "Gigabyte AORUS", name: "Pro X870", spec: "AM5, PCIe 5.0, ATX", price: 329, tag: "POPULAR" },
      { id: "mobo-aorus-master-x870e", brand: "Gigabyte AORUS", name: "Master X870E", spec: "AM5, flagship VRM, ATX", price: 499 },
      { id: "mobo-aorus-elite-z890", brand: "Gigabyte AORUS", name: "Elite Z890", spec: "LGA1851, ATX", price: 259 },
      { id: "mobo-aorus-pro-z890-ice", brand: "Gigabyte AORUS", name: "Pro Z890 ICE", spec: "LGA1851, white PCB, ATX", price: 349 },
    ],
  },
  {
    id: "ram",
    label: "Memory",
    slotLabel: "RAM",
    icon: MemoryStick,
    image: "/parts/ram.svg",
    options: [
      { id: "ram-16-6000", name: "16GB DDR5-6000", spec: "2x8GB kit", price: 69 },
      { id: "ram-32-6000-rgb", name: "32GB DDR5-6000 RGB", spec: "2x16GB kit", price: 129, tag: "POPULAR" },
      { id: "ram-32-6400-rgb", name: "32GB DDR5-6400 RGB", spec: "2x16GB kit", price: 149 },
      { id: "ram-64-6000-rgb", name: "64GB DDR5-6000 RGB", spec: "2x32GB kit", price: 259 },
      { id: "ram-64-8000-rgb", name: "64GB DDR5-8000 RGB", spec: "2x32GB kit", price: 349 },
    ],
  },
  {
    id: "cooler",
    label: "Cooling",
    slotLabel: "COOLER",
    icon: Fan,
    image: "/parts/cooler.svg",
    options: [
      { id: "cool-air-dual", name: "Dual-Fan Air Tower", spec: "Quiet, budget-friendly", price: 69 },
      { id: "cool-argb-240", name: "240mm ARGB Liquid Cooler", spec: "Compact AIO", price: 89 },
      { id: "cool-argb-360", name: "360mm ARGB Liquid Cooler", spec: "Balanced AIO", price: 139, tag: "POPULAR" },
      { id: "cool-argb-420", name: "420mm ARGB Liquid Cooler", spec: "Max cooling AIO", price: 189 },
      { id: "cool-hardline", name: "Custom Hardline Loop", spec: "Enthusiast custom loop", price: 549, tag: "ENTHUSIAST" },
    ],
  },
  {
    id: "gpu",
    label: "Graphics Card",
    slotLabel: "GPU",
    icon: Gpu,
    image: "/parts/gpu.svg",
    options: [
      { id: "gpu-5060ti-asus", brand: "ASUS Dual", name: "GeForce RTX 5060 Ti 16GB", spec: "1080p / 1440p esports", price: 429 },
      { id: "gpu-5070-msi", brand: "MSI Ventus", name: "GeForce RTX 5070 12GB", spec: "1440p high-refresh", price: 549 },
      { id: "gpu-5080-aorus", brand: "Gigabyte AORUS", name: "GeForce RTX 5080 16GB", spec: "1440p / 4K high-refresh", price: 999, tag: "POPULAR" },
      { id: "gpu-5080-msi", brand: "MSI Suprim", name: "GeForce RTX 5080 16GB", spec: "1440p / 4K, premium cooling", price: 1079 },
      { id: "gpu-5090-rog", brand: "ASUS ROG Astral", name: "GeForce RTX 5090 32GB", spec: "4K max settings, no limits", price: 1999, tag: "ENTHUSIAST" },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    slotLabel: "STORAGE",
    icon: HardDrive,
    image: "/parts/storage.svg",
    options: [
      { id: "storage-1tb-gen4", name: "1TB Gen4 NVMe SSD", spec: "OS-ready, heatsinked", price: 69 },
      { id: "storage-2tb-gen4", name: "2TB Gen4 NVMe SSD", spec: "OS-ready, heatsinked", price: 129, tag: "POPULAR" },
      { id: "storage-2tb-gen5", name: "2TB Gen5 NVMe SSD", spec: "Next-gen speed", price: 189 },
      { id: "storage-4tb-gen5", name: "4TB Gen5 NVMe SSD", spec: "Next-gen speed, max capacity", price: 349 },
      { id: "storage-dual-4tb", name: "1TB + 2TB Gen4 (Dual Drive)", spec: "OS drive + game library", price: 179 },
    ],
  },
  {
    id: "psu",
    label: "Power Supply",
    slotLabel: "PSU",
    icon: PlugZap,
    image: "/parts/psu.svg",
    options: [
      { id: "psu-650-gold", name: "650W 80+ Gold", spec: "Fixed cables", price: 79 },
      { id: "psu-750-gold", name: "750W 80+ Gold Modular", spec: "Fully modular", price: 99, tag: "POPULAR" },
      { id: "psu-850-gold", name: "850W 80+ Gold Modular", spec: "Fully modular", price: 129 },
      { id: "psu-1000-platinum", name: "1000W 80+ Platinum Modular", spec: "Fully modular, ATX 3.1", price: 189 },
      { id: "psu-1200-platinum", name: "1200W 80+ Platinum Modular", spec: "Fully modular, ATX 3.1", price: 259 },
    ],
  },
  {
    id: "case",
    label: "Case",
    slotLabel: "CASE",
    icon: Box,
    image: "/parts/case.svg",
    options: [
      { id: "case-core-tg", name: "Core TG Mid Tower", spec: "Mesh front", price: 79 },
      { id: "case-vision-tg", name: "Vision TG Mid Tower", spec: "Full glass panel", price: 109, tag: "POPULAR" },
      { id: "case-aurora-argb", name: "Aurora ARGB Mid Tower", spec: "4 ARGB fans included", price: 139 },
      { id: "case-titan", name: "Titan Full Tower", spec: "Supports 3x360mm", price: 189 },
      { id: "case-zero", name: "Zero Compact mATX", spec: "Small form factor", price: 99 },
    ],
  },
];

export function findOption(categoryId: string, optionId: string): PartOption | undefined {
  return PC_PARTS.find((c) => c.id === categoryId)?.options.find((o) => o.id === optionId);
}

/* ============================================================
   CATALOG OVERLAY — the admin panel (#/admin) stores products in a
   database (Vercel Blob). At runtime the builder fetches that catalog
   and overlays it on the fixed category structure below. When no
   catalog has been saved (or the backend isn't set up), the built-in
   options above are used, so the site always works.
   ============================================================ */

/** Products managed by the admin, keyed by category id. */
export type Catalog = Record<string, PartOption[]>;

/** The built-in options as a catalog — used to seed the admin editor. */
export function defaultCatalog(): Catalog {
  const cat: Catalog = {};
  for (const c of PC_PARTS) cat[c.id] = c.options.map((o) => ({ ...o }));
  return cat;
}

/** Merge a saved catalog onto the fixed categories. Categories with no
    saved products keep their built-in defaults. */
export function categoriesWithCatalog(catalog: Catalog | null): PartCategory[] {
  if (!catalog) return PC_PARTS;
  return PC_PARTS.map((c) =>
    catalog[c.id] && catalog[c.id].length > 0 ? { ...c, options: catalog[c.id] } : c
  );
}
