import React, { useState, useEffect } from 'react';
import { crossTabBus } from '../../services/crossTabBus';
import { Activity, Radio, CheckCircle2, AlertCircle, Server } from 'lucide-react';

export const SynchronizationHealthHeader: React.FC = () => {
  const [statuses, setStatuses] = useState([
    { name: 'Asaas', status: 'operational' },
    { name: 'Iugu', status: 'operational' },
    { name: 'Juno', status: 'operational' }
  ]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Agora mesmo');

  useEffect(() => {
    const unsubscribe = crossTabBus.subscribe('GATEWAY_STATUS_SYNC', () => {
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    // Periodically simulate minor fluctuations in provider health status
    const interval = setInterval(() => {
      setStatuses(prev => prev.map(p => {
        const rand = Math.random();
        // 95% operational, 5% degraded
        const status = rand > 0.96 ? 'degraded' : 'operational';
        return { ...p, status };
      }));
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden xl:flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 shadow-sm">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
        <Server className="h-3.5 w-3.5 text-indigo-500" />
        <span>BaaS Health:</span>
      </div>

      <div className="flex items-center gap-2.5">
        {statuses.map((prov, idx) => {
          const isOperational = prov.status === 'operational';
          return (
            <div key={idx} className="flex items-center gap-1.5" title={`${prov.name}: ${isOperational ? 'Operacional' : 'Degradado / Latência Alta'}`}>
              <span className="relative flex h-2 w-2">
                {isOperational ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">{prov.name}</span>
            </div>
          );
        })}
      </div>

      <span className="text-slate-300 dark:text-slate-700">|</span>
      <span className="text-[10px] text-slate-400 font-mono">Sync: {lastSyncTime}</span>
    </div>
  );
};
