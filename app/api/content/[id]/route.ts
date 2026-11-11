import { NextResponse } from 'next/server';
import { getDb, loc } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const lang = ['en','fr','ar'].includes(url.searchParams.get('lang') || '') ? url.searchParams.get('lang')! : 'en';
  const db: any = getDb();
  const item = db.content.find((c: any) => c.id === Number(params.id) && c.published);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const user = userFromRequest(req);
  const owned = !!user && db.library_items.some((l: any) => l.kind === 'content' && l.item_id === item.id && (l.user_id === user.id || l.owner_key === user.email));
  const isAdmin = !!user && user.role === 'admin';
  return NextResponse.json({
    id: item.id, kind: item.kind, price_cents: item.price_cents, meta: item.meta,
    title: loc(item.title, lang), description: loc(item.description, lang),
    owned: owned || item.price_cents === 0 || isAdmin,
    body: (owned || item.price_cents === 0 || isAdmin) ? item.body : null,
    media_note: 'Sample text/outline. Real audio/video files go in public/media/ — see docs/ARCHITECTURE.md.',
  });
}
