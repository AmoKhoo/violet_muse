export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const { name, email, specialty, resume } = await req.json();
  if (!name || !email || !specialty) return NextResponse.json({ error: 'fields_required' }, { status: 400 });
  const db: any = getDb();
  const app = { id: nextId('counselor_applications'), name, email, specialty, resume: resume || '', status: 'pending', created_at: nowIso() };
  db.counselor_applications.push(app);
  saveDb();
  return NextResponse.json({ application: app });
}
