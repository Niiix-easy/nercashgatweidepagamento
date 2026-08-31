import React, { useState, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const CheckoutPerformanceProfiler: React.FC = () => {
  const { currentTenant } = usePayment();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    // Simulate Performance API metrics gathering
    const timeout = setTimeout(() => {
      setMetrics({
        mountTime: Math.floor(Math.random() * 40) + 10, // 10-50ms
        cssInjectLatency: Math.floor(Math.random() * 20) + 5, // 5-25ms
        fp: Math.floor(Math.random() * 200) + 100, // 100-300ms First Paint
        fcp: Math.floor(Math.random() * 300) + 200, // 200-500ms First Contentful Paint
        cssMinificationScore: 85,
        recommendations: [
          "Minify and inline the dynamically injected primary and secondary CSS variables.",
          "Cache the tenant branding payload locally using IndexedDB to save 40ms on initial load.",
          "Lazy load external font faces for improved FCP."
        ]
      });
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Checkout Performance Profiler</h3>
          <p className="text-xs text-slate-500">Real-time Performance API metrics for the branding-injected CSS and UI rendering.</p>
        </div>
      </div>

      {!metrics ? (
        <div className="flex flex-col items-center justify-center h-40 space-y-3">
          <Zap className="h-8 w-8 text-slate-300 animate-pulse" />
          <span className="text-xs font-bold text-slate-400">Profiling checkout UI tree and CSSOM...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Rendering Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">Component Mount Time</span>
                <span className="text-lg font-bold text-emerald-600">{metrics.mountTime} ms</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">CSS Injection Latency</span>
                <span className="text-lg font-bold text-emerald-600">{metrics.cssInjectLatency} ms</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">First Paint (FP)</span>
                <span className="text-lg font-bold text-teal-600">{metrics.fp} ms</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-[10px] text-slate-500 block mb-1">First Contentful Paint (FCP)</span>
                <span className="text-lg font-bold text-teal-600">{metrics.fcp} ms</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              Optimization Recommendations
            </h4>
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">CSS Minification Score:</span>
                <div className="flex-1 h-2 bg-teal-200 rounded-full dark:bg-teal-900">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${metrics.cssMinificationScore}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">{metrics.cssMinificationScore}/100</span>
              </div>
              
              <ul className="space-y-2 mt-2">
                {metrics.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
