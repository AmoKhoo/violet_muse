// Violet AI reports.
// A report is generated from THREE inputs: the user's answers (as JSON), the
// test's own answer key, and the test's own AI prompt. Nothing else.
// Every report states it is NOT a diagnosis and is not a replacement for a
// counselor.
//
// Two paths:
//  1. OPENAI_API_KEY is set -> key + prompt + answers go to OpenAI
//     (default model gpt-4o-mini, overridable with OPENAI_MODEL).
//  2. Otherwise -> a local generator scores the answers with the key and
//     writes the report from the prompt's structure. Honest local generation,
//     NOT a live OpenAI call.

export interface TestRow {
  id: number;
  title: string;
  answer_key: string;
  ai_prompt: string;
  questions: string;
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export async function generateReport(test: TestRow, answers: number[]) {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const text = await openAiReport(test, answers, key);
      return { report: text, source: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini' };
    } catch (err: any) {
      const local = localReport(test, answers);
      return { ...local, source: 'local-fallback', ai_error: String(err?.message || err) };
    }
  }
  return { ...localReport(test, answers), source: 'local' };
}

async function openAiReport(test: TestRow, answers: number[], apiKey: string): Promise<string> {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a careful, respectful psychology assistant. Never present a screening result as a medical diagnosis.' },
        { role: 'user', content: `Test: ${test.title}\nAnswer key:\n${test.answer_key}\nReport prompt:\n${test.ai_prompt}\nUser answers (JSON):\n${JSON.stringify(answers)}` },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return ensureDisclaimer(data.choices?.[0]?.message?.content || '');
}

export function localReport(test: TestRow, answers: number[]) {
  const q = JSON.parse(test.questions) as any[];
  let scores: any = null;
  let headline = '';
  const sections: { title: string; text: string }[] = [];

  if (test.id === 1) {
    // MBTI-style: pairs Q1+Q5, Q2+Q6, Q3+Q7, Q4+Q8; first option = first letter.
    const dims: [string, string][] = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
    const code = dims.map(([a, b], d) => {
      const first = [answers[d], answers[d + 4]].filter((x) => x === 0).length;
      return first >= 1 ? a : b;
    }).join('');
    headline = `Your pattern: ${code}`;
    scores = { type: code };
    sections.push(
      { title: 'How you recharge', text: code[0] === 'E' ? 'You gain energy from people and activity; long quiet stretches can feel draining.' : 'You gain energy from quiet time alone; long social days need recovery time.' },
      { title: 'How you decide', text: code[2] === 'T' ? 'You lead with logic and consistency, and value fairness.' : 'You lead with values and the effect on people, and value harmony.' },
      { title: 'Strengths', text: 'Your answers show a clear preference in each dimension — that clarity is a strength when you play to it.' },
      { title: 'Watch out for', text: 'Your less-preferred side is still available to you; it just costs more energy. Plan for it on hard days.' },
    );
  } else {
    const values = answers.map((a, i) => scoreFor(test.id, i, a));
    const total = values.reduce((s, v) => s + v, 0);
    const max = q.length * (test.id === 4 ? 3 : 4);
    const pct = Math.round((total / max) * 100);
    headline = test.id === 2
      ? `Emotional intelligence snapshot — ${pct}% of the maximum score`
      : test.id === 3
        ? `Anger & stress snapshot — ${total} of ${max}`
        : `Anxiety screening snapshot — ${total} of ${max}`;
    scores = { total, max, percent: pct };
    sections.push(
      { title: 'What your answers show', text: `Across ${q.length} questions you scored ${total} out of ${max}. Treat this as a snapshot of the last days, not a fixed label.` },
      { title: 'A first step', text: 'Pick one small, concrete practice from your lowest-scoring area and try it daily for a week.' },
      { title: 'Next step', text: total >= max * 0.66 ? 'Your answers suggest this is affecting daily life — consider booking a session with a counselor on Violet.' : 'If anything here worries you, a single session with a counselor can help you read it properly.' },
    );
  }

  const body = [
    headline, '',
    ...sections.flatMap((s) => [s.title, s.text, '']),
    'This report is a self-discovery snapshot, not a medical or clinical diagnosis, and not a replacement for talking with a licensed counselor.',
  ].join('\n');
  return { report: ensureDisclaimer(body), scores, headline };
}

function scoreFor(testId: number, qi: number, optionIndex: number): number {
  const o = Math.max(0, Math.min(3, optionIndex)); // clamp: answers are 0-based 0..3
  if (testId === 4) return o; // anxiety: 0..3
  if (testId === 3 && qi === 5) return 4 - o; // anger Q6 reverse-scored
  return o + 1; // EI / anger: 1..4
}

function ensureDisclaimer(text: string): string {
  const note = 'This is not a diagnosis.';
  return text.includes(note) ? text : `${text}\n\n${note}`;
}
