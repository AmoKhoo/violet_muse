'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api } from '@/lib/client';
export default function PlansPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [cat, setCat] = useState<any>(null);
  const [annual, setAnnual] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => {}); }, [lang]);
  async function subscribe(planId: number) {
    if (!user) { router.push('/login'); return; }
    try {
      const r = await api('/api/shop/subscribe', { method: 'POST', body: JSON.stringify({ plan_id: planId, billing: annual ? 'annual' : 'monthly' }) });
      setMsg(r.demo ? 'Subscribed (demo checkout — no card charged).' : 'Subscribed.');
    } catch (e: any) { setMsg(e.message); }
  }
  return (<div className="section"><div className="container">
    <h1>{t(lang, 'plans')}</h1>
    <p className="muted">Tests are <strong>not</strong> included in any plan — each test is free or paid from your credit. Sessions expire at month-end (no rollover); credit rolls 60 days; extra session $65; cancel free up to 24h before.</p>
    <div className="tabs">
      <button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>{t(lang, 'monthly')}</button>
      <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>{t(lang, 'annual')}</button>
    </div>
    {!cat && <p>{t(lang, 'loading')}</p>}
    <div className="grid">{(cat?.plans || []).map((p: any) => {
      const price = annual ? p.annual_price_cents : p.price_cents;
      return (<div className={`card plan-card${p.priority ? ' featured' : ''}`} key={p.id}>
        <div className="card-body"><h3>{p.name}</h3>
          <p><span className="price plan-price">${(price / 100).toFixed(0)}</span>{annual ? ' / year' : ' / month'}</p>
          {annual && <p className="muted">You save ${((p.price_cents * 12 * 0.15) / 100).toFixed(0)} vs monthly — 15% off the 12-month total, paid at once.</p>}
          <p>{p.sessions} × 45-min sessions + ${(p.credit_cents / 100).toFixed(0)} credit</p>
          <p className="muted">Unlimited messaging{p.workshops ? ' · Workshops' : ''}{p.priority ? ' · Priority booking' : ''}{p.org_seat ? ' · 1 org seat' : ''}</p>
          <p className="muted">Value of sessions + credit: ${(p.value.total_value_cents / 100).toFixed(0)} — cheaper than buying singly.</p>
          <button className="btn" onClick={() => subscribe(p.id)}>Subscribe</button>
        </div>
      </div>);
    })}</div>
    {msg && <p className="notice">{msg}</p>}
    <p className="muted">Prefer to buy one thing at a time? <a href="/content">Buy a single item</a> or a single test — no plan needed, guest checkout available.</p>
  </div></div>);
}
