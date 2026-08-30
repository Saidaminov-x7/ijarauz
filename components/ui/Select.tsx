'use client';

import * as React from 'react';
import { forwardRef, useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  labelMap: Record<string, React.ReactNode>;
  registerLabel: (val: string, label: React.ReactNode) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

interface SelectProps {
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

function Select({ children, value: controlledValue, defaultValue = '', onValueChange, disabled = false }: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [labelMap, setLabelMap] = useState<Record<string, React.ReactNode>>({});

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
    setOpen(false);
  };

  const registerLabel = (val: string, label: React.ReactNode) => {
    setLabelMap((prev) => (prev[val] === label ? prev : { ...prev, [val]: label }));
  };

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        labelMap,
        registerLabel,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

const SelectGroup = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-1', className)} {...props} />
);
SelectGroup.displayName = 'SelectGroup';

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder = 'Select...', ...props }, ref) => {
    const context = useContext(SelectContext);
    const selectedLabel = context?.value ? context.labelMap[context.value] : null;

    return (
      <span ref={ref} className={cn('truncate', !selectedLabel && 'text-stone-400 dark:text-stone-500', className)} {...props}>
        {selectedLabel || placeholder}
      </span>
    );
  }
);
SelectValue.displayName = 'SelectValue';

const SelectTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, disabled, ...props }, ref) => {
    const context = useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && context?.setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 dark:text-stone-400',
            context?.open && 'rotate-180'
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(SelectContext);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          context?.setOpen(false);
        }
      };
      if (context?.open) {
        document.addEventListener('mousedown', handleOutside);
      }
      return () => document.removeEventListener('mousedown', handleOutside);
    }, [context?.open, context]);

    if (!context?.open) return null;

    return (
      <div
        ref={containerRef}
        className={cn(
          'absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-stone-200 bg-white p-1 shadow-lg shadow-stone-900/10 dark:border-stone-700 dark:bg-stone-800 dark:shadow-black/40',
          className
        )}
        {...props}
      >
        <div ref={ref}>{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

const SelectLabel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-2 py-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400', className)} {...props} />
  )
);
SelectLabel.displayName = 'SelectLabel';

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const SelectItem = forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = useContext(SelectContext);
    const isSelected = context?.value === value;

    useEffect(() => {
      context?.registerLabel(value, children);
    }, [value, children, context]);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context?.onValueChange(value)}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700',
          isSelected && 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/60 dark:text-primary-300',
          className
        )}
        {...props}
      >
        <span className="flex-1 text-left">{children}</span>
        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />}
      </button>
    );
  }
);
SelectItem.displayName = 'SelectItem';

const SelectSeparator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-mx-1 my-1 h-px bg-stone-100 dark:bg-stone-700', className)} {...props} />
  )
);
SelectSeparator.displayName = 'SelectSeparator';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
