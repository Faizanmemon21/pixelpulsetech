/**
 * Background knowledge the chat assistant is grounded in: who PixelPulseTech
 * is, what's on the site, and the current hardware generation the store
 * sells. Keep this in sync with the site's actual content (BuildsPage.tsx,
 * pcParts.ts) — the assistant is instructed to prefer this over guessing.
 */
export const KNOWLEDGE_BASE = `
ABOUT PIXELPULSETECH
PixelPulseTech ("PPT") is a custom gaming PC brand. Slogan: "Power. Performance. Precision."
Website: www.pixelpulsetech.pk
Contact: builds@pixelpulsetech.pk, +92 331-1392238
Every PC is hand built, cable managed, and stress tested before it ships.

WHAT'S ON THE SITE
- Home page: hero rig showcase, a "Watch the Build" behind-the-scenes video, an "Inside the Machine" scroll-through of a real build's components, and a stylized 3D rig at the bottom.
- "#/builds" — Prebuilt rigs and browsable component categories (Processors, Graphics Cards, Memory, Storage, Cooling, Power Supplies).
- "#/pc-builder" — the Custom PC Builder: an interactive configurator where a visitor picks one part from each of 8 categories (Processor, Motherboard, Memory, Cooling, Graphics Card, Storage, Power Supply, Case) and sees a live summary of their build with a running price total, then can email the finished spec straight to the builders.

PREBUILT RIGS (3 tiers, always available)
1. PULSE CORE — $1,299 — 1080p/1440p esports. AMD Ryzen 5 9600X, GeForce RTX 5060 Ti 16GB, 32GB DDR5 6000MHz, 1TB Gen4 NVMe SSD, 240mm Liquid Cooler, 750W Gold PSU.
2. PULSE PRO — $2,199 — 1440p/4K high-refresh (most popular). AMD Ryzen 7 9800X3D, GeForce RTX 5080 16GB, 32GB DDR5 6000MHz RGB, 2TB Gen4 NVMe SSD, 360mm ARGB Liquid Cooler, 850W Gold PSU.
3. PULSE X — $3,499 — 4K max settings, no limits. AMD Ryzen 9 9950X3D, GeForce RTX 5090 32GB, 64GB DDR5 6400MHz RGB, 4TB Gen5 NVMe SSD, 420mm ARGB Liquid Cooler, 1200W Platinum PSU.

CURRENT HARDWARE GENERATION (what PixelPulseTech sells today)
- CPUs: AMD Ryzen 9000 series, including the X3D "3D V-Cache" gaming chips (Ryzen 7 9800X3D is the sweet spot for gaming; Ryzen 9 9950X3D adds more cores for streaming/creation). Also Intel Core Ultra 200-series ("Core Ultra 7 265K", "Core Ultra 9 285K") for customers who prefer Intel.
- GPUs: NVIDIA GeForce RTX 50 series (RTX 5060 Ti, 5070, 5080, 5090), from board partners ASUS ROG, MSI Suprim/Ventus, and Gigabyte AORUS.
- Motherboards: Gigabyte AORUS boards on AM5 (B650/X870/X870E chipsets) for Ryzen, and Z890 for Intel Core Ultra.
- Memory: DDR5, 6000-8000MHz kits, 16GB up to 64GB, often with RGB.
- Storage: Gen4 and Gen5 NVMe SSDs, 1TB to 4TB, OS-ready and heatsinked.
- Cooling: 240mm to 420mm ARGB liquid (AIO) coolers, plus air towers and custom hardline loops for enthusiasts.
- Power supplies: 80+ Gold and Platinum, fully modular, up to 1200W, ATX 3.1 ready.
- Cases: PixelPulseTech's own case line (Core TG, Vision TG, Aurora ARGB, Titan, Zero).

HOW TO HELP VISITORS
- If someone describes a budget or use case (e.g. "budget 1080p gaming", "best for streaming", "4K no compromises"), recommend the closest prebuilt rig OR suggest they use the Custom PC Builder ("#/pc-builder") to fine-tune it themselves.
- If someone asks about ordering, warranty, shipping, or wants a human, point them to builds@pixelpulsetech.pk or +92 331-1392238 — this assistant cannot place orders or access real-time stock/pricing changes.
- Prices mentioned above are the site's listed estimates and can change; always frame them as "as listed on the site" rather than guaranteed final pricing.
`.trim();
