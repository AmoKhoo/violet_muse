export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { checkout } from '@/lib/payments';
import { createMeetLink } from '@/lib/meet';
import { EXTRA_SESSION_CENTS } from '@/lib/money';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const list = user.role === 'counselor'
    ? db.bookings.filter((b: any) => { const c = db.counselors.find((x: any) => x.id === b.counselor_id); return c && c.user_id === user.id; })
    : db.bookings.filter((b: any) => b.user_id === user.id);
  return NextResponse.json({ bookings: list });
}
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { counselor_id, starts_at } = await req.json();
  const db: any = getDb();
  const counselor = db.counselors.find((c: any) => c.id === Number(counselor_id) && c.status === 'approved');
  if (!counselor) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!starts_at) return NextResponse.json({ error: 'starts_at_required' }, { status: 400 });
  const start = new Date(starts_at);
  const end = new Date(start.getTime() + 45 * 60 * 1000);
  if (db.bookings.some((b: any) => b.counselor_id === counselor.id && b.status === 'booked' && b.starts_at === start.toISOString())) {
    return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
  }
  // Use a plan session when available, otherwise the $65 extra-session price.
  let payment = 'plan_session';
  const sub = db.subscriptions.find((s: any) => s.user_id === user.id && s.sessions_left > 0 && new Date(s.sessions_expire_at) > new Date());
  if (sub) { sub.sessions_left -= 1; }
  else {
    const pay = await checkout({ amountCents: EXTRA_SESSION_CENTS, description: `Extra session with ${counselor.name}`, email: user.email });
    payment = pay.payment;
  }
  const meet = createMeetLink({ title: `Violet session with ${counselor.name}`, startsAt: start.toISOString(), endsAt: end.toISOString() });
  const booking = { id: nextId('bookings'), user_id: user.id, counselor_id: counselor.id, starts_at: start.toISOString(), ends_at: end.toISOString(), status: 'booked', payment, meet_url: meet.url, meet_status: meet.status, created_at: nowIso() };
  db.bookings.push(booking);
  saveDb();
  return NextResponse.json({ booking, meet });
}
