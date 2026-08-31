import React, { useState } from 'react';
import { BarChart3, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const GatewayPerformanceComparisonWidget: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('7d');

  const comparisonData = [
    { gateway: 'Stone Adquirencia', success: 4210, failed: 85, successRate: 98.0, latencyMs: 142 },
    { gateway: 'Adyen Global', success: 3890, failed: 62, successRate: 98.4, latencyMs: 185 },
    { gateway: 'Stripe Payments', success: 2940, failed: 45, successRate: 98.5, latencyMs: 130 },
    { gateway: 'PIX SPI Central', success: 6120, failed: 110, successRate: 98.2, latencyMs: 95 },
    { gateway: 'Cielo API', success: 1850, failed: 92, successRate: 95.2, latencyMs: 240 }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gateway Performance Comparison (Sucesso vs Falhas)</h3>
            <p className="text-xs text-slate-500">Comparativo em tempo real de transações aprovadas e recusadas por adquirente</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === 'today' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === '7d' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              7 Dias
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeframe === '30d' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              30 Dias
            </button>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
            <XAxis dataKey="gateway" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              formatter={(value: any, name: string) => [
                value,
                name === 'success' ? 'Transações Aprovadas' : 'Transações Falhas / Recusadas'
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="success" name="Aprovadas" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="failed" name="Falhas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        {comparisonData.map(item => (
          <div key={item.gateway} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{item.gateway}</div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-600 font-bold">{item.successRate}% OK</span>
              <span className="text-slate-400">{item.latencyMs}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
