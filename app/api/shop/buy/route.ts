import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { checkout } from '@/lib/payments';
import { spendCredit, creditUsable } from '@/lib/money';
export const dynamic = 'force-dynamic';
// Buy one content item or one test access. Guest checkout: no account needed,
// just an email — the item is stored under that email and appears in the
// profile once the guest creates an account with the same email.
// Signed-in users can pay by card (demo) or from credit.
export async function POST(req: Request) {
  const body = await req.json();
  const { kind, item_id, email, pay_with } = body;
  const db: any = getDb();
  const user = userFromRequest(req);
  if (!user && !email) return NextResponse.json({ error: 'email_required' }, { status: 400 });
  const item = kind === 'test'
    ? db.tests.find((t: any) => t.id === Number(item_id) && t.published)
    : db.content.find((c: any) => c.id === Number(item_id) && c.published);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const price = item.price_cents || 0;
  let payment = 'free';
  if (price > 0) {
    if (user && pay_with === 'credit') {
      if (creditUsable(db.credit_grants.filter((g: any) => g.user_id === user.id)) < price) {
        return NextResponse.json({ error: 'insufficient_credit', price_cents: price }, { status: 402 });
      }
      spendCredit(db, user.id, price);
      payment = 'credit';
    } else {
      const r = await checkout({ amountCents: price, description: `Violet ${kind} #${item.id}`, email: email || user?.email });
      payment = r.payment;
    }
  }
  const order = { id: nextId('orders'), user_id: user ? user.id : null, guest_email: user ? '' : (email || ''), kind, item_id: item.id, label: item.title, amount_cents: price, payment, created_at: nowIso() };
  db.orders.push(order);
  db.library_items.push({ id: nextId('library_items'), user_id: user ? user.id : null, owner_key: user ? user.email : (email || ''), kind, item_id: item.id, created_at: nowIso() });
  saveDb();
  return NextResponse.json({ order, payment, demo: payment === 'demo' });
}
