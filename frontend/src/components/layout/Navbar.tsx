'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sprout, 
  Home, 
  Camera, 
  BarChart2, 
  CloudSun, 
  TrendingUp, 
  User, 
  Globe, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  Bot,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname.split('/')[1] || 'bn';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, clearAuth } = useAuthStore();

  const navLinks = [
    { href: `/${locale}/dashboard`, label: locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', icon: <Home size={17} /> },
    { href: `/${locale}/recommend`, label: locale === 'bn' ? 'ফসল সুপারিশ' : 'Crop Rec', icon: <Sprout size={17} /> },
    { href: `/${locale}/scan`, label: locale === 'bn' ? 'রোগ স্ক্যানার' : 'Disease Scanner', icon: <Camera size={17} /> },
    { href: `/${locale}/yield`, label: locale === 'bn' ? 'ফলন পূর্বাভাস' : 'Yield Forecast', icon: <BarChart2 size={17} /> },
    { href: `/${locale}/weather`, label: locale === 'bn' ? 'আবহাওয়া' : 'Weather & Advisory', icon: <CloudSun size={17} /> },
    { href: `/${locale}/farm`, label: locale === 'bn' ? 'আমার খামার' : 'My Farm', icon: <TrendingUp size={17} /> },
    { href: `/${locale}/market`, label: locale === 'bn' ? 'বাজার দর' : 'Market', icon: <DollarSign size={17} /> },
    { href: `/${locale}/assistant`, label: locale === 'bn' ? 'কৃষি বন্ধু' : 'AI Assistant', icon: <Bot size={17} /> },
  ];

  const switchLanguage = (newLocale: string) => {
    localStorage.setItem('km_locale', newLocale);
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Krishi<span className="text-emerald-600">Mind</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  AI Platform
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Decision Support Platform for Bangladesh
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className={active ? 'text-emerald-600' : 'text-slate-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
              <button
                onClick={() => switchLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locale === 'bn' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇧🇩 বাংলা
              </button>
              <button
                onClick={() => switchLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  locale === 'en' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Notifications */}
            <Link 
              href={`/${locale}/notifications`}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-2 right-2 border-2 border-white" />
            </Link>

            {/* Profile CTA */}
            <Link
              href={`/${locale}/profile`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-xs font-bold transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                👨‍🌾
              </div>
              <span>{locale === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
            </Link>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick Lang Switch on Mobile header */}
            <button
              onClick={() => switchLanguage(locale === 'bn' ? 'en' : 'bn')}
              className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
            >
              {locale === 'bn' ? 'EN' : 'বাং'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1.5 shadow-lg animate-in slide-in-from-top-3 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold ${
                isActive(link.href)
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-emerald-600">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href={`/${locale}/profile`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700"
            >
              <User size={16} className="text-emerald-600" />
              <span>{locale === 'bn' ? 'আমার প্রোফাইল ও সেটিংস' : 'My Profile & Settings'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
