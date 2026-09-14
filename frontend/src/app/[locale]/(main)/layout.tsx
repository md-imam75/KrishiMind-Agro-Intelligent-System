'use client';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <OfflineBanner />
      
      {/* Top Professional Website Navbar */}
      <Navbar />

      {/* Responsive full-width website content area with maximum 7xl width */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Comprehensive Professional Website Footer */}
      <Footer />
    </div>
  );
}
