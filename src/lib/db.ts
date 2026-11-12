// Violet data layer — one shared JSON database.
// The public site, all four panels and the admin panel read and write the SAME
// data, so an admin delete really removes the item from the public catalog.
//
// Storage:
//  - Locally / on a Node host: ./data/violet.json (DATA_DIR env overrides it).
//    The file is used only when a real filesystem is available.
//  - On Vercel / Cloudflare Pages (serverless, no persistent filesystem):
//    writes live in memory only and do NOT survive redeploys or a new
//    isolate. That is fine for checking the site, but for durable production
//    data set DATABASE_URL (Postgres) and swap this adapter;
//    see docs/ARCHITECTURE.md.
//  - Seed data lives in src/seed-data.json and is copied on first boot.
//
// No `node:fs` / `node:path` imports here: Cloudflare Pages runs routes on
// the Edge Runtime, where Node built-ins are not bundled. The filesystem is
// loaded lazily (and only on a real Node host) via an eval'd require that the
// bundler cannot statically trace; everywhere else the DB is in-memory.
import seedData from '../seed-data.json';

export type Db = typeof seedData;

type FsLike = {
  existsSync: (p: string) => boolean;
  readFileSync: (p: string, enc: 'utf8') => string;
  mkdirSync: (p: string, opts: { recursive: boolean }) => void;
  writeFileSync: (p: string, data: string, enc: 'utf8') => void;
  renameSync: (a: string, b: string) => void;
};

let fsModule: FsLike | null | undefined;
function loadFs(): FsLike | null {
  if (fsModule !== undefined) return fsModule;
  try {
    // Deliberately indirect: a static `require('node:fs')` would break the
    // Edge bundle. On Node this resolves; on Workers/Edge it throws.
    // eslint-disable-next-line no-eval
    const req = eval('typeof require !== "undefined" ? require : null') as
      | ((id: string) => FsLike)
      | null;
    fsModule = req ? req('node:fs') : null;
  } catch {
    fsModule = null;
  }
  return fsModule;
}

function dbDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL || process.env.CF_PAGES) return '/tmp/violet-data';
  return './data';
}

function dbFile(): string {
  const dir = dbDir().replace(/\/$/, '');
  return `${dir}/violet.json`;
}

let cache: Db | null = null;

export function loadDb(): Db {
  if (cache) return cache;
  const fs = loadFs();
  if (fs) {
    const file = dbFile();
    try {
      if (fs.existsSync(file)) {
        cache = JSON.parse(fs.readFileSync(file, 'utf8')) as Db;
        return cache;
      }
    } catch {
      // Corrupt / unreadable file: fall through to a fresh seed in memory.
    }
  }
  cache = JSON.parse(JSON.stringify(seedData)) as Db;
  saveDb();
  return cache;
}

export function saveDb(): void {
  if (!cache) return;
  const fs = loadFs();
  if (!fs) return; // No filesystem (e.g. serverless): keep the in-memory copy.
  try {
    const file = dbFile();
    const dir = file.slice(0, file.lastIndexOf('/')) || '.';
    fs.mkdirSync(dir, { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  } catch {
    // Read-only filesystem (e.g. serverless): keep the in-memory copy.
    // Data still works for the current session; it just won't persist.
  }
}

export function getDb(): Db {
  return loadDb();
}

export function nextId(table: keyof Db): number {
  const rows = (cache as any)[table] as { id?: number }[];
  return (rows || []).reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// Localised {en, fr, ar} value stored as a JSON string or object.
export function loc(value: unknown, lang: string): string {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const o = JSON.parse(value) as Record<string, string>;
      return o[lang] || o.en || value;
    } catch {
      return value;
    }
  }
  const o = value as Record<string, string>;
  return o[lang] || o.en || '';
}
