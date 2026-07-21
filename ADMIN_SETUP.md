# Store Admin — Setup Guide

Your site now has a **product management backend** (like a mini WordPress) at
`https://your-site.com/#/admin`. You log in, add/edit/delete products with
photos, prices and descriptions, hit **Save**, and your PC Builder updates
instantly — no code editing.

It runs on Vercel using **Vercel Blob** for storage (free tier). There's no
separate database to manage. This one-time setup takes about 5 minutes.

> Note: the admin panel only works on the **deployed Vercel site**, not on
> `npm run dev` locally. Locally the builder just shows the built-in default
> products.

---

## Step 1 — Create a Blob store (holds your products + images)

1. Go to your project on [vercel.com](https://vercel.com) → **Storage** tab.
2. Click **Create Database** → choose **Blob** → **Continue** → **Create**.
3. When asked, **connect it to this project**. Vercel automatically adds the
   `BLOB_READ_WRITE_TOKEN` environment variable for you — you don't copy
   anything by hand.

## Step 2 — Add your admin password

1. In your project → **Settings** → **Environment Variables**.
2. Add these two, for the **Production** (and Preview) environments:

   | Name                   | Value                                             |
   | ---------------------- | ------------------------------------------------- |
   | `ADMIN_PASSWORD`       | the password you'll type to log in (pick a strong one) |
   | `ADMIN_SESSION_SECRET` | any long random text (e.g. mash the keyboard, 40+ chars) |

3. Click **Save**.

## Step 3 — Redeploy

Environment variables only take effect on a new deploy.

- Push any commit, **or**
- In Vercel → **Deployments** → open the latest → **⋯** → **Redeploy**.

---

## Using the admin

1. Visit `https://your-site.com/#/admin`.
2. Enter your `ADMIN_PASSWORD`.
3. You'll see every category (CPU, GPU, RAM, …) with its products. For each:
   - **Add** — new product: upload a photo, type brand/name/description/price,
     optionally a badge (POPULAR / BEST VALUE / ENTHUSIAST).
   - **✏️ Edit** — change any field.
   - **🗑 Delete** — remove it.
4. Click **Save changes**. Done — the builder is updated for all visitors.

Photos you upload are stored on Vercel Blob automatically. A product with no
photo shows the category's default illustration, so nothing ever looks broken.

The first time you open the admin, it's pre-filled with the current built-in
products so you have a starting point — edit or replace them freely.

---

## Security notes

- Access is gated by a single shared password (`ADMIN_PASSWORD`). Anyone with
  it can edit products, so keep it private. Change it anytime by updating the
  env var and redeploying (this also logs everyone out).
- Sessions last 12 hours, then you log in again.
- Never commit these values to git — they live only in Vercel's env settings.

## Costs

Vercel Blob and serverless functions both have generous free tiers that a
small store won't exceed. If you ever grow past them, Vercel will notify you.

## Troubleshooting

- **"Admin not set up yet"** → env vars missing or not redeployed. Recheck
  Step 2 + 3.
- **"Could not save. Is the Blob store connected?"** → the Blob store isn't
  created/linked. Redo Step 1, then redeploy.
- **Changes don't show on the builder** → hard-refresh the builder page
  (`Ctrl+Shift+R`); the catalog is cached for ~30 seconds.
