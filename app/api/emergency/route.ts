export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { createMeetLink } from '@/lib/meet';
import {
  emergencyStatus, pickOnlineCounselor, nextOnlineAt, monthKey,
} from '@/lib/emergency';
export const dynamic = 'force-dynamic';

// GET — what the floating button and the panels need:
//  - member: plan allowance, used/remaining this month, own emergency history
//  - counselor: their online toggle state + incoming emergency requests
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const now = new Date();
  if (user.role === 'counselor') {
    const profile = db.counselors.find((c: any) => c.user_id === user.id);
    if (!profile) return NextResponse.json({ error: 'not_a_counselor' }, { status: 404 });
    const incoming = (db.emergency_calls || [])
      .filter((c: any) => c.counselor_id === profile.id && c.status === 'pending')
      .map((c: any) => {
        const u = db.users.find((x: any) => x.id === c.user_id);
        return { ...c, user_name: u ? u.name : '' };
      });
    return NextResponse.json({ online: profile.emergency_online !== false, incoming });
  }
  const status = emergencyStatus(db, user.id, now);
  const history = (db.emergency_calls || [])
    .filter((c: any) => c.user_id === user.id)
    .map((c: any) => {
      const co = db.counselors.find((x: any) => x.id === c.counselor_id);
      return { ...c, counselor_name: co ? co.name : '' };
    })
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json({ ...status, history });
}

// POST — start an emergency call right now.
// Errors: login_required (401) · no_plan · no_plan_allowance ·
// allowance_used_up · no_counselor_online (with next_online_at when known).
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const now = new Date();
  const status = emergencyStatus(db, user.id, now);
  if (!status.plan) return NextResponse.json({ error: 'no_plan', ...status }, { status: 403 });
  if (status.allowance <= 0) {
    return NextResponse.json({ error: 'no_plan_allowance', ...status }, { status: 403 });
  }
  if (status.remaining <= 0) {
    return NextResponse.json({ error: 'allowance_used_up', ...status }, { status: 403 });
  }
  const counselor = pickOnlineCounselor(db, now);
  if (!counselor) {
    return NextResponse.json(
      { error: 'no_counselor_online', ...status, next_online_at: nextOnlineAt(db, now) },
      { status: 503 },
    );
  }
  // The call starts in ~2 minutes, as the user was promised; 45 minutes long.
  const startsAt = new Date(now.getTime() + 2 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 45 * 60 * 1000);
  const meet = createMeetLink({
    title: `Violet emergency talk with ${counselor.name}`,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  });
  const call = {
    id: nextId('emergency_calls'),
    user_id: user.id,
    counselor_id: counselor.id,
    status: 'pending',
    month: monthKey(now),
    meet_url: meet.url,
    meet_status: meet.status,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    created_at: nowIso(),
  };
  db.emergency_calls.push(call);
  // The counselor is notified in-app: the same link lands in their panel
  // (incoming emergency request) and as a message in their thread.
  db.messages.push({
    id: nextId('messages'),
    user_id: user.id,
    counselor_id: counselor.id,
    sender: 'system',
    text: `Emergency talk — ${user.name} needs to talk now. Join in about 2 minutes: ${meet.url}`,
    created_at: nowIso(),
  });
  saveDb();
  return NextResponse.json({
    call,
    counselor: { id: counselor.id, name: counselor.name },
    meet,
    starts_in_minutes: 2,
    remaining_after: status.remaining - 1,
  });
}
