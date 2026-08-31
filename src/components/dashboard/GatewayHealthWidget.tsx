import React, { useState, useEffect } from 'react';
import { usePayment, useSystemState } from '../../context/PaymentContext';
import { Activity, Zap, CheckCircle2, AlertTriangle, RefreshCw, Server, Shield, Globe, Bell } from 'lucide-react';

export const GatewayHealthWidget: React.FC = () => {
  const { acquirers } = usePayment();
  const { getApiStatus, setApiStatus } = useSystemState();
  const [gatewayPings, setGatewayPings] = useState<Record<string, { latency: number; status: 'up' | 'degraded' | 'down'; tps: number }>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial simulated ping data
    const cachedData = sessionStorage.getItem('gateway_pings_cache');
    let initial: Record<string, { latency: number; status: 'up' | 'degraded' | 'down'; tps: number }> = {};
    
    if (cachedData) {
      initial = JSON.parse(cachedData);
    } else {
      acquirers.forEach(acq => {
        initial[acq.id] = {
          latency: Math.floor(12 + Math.random() * 25),
          status: acq.healthStatus || 'up',
          tps: Math.floor(150 + Math.random() * 450)
        };
      });
      sessionStorage.setItem('gateway_pings_cache', JSON.stringify(initial));
    }
    
    setGatewayPings(initial);

    // Live ping jitter interval
    const interval = setInterval(() => {
      setGatewayPings(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const current = next[id];
          const jitter = Math.floor(Math.random() * 7) - 3;
          const newLatency = Math.max(8, current.latency + jitter);
          next[id] = {
            ...current,
            latency: newLatency,
            tps: Math.max(50, current.tps + Math.floor(Math.random() * 30) - 15)
          };
        });
        sessionStorage.setItem('gateway_pings_cache', JSON.stringify(next));
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [acquirers]);

  const handleManualPing = () => {
    setIsRefreshing(true);
    sessionStorage.removeItem('gateway_pings_cache');
    setTimeout(() => {
      const initial: Record<string, { latency: number; status: 'up' | 'degraded' | 'down'; tps: number }> = {};
      acquirers.forEach(acq => {
        initial[acq.id] = {
          latency: Math.floor(12 + Math.random() * 25),
          status: acq.healthStatus || 'up',
          tps: Math.floor(150 + Math.random() * 450)
        };
      });
      setGatewayPings(initial);
      sessionStorage.setItem('gateway_pings_cache', JSON.stringify(initial));
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Gateway Health & Ping Monitor</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latência em tempo real e status de conectividade dos adquirentes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualPing}
          className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all ${
            isRefreshing ? 'opacity-70 animate-pulse' : ''
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Force Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {acquirers.map(acq => {
          const stats = gatewayPings[acq.id] || { latency: 18, status: 'up', tps: 240 };
          const isUp = stats.status === 'up' && !acq.circuitBreakerTripped;

          return (
            <div 
              key={acq.id}
              className={`rounded-2xl border p-4 transition-all ${
                isUp 
                  ? 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40' 
                  : 'border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`flex h-2.5 w-2.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {acq.name}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isUp 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isUp ? 'Operacional' : 'Degradado'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Latência</span>
                  <span className={`font-mono font-bold ${stats.latency < 40 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                    {stats.latency}ms
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Carga TPS</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {stats.tps} req/s
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SLA 24h</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {acq.successRate}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
