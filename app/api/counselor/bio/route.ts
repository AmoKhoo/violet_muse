export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
// A bio change goes live ONLY after admin approval (stored as pending_bio).
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const profile = db.counselors.find((c: any) => c.user_id === user.id);
  if (!profile) return NextResponse.json({ error: 'not_a_counselor' }, { status: 403 });
  const { bio } = await req.json();
  profile.pending_bio = bio;
  saveDb();
  return NextResponse.json({ ok: true, pending_bio: bio });
}
