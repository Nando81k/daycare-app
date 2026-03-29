import type { Metadata } from 'next';
import { Manrope, Sora, Geist } from 'next/font/google';
import { SessionProviderWrapper } from '@/components/SessionProviderWrapper';
import { MotionProvider } from '@/components/animations';
import { BRAND } from '@/lib/branding';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${BRAND.name} | Childcare + Parent Portal`,
  description:
    'Ambassadors Care delivers modern childcare operations with admissions, family records, and transparent parent billing.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn(sora.variable, "font-sans", geist.variable)}>
      <body className="bg-bg text-ink-900">
        <SessionProviderWrapper>
          <MotionProvider>{children}</MotionProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
