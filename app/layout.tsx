import type { Metadata } from 'next';
import { Newsreader, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import Nav from '@/components/Nav';
import EmergencyButton from '@/components/EmergencyButton';

// Preview-faithful typography (2026-11-12): Newsreader serif for display
// type, Noto Naskh Arabic for Arabic — self-hosted at build time via
// next/font/google, so no runtime Google Fonts request is needed.
const displayFont = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const arabicFont = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: 'Violet — Online Psychology',
  description: 'Violet: online psychology services in English, French and Arabic — content, AI tests, counselors, plans and organizations.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${displayFont.variable} ${arabicFont.variable}`}>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
          <EmergencyButton />
          <footer className="footer">
            <div className="container">
              <strong>Violet</strong> — online psychology in English, French and Arabic.
              <br />
              <small>
                Test reports are guidance and self-discovery, not a medical diagnosis
                and not a replacement for a licensed counselor. ·
                Prices in USD. Sessions expire at month-end; credit rolls 60 days.
              </small>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
