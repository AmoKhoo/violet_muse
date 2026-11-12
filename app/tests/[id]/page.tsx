'use client';

export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel } from '@/lib/client';
export default function TestRunner() {
  const { id } = useParams() as { id: string };
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { api(`/api/tests/${id}?lang=${lang}`).then((d: any) => { setTest(d); setAnswers(new Array(d.questions.length).fill(-1)); }).catch(() => setMsg(t(lang, 'loadError'))); }, [lang, id]);
  async function submit() {
    if (!user) { router.push('/login'); return; }
    if (answers.some((a) => a < 0)) { setMsg('Please answer every question.'); return; }
    setMsg('');
    try {
      const r = await api(`/api/tests/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) });
      setResult(r.result);
    } catch (e: any) { setMsg(e.message === 'insufficient_credit' ? 'Not enough credit — top up with a plan or buy credit.' : e.message); }
  }
  if (!test) return <div className="section"><div className="container"><p>{t(lang, 'loading')}</p>{msg && <p className="error">{msg}</p>}</div></div>;
  if (result) return (<div className="section"><div className="container">
    <h1>{result.headline || test.title}</h1>
    <p><span className="badge teal">Report source: {result.report_source}</span></p>
    <div className="card"><p style={{ whiteSpace: 'pre-wrap' }}>{result.report}</p></div>
    {result.scores && <p className="muted">Scores: {JSON.stringify(result.scores)}</p>}
    <p className="muted">{t(lang, 'notDiagnosis')} This report was generated from your answers, this test&apos;s answer key and its prompt.</p>
  </div></div>);
  return (<div className="section"><div className="container">
    <h1>{test.title}</h1><p>{test.description}</p>
    <p><span className="price">{priceLabel(test.price_cents)}</span> {test.price_cents > 0 && <span className="muted">(paid from credit)</span>}</p>
    {!user && <div className="notice">Please log in to take the test and keep your report.</div>}
    {test.questions.map((q: any, qi: number) => (
      <div className="card" key={qi} style={{ marginBottom: 12 }}>
        <h3>{qi + 1}. {q.text}</h3>
        {q.options.map((o: string, oi: number) => (
          <label key={oi} style={{ display: 'block', fontWeight: 400, margin: '6px 0' }}>
            <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }} /> {o}
          </label>
        ))}
      </div>
    ))}
    <button className="btn" onClick={submit}>Get my report</button>
    {msg && <p className="error">{msg}</p>}
  </div></div>);
}
