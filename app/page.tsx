'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel } from '@/lib/client';
export default function Home() {
  const { lang } = useLang();
  const [cat, setCat] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => setErr(t(lang, 'loadError'))); }, [lang]);
  return (
    <div>
      <section className="hero"><div className="container">
        <h1>Violet</h1>
        <p>{t(lang, 'tagline')}</p>
        <p className="muted">Books, audio, video and courses · AI tests with a personal report · Licensed counselors · Plans with credit · Organizations.</p>
        <Link href="/tests" className="btn">{t(lang, 'takeTest')}</Link>{' '}
        <Link href="/counselors" className="btn secondary">{t(lang, 'book')}</Link>{' '}
        <Link href="/plans" className="btn teal">{t(lang, 'plans')}</Link>
      </div></section>
      <section className="section"><div className="container">
        {err && <div className="notice warn">{err} <button className="btn secondary" onClick={() => location.reload()}>{t(lang, 'retry')}</button></div>}
        {!cat && !err && <p>{t(lang, 'loading')}</p>}
        {cat && (<>
          <div className="section-head"><h2>{t(lang, 'content')}</h2><Link href="/content">→</Link></div>
          <div className="grid">{cat.content.slice(0, 3).map((c: any) => (
            <div className="card" key={c.id}><span className="badge">{c.kind}</span> <span className="muted">{c.meta}</span>
              <h3>{c.title}</h3><p className="muted">{c.description}</p>
              <p><span className="price">{priceLabel(c.price_cents)}</span> <Link href={`/content/${c.id}`}>{t(lang, 'buy')}</Link></p></div>
          ))}</div>
          <div className="section-head"><h2>{t(lang, 'tests')}</h2><Link href="/tests">→</Link></div>
          <div className="grid">{cat.tests.map((x: any) => (
            <div className="card tinted" key={x.id}><h3>{x.title}</h3><p className="muted">{x.description}</p>
              <p><span className="price">{priceLabel(x.price_cents)}</span> · {x.question_count} questions</p>
              <Link href={`/tests/${x.id}`} className="btn">{t(lang, 'takeTest')}</Link></div>
          ))}</div>
          <div className="section-head"><h2>{t(lang, 'counselors')}</h2><Link href="/counselors">→</Link></div>
          <div className="grid">{cat.counselors.slice(0, 4).map((c: any) => (
            <div className="card" key={c.id}><h3>{c.name}</h3><p className="muted">{c.specialty} · ★ {c.rating} · {c.sessions_done} sessions</p>
              <p>{c.bio}</p><Link href={`/counselors/${c.id}`} className="btn secondary">{t(lang, 'book')}</Link></div>
          ))}</div>
          <div className="section-head"><h2>{t(lang, 'plans')}</h2><Link href="/plans">→</Link></div>
          <div className="grid">{cat.plans.map((p: any) => (
            <div className="card" key={p.id}><h3>{p.name}</h3>
              <p><span className="price">${(p.price_cents / 100).toFixed(0)}/mo</span></p>
              <p>{p.sessions} × 45-min sessions + ${(p.credit_cents / 100).toFixed(0)} credit · unlimited messaging</p>
              <p className="muted">No tests included — tests are free or paid from credit.</p></div>
          ))}</div>
        </>)}
        <div className="notice teal"><strong>Not a diagnosis.</strong> Test reports are guidance and self-discovery, not a medical diagnosis and not a replacement for a licensed counselor.</div>
      </div></section>
    </div>
  );
}
