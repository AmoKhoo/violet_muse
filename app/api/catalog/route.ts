export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getDb, loc } from '@/lib/db';
import { planValue, planAnnualPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

// Public catalog: plans, published content, published tests, approved counselors.
// Reads the SAME db the admin writes — an admin delete removes the item here.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = ['en', 'fr', 'ar'].includes(url.searchParams.get('lang') || '') ? url.searchParams.get('lang')! : 'en';
  const db = getDb();
  return NextResponse.json({
    plans: db.plans.map((p: any) => ({
      ...p, annual_price_cents: planAnnualPrice(p), value: planValue(p),
      name: p[`name_${lang}`] || p.name_en,
    })),
    content: db.content.filter((c: any) => c.published).map((c: any) => ({
      id: c.id, kind: c.kind, price_cents: c.price_cents, meta: c.meta,
      title: loc(c.title, lang), description: loc(c.description, lang),
    })),
    tests: db.tests.filter((t: any) => t.published).map((t: any) => ({
      id: t.id, price_cents: t.price_cents,
      question_count: JSON.parse(t.questions).length,
      title: loc(t.title, lang), description: loc(t.description, lang),
    })),
    counselors: db.counselors.filter((c: any) => c.status === 'approved').map((c: any) => ({
      id: c.id, name: c.name, languages: c.languages, rating: c.rating,
      sessions_done: c.sessions_done, session_price_cents: c.session_price_cents,
      specialty: loc(c.specialty, lang), bio: loc(c.bio, lang), photo: c.photo || '',
    })),
  });
}
