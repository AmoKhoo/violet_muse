export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';

// POST /api/emergency/availability — the counselor's own online/offline
// toggle for emergency talk. Body: { online: boolean }.
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  if (user.role !== 'counselor') return NextResponse.json({ error: 'not_a_counselor' }, { status: 403 });
  const db: any = getDb();
  const profile = db.counselors.find((c: any) => c.user_id === user.id);
  if (!profile) return NextResponse.json({ error: 'not_a_counselor' }, { status: 404 });
  const { online } = await req.json();
  profile.emergency_online = online !== false;
  saveDb();
  return NextResponse.json({ online: profile.emergency_online });
}
