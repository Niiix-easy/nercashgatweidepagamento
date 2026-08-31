import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { RefreshCcw, ShieldCheck, Zap, Clock, ArrowRight, CheckCircle2, AlertTriangle, Sliders } from 'lucide-react';

export const BaasRetryConfigPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [backoffMultiplier, setBackoffMultiplier] = useState<number>(2); // 2s, 4s, 8s
  const [timeoutThresholdMs, setTimeoutThresholdMs] = useState<number>(4000);
  const [secondaryProvider, setSecondaryProvider] = useState<string>('iugu');
  const [enableCircuitBreaker, setEnableCircuitBreaker] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    addToast(
      'Política de Retry & Failover',
      `Configuração de BaaS atualizada com sucesso. Max Retries: ${maxRetries}, Backoff: ${backoffMultiplier}x, Fallback: ${secondaryProvider.toUpperCase()}`,
      'success'
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orquestração de Retry Automático & Failover BaaS (PIX & Cartão)</h3>
              <p className="text-xs text-slate-500">Configure backoff exponencial para timeouts de PIX/Boleto e limiares de transbordo para provedores secundários</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Retry & Backoff */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Política de Tentativas (Exponential Backoff)</span>
            </h4>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Máximo de Tentativas de Reenvio (Retries)</label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value={1}>1 tentativa (Sem retry)</option>
                <option value={3}>3 tentativas (Padrão Recomendado)</option>
                <option value={5}>5 tentativas (Alta resiliência SPI)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fator de Backoff Exponencial</label>
              <select
                value={backoffMultiplier}
                onChange={(e) => setBackoffMultiplier(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value={1.5}>Linear (1.5s entre tentativas)</option>
                <option value={2}>Exponencial Base 2 (2s, 4s, 8s)</option>
                <option value={3}>Exponencial Agressivo Base 3 (3s, 9s, 27s)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Limiar de Timeout (ms)</label>
              <input
                type="number"
                value={timeoutThresholdMs}
                onChange={(e) => setTimeoutThresholdMs(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400">Se a API BaaS demorar mais que {timeoutThresholdMs}ms, o gatilho de timeout inicia o failover.</p>
            </div>
          </div>

          {/* Right Column: Failover & Circuit Breaker */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Transbordo & Circuit Breaker (Failover)</span>
            </h4>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Provedor Secundário de Fallback</label>
              <select
                value={secondaryProvider}
                onChange={(e) => setSecondaryProvider(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="iugu">Iugu BaaS API v2</option>
                <option value="juno">Juno / Billing Engine</option>
                <option value="asaas">Asaas SPI Gateway</option>
              </select>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Circuit Breaker Automático</span>
                <span className="text-[11px] text-slate-500">Desarma o provedor primário se a taxa de erro atingir &gt;15% em 60s.</span>
              </div>
              <input
                type="checkbox"
                checked={enableCircuitBreaker}
                onChange={(e) => setEnableCircuitBreaker(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Política de Orquestração BaaS'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
