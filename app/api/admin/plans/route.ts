import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const chk: any = requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const b = await req.json();
  const p = db.plans.find((x: any) => x.id === Number(b.id));
  if (!p) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  Object.assign(p, { price_cents: Number(b.price_cents ?? p.price_cents), sessions: Number(b.sessions ?? p.sessions), credit_cents: Number(b.credit_cents ?? p.credit_cents), workshops: b.workshops !== undefined ? !!b.workshops : p.workshops, priority: b.priority !== undefined ? !!b.priority : p.priority, org_seat: b.org_seat !== undefined ? !!b.org_seat : p.org_seat });
  saveDb();
  return NextResponse.json({ ok: true });
}
