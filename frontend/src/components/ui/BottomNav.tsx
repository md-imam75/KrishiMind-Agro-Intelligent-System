'use client';
import { useTranslations } from 'next-intl';
import { Home, Sprout, Camera, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

  const getPath = (path: string) => {
    const locale = pathname.split('/')[1] || 'bn';
    return `/${locale}${path}`;
  };

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Centered max-width container matching mobile layouts */}
      <div className="max-w-md mx-auto px-4 pb-3">
        <nav className="glass-panel border border-slate-200/80 bg-white/90 backdrop-blur-md rounded-2xl shadow-float px-2 py-1.5 flex justify-around items-center">
          <NavItem 
            href={getPath('/dashboard')} 
            icon={<Home size={20} />} 
            label={t('home')} 
            active={isActive('/dashboard')} 
          />
          <NavItem 
            href={getPath('/farm')} 
            icon={<Sprout size={20} />} 
            label={t('farm')} 
            active={isActive('/farm')} 
          />
          
          {/* Center Scan Button with elevated glow and gradient */}
          <Link 
            href={getPath('/scan')} 
            className="flex flex-col items-center group -mt-5"
          >
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 border-[3px] border-white group-hover:scale-105 group-active:scale-95 transition-all duration-200">
              <Camera size={22} className="stroke-[2.2]" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 mt-1">
              {t('scan')}
            </span>
          </Link>
          
          <NavItem 
            href={getPath('/market')} 
            icon={<TrendingUp size={20} />} 
            label={t('market')} 
            active={isActive('/market')} 
          />
          <NavItem 
            href={getPath('/profile')} 
            icon={<User size={20} />} 
            label={t('profile')} 
            active={isActive('/profile')} 
          />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[54px]',
        active 
          ? 'text-emerald-700 font-bold bg-emerald-50/80' 
          : 'text-slate-500 hover:text-slate-900 font-medium hover:bg-slate-50 active:scale-95'
      )}
    >
      <div className={cn('transition-transform', active && 'scale-110')}>{icon}</div>
      <span className="text-[11px] mt-1 tracking-tight">{label}</span>
    </Link>
  );
}
