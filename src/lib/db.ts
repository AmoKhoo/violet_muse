// Violet data layer — one shared JSON database.
// The public site, all four panels and the admin panel read and write the SAME
// data, so an admin delete really removes the item from the public catalog.
//
// Storage:
//  - Locally / on a Node host: ./data/violet.json (DATA_DIR env overrides it).
//  - On Vercel (serverless): the filesystem is ephemeral, so writes go to
//    /tmp/violet-data and do NOT survive redeploys. That is fine for checking
//    the site, but for durable production data set DATABASE_URL (Postgres —
//    Vercel Postgres / Neon) and swap this adapter; see docs/ARCHITECTURE.md.
//  - Seed data lives in src/seed-data.json and is copied on first boot.
import fs from 'node:fs';
import path from 'node:path';
import seedData from '../seed-data.json';

export type Db = typeof seedData;

function dbDir(): string {
  if (process.env.DATA_DIR) return process.env.DATA_DIR;
  if (process.env.VERCEL) return '/tmp/violet-data';
  return './data';
}

function dbFile(): string {
  return path.resolve(dbDir(), 'violet.json');
}

let cache: Db | null = null;

export function loadDb(): Db {
  if (cache) return cache;
  const file = dbFile();
  try {
    if (fs.existsSync(file)) {
      cache = JSON.parse(fs.readFileSync(file, 'utf8')) as Db;
      return cache;
    }
  } catch {
    // Corrupt / unreadable file: fall through to a fresh seed in memory.
  }
  cache = JSON.parse(JSON.stringify(seedData)) as Db;
  saveDb();
  return cache;
}

export function saveDb(): void {
  if (!cache) return;
  try {
    const file = dbFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
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
