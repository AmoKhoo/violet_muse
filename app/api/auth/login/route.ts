export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = (getDb().users as any[]).find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !(await verifyPassword(password || '', user.password_hash))) {
    return NextResponse.json({ error: 'invalid_login' }, { status: 401 });
  }
  return NextResponse.json({ token: await createToken(user.id), user: publicUser(user) });
}
