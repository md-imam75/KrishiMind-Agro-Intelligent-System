'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { intelligenceApi } from '@/lib/api';
import { Bell, AlertTriangle, CloudRain, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const t = useTranslations('Notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await intelligenceApi.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await intelligenceApi.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-500" />;
      case 'weather': return <CloudRain className="text-blue-500" />;
      case 'market': return <TrendingUp className="text-emerald-500" />;
      default: return <Info className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bell className="text-emerald-600" />
            নোটিফিকেশন (Notifications)
          </h1>
          <p className="text-slate-500 mt-1">আপনার খামার এবং এলাকার সকল গুরুত্বপূর্ণ আপডেট</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-24" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">কোনো নতুন নোটিফিকেশন নেই</h3>
          <p className="text-slate-500">আপনার সব আপডেট দেখা হয়ে গেছে।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                notif.is_read ? 'border-slate-200 shadow-sm opacity-75' : 'border-emerald-200 shadow-md ring-1 ring-emerald-100'
              }`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className={`font-bold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{notif.message}</p>
              </div>
              {!notif.is_read && (
                <div className="shrink-0 flex items-center">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
import { TrendingUp } from 'lucide-react';
