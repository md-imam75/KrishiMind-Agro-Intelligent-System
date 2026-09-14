'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, BarChart2, Users, Bell, LogOut, Map } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'bn';
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const navLinks = [
    { href: `/${locale}/officer`, label: 'Dashboard', icon: <BarChart2 size={18} /> },
    { href: `/${locale}/officer/farmers`, label: 'Farmer Directory', icon: <Users size={18} /> },
    { href: `/${locale}/officer/alerts`, label: 'Broadcast Alert', icon: <Bell size={18} /> },
  ];

  const handleLogout = () => {
    clearAuth();
    router.push(`/${locale}/login`);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">DAE Portal</h1>
            <p className="text-xs text-blue-300">KrishiMind Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== `/${locale}/officer` && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.icon}
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all text-left"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
