export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { registerUser, createToken, publicUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await registerUser(await req.json());
    return NextResponse.json({ token: await createToken(user.id), user: publicUser(user) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
