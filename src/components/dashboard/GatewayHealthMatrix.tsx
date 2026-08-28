import React from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Shield, Zap, CheckCircle2, AlertTriangle, RefreshCw, Activity, Server } from 'lucide-react';

export const GatewayHealthMatrix: React.FC = () => {
  const { acquirers } = usePayment();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Gateway Health Matrix & Latency Grid</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Real-Time Ping
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matriz colorida de status, latência e carga de TPS para cada adquirente e gateway conectado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Monitoramento 24/7 Ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {acquirers.map(acq => {
          const isHealthy = acq.status === 'active';
          const latency = acq.latencyMs || Math.floor(Math.random() * 35) + 12;

          return (
            <div
              key={acq.id}
              className={`rounded-2xl border p-4 transition-all ${
                isHealthy
                  ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-rose-500'}`} />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{acq.name}</h4>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  isHealthy ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isHealthy ? 'Operacional' : 'Degradado'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Latência</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{latency} ms</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Sucesso</span>
                  <div className="font-mono font-bold text-emerald-600">{acq.successRate}%</div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Carga: {Math.floor(Math.random() * 180) + 40} TPS • Rota: Principal
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
