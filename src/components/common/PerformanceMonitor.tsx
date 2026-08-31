import React, { useEffect, useRef, useState } from 'react';
import { Zap, Activity, BarChart2, ShieldCheck, AlertTriangle } from 'lucide-react';

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
  const [activeView, setActiveView] = useState<'health' | 'heatmap'>('health');
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ count: number; threshold: number } | null>(null);
  const [offlineWebhooks, setOfflineWebhooks] = useState<number>(7);
  const [isFlushingSync, setIsFlushingSync] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const now = performance.now();
    const duration = now - mountTimeRef.current;
    setRenderDuration(duration);

    if (duration > warnThresholdMs) {
      console.warn(`[PerformanceMonitor] Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    } else {
      console.info(`[PerformanceMonitor] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }

    const handleRateLimit429 = (e: any) => {
      setIsRateLimited(true);
      setRateLimitInfo(e.detail || { count: 1520, threshold: 1000 });
      setShowMetrics(true);
      setTimeout(() => setIsRateLimited(false), 12000);
    };

    window.addEventListener('nercash:rate-limit-429', handleRateLimit429 as EventListener);
    return () => {
      window.removeEventListener('nercash:rate-limit-429', handleRateLimit429 as EventListener);
    };
  }, [componentName, warnThresholdMs]);

  // Simulated latency heatmap buckets across 24h
  const latencyBuckets = [
    { hour: '00:00', ms: 42 }, { hour: '04:00', ms: 38 }, { hour: '08:00', ms: 110 },
    { hour: '12:00', ms: 185 }, { hour: '16:00', ms: 95 }, { hour: '20:00', ms: 62 }
  ];

  return (
    <div className="relative">
      {children}

      {/* Floating or subtle performance badge (can be toggled or viewed) */}
      <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2">
        {isRateLimited && (
          <div className="flex items-center gap-1.5 rounded-full border border-rose-500/50 bg-rose-950/90 px-3 py-1.5 text-[10px] font-bold text-rose-300 shadow-xl animate-bounce">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>HTTP 429 Too Many Requests</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowMetrics(prev => !prev)}
          title="Nercash Performance Telemetry"
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            isRateLimited
              ? 'border-rose-500 bg-rose-900/90 text-white animate-pulse'
              : 'border-emerald-500/30 bg-slate-900/90 text-emerald-400 hover:bg-slate-900'
          }`}
        >
          <Zap className="h-3 w-3 animate-pulse text-yellow-400" />
          <span>Perf: {renderDuration ? `${renderDuration.toFixed(1)}ms` : 'Ready'}</span>
        </button>

        {showMetrics && (
          <div className="absolute bottom-10 right-0 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-xs text-slate-200 shadow-2xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
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

            {isRateLimited && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/80 p-3 space-y-1 text-rose-200 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>429 Too Many Requests Triggered</span>
                </div>
                <p className="text-[10px] text-rose-300/80">
                  Middleware de Rate Limiting ativado: {rateLimitInfo?.count} reqs/min excederam o limite de {rateLimitInfo?.threshold} reqs/min. Tráfego agressivo bloqueado.
                </p>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex rounded-xl bg-slate-800 p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveView('health')}
                className={`flex-1 py-1 rounded-lg transition-all ${activeView === 'health' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                System Health
              </button>
              <button
                type="button"
                onClick={() => setActiveView('heatmap')}
                className={`flex-1 py-1 rounded-lg transition-all ${activeView === 'heatmap' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                Latency Heatmap
              </button>
            </div>

            {activeView === 'health' ? (
              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="space-y-2">
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
                    <span>Rate Limit Status:</span>
                    <span className={`font-bold ${isRateLimited ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isRateLimited ? 'Throttling (429)' : 'Normal (Active)'}
                    </span>
                  </div>
                </div>

                {/* Offline Sync State Indicator */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-2.5 space-y-2 text-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-amber-300">
                      <span>📦 Offline Sync (IndexedDB)</span>
                    </span>
                    <span className="rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-200">
                      {offlineWebhooks} pendentes
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-300/80 leading-relaxed">
                    Webhooks enfileirados localmente durante interrupção de conectividade.
                  </p>
                  {syncFeedback && (
                    <p className="text-[10px] text-emerald-400 font-bold">{syncFeedback}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlushingSync(true);
                        setTimeout(() => {
                          setOfflineWebhooks(0);
                          setIsFlushingSync(false);
                          setSyncFeedback('✓ Fila sincronizada com sucesso!');
                          setTimeout(() => setSyncFeedback(null), 3000);
                        }, 800);
                      }}
                      disabled={isFlushingSync || offlineWebhooks === 0}
                      className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-500 py-1 text-[10px] font-bold text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isFlushingSync ? 'Sincronizando...' : 'Flush / Sincronizar Fila'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Latência vs Média Móvel (30d)</span>
                  <span className="rounded bg-indigo-950 px-1.5 py-0.5 text-[10px] font-mono text-indigo-300 font-bold">30D MA: 98ms</span>
                </div>
                <div className="space-y-1.5">
                  {latencyBuckets.map(b => (
                    <div key={b.hour} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-400">{b.hour} (Atual: {b.ms}ms)</span>
                        <span className="font-mono text-indigo-400 font-semibold">30d MA: 95ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                          {/* 30D MA baseline indicator */}
                          <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-10" style={{ left: '48% ' }} title="30-Day Moving Average Baseline (95ms)" />
                          <div
                            className={`h-full ${b.ms > 120 ? 'bg-rose-500' : b.ms > 80 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (b.ms / 200) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">Linha vertical indica a média móvel histórica de 30 dias (95ms).</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
