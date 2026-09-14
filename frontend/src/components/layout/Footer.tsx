'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, ShieldCheck, Phone, Heart, Globe, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'bn';

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-base">
                🌾
              </div>
              <span className="text-lg font-black tracking-tight">
                Krishi<span className="text-emerald-500">Mind</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
              {locale === 'bn'
                ? 'বাংলাদেশের কৃষকদের জন্য অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা চালিত ফসল সিদ্ধান্ত ও বালাই ব্যবস্থাপনা প্ল্যাটফর্ম।'
                : 'AI-Powered Crop Intelligence & Farmer Decision Support Platform for Bangladesh.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-emerald-400 font-semibold">
              <ShieldCheck size={16} />
              <span>BRRI & BARI Agronomic Standards</span>
            </div>
          </div>

          {/* Quick AI Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              {locale === 'bn' ? 'স্মার্ট কৃষি সেবাসমূহ' : 'AI Services'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/recommend`} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{locale === 'bn' ? 'ফসল সুপারিশ' : 'Crop Recommendation'}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/scan`} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{locale === 'bn' ? 'রোগ স্ক্যানার' : 'Disease Scanner'}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/yield`} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{locale === 'bn' ? 'ফলন পূর্বাভাস' : 'Yield Forecaster'}</span>
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/weather`} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{locale === 'bn' ? 'আবহাওয়া ও কৃষি পরামর্শ' : 'Agro Weather Advisory'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Farmer & Officer Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
              {locale === 'bn' ? 'ম্যানেজমেন্ট পোর্টাল' : 'Portals'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/dashboard`} className="hover:text-white transition-colors">
                  {locale === 'bn' ? 'কৃষক ড্যাশবোর্ড' : 'Farmer Dashboard'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/farm`} className="hover:text-white transition-colors">
                  {locale === 'bn' ? 'আমার খামার ও প্লট' : 'My Farm & Plots'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/login`} className="hover:text-white transition-colors">
                  {locale === 'bn' ? 'কর্মকর্তা লগইন' : 'Officer Portal'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/profile`} className="hover:text-white transition-colors">
                  {locale === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Hotline */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              {locale === 'bn' ? 'জরুরি সহায়তা' : 'Farmer Support'}
            </h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block uppercase">জাতীয় কৃষি কল সেন্টার</span>
              <span className="text-emerald-400 text-lg font-black tracking-tight block mt-0.5">
                📞 ১৬১২৩ (16123)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">সকাল ৯টা হতে বিকাল ৫টা</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Department of Agricultural Extension (DAE) Bangladesh
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} KrishiMind Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">গোপনীয়তা নীতি</Link>
            <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">ব্যবহারের শর্তাবলী</Link>
            <span>Made with ❤️ for Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
