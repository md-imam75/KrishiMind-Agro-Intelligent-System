import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, leftIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full py-3 text-base rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border transition-all duration-200 min-h-[50px] shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
              leftIcon ? 'pl-11 pr-4' : 'px-4',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && <p className="text-xs text-slate-500 pl-1">{hint}</p>}
        {error && <p className="text-xs text-red-600 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
