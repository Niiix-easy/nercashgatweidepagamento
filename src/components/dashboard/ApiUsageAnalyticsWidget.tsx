import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cpu, Activity, Clock, Zap, Filter } from 'lucide-react';

const apiTrafficData = [
  { time: '00:00', getRequests: 1420, postRequests: 890, webhookCalls: 450, pixCallbacks: 2300 },
  { time: '03:00', getRequests: 820, postRequests: 410, webhookCalls: 210, pixCallbacks: 1100 },
  { time: '06:00', getRequests: 2100, postRequests: 1450, webhookCalls: 680, pixCallbacks: 3400 },
  { time: '09:00', getRequests: 6800, postRequests: 4900, webhookCalls: 2450, pixCallbacks: 11200 },
  { time: '12:00', getRequests: 9500, postRequests: 7200, webhookCalls: 3800, pixCallbacks: 16500 },
  { time: '15:00', getRequests: 8400, postRequests: 6100, webhookCalls: 3100, pixCallbacks: 14200 },
  { time: '18:00', getRequests: 7200, postRequests: 5300, webhookCalls: 2700, pixCallbacks: 12100 },
  { time: '21:00', getRequests: 4500, postRequests: 3100, webhookCalls: 1500, pixCallbacks: 7800 },
];

export const ApiUsageAnalyticsWidget: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>API Usage Analytics & Throughput Volume</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Live Stacked Bars
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Volume histórico e atual de requisições REST, Webhooks e PIX Callbacks por horário
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          {(['24h', '7d', '30d'] as const).map(range => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Chart (8 cols) */}
        <div className="lg:col-span-8 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={apiTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="pixCallbacks" name="PIX Callbacks" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="getRequests" name="GET Queries" stackId="a" fill="#6366f1" />
              <Bar dataKey="postRequests" name="POST Transactions" stackId="a" fill="#3b82f6" />
              <Bar dataKey="webhookCalls" name="Webhooks" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Stats Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pico de Requisições</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">36,500 req/h</span>
              <span className="text-[11px] font-bold text-emerald-600">@ 12:00</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Carga suportada sem degradação de SLA (latência média 14ms).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Taxa de Sucesso da API</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600 font-mono">99.98%</span>
              <span className="text-[11px] font-bold text-slate-500">HTTP 2xx</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Apenas 0.02% de erros 5xx tratados pelo circuit breaker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
