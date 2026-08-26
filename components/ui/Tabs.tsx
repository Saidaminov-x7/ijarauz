'use client';

import * as React from 'react';
import { forwardRef, createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
}

function Tabs({ defaultValue = '', value: controlledValue, onValueChange, className, children, ...props }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (val: string) => {
    if (!isControlled) setUncontrolledValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

const TabsList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-stone-100 p-1 dark:bg-stone-800',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context?.onValueChange(value)}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-50'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (context?.value !== value) return null;

    return (
      <div
        ref={ref}
        className={cn('mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };