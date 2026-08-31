import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { BrainCircuit, Zap, ShieldCheck, Activity, RefreshCw, CheckCircle2, TrendingUp, Cpu, Sliders } from 'lucide-react';

export const DynamicRoutingEnginePanel: React.FC = () => {
  const { acquirers, addToast } = usePayment();
  const [isOptimizerRunning, setIsOptimizerRunning] = useState<boolean>(false);
  const [autoRedirectEnabled, setAutoRedirectEnabled] = useState<boolean>(true);
  const [latencyWeight, setLatencyWeight] = useState<number>(35);
  const [successWeight, setSuccessWeight] = useState<number>(65);

  const handleRunOptimizer = () => {
    setIsOptimizerRunning(true);
    setTimeout(() => {
      setIsOptimizerRunning(false);
      addToast(
        'Motor de Roteamento Dinâmico',
        'Análise de latência e taxa de aprovação concluída. Pesos de redirecionamento otimizados para maximizar conversão em tempo real.',
        'success'
      );
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Motor de Roteamento Dinâmico em Tempo Real (Smart Dynamic Routing)</h3>
              <p className="text-xs text-slate-500">Análise contínua de latência e aprovação para redirecionar transações para os melhores adquirentes automaticamente</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunOptimizer}
              disabled={isOptimizerRunning}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isOptimizerRunning ? 'animate-spin' : ''}`} />
              <span>{isOptimizerRunning ? 'Otimizando Pesos...' : 'Executar Otimização AI'}</span>
            </button>
          </div>
        </div>

        {/* Top Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Taxa de Aprovação Otimizada</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">96.8% <span className="text-xs text-emerald-600 font-normal">(+4.2%)</span></span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Latência Média de Redirecionamento</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">124 ms</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Abandono Evitado (Failover)</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">1.489 transações</span>
            </div>
          </div>
        </div>

        {/* Configuration sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4 rounded-xl border border-slate-200 p-5 bg-white dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <span>Pesos do Algoritmo de Decisão</span>
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span>Peso de Taxa de Aprovação (Sucesso)</span>
                  <span className="font-bold">{successWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={successWeight}
                  onChange={(e) => setSuccessWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1 text-slate-700 dark:text-slate-300">
                  <span>Peso de Latência & Custo de Transação</span>
                  <span className="font-bold">{latencyWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={latencyWeight}
                  onChange={(e) => setLatencyWeight(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Redirecionamento Automático Ativo</span>
              <input
                type="checkbox"
                checked={autoRedirectEnabled}
                onChange={(e) => setAutoRedirectEnabled(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 p-5 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Status dos Adquirentes sob Monitoramento AI</h4>
            <div className="space-y-2">
              {acquirers.slice(0, 4).map(acq => (
                <div key={acq.id} className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-900 dark:text-white">{acq.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>{acq.latencyMs}ms</span>
                    <span className="text-emerald-600 font-bold">{acq.errorRate1m}% erro</span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold">Prioridade #{acq.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
