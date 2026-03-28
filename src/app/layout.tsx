import type { Metadata } from 'next';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { BRAND } from '@/lib/branding';
import './globals.css';

export const metadata: Metadata = {
  title: `${BRAND.name} | Childcare + Parent Portal`,
  description:
    'Ambassadors Care delivers modern childcare operations with admissions, family records, and transparent parent billing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
