'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api } from '@/lib/client';
export default function CounselorProfile() {
  const { id } = useParams() as { id: string };
  const { lang } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [c, setC] = useState<any>(null);
  const [when, setWhen] = useState('');
  const [msg, setMsg] = useState('');
  const [thread, setThread] = useState<any[]>([]);
  const [text, setText] = useState('');
  useEffect(() => { api(`/api/catalog?lang=${lang}`).then((d: any) => setC(d.counselors.find((x: any) => x.id === Number(id)))).catch(() => {}); }, [lang, id]);
  useEffect(() => { if (user) api(`/api/threads?counselor_id=${id}`).then((d: any) => setThread(d.messages)).catch(() => {}); }, [user, id]);
  async function book() {
    if (!user) { router.push('/login'); return; }
    if (!when) { setMsg('Pick a date and time.'); return; }
    try {
      const r = await api('/api/bookings', { method: 'POST', body: JSON.stringify({ counselor_id: Number(id), starts_at: new Date(when).toISOString() }) });
      setMsg(`Booked! Meet link: ${r.booking.meet_url} (${r.booking.meet_status === 'placeholder' ? 'placeholder — set Google credentials for a real Meet event' : 'real'})`);
    } catch (e: any) { setMsg(e.message); }
  }
  async function send() {
    if (!text.trim()) return;
    try { const r = await api('/api/threads', { method: 'POST', body: JSON.stringify({ counselor_id: Number(id), text }) }); setThread([...thread, r.message]); setText(''); } catch (e: any) { setMsg(e.message); }
  }
  if (!c) return <div className="section"><div className="container"><p>{t(lang, 'loading')}</p></div></div>;
  return (<div className="section"><div className="container">
    <h1>{c.name}</h1><p className="muted">{c.specialty} · ★ {c.rating} · {c.sessions_done} sessions · {c.languages}</p>
    <p>{c.bio}</p><p><span className="price">$65.00</span> / 45-minute session · free cancel up to 24h before</p>
    <h2>{t(lang, 'book')}</h2>
    <label>Date and time<input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
    <br /><button className="btn" onClick={book}>{t(lang, 'book')}</button>
    {msg && <p className="notice">{msg}</p>}
    {user && (<><h2>Messages</h2>
      <div className="card">{thread.length === 0 ? <p className="muted">No messages yet.</p> : thread.map((m: any) => (<p key={m.id}><strong>{m.sender}:</strong> {m.text}</p>))}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" />
      <button className="btn secondary" onClick={send}>Send</button></div></>)}
  </div></div>);
}
