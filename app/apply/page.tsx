'use client';
import { useState } from 'react';
import { api } from '@/lib/client';
export default function ApplyPage() {
  const [form, setForm] = useState({ name: '', email: '', specialty: '', resume: '' });
  const [msg, setMsg] = useState('');
  async function submit() {
    try { await api('/api/counselor/apply', { method: 'POST', body: JSON.stringify(form) }); setMsg('Application sent. The admin will review your resume and approve you.'); }
    catch (e: any) { setMsg(e.message); }
  }
  return (<div className="section"><div className="container">
    <h1>Apply as a counselor</h1>
    <p className="muted">Send your resume — the admin reviews it and, if approved, your profile appears on the public site.</p>
    <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
    <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
    <label>Specialty<input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></label>
    <label>Resume / bio<textarea rows={6} value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} /></label>
    <br /><button className="btn" onClick={submit}>Send application</button>
    {msg && <p className="notice">{msg}</p>}
  </div></div>);
}
