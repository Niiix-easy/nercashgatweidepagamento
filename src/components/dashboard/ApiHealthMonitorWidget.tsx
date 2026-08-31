import React, { useState, useEffect } from 'react';
import { Activity, Server, Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export const ApiHealthMonitorWidget: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState([
    { provider: 'Iugu', status: 'up', latency: 45, uptime: '99.99%' },
    { provider: 'Juno', status: 'up', latency: 82, uptime: '99.95%' },
    { provider: 'Asaas', status: 'down', latency: 0, uptime: '98.50%' }
  ]);

  useEffect(() => {
    // Simulate real-time health checks
    const interval = setInterval(() => {
      setHealthStatus(prev => prev.map(p => {
        if (p.provider === 'Asaas') {
          // Recover Asaas after some time
          return Math.random() > 0.7 ? { ...p, status: 'up', latency: 120 } : p;
        }
        return {
          ...p,
          latency: p.status === 'up' ? Math.max(10, p.latency + (Math.random() * 20 - 10)) : 0
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Health Monitor</h3>
            <p className="text-xs text-slate-500">Real-time BaaS connectivity & latency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthStatus.map(provider => (
          <div key={provider.provider} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/60 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-400" />
                {provider.provider}
              </span>
              {provider.status === 'up' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> UP
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-400 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> DOWN
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Latency</span>
              </div>
              <span className={`font-bold ${provider.status === 'down' ? 'text-rose-500' : provider.latency > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {provider.status === 'down' ? 'ERR' : `${Math.round(provider.latency)}ms`}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs mt-2">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Uptime</span>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {provider.uptime}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
