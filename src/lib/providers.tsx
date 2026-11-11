// Violet providers — language + auth state for the whole app.
// Language is applied to <html lang/dir> after mount (avoids hydration
// mismatch); storage reads are safe (try/catch + in-memory fallback).
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageGet, storageSet, api } from '@/lib/client';
import type { Lang } from '@/lib/i18n';

interface AuthUser { id: number; name: string; email: string; role: string; }

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} });
const AuthCtx = createContext<{ user: AuthUser | null; setUser: (u: AuthUser | null) => void; refresh: () => Promise<void> }>({
  user: null, setUser: () => {}, refresh: async () => {},
});

export function useLang() { return useContext(LangCtx); }
export function useAuth() { return useContext(AuthCtx); }

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = storageGet('violet-lang');
    if (saved === 'en' || saved === 'fr' || saved === 'ar') setLangState(saved as Lang);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    storageSet('violet-lang', lang);
  }, [lang]);

  async function refresh() {
    try {
      const data = await api('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }

  function setLang(l: Lang) { setLangState(l); }

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <AuthCtx.Provider value={{ user, setUser, refresh }}>{children}</AuthCtx.Provider>
    </LangCtx.Provider>
  );
}
