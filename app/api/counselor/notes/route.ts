import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
// Private per-patient notes: only the counselor who wrote them can read them.
export async function POST(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const profile = db.counselors.find((c: any) => c.user_id === user.id);
  if (!profile) return NextResponse.json({ error: 'not_a_counselor' }, { status: 403 });
  const { patient_id, text } = await req.json();
  if (!text) return NextResponse.json({ error: 'text_required' }, { status: 400 });
  const note = { id: nextId('counselor_notes'), counselor_id: profile.id, patient_id: Number(patient_id), text, created_at: nowIso() };
  db.counselor_notes.push(note);
  saveDb();
  return NextResponse.json({ note });
}
