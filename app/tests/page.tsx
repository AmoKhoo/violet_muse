'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel } from '@/lib/client';
export default function TestsPage() {
  const { lang } = useLang();
  const [cat, setCat] = useState<any>(null);
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => {}); }, [lang]);
  return (<div className="section"><div className="container">
    <h1>{t(lang, 'tests')}</h1>
    <p className="muted">Each test is free or paid from your credit — tests are <strong>not</strong> included in any plan. Your answers go to the AI together with that test&apos;s answer key and prompt, and you get a personal 1–2 page report. {t(lang, 'notDiagnosis')}</p>
    {!cat && <p>{t(lang, 'loading')}</p>}
    <div className="grid">{(cat?.tests || []).map((x: any) => (
      <div className="card tinted" key={x.id}><h3>{x.title}</h3><p className="muted">{x.description}</p>
        <p><span className="price">{priceLabel(x.price_cents)}</span> · {x.question_count} questions</p>
        <Link href={`/tests/${x.id}`} className="btn">{t(lang, 'takeTest')}</Link></div>
    ))}</div>
  </div></div>);
}
