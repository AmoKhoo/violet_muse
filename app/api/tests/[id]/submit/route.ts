import { NextResponse } from 'next/server';
import { getDb, saveDb, nextId, nowIso } from '@/lib/db';
import { userFromRequest } from '@/lib/auth';
import { generateReport } from '@/lib/ai';
import { spendCredit, creditUsable } from '@/lib/money';

export const dynamic = 'force-dynamic';

// Submit test answers. Payment: free, or paid from credit (tests are NOT in
// any plan). Report: answers JSON + the test's answer key + AI prompt.
// The result is org-visible ONLY when taken under an org assignment.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = userFromRequest(req);
  if (!user) return NextResponse.json({ error: 'login_required' }, { status: 401 });
  const db: any = getDb();
  const test = db.tests.find((t: any) => t.id === Number(params.id) && t.published);
  if (!test) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const body = await req.json();
  const answers = body.answers;
  const questions = JSON.parse(test.questions);
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    return NextResponse.json({ error: 'bad_answers' }, { status: 400 });
  }

  let orgId: number | null = null;
  if (body.org_assignment_id) {
    const asg = db.assignments.find((a: any) => a.id === Number(body.org_assignment_id));
    if (!asg || asg.kind !== 'test' || asg.item_id !== test.id) {
      return NextResponse.json({ error: 'bad_assignment' }, { status: 400 });
    }
    if (!db.org_members.some((m: any) => m.org_id === asg.org_id && m.user_id === user.id)) {
      return NextResponse.json({ error: 'not_org_member' }, { status: 403 });
    }
    orgId = asg.org_id;
  }

  if (test.price_cents > 0) {
    if (creditUsable(db.credit_grants.filter((g: any) => g.user_id === user.id)) < test.price_cents) {
      return NextResponse.json({ error: 'insufficient_credit', price_cents: test.price_cents }, { status: 402 });
    }
    spendCredit(db, user.id, test.price_cents);
  }

  const { report, source, scores, headline, ai_error }: any = await generateReport(test, answers);
  const result = {
    id: nextId('test_results'), user_id: user.id, test_id: test.id,
    org_id: orgId, answers, scores: scores || null, headline: headline || '',
    report, report_source: source, ai_error: ai_error || null,
    created_at: nowIso(),
  };
  db.test_results.push(result as any);
  saveDb();
  return NextResponse.json({ result });
}
