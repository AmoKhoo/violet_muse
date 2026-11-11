import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const profile = db.counselors.find((c: any) => c.user_id === user.id);
  if (!profile) return NextResponse.json({ error: 'not_a_counselor' }, { status: 404 });
  const bookings = db.bookings.filter((b: any) => b.counselor_id === profile.id).map((b: any) => {
    const u = db.users.find((x: any) => x.id === b.user_id);
    return { ...b, patient_name: u ? u.name : '', patient_id: b.user_id };
  });
  const patientIds = [...new Set(bookings.map((b: any) => b.user_id))];
  const patients = patientIds.map((id: any) => {
    const u = db.users.find((x: any) => x.id === id);
    const notes = db.counselor_notes.filter((n: any) => n.counselor_id === profile.id && n.patient_id === id);
    return u ? { id: u.id, name: u.name, email: u.email, notes } : null;
  }).filter(Boolean);
  return NextResponse.json({ profile, bookings, patients, applications: db.counselor_applications });
}
