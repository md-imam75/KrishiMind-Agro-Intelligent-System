'use client';
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => { window.removeEventListener('online', updateStatus); window.removeEventListener('offline', updateStatus); };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-white px-4 py-2 flex items-center gap-2 text-sm font-medium">
      <WifiOff size={16} />
      <span>{t('offline')}</span>
    </div>
  );
}
