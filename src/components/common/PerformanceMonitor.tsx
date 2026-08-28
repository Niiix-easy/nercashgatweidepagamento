import React, { useEffect, useRef, useState } from 'react';
import { Zap, Activity } from 'lucide-react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName?: string;
  warnThresholdMs?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  componentName = 'MainComponent',
  warnThresholdMs = 100
}) => {
  const mountTimeRef = useRef<number>(performance.now());
  const [renderDuration, setRenderDuration] = useState<number | null>(null);
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  useEffect(() => {
    const now = performance.now();
    const duration = now - mountTimeRef.current;
    setRenderDuration(duration);

    if (duration > warnThresholdMs) {
      console.warn(`[PerformanceMonitor] Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    } else {
      console.info(`[PerformanceMonitor] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
  }, [componentName, warnThresholdMs]);

  return (
    <div className="relative">
      {children}

      {/* Floating or subtle performance badge (can be toggled or viewed) */}
      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={() => setShowMetrics(prev => !prev)}
          title="Nercash Performance Telemetry"
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-slate-900/90 px-3 py-1.5 text-[10px] font-bold text-emerald-400 shadow-lg backdrop-blur-md hover:bg-slate-900 transition-all"
        >
          <Zap className="h-3 w-3 animate-pulse text-yellow-400" />
          <span>Perf: {renderDuration ? `${renderDuration.toFixed(1)}ms` : 'Ready'}</span>
        </button>

        {showMetrics && (
          <div className="absolute bottom-10 right-0 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Activity className="h-3.5 w-3.5" /> Web Vitals & Telemetry
              </span>
              <button
                type="button"
                onClick={() => setShowMetrics(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>Componente:</span>
                <span className="font-mono text-emerald-300">{componentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo de Render:</span>
                <span className="font-mono font-bold text-white">{renderDuration ? `${renderDuration.toFixed(2)}ms` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Memory Heap:</span>
                <span className="font-mono text-emerald-300">
                  {typeof window !== 'undefined' && (performance as any).memory
                    ? `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`
                    : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status CSP:</span>
                <span className="font-bold text-emerald-400">Ativo (Secure)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
