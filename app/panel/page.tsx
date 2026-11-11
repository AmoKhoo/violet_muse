'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api } from '@/lib/client';
export default function PanelPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [acc, setAcc] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [orgPanel, setOrgPanel] = useState<any>(null);
  const [cPanel, setCPanel] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [orgName, setOrgName] = useState('');
  const [member, setMember] = useState({ name: '', email: '', password: '' });
  const [assign, setAssign] = useState({ kind: 'test', item_id: '' });
  const [note, setNote] = useState({ patient_id: '', text: '' });
  const [bio, setBio] = useState('');
  function load() {
    api('/api/account').then(setAcc).catch(() => {});
    api('/api/counselor/panel').then(setCPanel).catch(() => {});
  }
  useEffect(load, []);
  useEffect(() => {
    if (acc?.led_orgs?.[0]) api(`/api/orgs/${acc.led_orgs[0].id}`).then(setOrgPanel).catch(() => {});
  }, [acc]);
  if (!user) return (<div className="section"><div className="container"><h1>{t(lang, 'myPanel')}</h1><p>Please <Link href="/login">log in</Link>.</p></div></div>);
  const tabs = ['overview', 'library', 'bookings', 'results', 'orgs', ...(user.role === 'counselor' ? ['counselor'] : []), ...(user.role === 'admin' ? ['admin'] : [])];
  async function cancelBooking(id: number) { try { await api(`/api/bookings/${id}/cancel`, { method: 'POST', body: '{}' }); load(); } catch (e: any) { setMsg(e.message); } }
  async function createOrg() { try { await api('/api/orgs', { method: 'POST', body: JSON.stringify({ name: orgName }) }); setOrgName(''); load(); } catch (e: any) { setMsg(e.message); } }
  async function addMember() {
    if (!orgPanel) return;
    try { await api(`/api/orgs/${orgPanel.org.id}`, { method: 'POST', body: JSON.stringify({ action: 'add_member', ...member }) }); setMember({ name: '', email: '', password: '' }); api(`/api/orgs/${orgPanel.org.id}`).then(setOrgPanel); } catch (e: any) { setMsg(e.message); }
  }
  async function doAssign() {
    if (!orgPanel) return;
    try { await api(`/api/orgs/${orgPanel.org.id}`, { method: 'POST', body: JSON.stringify({ action: 'assign', kind: assign.kind, item_id: Number(assign.item_id) }) }); api(`/api/orgs/${orgPanel.org.id}`).then(setOrgPanel); } catch (e: any) { setMsg(e.message); }
  }
  async function saveNote() {
    try { await api('/api/counselor/notes', { method: 'POST', body: JSON.stringify({ patient_id: Number(note.patient_id), text: note.text }) }); setNote({ patient_id: '', text: '' }); load(); } catch (e: any) { setMsg(e.message); }
  }
  async function saveBio() {
    try { await api('/api/counselor/bio', { method: 'POST', body: JSON.stringify({ bio }) }); setMsg('Bio submitted — it goes live only after admin approval.'); } catch (e: any) { setMsg(e.message); }
  }
  return (<div className="section"><div className="container">
    <h1>{t(lang, 'myPanel')} — {user.name} <span className="badge">{user.role}</span></h1>
    {user.role === 'admin' && <p><Link href="/admin" className="btn">Open the admin console →</Link></p>}
    <div className="tabs">{tabs.map((x) => <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>{x}</button>)}</div>
    {msg && <p className="notice">{msg}</p>}
    {!acc && <p>{t(lang, 'loading')}</p>}
    {acc && tab === 'overview' && (<div className="grid">
      <div className="card"><h3>Plan</h3>{acc.subscription ? (<p>{acc.subscription.plan?.name} · {acc.subscription.sessions_left} {t(lang, 'sessionsLeft')} · billing: {acc.subscription.billing}</p>) : <p>No plan yet. <Link href="/plans">Choose a plan</Link></p>}</div>
      <div className="card"><h3>{t(lang, 'credit')}</h3><p>${(acc.credit_cents / 100).toFixed(2)} (rolls 60 days)</p></div>
      <div className="card"><h3>Library</h3><p>{acc.library.length} items · {acc.test_results.length} test results · {acc.bookings.length} bookings</p></div>
      <div className="card"><h3>Spaces</h3><p>Personal space + {acc.my_orgs.length} org space(s): {acc.my_orgs.map((o: any) => o.name).join(', ') || '—'}</p><p className="muted">Personal results are never visible to a leader — only results of tests assigned inside an org.</p></div>
    </div>)}
    {acc && tab === 'library' && (<div className="grid">{acc.library.map((l: any) => (
      <div className="card" key={l.id}><span className="badge">{l.kind}</span><h3>{l.title}</h3>
      {l.kind === 'content' ? <Link href={`/content/${l.item_id}`}>Open</Link> : <Link href={`/tests/${l.item_id}`}>Open test</Link>}</div>
    ))}{acc.library.length === 0 && <p className="muted">Nothing yet — buy a book, audio, course or test.</p>}</div>)}
    {acc && tab === 'bookings' && (<div>{acc.bookings.map((b: any) => (
      <div className="card" key={b.id} style={{ marginBottom: 12 }}><strong>{b.counselor_name}</strong> · {new Date(b.starts_at).toLocaleString()} · {b.status}
      <br /><a href={b.meet_url} target="_blank" rel="noreferrer">Meet link ({b.meet_status})</a>
      {b.status === 'booked' && <> · <button className="btn secondary" onClick={() => cancelBooking(b.id)}>Cancel (free up to 24h before)</button></>}</div>
    ))}{acc.bookings.length === 0 && <p className="muted">No bookings yet.</p>}</div>)}
    {acc && tab === 'results' && (<div>{acc.test_results.map((r: any) => (
      <div className="card" key={r.id} style={{ marginBottom: 12 }}><strong>{r.headline}</strong><p style={{ whiteSpace: 'pre-wrap' }}>{r.report}</p><p className="muted">Source: {r.report_source} · {r.org_id ? 'Taken under an org assignment (visible to that leader)' : 'Personal — not visible to any leader'}</p></div>
    ))}{acc.test_results.length === 0 && <p className="muted">No test results yet.</p>}</div>)}
    {acc && tab === 'orgs' && (<div>
      <h2>Your organizations</h2>
      {acc.my_orgs.map((o: any) => <div className="card" key={o.id} style={{ marginBottom: 8 }}><strong>{o.name}</strong><p className="muted">Org space — assignments here: {(acc.assignments || []).filter((a: any) => a.org_id === o.id).map((a: any) => `${a.kind} #${a.item_id}`).join(', ') || 'none yet'}</p></div>)}
      <h2>Create an organization (leader)</h2>
      <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="School / company / family name" />
      <button className="btn" onClick={createOrg}>Create org</button>
      {orgPanel && (<><h2>Leader panel — {orgPanel.org.name}</h2>
        <h3>Members</h3>{orgPanel.members.map((m: any) => <p key={m.id}>{m.name} ({m.email})</p>)}
        <label>New member name<input value={member.name} onChange={(e) => setMember({ ...member, name: e.target.value })} /></label>
        <label>Email<input value={member.email} onChange={(e) => setMember({ ...member, email: e.target.value })} /></label>
        <label>Password<input value={member.password} onChange={(e) => setMember({ ...member, password: e.target.value })} /></label>
        <button className="btn" onClick={addMember}>Add member</button>
        <h3>Assign a test or content item</h3>
        <label>Kind<select value={assign.kind} onChange={(e) => setAssign({ ...assign, kind: e.target.value })}><option value="test">Test</option><option value="content">Content</option></select></label>
        <label>Item ID<input value={assign.item_id} onChange={(e) => setAssign({ ...assign, item_id: e.target.value })} placeholder="e.g. 2" /></label>
        <button className="btn" onClick={doAssign}>Assign to all members</button>
        <h3>Results of org-assigned tests only</h3>
        {orgPanel.results.map((r: any) => <p key={r.id}>{r.user_name} — {r.headline}</p>)}
        {orgPanel.results.length === 0 && <p className="muted">No org results yet. Personal results of members are never shown here.</p>}
      </>)}
    </div>)}
    {tab === 'counselor' && cPanel && (<div>
      <h2>Counselor panel — {cPanel.profile.name}</h2>
      <h3>Upcoming sessions</h3>
      {cPanel.bookings.map((b: any) => <p key={b.id}>{b.patient_name} · {new Date(b.starts_at).toLocaleString()} · {b.status} · <a href={b.meet_url} target="_blank" rel="noreferrer">Meet</a></p>)}
      <h3>Patients & private notes (only you see these)</h3>
      {cPanel.patients.map((p: any) => (<div className="card" key={p.id} style={{ marginBottom: 8 }}><strong>{p.name}</strong>
        {p.notes.map((n: any) => <p key={n.id} className="muted">{n.text}</p>)}
      </div>))}
      <label>Patient ID<input value={note.patient_id} onChange={(e) => setNote({ ...note, patient_id: e.target.value })} placeholder="patient user id" /></label>
      <label>Private note<textarea rows={3} value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} /></label>
      <button className="btn" onClick={saveNote}>Save private note</button>
      <h3>Edit your bio (goes live only after admin approval)</h3>
      <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="New bio…" />
      <button className="btn secondary" onClick={saveBio}>Submit bio for approval</button>
      {cPanel.profile.pending_bio && <p className="muted">Pending bio awaiting approval: {cPanel.profile.pending_bio}</p>}
    </div>)}
    {tab === 'admin' && <p><Link href="/admin" className="btn">Open the admin console →</Link></p>}
  </div></div>);
}
