export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const chk: any = await requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const b = await req.json();
  if (b.id) {
    const item = db.content.find((c: any) => c.id === Number(b.id));
    if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    Object.assign(item, { kind: b.kind || item.kind, price_cents: Number(b.price_cents ?? item.price_cents), meta: b.meta ?? item.meta, title: b.title ?? item.title, description: b.description ?? item.description, body: b.body ?? item.body, published: b.published !== undefined ? !!b.published : item.published });
  } else {
    db.content.push({ id: nextId('content'), kind: b.kind || 'book', price_cents: Number(b.price_cents || 0), meta: b.meta || '', title: b.title || '', description: b.description || '', body: b.body || '', published: b.published !== false, created_at: nowIso() });
  }
  saveDb();
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const chk: any = await requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const id = Number(new URL(req.url).searchParams.get('id') || 0);
  db.content = db.content.filter((c: any) => c.id !== id);
  saveDb();
  return NextResponse.json({ ok: true });
}
