import React, { Suspense } from 'react';
import { motion } from 'motion/react';

export const WidgetSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="h-full w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[300px]"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-20 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-20 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
  </motion.div>
);

interface WidgetSuspenseProps {
  children: React.ReactNode;
}

export const WidgetSuspense: React.FC<WidgetSuspenseProps> = ({ children }) => {
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      {children}
    </Suspense>
  );
};
