import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'lg', loading, fullWidth, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm hover:shadow active:scale-[0.98]',
      gradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-lg active:scale-[0.98]',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 active:scale-[0.98]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm active:scale-[0.98]',
      ghost: 'bg-transparent text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100',
      outline: 'border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs font-medium min-h-[38px] rounded-lg',
      md: 'px-4 py-2.5 text-sm font-semibold min-h-[46px] rounded-xl',
      lg: 'px-5 py-3 text-base font-semibold min-h-[52px] rounded-xl',
      xl: 'px-6 py-3.5 text-lg font-bold min-h-[56px] rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
