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

## Check it live (no desktop needed) — deploy on Vercel

The repo is a standard Next.js app, so the fastest way to check the live
site independently from Muse is Vercel (free tier is enough to look around):

1. Open https://vercel.com/new and **Import** `AmoKhoo/violet_muse`.
2. Framework preset: **Next.js** (detected automatically). No build command
   to change — `next build` is the default.
3. Environment variables: none required to look around. Optionally set
   `OPENAI_API_KEY`, `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY`,
   Google credentials and `SESSION_SECRET` (see `.env.example`).
4. Click **Deploy**. Vercel gives you a live URL like
   `violet-muse.vercel.app` — open it, switch EN / FR / AR, log in with a
   demo account below, and try the tests, booking and admin panel.

Note: on Vercel the JSON database lives in `/tmp` and does **not** persist
between deployments — fine for checking the site, not for production data.
For durable production data set `DATABASE_URL` (Postgres, e.g. Vercel
Postgres / Neon) — see `docs/ARCHITECTURE.md`. To make the site public
under your own domain, add the domain in Vercel → Project Settings →
Domains.

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
4. **Domain + hosting** — run `npm run dev` locally to test; for the public
   site deploy this app (any Node host) and point your domain at it.
5. **Legal pages** — privacy policy, terms, and the "not a diagnosis" notice
   (the notice is already in every report; the pages are stubs in the footer).
