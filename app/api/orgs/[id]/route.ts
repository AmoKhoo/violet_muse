import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest, hashPassword } from '@/lib/auth';
export const dynamic = 'force-dynamic';
// Leader panel for one org: members, assignments, and results of
// org-assigned tests ONLY. Personal results are never returned here.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const org = db.organizations.find((o: any) => o.id === Number(params.id));
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (org.leader_id !== user.id && user.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const members = db.org_members.filter((m: any) => m.org_id === org.id).map((m: any) => {
    const u = db.users.find((x: any) => x.id === m.user_id);
    return u ? { id: u.id, name: u.name, email: u.email } : null;
  }).filter(Boolean);
  const assignments = db.assignments.filter((a: any) => a.org_id === org.id);
  const results = db.test_results.filter((r: any) => r.org_id === org.id).map((r: any) => {
    const u = db.users.find((x: any) => x.id === r.user_id);
    const t = db.tests.find((x: any) => x.id === r.test_id);
    return { ...r, user_name: u ? u.name : '', test_title: t ? t.title : '' };
  });
  return NextResponse.json({ org, members, assignments, results });
}
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const org = db.organizations.find((o: any) => o.id === Number(params.id));
  if (!org) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (org.leader_id !== user.id && user.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  if (body.action === 'add_member') {
    const { name, email, password } = body;
    if (!name || !email || !password) return NextResponse.json({ error: 'fields_required' }, { status: 400 });
    let member = db.users.find((u: any) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!member) {
      member = { id: nextId('users'), name, email, role: 'member', password_hash: hashPassword(password), credit_cents: 0, created_at: nowIso() };
      db.users.push(member);
    }
    if (!db.org_members.some((m: any) => m.org_id === org.id && m.user_id === member.id)) {
      db.org_members.push({ id: nextId('org_members'), org_id: org.id, user_id: member.id });
    }
    saveDb();
    return NextResponse.json({ member: { id: member.id, name: member.name, email: member.email } });
  }
  if (body.action === 'remove_member') {
    db.org_members = db.org_members.filter((m: any) => !(m.org_id === org.id && m.user_id === Number(body.user_id)));
    saveDb();
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'assign') {
    const { kind, item_id } = body;
    if (!['test', 'content'].includes(kind)) return NextResponse.json({ error: 'bad_kind' }, { status: 400 });
    const asg = { id: nextId('assignments'), org_id: org.id, kind, item_id: Number(item_id), created_at: nowIso() };
    db.assignments.push(asg);
    saveDb();
    return NextResponse.json({ assignment: asg });
  }
  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
