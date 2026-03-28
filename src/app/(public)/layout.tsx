import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MobileEnrollmentCTA } from '@/components/MobileEnrollmentCTA';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-site relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[20rem] bg-[linear-gradient(180deg,rgba(17,64,133,0.06),transparent)]" />
      <Header />
      <main className="relative z-10 min-h-screen pb-24 md:pb-0">{children}</main>
      <Footer />
      <MobileEnrollmentCTA />
    </div>
  );
}
