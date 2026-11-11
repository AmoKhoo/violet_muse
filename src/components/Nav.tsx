// Violet nav — brand, links, language switcher, login / panel.
// Uses the theme classes from app/globals.css (soft violet on warm cream).
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLang, useAuth } from '@/lib/providers';
import { t, LANGS, LANG_NAMES } from '@/lib/i18n';
import { storageRemove } from '@/lib/client';

export default function Nav() {
  const { lang, setLang } = useLang();
  const { user, setUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/', label: 'Violet' },
    { href: '/content', label: t(lang, 'content') },
    { href: '/tests', label: t(lang, 'tests') },
    { href: '/counselors', label: t(lang, 'counselors') },
    { href: '/plans', label: t(lang, 'plans') },
  ];

  function logout() {
    storageRemove('violet-token');
    setUser(null);
    router.push('/');
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">Violet<span>.</span></Link>
        <nav className="nav">
          {links.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link>
          ))}
          {user && <Link href="/panel" className={pathname === '/panel' ? 'active' : ''}>{t(lang, 'myPanel')}</Link>}
        </nav>
        <div className="lang-switch">
          {LANGS.map((l) => (
            <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>
        {user ? (
          <button className="btn secondary" onClick={logout}>{t(lang, 'logout')} ({user.name})</button>
        ) : (
          <Link href="/login" className="btn">{t(lang, 'login')}</Link>
        )}
      </div>
    </header>
  );
}
