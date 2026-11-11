import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const cid = Number(new URL(req.url).searchParams.get('counselor_id') || 0);
  const uid = Number(new URL(req.url).searchParams.get('user_id') || user.id);
  const messages = db.messages.filter((m: any) => m.counselor_id === cid && m.user_id === uid);
  return NextResponse.json({ messages });
}
export async function POST(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { counselor_id, text, patient_id } = await req.json();
  const db: any = getDb();
  const counselor = db.counselors.find((c: any) => c.id === Number(counselor_id));
  if (!counselor || !text) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const targetUserId = user.role === 'counselor' ? Number(patient_id || 0) : user.id;
  if (!targetUserId) return NextResponse.json({ error: 'patient_required' }, { status: 400 });
  const msg = { id: nextId('messages'), user_id: targetUserId, counselor_id: counselor.id, sender: user.role === 'counselor' ? 'counselor' : 'user', text, created_at: nowIso() };
  db.messages.push(msg);
  saveDb();
  return NextResponse.json({ message: msg });
}
