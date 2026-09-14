import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export function RiskBadge({ level, className, showIcon = true }: { level: RiskLevel; className?: string; showIcon?: boolean }) {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }> = {
    HIGH: {
      bg: 'bg-red-50 text-red-700',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-500',
      icon: <AlertTriangle size={13} className="text-red-600" />,
      label: 'High Risk'
    },
    MEDIUM: {
      bg: 'bg-amber-50 text-amber-800',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      icon: <AlertCircle size={13} className="text-amber-600" />,
      label: 'Moderate'
    },
    LOW: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      icon: <CheckCircle2 size={13} className="text-emerald-600" />,
      label: 'Low Risk'
    },
  };

  const current = configs[level] || configs.LOW;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
        current.bg,
        current.border,
        className
      )}
    >
      {showIcon ? current.icon : <span className={cn('w-1.5 h-1.5 rounded-full', current.dot)} />}
      <span className="tracking-wide">{level}</span>
    </span>
  );
}
