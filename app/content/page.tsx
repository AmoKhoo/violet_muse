'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, priceLabel } from '@/lib/client';
import { ContentCover } from '@/components/visuals';
export default function ContentPage() {
  const { lang } = useLang();
  const [cat, setCat] = useState<any>(null);
  const [kind, setKind] = useState('all');
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then(setCat).catch(() => {}); }, [lang]);
  const items = (cat?.content || []).filter((c: any) => kind === 'all' || c.kind === kind);
  return (<div className="section"><div className="container">
    <h1>{t(lang, 'content')}</h1>
    <p className="muted">Books, audio, video and courses — free or paid per item. Buy one item as a guest, no account needed.</p>
    <div className="tabs">{['all', 'book', 'audio', 'video', 'course'].map((k) => (
      <button key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>{k}</button>))}
    </div>
    {!cat && <p>{t(lang, 'loading')}</p>}
    <div className="grid">{items.map((c: any) => (
      <div className="card media-card" key={c.id}>
        <ContentCover kind={c.kind} />
        <div className="card-body"><span className="card-tags"><span className="badge">{c.kind}</span> <span className="muted">{c.meta}</span></span>
          <h3>{c.title}</h3><p className="muted">{c.description}</p>
          <p><span className="price">{priceLabel(c.price_cents)}</span></p>
          <Link href={`/content/${c.id}`} className="btn">{c.price_cents === 0 ? t(lang, 'free') : t(lang, 'buy')}</Link></div></div>
    ))}</div>
    {items.length === 0 && cat && <p className="muted">Nothing here yet.</p>}
  </div></div>);
}
