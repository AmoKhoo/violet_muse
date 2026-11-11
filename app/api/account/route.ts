import { NextResponse } from 'next/server';
import { getDb, loc } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { creditUsable } from '@/lib/money';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const url = new URL(req.url);
  const lang = ['en','fr','ar'].includes(url.searchParams.get('lang') || '') ? url.searchParams.get('lang')! : 'en';
  const sub = db.subscriptions.find((s: any) => s.user_id === user.id);
  const plan = sub ? db.plans.find((p: any) => p.id === sub.plan_id) : null;
  const grants = db.credit_grants.filter((g: any) => g.user_id === user.id);
  const myOrgs = db.org_members.filter((m: any) => m.user_id === user.id).map((m: any) => {
    const o = db.organizations.find((x: any) => x.id === m.org_id);
    return o ? { ...o } : null;
  }).filter(Boolean);
  const ledOrgs = db.organizations.filter((o: any) => o.leader_id === user.id);
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    subscription: sub ? { ...sub, plan: plan ? { ...plan, name: plan[`name_${lang}`] || plan.name_en } : null } : null,
    credit_cents: creditUsable(grants),
    credit_grants: grants,
    library: db.library_items.filter((l: any) => l.user_id === user.id || l.owner_key === user.email).map((l: any) => {
      const item = l.kind === 'test' ? db.tests.find((t: any) => t.id === l.item_id) : db.content.find((c: any) => c.id === l.item_id);
      return { ...l, title: item ? loc(item.title, lang) : l.label || '' };
    }),
    test_results: db.test_results.filter((r: any) => r.user_id === user.id),
    bookings: db.bookings.filter((b: any) => b.user_id === user.id).map((b: any) => {
      const c = db.counselors.find((x: any) => x.id === b.counselor_id);
      return { ...b, counselor_name: c ? c.name : '' };
    }),
    orders: db.orders.filter((o: any) => o.user_id === user.id),
    my_orgs: myOrgs, led_orgs: ledOrgs,
    assignments: db.assignments.filter((a: any) => myOrgs.some((o: any) => o.id === a.org_id)),
  });
}
