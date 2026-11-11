import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const chk: any = requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const b = await req.json();
  if (b.id) {
    const t = db.tests.find((x: any) => x.id === Number(b.id));
    if (!t) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    Object.assign(t, { price_cents: Number(b.price_cents ?? t.price_cents), title: b.title ?? t.title, description: b.description ?? t.description, answer_key: b.answer_key ?? t.answer_key, ai_prompt: b.ai_prompt ?? t.ai_prompt, questions: b.questions ?? t.questions, published: b.published !== undefined ? !!b.published : t.published });
  } else {
    db.tests.push({ id: nextId('tests'), price_cents: Number(b.price_cents || 0), title: b.title || '', description: b.description || '', answer_key: b.answer_key || '', ai_prompt: b.ai_prompt || '', questions: b.questions || '[]', published: b.published !== false, created_at: nowIso() });
  }
  saveDb();
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const chk: any = requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const id = Number(new URL(req.url).searchParams.get('id') || 0);
  db.tests = db.tests.filter((t: any) => t.id !== id);
  saveDb();
  return NextResponse.json({ ok: true });
}
