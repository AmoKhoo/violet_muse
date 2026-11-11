import { NextResponse } from 'next/server';
import { userFromRequest, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
