/** @type {import('next').NextConfig} */
const nextConfig = {
  // No external requests at runtime: system fonts only, no webfonts.
  // API routes and dynamic pages run on the Edge Runtime
  // (`export const runtime = 'edge'` in each route) so the app builds for
  // Cloudflare Pages via `@cloudflare/next-on-pages`
  // (`npm run pages:build`, output `.vercel/output/static`).
  // No `output: 'standalone'` here — for a self-hosted Node server,
  // `next build && next start` is enough.
};

export default nextConfig;
