# Violet — online psychology platform

Violet is a marketplace for online psychology services, in **English, French and
Arabic** (Arabic is full RTL). It is a **modular monolith** — one Node.js app, one
shared database, separate modules for catalog, tests, booking, plans, orgs and
admin. It is **not** microservices.

## What it does

- **Content store** — books, audio (e.g. a 50-minute anger-control session),
  video and multi-part courses. Free or paid per item ($1 / $2 / $5 / $10).
- **AI tests** — MBTI-style, Emotional Intelligence, Anger & Stress, Anxiety
  (CAC-style). Each test stores its questions, answer key and AI prompt in the
  admin panel. The report is generated from the key + prompt and always states
  it is **not a diagnosis**.
- **Counselors** — external counselors apply, admin reviews the resume and
  approves. Users book a 45-minute session, chat in-site, and get a Meet link.
- **Plans** — Bronze $99/mo (2 sessions + $20 credit), Silver $199/mo
  (3 + $60), Gold $299/mo (5 + $100 + workshops), Diamond $599/mo
  (8 + $200 + priority booking + 1 org seat). Unlimited messaging on all.
  Tests are **not** included in any plan: each test is free or paid from credit.
  Sessions expire at month-end (no rollover), credit rolls 60 days, extra
  session $65, cancel free up to 24h before. **Annual billing: 15% off** the
  12-month total, paid at once.
- **Guest checkout** — buy one item without an account; it then appears in
  your profile. Plan buying is cheaper than buying the same items singly.
- **Organizations / leaders** — a school, company or family leader creates
  username/password accounts for members, assigns tests/content, and sees
  results **only for org-assigned items**. Users have a personal space plus
  one or more org spaces; personal results are never visible to a leader.
- **Four panels** — member, leader, counselor (private per-patient notes only
  that counselor sees; bio goes live only after admin approval), admin/owner
  (everything: users, counselor approvals, content, tests incl. key + prompt,
  plans, orders, bookings, orgs).

Admin delete really deletes: the public site and the admin panel read the **same
database**, so deleting a test or a content item in admin removes it from the
public catalog immediately.

## Check it live (no desktop needed) — deploy on Cloudflare Pages

The repo is ready for Cloudflare Pages (free tier is enough to look
around). The build uses `@cloudflare/next-on-pages`, so API routes keep
working — this is **not** a static export.

**English:**
1. Open https://dash.cloudflare.com → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
2. Select the `AmoKhoo/violet_muse` repository.
3. Framework preset: **Next.js**. Set the build command to
   `npm run pages:build` and the build output directory to
   `.vercel/output/static` (the adapter's output).
   **Do NOT leave the preset's defaults:** the Next.js preset fills in
   build command `npm run build` and deploy command
   `npx wrangler deploy`. That combination builds plain Next.js and then
   fails the deploy in seconds with "Missing entry-point to Worker script
   or to assets directory" — `wrangler deploy` is for Workers, not Pages.
   So set the build command to `npm run pages:build` and **clear/remove
   the deploy command entirely (leave it empty)** — Pages deploys the
   output directory itself, no deploy command is needed.
4. Environment variables: none required to look around. Optionally set
   `OPENAI_API_KEY`, `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`,
   Google credentials and `SESSION_SECRET` (see `.env.example`).
5. Click **Save and Deploy**. Cloudflare gives you a live URL like
   `violet-muse.pages.dev` — open it, switch EN / FR / AR, log in with a
   demo account below, and try the tests, booking and admin panel.

   **Important:** if a deployment already failed with the old preset
   settings, **"Retry deployment" re-runs that old deployment with its
   original config** — it does NOT pick up corrected build settings.
   After fixing the settings, trigger a **new** deployment instead
   (e.g. push a new commit to `main`, or use **Create deployment**),
   so Cloudflare builds with `npm run pages:build` and an empty deploy
   command.

**فارسی:**
۱. به https://dash.cloudflare.com برو → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git**.
۲. مخزن `AmoKhoo/violet_muse` را انتخاب کن.
۳. Framework preset را **Next.js** بگذار، دستور ساخت را
   `npm run pages:build` و پوشه خروجی ساخت را
   `.vercel/output/static` بگذار.
   **مقادیر پیش‌فرض preset را دست‌نخورده نگذار:** preset دستور ساخت را
   `npm run build` و دستور دیپلوی را `npx wrangler deploy` می‌گذارد.
   با آن‌ها بیلد ساخته می‌شود ولی دیپلوی در چند ثانیه با خطای
   "Missing entry-point to Worker script or to assets directory" می‌افتد،
   چون `wrangler deploy` مال Workers است نه Pages. پس دستور ساخت را
   `npm run pages:build` بگذار و **دستور دیپلوی را کاملا پاک کن (خالی
   بماند)** — خود Pages پوشه خروجی را دیپلوی می‌کند و دستور دیپلوی لازم نیست.
۴. متغیر محیطی برای دیدن سایت لازم نیست. اگر خواستی `OPENAI_API_KEY`،
   کلیدهای Stripe، اطلاعات گوگل و `SESSION_SECRET` را بگذار
   (در `.env.example` هست).
۵. **Save and Deploy** را بزن. آدرسی مثل `violet-muse.pages.dev`
   می‌گیری؛ بازش کن، زبان را عوض کن، با یک حساب نمایشی زیر وارد شو و
   آزمون، رزرو و پنل مدیر را امتحان کن.

Note: on Cloudflare Pages there is **no persistent filesystem**, so the
JSON database lives in memory only and does **not** persist between
deployments or new isolates — fine for checking the site, not for
production data. Admin changes (add/delete) work while the site is
running, but they reset on the next deploy. For durable production data
set `DATABASE_URL` (Postgres, e.g. Neon / Supabase) — see
`docs/ARCHITECTURE.md`. To make the site public under your own domain,
add the domain in Cloudflare → Pages → your project → Custom domains.

Alternative: the app is also a standard Next.js app, so it still deploys
on Vercel (`vercel.com/new`, Import `AmoKhoo/violet_muse`, Deploy) or any
Node host (`npm run build && npm start`). On Vercel the JSON database
lives in `/tmp` and likewise does not persist.

## Run it locally

```bash
git clone https://github.com/AmoKhoo/violet_muse.git
cd violet_muse
npm install
cp .env.example .env.local   # optional — the app runs with defaults
npm run dev
```

Open http://localhost:3000

The database (`data/violet.json`) is created and seeded automatically on first
boot. Seed content is clearly marked sample data — replace it from the admin
panel or by editing `src/seed-data.json` before launch.

## Demo accounts (password for all: `demo1234`)

| Role | Email |
|---|---|
| Admin / owner | owner@platform.demo |
| Member | maya@demo.member |
| Leader (school) | leader@demo.school |
| Counselor | layla@demo.counselor |
| Students | sara@demo.student, karim@demo.student, lina@demo.student |

Change `DEMO_PASSWORD` / the demo accounts in `src/seed-data.json` before launch, and
delete the demo organization from the admin panel when you add real data.

## Project layout

```
app/
  layout.tsx          shell, nav, footer, theme
  globals.css         Violet theme (soft violet on warm cream, teal secondary)
  page.tsx            home
  content/            store list + detail (buy / guest checkout)
  tests/              test list + runner + report
  counselors/         counselor list + profile + booking + chat
  plans/              plans, monthly / annual (15% off)
  login/              login / register / demo accounts
  panel/              member + leader + counselor panels
  admin/              admin console (CRUD, approvals)
  apply/              counselor application
  api/
    catalog.ts        public catalog (same DB as admin)
    content/[id]      content detail (paywall check)
    tests/[id]        questions (key + prompt never leave the server)
    tests/[id]/submit test submit → report
    auth/             login / me / register
    shop/             buy (guest checkout) / subscribe
    bookings/         book / cancel (24h free cancel)
    threads/          in-site messages
    orgs/             organizations, members, assignments, leader view
    counselor/        panel, private notes, bio, apply
    admin/            everything: content, tests, plans, counselors
src/
  lib/
    db.ts             one shared JSON database
    seed-data.json    seed: 4 plans, 4 tests, 6 content items, 8 counselors, 7 users, 1 org
    i18n.ts           EN / FR / AR (AR = RTL)
    ai.ts             report generation + OpenAI integration point
    payments.ts       checkout: demo + Stripe integration point
    meet.ts           Meet link + Calendar: placeholder + Google point
    auth.ts           sessions, scrypt passwords, roles
    money.ts          plan / session / credit / annual rules
    theme.ts          palette (single source of truth)
    client.ts         safe storage + API client
    providers.tsx     language + auth state
    admin.ts          admin role guard
  components/Nav.tsx  brand, links, language switcher, login
docs/
  ARCHITECTURE.md     how the pieces fit, and what to change to go live
```

## What is real vs placeholder

| Feature | Status |
|---|---|
| Catalog, tests, booking, plans, credit, orgs, all 4 panels | Real, working, one shared DB |
| Test report generation | Real from the stored key + prompt; **local** unless `OPENAI_API_KEY` is set (see `src/lib/ai.ts`) |
| Checkout / payments | **Demo checkout** until `STRIPE_SECRET_KEY` is set (see `src/lib/payments.ts`) |
| Meet link / Calendar | **Placeholder link** until Google credentials are set (see `src/lib/meet.ts`) |
| Seed tests, content, counselors | **Sample data** — replace with your real tests, files and photos |
| Content playback | Text/outline playback in this version; real audio/video files go in `public/media/` (see `docs/ARCHITECTURE.md`) |

## What you still need to provide before launch

1. **Real test answer keys + prompts** — the seeded tests are samples; put your
   real (licensed) tests in the admin panel.
2. **Real content files** — books, audio and video files (MP3/MP4/PDF) for the
   store, and real counselor photos.
3. **Keys** — `OPENAI_API_KEY` for live AI reports, Stripe keys for real
   payments, Google credentials for real Meet links.
4. **Domain + hosting** — deploy this app on Cloudflare Pages (see above)
   and point your domain at it (Pages → Custom domains).
5. **Legal pages** — privacy policy, terms, and the "not a diagnosis" notice
   (the notice is already in every report; the pages are stubs in the footer).
