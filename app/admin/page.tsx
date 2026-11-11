'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers';
import { api } from '@/lib/client';
function parseLoc(v: any): any { try { return JSON.parse(v); } catch { return { en: v || '', fr: '', ar: '' }; } }
function locStr(en: string, fr: string, ar: string): string { return JSON.stringify({ en, fr: fr || en, ar: ar || en }); }
const emptyContent = { id: '', kind: 'book', price_cents: 0, meta: '', title_en: '', title_fr: '', title_ar: '', desc_en: '', desc_fr: '', desc_ar: '', body: '', published: true };
const emptyTest = { id: '', price_cents: 0, title_en: '', title_fr: '', title_ar: '', desc_en: '', desc_fr: '', desc_ar: '', answer_key: '', ai_prompt: '', questions: '[]', published: true };
export default function AdminPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [msg, setMsg] = useState('');
  const [content, setContent] = useState<any>(emptyContent);
  const [test, setTest] = useState<any>(emptyTest);
  const [planEdits, setPlanEdits] = useState<any>({});
  function load() { api('/api/admin').then((d: any) => { setData(d); const pe: any = {}; d.plans.forEach((p: any) => { pe[p.id] = { ...p }; }); setPlanEdits(pe); }).catch((e: any) => setMsg(e.message)); }
  useEffect(load, []);
  if (!user) return <div className="section"><div className="container"><p>Please log in.</p></div></div>;
  if (user.role !== 'admin') return <div className="section"><div className="container"><p>Admin only.</p></div></div>;
  async function saveContent() {
    try {
      await api('/api/admin/content', { method: 'POST', body: JSON.stringify({ id: content.id ? Number(content.id) : undefined, kind: content.kind, price_cents: Number(content.price_cents), meta: content.meta, title: locStr(content.title_en, content.title_fr, content.title_ar), description: locStr(content.desc_en, content.desc_fr, content.desc_ar), body: content.body, published: content.published }) });
      setContent(emptyContent); setMsg('Content saved.'); load();
    } catch (e: any) { setMsg(e.message); }
  }
  async function delContent(id: number) { if (!confirm('Delete this content item from the public site?')) return; await api(`/api/admin/content?id=${id}`, { method: 'DELETE' }); load(); }
  async function saveTest() {
    try {
      JSON.parse(test.questions);
      await api('/api/admin/tests', { method: 'POST', body: JSON.stringify({ id: test.id ? Number(test.id) : undefined, price_cents: Number(test.price_cents), title: locStr(test.title_en, test.title_fr, test.title_ar), description: locStr(test.desc_en, test.desc_fr, test.desc_ar), answer_key: test.answer_key, ai_prompt: test.ai_prompt, questions: test.questions, published: test.published }) });
      setTest(emptyTest); setMsg('Test saved.'); load();
    } catch (e: any) { setMsg('Save failed: ' + e.message); }
  }
  async function delTest(id: number) { if (!confirm('Delete this test from the public site?')) return; await api(`/api/admin/tests?id=${id}`, { method: 'DELETE' }); load(); }
  async function savePlan(id: number) {
    const p = planEdits[id];
    await api('/api/admin/plans', { method: 'POST', body: JSON.stringify({ id, price_cents: Number(p.price_cents), sessions: Number(p.sessions), credit_cents: Number(p.credit_cents), workshops: !!p.workshops, priority: !!p.priority, org_seat: !!p.org_seat }) });
    setMsg('Plan saved.'); load();
  }
  async function counselorAction(action: string, id: number, status?: string) {
    await api('/api/admin/counselors', { method: 'POST', body: JSON.stringify({ action, id, status }) }); load();
  }
  const tabs = ['overview', 'content', 'tests', 'plans', 'counselors', 'users', 'orders', 'bookings', 'orgs'];
  return (<div className="section"><div className="container">
    <h1>Admin console — Violet</h1>
    <p className="muted">Everything here writes to the same database the public site reads. Deleting a test or content item here removes it from the public catalog immediately.</p>
    <div className="tabs">{tabs.map((x) => <button key={x} className={tab === x ? 'active' : ''} onClick={() => setTab(x)}>{x}</button>)}</div>
    {msg && <p className="notice">{msg}</p>}
    {!data && <p>Loading…</p>}
    {data && tab === 'overview' && (<div className="grid">
      <div className="card"><h3>Users</h3><p>{data.stats.users}</p></div>
      <div className="card"><h3>Orders</h3><p>{data.stats.orders} · revenue ${(data.stats.revenue_cents / 100).toFixed(2)}</p></div>
      <div className="card"><h3>Bookings</h3><p>{data.stats.bookings}</p></div>
      <div className="card"><h3>Pending</h3><p>{data.stats.applications_pending} applications · {data.stats.bios_pending} bios awaiting approval</p></div>
    </div>)}
    {data && tab === 'content' && (<div>
      <h2>{content.id ? 'Edit content' : 'New content item'}</h2>
      <div className="field-row"><label>Kind<select value={content.kind} onChange={(e) => setContent({ ...content, kind: e.target.value })}><option>book</option><option>audio</option><option>video</option><option>course</option></select></label>
      <label>Price (cents)<input type="number" value={content.price_cents} onChange={(e) => setContent({ ...content, price_cents: e.target.value })} /></label>
      <label>Meta<input value={content.meta} onChange={(e) => setContent({ ...content, meta: e.target.value })} placeholder="50 min · audio" /></label></div>
      <label>Title EN<input value={content.title_en} onChange={(e) => setContent({ ...content, title_en: e.target.value })} /></label>
      <div className="field-row"><label>Title FR<input value={content.title_fr} onChange={(e) => setContent({ ...content, title_fr: e.target.value })} /></label>
      <label>Title AR<input value={content.title_ar} onChange={(e) => setContent({ ...content, title_ar: e.target.value })} /></label></div>
      <label>Description EN<textarea rows={2} value={content.desc_en} onChange={(e) => setContent({ ...content, desc_en: e.target.value })} /></label>
      <label>Body / outline<textarea rows={4} value={content.body} onChange={(e) => setContent({ ...content, body: e.target.value })} /></label>
      <label><input type="checkbox" checked={content.published} onChange={(e) => setContent({ ...content, published: e.target.checked })} /> Published</label>
      <br /><button className="btn" onClick={saveContent}>Save content</button>{' '}<button className="btn secondary" onClick={() => setContent(emptyContent)}>Clear form</button>
      <h2>All content</h2>
      <table><thead><tr><th>ID</th><th>Kind</th><th>Title</th><th>Price</th><th>Published</th><th></th></tr></thead><tbody>
      {data.content.map((c: any) => (<tr key={c.id}><td>{c.id}</td><td>{c.kind}</td><td>{parseLoc(c.title).en}</td><td>${(c.price_cents / 100).toFixed(2)}</td><td>{c.published ? 'yes' : 'no'}</td>
      <td><button className="btn secondary" onClick={() => { const t = parseLoc(c.title); const d = parseLoc(c.description); setContent({ id: c.id, kind: c.kind, price_cents: c.price_cents, meta: c.meta, title_en: t.en, title_fr: t.fr, title_ar: t.ar, desc_en: d.en, desc_fr: d.fr, desc_ar: d.ar, body: c.body, published: c.published }); }}>Edit</button>{' '}
      <button className="btn danger" onClick={() => delContent(c.id)}>Delete</button></td></tr>))}</tbody></table>
    </div>)}
    {data && tab === 'tests' && (<div>
      <h2>{test.id ? 'Edit test' : 'New test'}</h2>
      <p className="muted">The answer key and AI prompt never leave the server — only the admin sees them. The report is generated from answers (JSON) + key + prompt.</p>
      <div className="field-row"><label>Price (cents)<input type="number" value={test.price_cents} onChange={(e) => setTest({ ...test, price_cents: e.target.value })} /></label>
      <label>Title EN<input value={test.title_en} onChange={(e) => setTest({ ...test, title_en: e.target.value })} /></label></div>
      <div className="field-row"><label>Title FR<input value={test.title_fr} onChange={(e) => setTest({ ...test, title_fr: e.target.value })} /></label>
      <label>Title AR<input value={test.title_ar} onChange={(e) => setTest({ ...test, title_ar: e.target.value })} /></label></div>
      <label>Description EN<textarea rows={2} value={test.desc_en} onChange={(e) => setTest({ ...test, desc_en: e.target.value })} /></label>
      <label>Answer key<textarea rows={4} value={test.answer_key} onChange={(e) => setTest({ ...test, answer_key: e.target.value })} placeholder="How answers are scored, per question / dimension…" /></label>
      <label>AI prompt<textarea rows={4} value={test.ai_prompt} onChange={(e) => setTest({ ...test, ai_prompt: e.target.value })} placeholder="How the report should be written (tone, length, structure)…" /></label>
      <label>Questions (JSON array of question objects with text and options in en/fr/ar)<textarea rows={6} value={test.questions} onChange={(e) => setTest({ ...test, questions: e.target.value })} /></label>
      <label><input type="checkbox" checked={test.published} onChange={(e) => setTest({ ...test, published: e.target.checked })} /> Published</label>
      <br /><button className="btn" onClick={saveTest}>Save test</button>{' '}<button className="btn secondary" onClick={() => setTest(emptyTest)}>Clear form</button>
      <h2>All tests</h2>
      <table><thead><tr><th>ID</th><th>Title</th><th>Price</th><th>Questions</th><th>Published</th><th></th></tr></thead><tbody>
      {data.tests.map((x: any) => (<tr key={x.id}><td>{x.id}</td><td>{parseLoc(x.title).en}</td><td>${(x.price_cents / 100).toFixed(2)}</td><td>{JSON.parse(x.questions).length}</td><td>{x.published ? 'yes' : 'no'}</td>
      <td><button className="btn secondary" onClick={() => { const t = parseLoc(x.title); const d = parseLoc(x.description); setTest({ id: x.id, price_cents: x.price_cents, title_en: t.en, title_fr: t.fr, title_ar: t.ar, desc_en: d.en, desc_fr: d.fr, desc_ar: d.ar, answer_key: x.answer_key, ai_prompt: x.ai_prompt, questions: x.questions, published: x.published }); }}>Edit</button>{' '}
      <button className="btn danger" onClick={() => delTest(x.id)}>Delete</button></td></tr>))}</tbody></table>
    </div>)}
    {data && tab === 'plans' && (<div>
      <p className="muted">Tests are not in any plan. Plan value: sessions at $65 each + credit — every tier is cheaper than buying singly. Annual = 15% off the 12-month total.</p>
      {data.plans.map((p: any) => { const e = planEdits[p.id] || p; return (
        <div className="card" key={p.id} style={{ marginBottom: 12 }}><h3>{p.name_en}</h3>
        <div className="field-row">
          <label>Price (cents)<input type="number" value={e.price_cents} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, price_cents: ev.target.value } })} /></label>
          <label>Sessions<input type="number" value={e.sessions} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, sessions: ev.target.value } })} /></label>
          <label>Credit (cents)<input type="number" value={e.credit_cents} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, credit_cents: ev.target.value } })} /></label>
        </div>
        <label><input type="checkbox" checked={!!e.workshops} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, workshops: ev.target.checked } })} /> Workshops</label>{' '}
        <label><input type="checkbox" checked={!!e.priority} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, priority: ev.target.checked } })} /> Priority booking</label>{' '}
        <label><input type="checkbox" checked={!!e.org_seat} onChange={(ev) => setPlanEdits({ ...planEdits, [p.id]: { ...e, org_seat: ev.target.checked } })} /> Org seat</label>
        <br /><button className="btn" onClick={() => savePlan(p.id)}>Save plan</button></div>
      ); })}
    </div>)}
    {data && tab === 'counselors' && (<div>
      <h2>Counselor applications</h2>
      {data.applications.map((a: any) => (<div className="card" key={a.id} style={{ marginBottom: 8 }}><strong>{a.name}</strong> ({a.email}) · {a.specialty} · {a.status}<p className="muted">{a.resume}</p>
      {a.status === 'pending' && (<><button className="btn" onClick={() => counselorAction('review_application', a.id, 'approved')}>Approve</button>{' '}<button className="btn danger" onClick={() => counselorAction('review_application', a.id, 'rejected')}>Reject</button></>)}</div>))}
      {data.applications.length === 0 && <p className="muted">No applications.</p>}
      <h2>All counselors</h2>
      {data.counselors.map((c: any) => (<div className="card" key={c.id} style={{ marginBottom: 8 }}><strong>{c.name}</strong> · {c.status} · ★ {c.rating}
      {c.pending_bio && (<><p className="muted">Pending bio: {c.pending_bio}</p><button className="btn" onClick={() => counselorAction('approve_bio', c.id)}>Approve bio</button></>)}
      {' '}<button className="btn secondary" onClick={() => counselorAction('set_status', c.id, c.status === 'approved' ? 'suspended' : 'approved')}>{c.status === 'approved' ? 'Suspend' : 'Re-approve'}</button></div>))}
    </div>)}
    {data && tab === 'users' && (<table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>
      {data.users.map((u: any) => <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>)}</tbody></table>)}
    {data && tab === 'orders' && (<table><thead><tr><th>ID</th><th>User</th><th>Kind</th><th>Label</th><th>Amount</th><th>Payment</th></tr></thead><tbody>
      {data.orders.map((o: any) => <tr key={o.id}><td>{o.id}</td><td>{o.user_id || o.guest_email}</td><td>{o.kind}</td><td>{o.label}</td><td>${(o.amount_cents / 100).toFixed(2)}</td><td>{o.payment}</td></tr>)}</tbody></table>)}
    {data && tab === 'bookings' && (<table><thead><tr><th>ID</th><th>User</th><th>Counselor</th><th>Starts</th><th>Status</th><th>Meet</th></tr></thead><tbody>
      {data.bookings.map((b: any) => <tr key={b.id}><td>{b.id}</td><td>{b.user_id}</td><td>{b.counselor_id}</td><td>{new Date(b.starts_at).toLocaleString()}</td><td>{b.status}</td><td><a href={b.meet_url} target="_blank" rel="noreferrer">link</a> ({b.meet_status})</td></tr>)}</tbody></table>)}
    {data && tab === 'orgs' && (<div>{data.organizations.map((o: any) => (<div className="card" key={o.id} style={{ marginBottom: 8 }}><strong>{o.name}</strong> · leader {o.leader_id} · members: {data.org_members.filter((m: any) => m.org_id === o.id).length}</div>))}
      <h3>Test results (all)</h3>{data.test_results.map((r: any) => <p key={r.id}>#{r.id} user {r.user_id} test {r.test_id} · {r.headline} · org: {r.org_id || 'personal'}</p>)}</div>)}
  </div></div>);
}
