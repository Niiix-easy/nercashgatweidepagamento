import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Activity, ShieldCheck, AlertTriangle, XCircle, Server, Wifi } from 'lucide-react';

export const SystemHealthPulse: React.FC = () => {
  const { acquirers } = usePayment();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalProviders = acquirers.length;
  const healthyProviders = acquirers.filter(a => a.healthStatus === 'up' && !a.circuitBreakerTripped).length;
  const degradedProviders = acquirers.filter(a => a.healthStatus === 'degraded').length;
  const downProviders = acquirers.filter(a => a.healthStatus === 'down' || a.circuitBreakerTripped).length;

  let overallStatus = 'healthy';
  if (downProviders > 0) overallStatus = 'error';
  else if (degradedProviders > 0) overallStatus = 'warning';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex h-8 w-full items-center justify-between border-t border-slate-200 bg-white px-4 text-[10px] font-semibold text-slate-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 lg:pl-64">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Activity className={`h-3 w-3 ${
            overallStatus === 'error' ? 'text-rose-500' :
            overallStatus === 'warning' ? 'text-amber-500' : 'text-emerald-500'
          } ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity duration-700`} />
          <span className="uppercase tracking-wider">System Pulse</span>
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Server className="h-3 w-3 text-indigo-400" />
            <span>{totalProviders} BaaS Providers Linked</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">{healthyProviders} Healthy</span>
          </div>
          {degradedProviders > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400">{degradedProviders} Degraded</span>
            </div>
          )}
          {downProviders > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-rose-500" />
              <span className="text-rose-600 dark:text-rose-400">{downProviders} Down/Circuit Open</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 opacity-70">
          <Wifi className="h-3 w-3" />
          <span>WebSocket Real-time Sync Active</span>
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
        <span>Nercash Orchestrator Core v4.2</span>
      </div>
    </div>
  );
};
