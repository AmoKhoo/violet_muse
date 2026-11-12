export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const chk: any = await requireAdmin(req);
  if (chk.error) return NextResponse.json({ error: chk.error }, { status: chk.status });
  const db: any = getDb();
  return NextResponse.json({
    stats: { users: db.users.length, orders: db.orders.length, revenue_cents: db.orders.reduce((s: number, o: any) => s + (o.amount_cents || 0), 0), bookings: db.bookings.length, applications_pending: db.counselor_applications.filter((a: any) => a.status === 'pending').length, bios_pending: db.counselors.filter((c: any) => c.pending_bio).length },
    users: db.users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at })),
    content: db.content, tests: db.tests, plans: db.plans, counselors: db.counselors,
    applications: db.counselor_applications, orders: db.orders, bookings: db.bookings,
    organizations: db.organizations, org_members: db.org_members, test_results: db.test_results,
  });
}
