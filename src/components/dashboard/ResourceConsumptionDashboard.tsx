import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, RefreshCw, Download, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { BaaSQuotaWidget } from './BaaSQuotaWidget';

export const ResourceConsumptionDashboard: React.FC = () => {
  const [memoryUsageMb, setMemoryUsageMb] = useState<number>(46.5);
  const [cpuUsagePercent, setCpuUsagePercent] = useState<number>(3.8);
  const [activeThreads, setActiveThreads] = useState<number>(4);
  const [cacheFootprintKb, setCacheFootprintKb] = useState<number>(1840);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate natural minor oscillations
      setMemoryUsageMb(prev => Number((45 + Math.random() * 5).toFixed(1)));
      setCpuUsagePercent(prev => Number((3.2 + Math.random() * 2.1).toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunGarbageCollection = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setMemoryUsageMb(32.4);
      setCacheFootprintKb(920);
      setIsCleaning(false);
    }, 800);
  };

  const handleGenerateDiagnosticSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      platform: 'Nercash Enterprise Payment Orchestration',
      clientRuntime: navigator.userAgent,
      memoryHeapMb: memoryUsageMb,
      cpuUsagePercent: cpuUsagePercent,
      activeThreads: activeThreads,
      cacheFootprintKb: cacheFootprintKb,
      activeRoutes: ['/dashboard', '/orchestration', '/compliance', '/api-docs'],
      recentErrors: [],
      performanceMetrics: {
        avgLatencyMs: 112,
        p99LatencyMs: 240,
        successRatePercent: 98.4
      },
      securityState: {
        csp: 'Enforced',
        encryption: 'AES-256-GCM',
        sessionActive: true
      }
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_diagnostic_snapshot_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSnapshotFeedback('✓ Diagnostic Snapshot gerado e baixado com sucesso!');
    setTimeout(() => setSnapshotFeedback(null), 4000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resource Consumption Dashboard & Diagnostic Snapshot</h3>
            <p className="text-xs text-slate-500">Monitoramento em tempo real de memória heap, cache client-side e threads para prevenção de degradação</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunGarbageCollection}
            disabled={isCleaning}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCleaning ? 'animate-spin' : ''}`} />
            <span>{isCleaning ? 'Otimizando...' : 'Executar GC (Cache Clean)'}</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateDiagnosticSnapshot}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Baixar Diagnostic Snapshot</span>
          </button>
        </div>
      </div>

      {snapshotFeedback && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
          {snapshotFeedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Memory Heap (JS)</span>
            <HardDrive className="h-4 w-4 text-purple-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{memoryUsageMb} MB</span>
            <span className="text-[11px] text-emerald-600 font-bold">Limite: 128 MB</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${(memoryUsageMb / 128) * 100}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">CPU Worker Load</span>
            <Cpu className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{cpuUsagePercent}%</span>
            <span className="text-[11px] text-emerald-600 font-bold">Otimizado</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${cpuUsagePercent * 10}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Threads Ativas</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{activeThreads} Workers</span>
            <span className="text-[11px] text-emerald-600 font-bold">Estável</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Client-Side Cache</span>
            <ShieldCheck className="h-4 w-4 text-teal-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{cacheFootprintKb} KB</span>
            <span className="text-[11px] text-teal-600 font-bold">IndexedDB</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, (cacheFootprintKb / 5000) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* BaaS Rate Limit Usage Widget */}
      <BaaSQuotaWidget />
    </div>
  );
};
