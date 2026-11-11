import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const chk: any = requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  const b = await req.json();
  if (b.action === 'set_status') {
    const c = db.counselors.find((x: any) => x.id === Number(b.id));
    if (!c) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    c.status = b.status;
  } else if (b.action === 'approve_bio') {
    const c = db.counselors.find((x: any) => x.id === Number(b.id));
    if (!c || !c.pending_bio) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    c.bio = c.pending_bio; c.pending_bio = null;
  } else if (b.action === 'review_application') {
    const a = db.counselor_applications.find((x: any) => x.id === Number(b.id));
    if (!a) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    a.status = b.status;
    if (b.status === 'approved') {
      db.counselors.push({ id: nextId('counselors'), user_id: null, name: a.name, specialty: JSON.stringify({ en: a.specialty, fr: a.specialty, ar: a.specialty }), languages: 'en', rating: 5, sessions_done: 0, session_price_cents: 6500, status: 'approved', photo: '', bio: JSON.stringify({ en: a.resume || '', fr: a.resume || '', ar: a.resume || '' }), pending_bio: null });
    }
  } else return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  saveDb();
  return NextResponse.json({ ok: true });
}
