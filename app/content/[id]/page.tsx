'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel, storageGet, storageSet } from '@/lib/client';
export default function ContentDetail() {
  const { id } = useParams() as { id: string };
  const { lang } = useLang();
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [payWith, setPayWith] = useState('card');
  function load() { api(`/api/content/${id}?lang=${lang}`).then(setItem).catch(() => setMsg(t(lang, 'loadError'))); }
  useEffect(load, [lang, id]);
  async function buy() {
    setMsg('');
    try {
      const r = await api('/api/shop/buy', { method: 'POST', body: JSON.stringify({ kind: 'content', item_id: Number(id), email: user ? undefined : (email || storageGet('violet-guest-email') || ''), pay_with: user ? payWith : 'card' }) });
      if (!user && email) storageSet('violet-guest-email', email);
      setMsg(r.demo ? 'Demo checkout — no card was charged. Order recorded.' : 'Purchased.');
      load();
    } catch (e: any) { setMsg(e.message); }
  }
  if (!item) return <div className="section"><div className="container"><p>{t(lang, 'loading')}</p></div></div>;
  return (<div className="section"><div className="container">
    <span className="badge">{item.kind}</span> <span className="muted">{item.meta}</span>
    <h1>{item.title}</h1><p>{item.description}</p>
    <p><span className="price">{priceLabel(item.price_cents)}</span></p>
    {item.owned ? (<>
      <div className="notice teal">In your library — you can read / listen / watch it here.</div>
      <div className="card"><p style={{ whiteSpace: 'pre-wrap' }}>{item.body}</p>
      <p className="muted">{item.media_note}</p></div>
    </>) : (<>
      <p className="muted">{t(lang, 'guestCheckout')}</p>
      {user && (<label>Pay with <select value={payWith} onChange={(e) => setPayWith(e.target.value)}><option value="card">Card (demo)</option><option value="credit">My credit</option></select></label>)}
      {!user && (<label>Your email (to receive the item in your profile)<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>)}
      <br /><button className="btn" onClick={buy}>{t(lang, 'buy')} — {priceLabel(item.price_cents)}</button>
    </>)}
    {msg && <p className="notice">{msg}</p>}
  </div></div>);
}
