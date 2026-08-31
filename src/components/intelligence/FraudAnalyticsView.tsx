import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Activity, Search, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const FraudAnalyticsView: React.FC = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [data, setData] = useState([
    { time: '08:00', score: 12 },
    { time: '09:00', score: 15 },
    { time: '10:00', score: 11 },
    { time: '11:00', score: 18 },
    { time: '12:00', score: 14 },
    { time: '13:00', score: 20 },
    { time: '14:00', score: 16 }
  ]);

  const handleSimulateSpike = () => {
    setIsSimulating(true);
    const newData = [...data, { time: '14:30', score: 85 }, { time: '15:00', score: 92 }];
    setData(newData);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fraud Analytics</h2>
            <p className="text-sm text-slate-500">Monitor fraud scores and alert on suspicious transaction spikes.</p>
          </div>
        </div>
        <button
          onClick={handleSimulateSpike}
          disabled={isSimulating}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          <AlertTriangle className="h-4 w-4" />
          Simular Ataque
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Risco Médio (24h)</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-emerald-600">15.2</span>
            <span className="text-xs text-slate-400 mb-1">/ 100</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Transações Bloqueadas</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">142</span>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-1 dark:text-rose-400">Alertas Críticos</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-500">{data.length > 7 ? '1' : '0'}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-800 mb-4 dark:text-slate-200">Historical Fraud Score</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="score" stroke="#f43f5e" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
