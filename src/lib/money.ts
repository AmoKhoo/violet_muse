// Violet money rules — plans, sessions, credit, annual billing.
// - Tests are NOT in any plan. A test is free or paid from credit.
// - Plan sessions expire at month-end (no rollover). Credit rolls 60 days.
// - Extra session $65. Cancel free up to 24h before the session.
// - Annual billing: 15% off the 12-month total, paid at once.
// - Plan buying must be cheaper than buying the same items singly.
export const EXTRA_SESSION_CENTS = 6500;
export const CREDIT_ROLL_DAYS = 60;

export interface Plan {
  id: number; key: string;
  name_en: string; name_fr: string; name_ar: string;
  price_cents: number; sessions: number; credit_cents: number;
  workshops: boolean; priority: boolean; org_seat: boolean;
}

export function planAnnualPrice(plan: Plan): number {
  return Math.round(plan.price_cents * 12 * 0.85);
}

export function annualSavings(plan: Plan): number {
  return plan.price_cents * 12 - planAnnualPrice(plan);
}

export function sessionsExpired(sub: any): boolean {
  if (!sub) return true;
  return new Date(sub.sessions_expire_at) < new Date();
}

export function creditUsable(grants: any[], at = new Date()): number {
  return grants
    .filter((g) => new Date(g.expires_at) > at && g.remaining_cents > 0)
    .reduce((s, g) => s + g.remaining_cents, 0);
}

export function spendCredit(db: any, userId: number, amountCents: number): void {
  const grants = db.credit_grants
    .filter((g: any) => g.user_id === userId && g.remaining_cents > 0)
    .sort((a: any, b: any) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime());
  let left = amountCents;
  for (const g of grants) {
    if (left <= 0) break;
    const take = Math.min(g.remaining_cents, left);
    g.remaining_cents -= take;
    left -= take;
  }
  if (left > 0) throw new Error('insufficient_credit');
}

export function grantCredit(db: any, userId: number, amountCents: number, reason: string) {
  const expires = new Date();
  expires.setDate(expires.getDate() + CREDIT_ROLL_DAYS);
  const grant = {
    id: db.credit_grants.reduce((m: number, g: any) => Math.max(m, g.id), 0) + 1,
    user_id: userId, amount_cents: amountCents, remaining_cents: amountCents,
    reason, expires_at: expires.toISOString(), created_at: new Date().toISOString(),
  };
  db.credit_grants.push(grant);
  return grant;
}

// Is the plan cheaper than buying singly? Sessions alone at $65 each already
// beat the plan price on every tier — shown in the admin panel.
export function planValue(plan: Plan) {
  const sessionsValue = plan.sessions * EXTRA_SESSION_CENTS;
  const totalValue = sessionsValue + plan.credit_cents;
  return {
    plan_price_cents: plan.price_cents,
    sessions_value_cents: sessionsValue,
    credit_cents: plan.credit_cents,
    total_value_cents: totalValue,
    saves_cents: totalValue - plan.price_cents,
    cheaper_than_single: totalValue > plan.price_cents,
  };
}
