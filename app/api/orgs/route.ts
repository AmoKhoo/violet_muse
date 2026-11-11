import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  return NextResponse.json({
    my_orgs: db.org_members.filter((m: any) => m.user_id === user.id).map((m: any) => db.organizations.find((o: any) => o.id === m.org_id)).filter(Boolean),
    led_orgs: db.organizations.filter((o: any) => o.leader_id === user.id),
  });
}
export async function POST(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });
  const db: any = getDb();
  const org = { id: nextId('organizations'), name, leader_id: user.id, created_at: nowIso() };
  db.organizations.push(org);
  saveDb();
  return NextResponse.json({ org });
}
