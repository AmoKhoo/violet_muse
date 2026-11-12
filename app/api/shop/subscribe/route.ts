export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { checkout } from '@/lib/payments';
import { grantCredit, planAnnualPrice } from '@/lib/money';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const { plan_id, billing } = await req.json();
  const db: any = getDb();
  const plan = db.plans.find((p: any) => p.id === Number(plan_id));
  if (!plan) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const annual = billing === 'annual';
  const price = annual ? planAnnualPrice(plan) : plan.price_cents;
  const pay = await checkout({ amountCents: price, description: `Violet ${plan.name_en} plan (${billing})`, email: user.email });
  const expires = new Date(); expires.setDate(expires.getDate() + (annual ? 365 : 30));
  const sessionsExpire = new Date(); sessionsExpire.setMonth(sessionsExpire.getMonth() + 1);
  db.subscriptions = db.subscriptions.filter((s: any) => s.user_id !== user.id);
  const sub = { id: nextId('subscriptions'), user_id: user.id, plan_id: plan.id, billing: annual ? 'annual' : 'monthly', sessions_left: plan.sessions, sessions_expire_at: sessionsExpire.toISOString(), started_at: nowIso(), ends_at: expires.toISOString() };
  db.subscriptions.push(sub);
  grantCredit(db, user.id, plan.credit_cents, `${plan.name_en} plan credit`);
  db.orders.push({ id: nextId('orders'), user_id: user.id, guest_email: '', kind: 'plan', item_id: plan.id, label: `${plan.name_en} (${billing})`, amount_cents: price, payment: pay.payment, created_at: nowIso() });
  saveDb();
  return NextResponse.json({ subscription: sub, payment: pay.payment, demo: pay.payment === 'demo' });
}
