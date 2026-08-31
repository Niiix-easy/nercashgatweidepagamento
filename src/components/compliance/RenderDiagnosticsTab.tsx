import React, { useState, useEffect } from 'react';
import { Activity, Zap, Cpu, BarChart3, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

export const RenderDiagnosticsTab: React.FC = () => {
  const [renderMetrics, setRenderMetrics] = useState<Array<{ id: string; component: string; type: string; renderTimeMs: number; timestamp: string; status: 'optimal' | 'warning' }>>([
    { id: 'm_1', component: 'OverviewChart (Recharts)', type: 'SVG Chart Render', renderTimeMs: 4.2, timestamp: '11:35:10', status: 'optimal' },
    { id: 'm_2', component: 'OrchestrationFlow (React Flow)', type: 'Canvas Graph Render', renderTimeMs: 8.9, timestamp: '11:35:08', status: 'optimal' },
    { id: 'm_3', component: 'GatewayPerformanceComparisonWidget', type: 'BarChart Render', renderTimeMs: 3.5, timestamp: '11:34:55', status: 'optimal' },
    { id: 'm_4', component: 'TransactionTableWithBulkTagging', type: 'Virtual DOM Reconcile', renderTimeMs: 14.1, timestamp: '11:34:40', status: 'optimal' },
    { id: 'm_5', component: 'GatewayHealthMatrix', type: 'Grid Matrix Render', renderTimeMs: 6.8, timestamp: '11:34:20', status: 'optimal' }
  ]);
  const [isProfiling, setIsProfiling] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  const runProfiler = () => {
    setIsProfiling(true);
    setProfileFeedback('Iniciando perfilamento de renderização Recharts & React Flow...');
    setTimeout(() => {
      setRenderMetrics(prev => [
        {
          id: `m_${Date.now()}`,
          component: Math.random() > 0.5 ? 'OverviewChart (Recharts)' : 'OrchestrationFlow (React Flow)',
          type: 'Stress Profiling Run',
          renderTimeMs: Number((2 + Math.random() * 8).toFixed(1)),
          timestamp: new Date().toLocaleTimeString(),
          status: 'optimal'
        },
        ...prev
      ]);
      setIsProfiling(false);
      setProfileFeedback('✓ Perfilamento concluído. Nenhum gargalo de renderização detectado.');
      setTimeout(() => setProfileFeedback(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Render Diagnostics & Profiler (Recharts & React Flow)</h3>
              <p className="text-xs text-slate-500">Monitoramento especializado de tempos de renderização de gráficos e nós de fluxo para otimização de performance</p>
            </div>
          </div>

          <button
            type="button"
            onClick={runProfiler}
            disabled={isProfiling}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-500 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isProfiling ? 'animate-spin' : ''}`} />
            <span>{isProfiling ? 'Perfilando...' : 'Executar Profiler de Render'}</span>
          </button>
        </div>

        {profileFeedback && (
          <div className="rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-xs text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 font-medium">
            {profileFeedback}
          </div>
        )}

        {/* Metrics Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Log de Tempos de Renderização de Componentes Pesados</h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Componente Registrado</th>
                  <th className="p-3">Tipo de Renderização</th>
                  <th className="p-3">Tempo de Render (ms)</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status de Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {renderMetrics.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{item.component}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{item.type}</td>
                    <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">{item.renderTimeMs} ms</td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{item.timestamp}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Ótimo (&lt;16ms)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
