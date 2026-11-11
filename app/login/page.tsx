'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, storageSet } from '@/lib/client';
const DEMOS = [
  { role: 'Admin / owner', email: 'owner@platform.demo' },
  { role: 'Member', email: 'maya@demo.member' },
  { role: 'Leader (school)', email: 'leader@demo.school' },
  { role: 'Counselor', email: 'layla@demo.counselor' },
  { role: 'Student', email: 'sara@demo.student' },
];
export default function LoginPage() {
  const { lang } = useLang();
  const { refresh } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('maya@demo.member');
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [msg, setMsg] = useState('');
  async function submit() {
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const r = await api(path, { method: 'POST', body: JSON.stringify({ email, password, name }) });
      storageSet('violet-token', r.token);
      await refresh();
      router.push('/panel');
    } catch (e: any) { setMsg(e.message); }
  }
  return (<div className="section"><div className="container">
    <h1>{mode === 'login' ? t(lang, 'login') : t(lang, 'register')}</h1>
    <div className="tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t(lang, 'login')}</button>
    <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t(lang, 'register')}</button></div>
    {mode === 'register' && <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>}
    <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
    <br /><button className="btn" onClick={submit}>{mode === 'login' ? t(lang, 'login') : t(lang, 'register')}</button>
    {msg && <p className="error">{msg}</p>}
    <h2>Demo accounts (password for all: demo1234)</h2>
    <div className="grid">{DEMOS.map((d) => (
      <div className="card" key={d.email}><strong>{d.role}</strong><br /><span className="muted">{d.email}</span><br />
      <button className="btn secondary" onClick={() => { setEmail(d.email); setPassword('demo1234'); setMode('login'); }}>Use this account</button></div>
    ))}</div>
  </div></div>);
}
