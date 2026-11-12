# Violet — architecture

Violet is a **modular monolith**: one Next.js 14 (App Router, TypeScript) app,
one shared JSON database, separate modules per concern. It is **not**
microservices — that would add cost and complexity with no benefit at this
scale, and the modules can be split later if one of them outgrows the rest.

## Stack

- Next.js 15 + React 19 + TypeScript. `next dev` / `next build` / `next start`.
  Cloudflare Pages build: `npm run pages:build` (`@cloudflare/next-on-pages`
  1.13; build output `.vercel/output/static`). All API routes and dynamic
  pages run on the Edge Runtime (`export const runtime = 'edge'`), so the
  code uses Web Crypto only — no `node:crypto` / `node:fs` imports.
- Styling: `app/globals.css` + `src/lib/theme.ts` (soft violet #8B7BC7 /
  #A78BFA, deep plum #4C3A7A, warm cream #FBF8F5, muted teal #6FA8A0).
  System fonts only — no external requests, so the first paint never blocks.
- Data: `src/lib/db.ts` — one JSON file (`data/violet.json`, seeded from
  `src/seed-data.json`) when a real filesystem exists (local / Node host).
  Public site, all four panels and admin read/write the same DB, so an
  admin delete removes the item from the public catalog. On Cloudflare
  Pages / Vercel there is no persistent filesystem: the DB lives in memory
  only and resets on redeploy / new isolate — fine for checking the site,
  not for durable production data. For production, set `DATABASE_URL`
  (Postgres — Neon / Supabase) and swap the adapter in `src/lib/db.ts`;
  the route code does not need to change.
- Auth: `src/lib/auth.ts` — PBKDF2-SHA256 password hashing (Web Crypto,
  100k iterations; stored as `pbkdf2:<salt>:<hash>`), stateless HMAC-signed
  tokens (30 days), roles member / leader / counselor / admin.
- i18n: `src/lib/i18n.ts` — EN / FR / AR strings; Arabic sets `dir="rtl"`.
  Content titles/descriptions are stored as `{en, fr, ar}` JSON.

## Modules (src/lib)

| File | Owns |
|---|---|
| db.ts | one shared DB, load/save, localized values |
| auth.ts | passwords, tokens, roles |
| ai.ts | test reports: answers JSON + answer key + prompt → report; OpenAI when `OPENAI_API_KEY` is set, local scoring otherwise |
| money.ts | plans, sessions, credit (60-day roll), annual 15% off, extra session $65 |
| payments.ts | checkout: DEMO until `STRIPE_SECRET_KEY` is set |
| meet.ts | Meet link: placeholder until Google credentials are set |
| i18n.ts / theme.ts | languages + palette |

## Routes

- Public pages: `/` `/content` `/content/[id]` `/tests` `/tests/[id]`
  `/counselors` `/counselors/[id]` `/plans` `/login` `/apply`
- Panels: `/panel` (member / leader / counselor by role), `/admin`
- API: `/api/catalog` `/api/content/[id]` `/api/tests/[id]` (+ `/submit`)
  `/api/auth/*` `/api/shop/buy` `/api/shop/subscribe` `/api/bookings`
  (+ `/[id]/cancel`) `/api/threads` `/api/orgs` (+ `/[id]`)
  `/api/counselor/*` `/api/admin` (+ `/content` `/tests` `/plans`
  `/counselors`)

## Privacy rules (enforced server-side, not just in the UI)

- A test's answer key and AI prompt never leave the server (`/api/tests/[id]`
  returns questions only; `/api/admin` requires the admin role).
- A leader sees test results **only** for tests taken under an org
  assignment (`test_results.org_id`); personal results (`org_id` null) are
  never returned by the org panel.
- A counselor's private notes are returned only to that counselor.
- A counselor bio change is stored as `pending_bio` and goes live only
  after admin approval.

## Going live — checklist

1. Real tests (licensed answer keys + prompts) via the admin panel.
2. Real content files: put MP3/MP4/PDF in `public/media/` and set
   `media_url` on the content item; the detail page currently shows the
   text outline.
3. Keys: `OPENAI_API_KEY`, Stripe keys, Google credentials (see `.env.example`).
4. `DATABASE_URL` for durable data; change `SESSION_SECRET` and
   `DEMO_PASSWORD`; delete demo accounts/org from the admin panel.
5. Deploy on Cloudflare Pages (see README) and point your domain at it.
