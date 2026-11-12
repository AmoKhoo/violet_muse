// Violet emergency talk — shared logic (server-side).
//
// An emergency call is a same-day, right-now session: the user clicks the
// floating button, an online counselor is picked, a Meet link is created for
// ~2 minutes from now, and both sides get the link. Entitlement comes from
// the user's active plan: Bronze 0, Silver 1, Gold 2, Diamond 4 calls per
// calendar month (plan field `emergency_calls_per_month`). Usage is counted
// from the `emergency_calls` table, keyed by calendar month (UTC).
//
// A counselor is "online" when their manual toggle (`emergency_online`) is
// on AND the current UTC time falls inside one of their weekly
// `online_windows` ({ days: 0=Sun..6=Sat, start/end: UTC hour, end exclusive,
// 24 = midnight }). Picking is least-busy among the online counselors
// (fewest emergency calls this month, then lowest id) — a fair round-robin.
//
// No Node built-ins: runs on Node, Edge and Cloudflare Workers alike.
export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function activeSubscription(db: any, userId: number): any | null {
  const now = new Date();
  const subs = (db.subscriptions || []).filter(
    (s: any) => s.user_id === userId && new Date(s.ends_at) > now,
  );
  if (!subs.length) return null;
  subs.sort((a: any, b: any) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime());
  return subs[0];
}

export function planAllowance(plan: any): number {
  return plan ? Number(plan.emergency_calls_per_month || 0) : 0;
}

export function emergencyUsage(db: any, userId: number, month: string): number {
  return (db.emergency_calls || []).filter(
    (c: any) => c.user_id === userId && c.month === month && c.status !== 'cancelled',
  ).length;
}

export function emergencyStatus(db: any, userId: number, now = new Date()) {
  const month = monthKey(now);
  const sub = activeSubscription(db, userId);
  const plan = sub ? db.plans.find((p: any) => p.id === sub.plan_id) : null;
  const allowance = planAllowance(plan);
  const used = emergencyUsage(db, userId, month);
  return {
    month,
    plan: plan ? { id: plan.id, key: plan.key, name_en: plan.name_en } : null,
    allowance,
    used,
    remaining: Math.max(0, allowance - used),
  };
}

export function inWindow(windows: any[] | undefined, now: Date): boolean {
  if (!windows || !windows.length) return false;
  const day = now.getUTCDay();
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60;
  return windows.some(
    (w: any) => Array.isArray(w.days) && w.days.includes(day) && hour >= w.start && hour < w.end,
  );
}

export function isCounselorOnline(c: any, now: Date): boolean {
  if (!c || c.status !== 'approved') return false;
  if (c.emergency_online === false) return false;
  return inWindow(c.online_windows, now);
}

export function onlineCounselors(db: any, now = new Date()): any[] {
  return (db.counselors || []).filter((c: any) => isCounselorOnline(c, now));
}

// Least-busy online counselor: fewest emergency calls this month, then lowest id.
export function pickOnlineCounselor(db: any, now = new Date()): any | null {
  const online = onlineCounselors(db, now);
  if (!online.length) return null;
  const month = monthKey(now);
  const counts = new Map<number, number>();
  for (const call of db.emergency_calls || []) {
    if (call.month === month && call.status !== 'cancelled') {
      counts.set(call.counselor_id, (counts.get(call.counselor_id) || 0) + 1);
    }
  }
  online.sort(
    (a: any, b: any) =>
      (counts.get(a.id) || 0) - (counts.get(b.id) || 0) || a.id - b.id,
  );
  return online[0];
}

// Next time any counselor comes online (UTC ISO), or null if none scheduled.
export function nextOnlineAt(db: any, now = new Date()): string | null {
  const counselors = (db.counselors || []).filter(
    (c: any) => c.status === 'approved' && c.emergency_online !== false && Array.isArray(c.online_windows) && c.online_windows.length,
  );
  if (!counselors.length) return null;
  const starts: number[] = [];
  for (let add = 0; add < 8; add++) {
    const day = new Date(now);
    day.setUTCDate(now.getUTCDate() + add);
    for (const c of counselors) {
      for (const w of c.online_windows) {
        if (!w.days.includes(day.getUTCDay())) continue;
        const start = new Date(day);
        start.setUTCHours(w.start, 0, 0, 0);
        if (start.getTime() <= now.getTime()) continue;
        starts.push(start.getTime());
      }
    }
  }
  if (!starts.length) return null;
  return new Date(Math.min(...starts)).toISOString();
}
