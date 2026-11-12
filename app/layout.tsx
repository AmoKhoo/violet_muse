import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/lib/providers';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Violet — Online Psychology',
  description: 'Violet: online psychology services in English, French and Arabic — content, AI tests, counselors, plans and organizations.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
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
