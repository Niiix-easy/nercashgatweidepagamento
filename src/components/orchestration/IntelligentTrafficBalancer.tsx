import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Sliders, Zap, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Layers } from 'lucide-react';

interface GatewayOption {
  id: string;
  name: string;
  type: 'Credit Card' | 'Boleto Bancário' | 'Pix Parcelado (BaaS)';
  latencyMs: number;
  successRate: number; // e.g. 99.4
  costBps: number; // basis points e.g. 290 (2.9%)
  isRecommended?: boolean;
}

export const IntelligentTrafficBalancer: React.FC<{ onApplyOptimization: () => void }> = ({ onApplyOptimization }) => {
  const { addToast } = usePayment();
  const [methodFilter, setMethodFilter] = useState<'all' | 'Credit Card' | 'Boleto Bancário' | 'Pix Parcelado (BaaS)'>('all');
  const [latencyWeight, setLatencyWeight] = useState<number>(30); // 30%
  const [successWeight, setSuccessWeight] = useState<number>(50); // 50%
  const [costWeight, setCostWeight] = useState<number>(20); // 20%
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [appliedOptimization, setAppliedOptimization] = useState<boolean>(false);

  const gateways: GatewayOption[] = [
    { id: 'cielo_cc', name: 'Cielo API V3 (Cartão de Crédito)', type: 'Credit Card', latencyMs: 140, successRate: 99.2, costBps: 280 },
    { id: 'stone_cc', name: 'Stone Direct (Cartão de Crédito High-Yield)', type: 'Credit Card', latencyMs: 95, successRate: 99.6, costBps: 260 },
    { id: 'adyen_cc', name: 'Adyen Global (Cartão Internacional)', type: 'Credit Card', latencyMs: 210, successRate: 99.8, costBps: 310 },
    { id: 'asaas_boleto', name: 'Asaas Banking-as-a-Service (Boleto Registrado)', type: 'Boleto Bancário', latencyMs: 320, successRate: 98.9, costBps: 199 },
    { id: 'banco_central_boleto', name: 'Banco Central SPB (Boleto Direto)', type: 'Boleto Bancário', latencyMs: 180, successRate: 99.4, costBps: 150 },
    { id: 'asaas_pix_parcelado', name: 'Asaas BaaS - Pix Parcelado (Garantia em Cartão)', type: 'Pix Parcelado (BaaS)', latencyMs: 110, successRate: 99.7, costBps: 240 },
    { id: 'bcb_pix_instant', name: 'SPI / Pix Direto (Parcelado via BACEN)', type: 'Pix Parcelado (BaaS)', latencyMs: 85, successRate: 99.9, costBps: 120 }
  ];

  // Calculate efficiency score for each gateway based on weights
  const scoredGateways = useMemo(() => {
    return gateways
      .filter(gw => methodFilter === 'all' || gw.type === methodFilter)
      .map(gw => {
        // Normalize metrics: Success rate (0-100), Latency (lower is better, max 500ms), Cost (lower is better, max 400bps)
        const successScore = gw.successRate; // 98 - 100
        const latencyScore = Math.max(0, 100 - (gw.latencyMs / 5)); // 500ms = 0 score, 0ms = 100 score
        const costScore = Math.max(0, 100 - (gw.costBps / 4)); // 400bps = 0 score, 0bps = 100 score

        const totalScore = (
          (successScore * (successWeight / 100)) +
          (latencyScore * (latencyWeight / 100)) +
          (costScore * (costWeight / 100))
        );

        return { ...gw, score: Math.round(totalScore * 10) / 10 };
      })
      .sort((a, b) => b.score - a.score);
  }, [methodFilter, latencyWeight, successWeight, costWeight]);

  const bestRoute = scoredGateways[0];

  const handleApplyOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setAppliedOptimization(true);
      onApplyOptimization();
      addToast(
        'Traffic Balancer',
        `Rota otimizada aplicada com sucesso! O gateway "${bestRoute?.name}" foi definido como rota primária para ${methodFilter === 'all' ? 'todos os métodos' : methodFilter}.`,
        'success'
      );
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Intelligent Traffic Balancing & Multi-BaaS Routing</h3>
              <p className="text-xs text-slate-500">Otimização automática de rotas para Cartão de Crédito, Boletos e Pix Parcelado (Asaas BaaS) via fórmula ponderada</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Métodos de Pagamento</option>
              <option value="Credit Card">Cartão de Crédito</option>
              <option value="Boleto Bancário">Boletos (BaaS)</option>
              <option value="Pix Parcelado (BaaS)">Pix Parcelado (Asaas BaaS)</option>
            </select>

            <button
              type="button"
              onClick={handleApplyOptimization}
              disabled={isOptimizing || !bestRoute}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Otimizando...' : 'Aplicar Otimização ao Grafo'}</span>
            </button>
          </div>
        </div>

        {/* Weights Slider Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Peso Taxa de Sucesso</span>
              <span className="font-mono text-violet-600 dark:text-violet-400">{successWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={successWeight}
              onChange={(e) => setSuccessWeight(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Peso Baixa Latência</span>
              <span className="font-mono text-violet-600 dark:text-violet-400">{latencyWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={latencyWeight}
              onChange={(e) => setLatencyWeight(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Peso Menor Custo (MDR)</span>
              <span className="font-mono text-violet-600 dark:text-violet-400">{costWeight}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={costWeight}
              onChange={(e) => setCostWeight(Number(e.target.value))}
              className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Scored Gateway Results Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ranking de Eficiência de Roteamento</h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Classificação & Gateway / BaaS</th>
                  <th className="p-3">Método</th>
                  <th className="p-3">Latência Média</th>
                  <th className="p-3">Taxa de Sucesso</th>
                  <th className="p-3">Custo (BPS)</th>
                  <th className="p-3">Score Algorítmico</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scoredGateways.map((gw, idx) => (
                  <tr key={gw.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 ${idx === 0 ? 'bg-violet-50/30 dark:bg-violet-950/20 font-bold' : ''}`}>
                    <td className="p-3 flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] ${idx === 0 ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        #{idx + 1}
                      </span>
                      <span className="text-slate-900 dark:text-white">{gw.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {gw.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{gw.latencyMs}ms</td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">{gw.successRate}%</td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{gw.costBps} bps</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-violet-600 h-full rounded-full" style={{ width: `${Math.min(100, gw.score)}%` }}></div>
                        </div>
                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{gw.score}/100</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {idx === 0 ? (
                        <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                          👑 Rota Recomendada
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Failover Secundário</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {appliedOptimization && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">Grafo Low-Code Atualizado com Sucesso</strong>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">As regras de roteamento dinâmico para Cartão, Boleto e Pix Parcelado (Asaas BaaS) estão ativas no motor de pagamentos.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
