"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  PC_PARTS,
  defaultCatalog,
  partImage,
  type Catalog,
  type PartCategory,
  type PartOption,
} from "@/data/pcParts";
import { fetchCatalog } from "@/lib/catalog";

type Screen = "loading" | "setup" | "login" | "ready";

type EditState = {
  category: PartCategory;
  index: number | null; // null = new product
  draft: PartOption;
};

const TAGS = ["", "POPULAR", "BEST VALUE", "ENTHUSIAST"] as const;

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function blankOption(categoryId: string): PartOption {
  return { id: `${categoryId}-${Date.now().toString(36)}`, name: "", spec: "", price: 0 };
}

/* =========================
   PRODUCT EDITOR MODAL
========================= */

function EditorModal({
  state,
  onCancel,
  onSave,
}: {
  state: EditState;
  onCancel: () => void;
  onSave: (option: PartOption) => void;
}) {
  const [draft, setDraft] = useState<PartOption>(state.draft);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const set = <K extends keyof PartOption>(k: K, v: PartOption[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr("");
    try {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      set("image", blob.url);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const canSave = draft.name.trim().length > 0 && Number.isFinite(draft.price);
  const previewSrc = draft.image || partImage(state.category, draft);

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#0c0707] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight">
            {state.index === null ? "Add" : "Edit"} · {state.category.label}
          </h2>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="glow-icon flex h-9 w-9 items-center justify-center rounded-lg text-white/60"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* image */}
        <div className="flex items-center gap-4">
          <img
            src={previewSrc}
            alt=""
            className="h-20 w-20 shrink-0 rounded-xl object-cover bg-black/40 border border-white/10"
          />
          <div>
            <label className="glow-btn inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold hover:bg-white/5">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4 text-red-500" />
              )}
              {uploading ? "Uploading…" : draft.image ? "Replace photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={onFile} className="hidden" disabled={uploading} />
            </label>
            {draft.image && (
              <button
                onClick={() => set("image", undefined)}
                className="ml-3 text-xs text-white/40 hover:text-white/70"
              >
                Remove
              </button>
            )}
            <p className="mt-1 text-[11px] text-white/40">Optional — uses the default illustration if empty.</p>
            {uploadErr && <p className="mt-1 text-[11px] text-red-400">{uploadErr}</p>}
          </div>
        </div>

        {/* fields */}
        <div className="mt-5 space-y-3.5">
          <Field label="Brand (optional)">
            <input
              value={draft.brand ?? ""}
              onChange={(e) => set("brand", e.target.value || undefined)}
              placeholder="e.g. AMD, ASUS ROG — leave blank for house items"
              className="ppt-input"
            />
          </Field>
          <Field label="Product name">
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Ryzen 7 9800X3D"
              className="ppt-input"
            />
          </Field>
          <Field label="Description">
            <input
              value={draft.spec}
              onChange={(e) => set("spec", e.target.value)}
              placeholder="e.g. 8-core 3D V-Cache, gaming flagship"
              className="ppt-input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Price (USD)">
              <input
                type="number"
                min={0}
                value={Number.isFinite(draft.price) ? draft.price : ""}
                onChange={(e) => set("price", Math.max(0, Math.round(Number(e.target.value))))}
                placeholder="479"
                className="ppt-input"
              />
            </Field>
            <Field label="Badge (optional)">
              <select
                value={draft.tag ?? ""}
                onChange={(e) => set("tag", (e.target.value || undefined) as PartOption["tag"])}
                className="ppt-input"
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t || "None"}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="glow-link text-sm text-white/60">
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave({ ...draft, name: draft.name.trim(), spec: draft.spec.trim() })}
            className={`glow-btn inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
              canSave ? "bg-red-600 hover:bg-red-500 text-white" : "bg-white/10 text-white/40 pointer-events-none"
            }`}
          >
            <Check className="size-4" />
            {state.index === null ? "Add product" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-mono tracking-[0.2em] text-white/45 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

/* =========================
   PAGE
========================= */

export default function AdminPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [catalog, setCatalog] = useState<Catalog>({});
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/login");
        const d = (await r.json()) as { configured?: boolean; authed?: boolean };
        if (!d.configured) return setScreen("setup");
        if (d.authed) {
          await loadCatalog();
          return setScreen("ready");
        }
        setScreen("login");
      } catch {
        setScreen("setup");
      }
    })();
  }, []);

  async function loadCatalog() {
    const c = await fetchCatalog();
    setCatalog(c ?? defaultCatalog());
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      await loadCatalog();
      setPassword("");
      setScreen("ready");
    } else {
      const d = (await r.json().catch(() => ({}))) as { error?: string };
      setLoginError(d.error || "Login failed.");
    }
  }

  async function doLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setScreen("login");
  }

  async function saveAll() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const r = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ catalog }),
      });
      if (r.ok) setSaveMsg({ ok: true, text: "Saved — your changes are now live on the site." });
      else {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        setSaveMsg({ ok: false, text: d.error || "Save failed." });
      }
    } catch {
      setSaveMsg({ ok: false, text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }

  function commitOption(option: PartOption) {
    if (!editing) return;
    const catId = editing.category.id;
    setCatalog((prev) => {
      const list = [...(prev[catId] ?? [])];
      if (editing.index === null) list.push(option);
      else list[editing.index] = option;
      return { ...prev, [catId]: list };
    });
    setEditing(null);
    setSaveMsg(null);
  }

  function deleteOption(catId: string, index: number) {
    setCatalog((prev) => {
      const list = [...(prev[catId] ?? [])];
      list.splice(index, 1);
      return { ...prev, [catId]: list };
    });
    setSaveMsg(null);
  }

  const totalProducts = useMemo(
    () => Object.values(catalog).reduce((n, arr) => n + arr.length, 0),
    [catalog]
  );

  /* ---- screens ---- */

  if (screen === "loading") {
    return (
      <Shell>
        <div className="flex items-center gap-3 text-white/50">
          <Loader2 className="size-5 animate-spin" /> Loading…
        </div>
      </Shell>
    );
  }

  if (screen === "setup") {
    return (
      <Shell>
        <div className="max-w-lg rounded-2xl border border-white/10 bg-[#0c0707] p-6">
          <h1 className="text-2xl font-bold tracking-tight">Admin not set up yet</h1>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">
            To turn on the product manager, add these in your Vercel project
            (<span className="text-white/80">Settings → Environment Variables</span>),
            then create a Blob store (<span className="text-white/80">Storage → Create → Blob</span>)
            and redeploy:
          </p>
          <ul className="mt-4 space-y-2 font-mono text-xs">
            <li className="rounded-lg bg-black/50 border border-white/10 px-3 py-2">
              <span className="text-red-400">ADMIN_PASSWORD</span> = your login password
            </li>
            <li className="rounded-lg bg-black/50 border border-white/10 px-3 py-2">
              <span className="text-red-400">ADMIN_SESSION_SECRET</span> = any long random text
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/40">
            Full steps are in <span className="text-white/70">ADMIN_SETUP.md</span> in your project.
          </p>
        </div>
      </Shell>
    );
  }

  if (screen === "login") {
    return (
      <Shell>
        <form onSubmit={doLogin} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0707] p-6">
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-lg object-cover" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Store Admin</h1>
          <p className="mt-1 text-sm text-white/50">Enter your password to manage products.</p>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="ppt-input mt-5"
          />
          {loginError && <p className="mt-2 text-sm text-red-400">{loginError}</p>}
          <button
            type="submit"
            className="glow-btn mt-4 w-full rounded-xl bg-red-600 hover:bg-red-500 py-3 font-semibold"
          >
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  // ready
  return (
    <div className="min-h-screen bg-black text-white">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-bold leading-tight truncate">Store Admin</p>
              <p className="text-[11px] text-white/45">{totalProducts} products</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#/pc-builder" className="glow-link hidden sm:inline text-sm text-white/60">
              View builder
            </a>
            <button
              onClick={saveAll}
              disabled={saving}
              className="glow-btn inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-semibold"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save changes
            </button>
            <button
              onClick={doLogout}
              aria-label="Log out"
              className="glow-icon flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/60"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        {saveMsg && (
          <div
            className={`px-5 py-2 text-center text-sm ${
              saveMsg.ok ? "bg-green-600/15 text-green-300" : "bg-red-600/15 text-red-300"
            }`}
          >
            {saveMsg.text}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 space-y-8">
        <p className="text-sm text-white/50">
          Add, edit, or remove products in each category. Click{" "}
          <span className="text-white/80 font-semibold">Save changes</span> when you're done —
          your PC builder updates instantly.
        </p>

        {PC_PARTS.map((category) => {
          const Icon = category.icon;
          const products = catalog[category.id] ?? [];
          return (
            <section key={category.id}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
                    <Icon className="size-4" />
                  </span>
                  <h2 className="font-bold tracking-tight">{category.label}</h2>
                  <span className="text-xs text-white/35">{products.length}</span>
                </div>
                <button
                  onClick={() =>
                    setEditing({ category, index: null, draft: blankOption(category.id) })
                  }
                  className="glow-btn inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
                >
                  <Plus className="size-3.5 text-red-500" /> Add
                </button>
              </div>

              <div className="space-y-2">
                {products.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-white/35 text-center">
                    No products yet — click “Add”.
                  </p>
                )}
                {products.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0c0707] p-2.5"
                  >
                    <img
                      src={partImage(category, option)}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg object-cover bg-black/40"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight truncate">
                        {option.brand ? `${option.brand} ` : ""}
                        <span className="text-white/75">{option.name}</span>
                        {option.tag && (
                          <span className="ml-2 rounded bg-red-600/20 px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-red-300 align-middle">
                            {option.tag}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/45 truncate">{option.spec}</p>
                    </div>
                    <span className="shrink-0 font-bold text-red-400 text-sm">
                      {formatPrice(option.price)}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditing({ category, index, draft: { ...option } })}
                        aria-label="Edit"
                        className="glow-icon flex h-8 w-8 items-center justify-center rounded-lg text-white/55"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => deleteOption(category.id, index)}
                        aria-label="Delete"
                        className="glow-icon flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/40 text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="pt-2">
          <button
            onClick={saveAll}
            disabled={saving}
            className="glow-btn inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-6 py-3 font-semibold"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save all changes
          </button>
        </div>
      </main>

      {editing && (
        <EditorModal state={editing} onCancel={() => setEditing(null)} onSave={commitOption} />
      )}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      {children}
    </div>
  );
}
