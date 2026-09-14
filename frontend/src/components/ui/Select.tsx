import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-4 pr-10 py-3 text-base rounded-xl bg-white text-slate-900 border appearance-none transition-all duration-200 min-h-[50px] shadow-sm cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          >
            <option value="" disabled>
              Select an option
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;
