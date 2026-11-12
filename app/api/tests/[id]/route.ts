export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, loc } from '@/lib/db';

export const dynamic = 'force-dynamic';

// One test with its questions. The answer key and AI prompt NEVER leave the server.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramId } = await params;
  const url = new URL(req.url);
  const lang = ['en', 'fr', 'ar'].includes(url.searchParams.get('lang') || '') ? url.searchParams.get('lang')! : 'en';
  const db = getDb();
  const test = db.tests.find((t: any) => t.id === Number(paramId) && t.published);
  if (!test) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({
    id: test.id, price_cents: test.price_cents,
    title: loc(test.title, lang), description: loc(test.description, lang),
    questions: JSON.parse(test.questions).map((q: any) => ({
      text: loc(q.text, lang), options: q.options.map((o: any) => loc(o, lang)),
    })),
  });
}
