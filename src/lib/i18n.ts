// Violet i18n — English, French, Arabic (Arabic = RTL, dir="rtl" in the UI).
export const LANGS = ['en', 'fr', 'ar'] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_NAMES: Record<Lang, string> = { en: 'English', fr: 'Français', ar: 'العربية' };

const T: Record<Lang, Record<string, string>> = {
  en: {
    tagline: 'Online psychology, in your language.',
    heroEyebrow: 'Licensed counselors · Honest tests · Books, audio & courses',
    heroTitle: 'A calmer mind starts with understanding yourself.',
    heroSub: 'Violet brings licensed counselors, psychological tests with a personal report, and books, audio and courses together in one calm place. No diagnosis, no judgment. Just clarity, at your pace.',
    heroTrust: 'Licensed counselors · Reports are guidance, not a diagnosis · Cancel a session free up to 24h before',
    content: 'Content', tests: 'Tests', counselors: 'Counselors', plans: 'Plans',
    login: 'Log in', logout: 'Log out', register: 'Create account',
    myPanel: 'My panel', admin: 'Admin', loading: 'Loading…', retry: 'Try again',
    loadError: 'Could not load the catalog. Check your connection and try again.',
    notDiagnosis: 'This is not a diagnosis.',
    buy: 'Buy', free: 'Free', book: 'Book a session', takeTest: 'Take the test',
    guestCheckout: 'Buy as a guest — no account needed',
    annual: 'Annual (15% off)', monthly: 'Monthly',
    sessionsLeft: 'sessions left', credit: 'credit',
    path1: 'Take a test', path2: 'Read your personal report',
    path3: 'Book a counselor', path4: 'Keep learning — books & audio',
    pillarsHead: 'Three ways to begin',
    pillarsSub: 'A test, a counselor, or something to learn from — start wherever feels right.',
    browseContent: 'Browse content',
  },
  fr: {
    tagline: 'La psychologie en ligne, dans votre langue.',
    heroEyebrow: 'Conseillers agréés · Tests honnêtes · Livres, audio et cours',
    heroTitle: 'Se comprendre, pour se sentir plus serein.',
    heroSub: 'Violet réunit des conseillers agréés, des tests psychologiques avec un rapport personnel, ainsi que des livres, de l’audio et des cours, dans un lieu calme. Ni diagnostic, ni jugement. Juste de la clarté, à votre rythme.',
    heroTrust: 'Conseillers agréés · Les rapports sont un repère, pas un diagnostic · Annulation gratuite jusqu’à 24 h avant la séance',
    content: 'Contenu', tests: 'Tests', counselors: 'Conseillers', plans: 'Formules',
    login: 'Se connecter', logout: 'Se déconnecter', register: 'Créer un compte',
    myPanel: 'Mon espace', admin: 'Admin', loading: 'Chargement…', retry: 'Réessayer',
    loadError: 'Impossible de charger le catalogue. Vérifiez votre connexion et réessayez.',
    notDiagnosis: 'Ceci n’est pas un diagnostic.',
    buy: 'Acheter', free: 'Gratuit', book: 'Réserver une séance', takeTest: 'Faire le test',
    guestCheckout: 'Acheter en invité — aucun compte nécessaire',
    annual: 'Annuel (-15 %)', monthly: 'Mensuel',
    sessionsLeft: 'séances restantes', credit: 'crédit',
    path1: 'Faire un test', path2: 'Lire votre rapport personnel',
    path3: 'Réserver un conseiller', path4: 'Continuer avec livres et audio',
    pillarsHead: 'Trois façons de commencer',
    pillarsSub: 'Un test, un conseiller, ou de quoi apprendre — commencez là où vous voulez.',
    browseContent: 'Voir le contenu',
  },
  ar: {
    tagline: 'علم النفس عبر الإنترنت، بلغتك.',
    heroEyebrow: 'مستشارون مرخّصون · اختبارات صادقة · كتب وصوتيات ودورات',
    heroTitle: 'افهم نفسك — لتشعر بهدوء أكبر.',
    heroSub: 'يجمع Violet مستشارين مرخّصين، واختبارات نفسية مع تقرير شخصي، وكتباً وصوتيات ودورات، في مكان هادئ واحد. بلا تشخيص وبلا أحكام. فقط وضوح، على إيقاعك.',
    heroTrust: 'مستشارون مرخّصون · التقارير إرشاد وليست تشخيصاً · إلغاء مجاني للجلسة حتى ٢٤ ساعة قبلها',
    content: 'المحتوى', tests: 'الاختبارات', counselors: 'المستشارون', plans: 'الباقات',
    login: 'تسجيل الدخول', logout: 'تسجيل الخروج', register: 'إنشاء حساب',
    myPanel: 'لوحتي', admin: 'الإدارة', loading: 'جارٍ التحميل…', retry: 'إعادة المحاولة',
    loadError: 'تعذّر تحميل الكتالوج. تحقق من اتصالك وحاول مجدداً.',
    notDiagnosis: 'هذا ليس تشخيصاً.',
    buy: 'شراء', free: 'مجاني', book: 'احجز جلسة', takeTest: 'ابدأ الاختبار',
    guestCheckout: 'اشترِ كضيف — لا حاجة لحساب',
    annual: 'سنوي (خصم ١٥٪)', monthly: 'شهري',
    sessionsLeft: 'جلسات متبقية', credit: 'رصيد',
    path1: 'ابدأ اختباراً', path2: 'اقرأ تقريرك الشخصي',
    path3: 'احجز مستشاراً', path4: 'واصل التعلّم بالكتب والصوتيات',
    pillarsHead: 'ثلاث طرق للبدء',
    pillarsSub: 'اختبار، أو مستشار، أو شيء تتعلّم منه — ابدأ من حيث يناسبك.',
    browseContent: 'تصفّح المحتوى',
  },
};

export function t(lang: Lang, key: string): string {
  return T[lang]?.[key] || T.en[key] || key;
}

export function isRtl(lang: Lang): boolean {
  return lang === 'ar';
}
