'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api } from '@/lib/client';
export default function CounselorsPage() {
  const { lang } = useLang();
  const [cat, setCat] = useState<any>(null);
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => {}); }, [lang]);
  return (<div className="section"><div className="container">
    <h1>{t(lang, 'counselors')}</h1>
    <p className="muted">Every counselor is reviewed and approved by Violet before appearing here. Book a 45-minute session — a Meet link is created automatically.</p>
    <p><Link href="/apply" className="btn secondary">Are you a counselor? Apply here</Link></p>
    {!cat && <p>{t(lang, 'loading')}</p>}
    <div className="grid">{(cat?.counselors || []).map((c: any) => (
      <div className="card" key={c.id}><h3>{c.name}</h3>
        <p className="muted">{c.specialty} · ★ {c.rating} · {c.sessions_done} sessions · {c.languages}</p>
        <p>{c.bio}</p><p><span className="price">$65.00</span> / session</p>
        <Link href={`/counselors/${c.id}`} className="btn">{t(lang, 'book')}</Link></div>
    ))}</div>
  </div></div>);
}
