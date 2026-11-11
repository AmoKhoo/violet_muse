// Violet i18n — English, French, Arabic (Arabic = RTL, dir="rtl" in the UI).
export const LANGS = ['en', 'fr', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', fr: 'Français', ar: 'العربية' };

const T: Record<Lang, Record<string, string>> = {
  en: {
    tagline: 'Online psychology, in your language.',
    content: 'Content', tests: 'Tests', counselors: 'Counselors', plans: 'Plans',
    login: 'Log in', logout: 'Log out', register: 'Create account',
    myPanel: 'My panel', admin: 'Admin', loading: 'Loading…', retry: 'Try again',
    loadError: 'Could not load the catalog. Check your connection and try again.',
    notDiagnosis: 'This is not a diagnosis.',
    buy: 'Buy', free: 'Free', book: 'Book a session', takeTest: 'Take the test',
    guestCheckout: 'Buy as a guest — no account needed',
    annual: 'Annual (15% off)', monthly: 'Monthly',
    sessionsLeft: 'sessions left', credit: 'credit',
  },
  fr: {
    tagline: 'La psychologie en ligne, dans votre langue.',
    content: 'Contenu', tests: 'Tests', counselors: 'Conseillers', plans: 'Formules',
    login: 'Se connecter', logout: 'Se déconnecter', register: 'Créer un compte',
    myPanel: 'Mon espace', admin: 'Admin', loading: 'Chargement…', retry: 'Réessayer',
    loadError: 'Impossible de charger le catalogue. Vérifiez votre connexion et réessayez.',
    notDiagnosis: 'Ceci n’est pas un diagnostic.',
    buy: 'Acheter', free: 'Gratuit', book: 'Réserver une séance', takeTest: 'Faire le test',
    guestCheckout: 'Acheter en invité — aucun compte nécessaire',
    annual: 'Annuel (-15 %)', monthly: 'Mensuel',
    sessionsLeft: 'séances restantes', credit: 'crédit',
  },
  ar: {
    tagline: 'علم النفس عبر الإنترنت، بلغتك.',
    content: 'المحتوى', tests: 'الاختبارات', counselors: 'المستشارون', plans: 'الباقات',
    login: 'تسجيل الدخول', logout: 'تسجيل الخروج', register: 'إنشاء حساب',
    myPanel: 'لوحتي', admin: 'الإدارة', loading: 'جارٍ التحميل…', retry: 'إعادة المحاولة',
    loadError: 'تعذّر تحميل الكتالوج. تحقق من اتصالك وحاول مجدداً.',
    notDiagnosis: 'هذا ليس تشخيصاً.',
    buy: 'شراء', free: 'مجاني', book: 'احجز جلسة', takeTest: 'ابدأ الاختبار',
    guestCheckout: 'اشترِ كضيف — لا حاجة لحساب',
    annual: 'سنوي (خصم ١٥٪)', monthly: 'شهري',
    sessionsLeft: 'جلسات متبقية', credit: 'رصيد',
  },
};

export function t(lang: Lang, key: string): string {
  return T[lang]?.[key] || T.en[key] || key;
}

export function isRtl(lang: Lang): boolean {
  return lang === 'ar';
}
