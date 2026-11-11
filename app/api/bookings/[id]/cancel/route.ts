import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const b = db.bookings.find((x: any) => x.id === Number(params.id) && x.user_id === user.id);
  if (!b) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (b.status !== 'booked') return NextResponse.json({ error: 'already_cancelled' }, { status: 400 });
  const hoursLeft = (new Date(b.starts_at).getTime() - Date.now()) / 3600000;
  if (hoursLeft < 24) return NextResponse.json({ error: 'cancel_deadline_passed' }, { status: 400 });
  b.status = 'cancelled';
  if (b.payment === 'plan_session') {
    const sub = db.subscriptions.find((s: any) => s.user_id === user.id);
    if (sub) sub.sessions_left += 1;
  }
  saveDb();
  return NextResponse.json({ booking: b });
}
