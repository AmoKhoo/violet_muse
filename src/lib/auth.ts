// Violet auth — stateless signed tokens (works on serverless: no in-memory
// session store).
//
// Web Crypto only — no `node:crypto`. Cloudflare Pages runs routes on the
// Edge Runtime, where Node built-ins are not bundled, so passwords use
// PBKDF2-SHA256 and tokens use HMAC-SHA256 via `crypto.subtle`, which exists
// on Node 18+, in the Edge Runtime and in Cloudflare Workers alike.
//
// Password format: `pbkdf2:<salt-hex>:<hash-hex>` (100k iterations, 256-bit).
// Legacy `scrypt:` hashes from v0.1 cannot be verified without Node crypto
// and are rejected; the seeded demo accounts were re-hashed to pbkdf2.
// Demo accounts use DEMO_PASSWORD (default demo1234); change before launch.
import { getDb, saveDb } from './db';

export type Role = 'member' | 'leader' | 'counselor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  password_hash: string;
  credit_cents: number;
  created_at: string;
}

const PBKDF2_ITERATIONS = 100000;

function secret(): string {
  return process.env.SESSION_SECRET || 'violet-dev-secret-change-me';
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex) as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(password: string, salt = randomHex(16)): Promise<string> {
  const hash = await pbkdf2(password, salt);
  return `pbkdf2:${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored || !stored.startsWith('pbkdf2:')) return false;
  const [, salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = await pbkdf2(password, salt);
  return constantTimeEqual(hash, check);
}

async function hmac(data: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Buffer.from(sig).toString('base64url');
}

export async function createToken(userId: number): Promise<string> {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64url');
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function userFromToken(token: string | null | undefined): Promise<User | null> {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expect = await hmac(payload);
  try {
    if (!constantTimeEqual(sig, expect)) return null;
  } catch {
    return null;
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (data.exp < Date.now()) return null;
  return (getDb().users as User[]).find((u) => u.id === data.id) || null;
}

export async function userFromRequest(req: Request): Promise<User | null> {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  return userFromToken(token);
}

export function publicUser(u: User | null | undefined) {
  if (!u) return null;
  const { password_hash, ...rest } = u as any;
  return rest;
}

export async function registerUser({ name, email, password, role = 'member' as Role }: any): Promise<User> {
  const db = getDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('email_taken');
  }
  const user: User = {
    id: (db.users as User[]).reduce((m, u) => Math.max(m, u.id), 0) + 1,
    name, email, role,
    password_hash: await hashPassword(password),
    credit_cents: 0,
    created_at: new Date().toISOString(),
  };
  db.users.push(user as any);
  saveDb();
  return user;
}
