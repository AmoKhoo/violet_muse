// Violet auth — stateless signed tokens (works on serverless: no in-memory
// session store). Passwords are hashed with scrypt (Node built-in).
// Demo accounts use DEMO_PASSWORD (default demo1234); change before launch.
import crypto from 'node:crypto';
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

function secret(): string {
  return process.env.SESSION_SECRET || 'violet-dev-secret-change-me';
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.startsWith('scrypt:')) return false;
  const [, salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

export function createToken(userId: number): string {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function userFromToken(token: string | null | undefined): User | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expect = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  } catch {
    return null;
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (data.exp < Date.now()) return null;
  return (getDb().users as User[]).find((u) => u.id === data.id) || null;
}

export function userFromRequest(req: Request): User | null {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  return userFromToken(token);
}

export function publicUser(u: User | null | undefined) {
  if (!u) return null;
  const { password_hash, ...rest } = u as any;
  return rest;
}

export function registerUser({ name, email, password, role = 'member' as Role }: any): User {
  const db = getDb();
  if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('email_taken');
  }
  const user: User = {
    id: (db.users as User[]).reduce((m, u) => Math.max(m, u.id), 0) + 1,
    name, email, role,
    password_hash: hashPassword(password),
    credit_cents: 0,
    created_at: new Date().toISOString(),
  };
  db.users.push(user as any);
  saveDb();
  return user;
}
