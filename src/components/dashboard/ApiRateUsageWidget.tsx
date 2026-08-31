import React, { useState, useEffect } from 'react';
import { Server, Activity, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ApiRateUsageWidget: React.FC = () => {
  const [providers, setProviders] = useState([
    { name: 'Iugu', used: 4520, limit: 10000, color: '#6366f1' },
    { name: 'Juno', used: 8900, limit: 15000, color: '#f43f5e' },
    { name: 'Asaas', used: 1200, limit: 5000, color: '#10b981' },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setProviders([
        { name: 'Iugu', used: 4535, limit: 10000, color: '#6366f1' },
        { name: 'Juno', used: 8940, limit: 15000, color: '#f43f5e' },
        { name: 'Asaas', used: 1210, limit: 5000, color: '#10b981' },
      ]);
      setIsRefreshing(false);
    }, 800);
  };

  const chartData = providers.map(p => ({
    name: p.name,
    Utilizado: p.used,
    Disponível: p.limit - p.used,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Uso de API (Rate Limits)</h3>
            <p className="text-xs text-slate-500">Monitoramento diário de cotas dos provedores BaaS</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {providers.map(provider => {
          const usagePercent = Math.round((provider.used / provider.limit) * 100);
          const isCritical = usagePercent > 85;
          return (
            <div key={provider.name} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/60 dark:bg-slate-950">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">{provider.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                  {usagePercent}% Uso
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${usagePercent}%`, backgroundColor: provider.color }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{provider.used.toLocaleString()} reqs</span>
                <span>Restam: {(provider.limit - provider.used).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 'bold' }} width={60} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="Utilizado" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Disponível" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
