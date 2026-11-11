/** @type {import('next').NextConfig} */
const nextConfig = {
  // No external requests at runtime: system fonts only, no webfonts.
  // No `output: 'standalone'` here — Vercel handles the build; for a
  // self-hosted Node server, `next build && next start` is enough.
};

export default nextConfig;
