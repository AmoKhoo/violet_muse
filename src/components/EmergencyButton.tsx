// Violet emergency talk — floating button + modal, rendered on every page.
// Logged out → asks to log in. Logged in → shows this month's remaining
// allowance, confirms, then shows the Meet link, the counselor's name and
// the "join in about 2 minutes" promise. No emojis; warm amber accent so it
// stands out from the calm violet design without looking alarming.
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang, useAuth } from '@/lib/providers';
import { t } from '@/lib/i18n';
import { api, authToken } from '@/lib/client';

type Status = {
  month: string;
  plan: { id: number; key: string; name_en: string } | null;
  allowance: number;
  used: number;
  remaining: number;
};

export default function EmergencyButton() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [nextOnline, setNextOnline] = useState('');
  const [done, setDone] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  async function openModal() {
    setOpen(true);
    setErr('');
    setDone(null);
    setCopied(false);
    if (!user) return;
    try {
      const s = await api('/api/emergency');
      setStatus(s);
    } catch (e: any) {
      setErr(e.message || 'request_failed');
    }
  }

  function close() {
    setOpen(false);
    setStatus(null);
    setErr('');
    setDone(null);
  }

  async function connect() {
    setBusy(true);
    setErr('');
    setNextOnline('');
    try {
      // Raw fetch (not api()) so the error body — e.g. next_online_at —
      // survives instead of only the error string.
      const token = authToken();
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || `request_failed_${res.status}`);
        if (data.error === 'no_counselor_online' && data.next_online_at) {
          setNextOnline(data.next_online_at);
        }
        return;
      }
      setDone(data);
      setStatus((s) => (s ? { ...s, remaining: data.remaining_after, used: s.used + 1 } : s));
    } catch {
      setErr('request_failed');
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    const url = done?.call?.meet_url || '';
    try {
      navigator.clipboard?.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button className="emergency-fab" onClick={openModal} aria-label={t(lang, 'emergencyNow')}>
        <span className="emergency-fab-dot" aria-hidden="true" />
        {t(lang, 'emergencyNow')}
      </button>
      {open && (
        <div className="emergency-overlay" role="dialog" aria-modal="true" aria-label={t(lang, 'emergencyTitle')}>
          <div className="emergency-modal">
            <button className="emergency-close" onClick={close} aria-label="×">×</button>
            <h2>{t(lang, 'emergencyTitle')}</h2>
            <p className="muted">{t(lang, 'emergencyIntro')}</p>

            {!user && (
              <p className="notice">{t(lang, 'emergencyLogin')} <Link href="/login">{t(lang, 'login')}</Link></p>
            )}

            {user && !done && status && (
              <>
                <p>
                  {status.plan
                    ? `${status.plan.name_en} · ${status.remaining} / ${status.allowance} ${t(lang, 'emergencyRemaining')}`
                    : t(lang, 'emergencyNoPlan')}
                </p>
                {status.allowance <= 0 && (
                  <p><Link href="/plans" className="btn">{t(lang, 'emergencyUpgrade')}</Link></p>
                )}
                {status.allowance > 0 && status.remaining <= 0 && (
                  <p className="notice warn">{t(lang, 'emergencyUsedUp')}</p>
                )}
                {status.allowance > 0 && status.remaining > 0 && (
                  <button className="btn emergency-confirm" onClick={connect} disabled={busy}>
                    {busy ? t(lang, 'loading') : t(lang, 'emergencyConnect')}
                  </button>
                )}
              </>
            )}

            {user && !done && !status && !err && <p>{t(lang, 'loading')}</p>}

            {done && (
              <div className="emergency-success">
                <p><strong>{t(lang, 'emergencyJoined')}</strong></p>
                <p>{t(lang, 'emergencyCounselor')}: <strong>{done.counselor?.name}</strong></p>
                <p className="muted">{t(lang, 'emergencyStartsIn')} · {new Date(done.call.starts_at).toLocaleTimeString()}</p>
                <p>
                  <a className="emergency-link" href={done.call.meet_url} target="_blank" rel="noreferrer">
                    {done.call.meet_url}
                  </a>
                </p>
                <p>
                  <a className="btn" href={done.call.meet_url} target="_blank" rel="noreferrer">{t(lang, 'emergencyJoin')}</a>{' '}
                  <button className="btn secondary" onClick={copyLink}>
                    {copied ? t(lang, 'emergencyCopied') : t(lang, 'emergencyCopy')}
                  </button>
                </p>
                <p className="muted">{done.call.meet_status === 'placeholder' ? 'Meet link (placeholder — real Google Meet once credentials are set).' : ''}</p>
              </div>
            )}

            {err && err !== 'no_counselor_online' && (
              <p className="notice warn">
                {err === 'no_plan' || err === 'no_plan_allowance'
                  ? t(lang, 'emergencyNoPlan')
                  : err === 'allowance_used_up'
                    ? t(lang, 'emergencyUsedUp')
                    : err}
                {(err === 'no_plan' || err === 'no_plan_allowance') && (
                  <> <Link href="/plans" className="btn">{t(lang, 'emergencyUpgrade')}</Link></>
                )}
              </p>
            )}
            {err === 'no_counselor_online' && (
              <p className="notice warn">
                {t(lang, 'emergencyNoneOnline')}
                {nextOnline && (
                  <><br />{t(lang, 'emergencyNextOnline')}: {new Date(nextOnline).toLocaleString()}</>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
