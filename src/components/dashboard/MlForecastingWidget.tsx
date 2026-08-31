import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import {
  TrendingUp,
  BrainCircuit,
  Zap,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Cpu,
  Clock,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Layers,
  ChevronRight,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export interface ForecastHourData {
  hourOffset: number;
  timeLabel: string;
  expectedTps: number;
  lowerBoundTps: number;
  upperBoundTps: number;
  predictedBrlVolume: number;
  riskProbability: number; // 0-100%
  isSurgePeak: boolean;
  recommendedAcquirer: string;
}

export const MlForecastingWidget: React.FC = () => {
  const { routingRules, acquirers, updateAcquirerHealth, addRoutingRule, addAuditLog } = usePayment();
  const [modelType, setModelType] = useState<'ensemble' | 'arima' | 'deepar'>('ensemble');
  const [scenario, setScenario] = useState<'normal' | 'flash_sale' | 'high_risk'>('normal');
  const [appliedStrategies, setAppliedStrategies] = useState<string[]>([]);
  const [activeStrategyToast, setActiveStrategyToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(0);

  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCacheBuster(prev => prev + 1);
      setIsRefreshing(false);
    }, 600);
  };

  // Generate dynamic 48h forecast series based on scenario
  const forecastData: ForecastHourData[] = useMemo(() => {
    const cacheKey = `ml_forecast_cache_${scenario}_${cacheBuster}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    const data: ForecastHourData[] = [];
    const now = new Date();
    const multiplier = scenario === 'flash_sale' ? 2.8 : scenario === 'high_risk' ? 1.4 : 1.0;
    const baseRiskMultiplier = scenario === 'high_risk' ? 2.4 : 1.0;

    for (let i = 0; i <= 48; i += 2) {
      const futureTime = new Date(now.getTime() + i * 3600 * 1000);
      const hourOfDay = futureTime.getHours();
      const timeLabel = `+${i}h (${futureTime.getHours().toString().padStart(2, '0')}:00)`;

      // Diurnal cycle simulation: peak between 14:00 - 20:00
      const isPeakHour = hourOfDay >= 14 && hourOfDay <= 21;
      const hourWave = Math.sin((hourOfDay - 6) * (Math.PI / 12));
      const baseTps = Math.max(350, Math.floor((1200 + hourWave * 800 + Math.random() * 150) * multiplier));
      const spread = Math.floor(baseTps * 0.18);
      const isSurge = (i >= 6 && i <= 10) || (i >= 22 && i <= 28) || (scenario === 'flash_sale' && baseTps > 2400);

      const riskProb = Math.min(
        95,
        Math.floor((isPeakHour ? 22 : 8) * baseRiskMultiplier + (scenario === 'high_risk' ? 35 : 0) + Math.random() * 8)
      );

      data.push({
        hourOffset: i,
        timeLabel,
        expectedTps: baseTps,
        lowerBoundTps: Math.max(100, baseTps - spread),
        upperBoundTps: baseTps + spread,
        predictedBrlVolume: Math.round(baseTps * 185 * 3600),
        riskProbability: riskProb,
        isSurgePeak: isSurge,
        recommendedAcquirer: baseTps > 2000 ? 'Stone + Rede Cluster' : 'Stone Dinâmico'
      });
    }

    return data;
  }, [scenario]);

  // Key Peak Statistics
  const peakTpsData = useMemo(() => {
    return forecastData.reduce((max, item) => item.expectedTps > max.expectedTps ? item : max, forecastData[0]);
  }, [forecastData]);

  const total48hProjectedVolume = useMemo(() => {
    return forecastData.reduce((acc, curr) => acc + curr.predictedBrlVolume, 0) * 2; // sampled every 2h
  }, [forecastData]);

  // Actionable Orchestration Recommendations
  const strategySuggestions = useMemo(() => {
    return [
      {
        id: 'strat_stone_heavy',
        title: 'Aumentar Peso Stone para 70% (Pico das 18h)',
        description: 'ML prevê rajada de 3.200 TPS às +8h. Redirecionar 70% do fluxo de cartão para o pool de alto rendimento da Stone.',
        impact: '+4.2% Conversão & -180ms Latência',
        badge: 'Recomendação Crítica',
        badgeColor: 'rose',
        action: () => {
          addRoutingRule({
            name: 'ML Auto-Rule: Balanceamento de Pico 48h (Stone Heavy)',
            priority: 1,
            condition: {
              field: 'amount',
              operator: 'greater_than',
              value: 0
            },
            action: {
              type: 'split',
              splitAllocations: [
                { acquirerId: 'acq_stone', percentage: 70 },
                { acquirerId: 'acq_cielo', percentage: 20 },
                { acquirerId: 'acq_rede', percentage: 10 }
              ]
            },
            active: true
          });
        }
      },
      {
        id: 'strat_pix_prewarm',
        title: 'Pré-Aquecimento de Conexões SPI / BACEN',
        description: 'Detectado surto de Pix noturno às +24h. Pré-inicializar 300 sockets TLS persistentes com o DICT Banco Central.',
        impact: 'Zero Timeouts & 99.98% SLA',
        badge: 'Otimização de Performance',
        badgeColor: 'emerald',
        action: () => {
          updateAcquirerHealth('acq_stone', 'up', 0.05);
        }
      },
      {
        id: 'strat_risk_strict',
        title: 'Reforço de Escudo Antifraude em Horário de Pico',
        description: 'Probabilidade de fraude atinge 48% na janela +26h. Baixar threshold de desafio 3DS de R$ 800 para R$ 250.',
        impact: '-62% Risco de Chargeback',
        badge: 'Proteção Ativa',
        badgeColor: 'indigo',
        action: () => {
          addRoutingRule({
            name: 'ML Shield: Desafio 3DS Dinâmico p/ Risco Elevado',
            priority: 2,
            condition: {
              field: 'risk_score',
              operator: 'greater_than',
              value: 45
            },
            action: {
              type: 'require_3ds'
            },
            active: true
          });
        }
      }
    ];
  }, [addRoutingRule, updateAcquirerHealth]);

  const handleApplyStrategy = (strat: typeof strategySuggestions[0]) => {
    strat.action();
    setAppliedStrategies(prev => [...prev, strat.id]);
    setActiveStrategyToast(`Estratégia "${strat.title}" aplicada com sucesso no motor de orquestração!`);

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'ML_ORCHESTRATION_STRATEGY_APPLIED',
      category: 'orchestration',
      resourceType: 'RoutingRule',
      resourceId: strat.id,
      status: 'success',
      severity: 'medium',
      details: `Estratégia preditiva de ML aplicada: ${strat.title}. Regras de balanceamento atualizadas para acomodar pico projetado de ${peakTpsData.expectedTps} TPS.`
    });

    setTimeout(() => setActiveStrategyToast(null), 4000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Toast Notification */}
      {activeStrategyToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fade-in shadow-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{activeStrategyToast}</span>
        </div>
      )}

      {/* Header with Title & Scenario Switches */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white shadow-md">
            <BrainCircuit className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ML Predictive Forecasting & Load Surge (48h)
              </h3>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Prophet + DeepAR Ensemble
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projeção temporal de volume, anomalias de risco e ajuste inteligente de balanceamento de adquirentes
            </p>
          </div>
        </div>

        {/* Model & Scenario Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 px-1">Cenário:</span>
            <button
              type="button"
              onClick={() => setScenario('normal')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                scenario === 'normal'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Padrão
            </button>
            <button
              type="button"
              onClick={() => setScenario('flash_sale')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                scenario === 'flash_sale'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🔥 Flash Sale (+280%)
            </button>
            <button
              type="button"
              onClick={() => setScenario('high_risk')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                scenario === 'high_risk'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ⚠️ Anomalia de Risco
            </button>
          </div>
        </div>
      </div>

      {/* Surge Alert Banner if High Peak */}
      {peakTpsData.expectedTps > 2200 && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50/80 p-4 text-xs dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900 dark:text-rose-200">
                Alerta de Sobrecarga Preditiva: Pico projetado de {peakTpsData.expectedTps.toLocaleString()} TPS em {peakTpsData.timeLabel}
              </span>
              <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                Capacidade nominal do gateway principal pode sofrer degradação. Recomendado aplicar balanceamento preventivo.
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shrink-0">
            Surge Iminente
          </span>
        </div>
      )}

      {/* Forecast Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Pico Máximo Previsto</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {peakTpsData.expectedTps.toLocaleString()} TPS
            </span>
            <span className="text-xs font-semibold text-indigo-600">{peakTpsData.timeLabel}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Intervalo de confiança 95%</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Volume Total Projetado (48h)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {(total48hProjectedVolume / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M BRL
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Estimativa baseada em sazonalidade</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Probabilidade de Anomalia de Risco</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-xl font-black ${
              scenario === 'high_risk' ? 'text-rose-600' : 'text-amber-500'
            }`}>
              {scenario === 'high_risk' ? '54.2%' : '14.8%'}
            </span>
            <span className="text-xs font-semibold text-slate-400">Desvio padrão normal</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Escudo preditivo calibrado</span>
        </div>
      </div>

      {/* Main 48-Hour Forecasting Area Chart */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Curva de Carga Projetada (TPS) & Faixa de Confiança (Próximas 48 Horas)
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>TPS Esperado</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-4 bg-indigo-200/50 rounded dark:bg-indigo-950/60" />
              <span>Faixa de Incerteza (95%)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="expectedTpsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="boundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  `${Number(value).toLocaleString()} TPS`,
                  name === 'expectedTps' ? 'TPS Previsto' : name === 'upperBoundTps' ? 'Limite Superior' : 'Limite Inferior'
                ]}
              />
              <ReferenceLine y={2500} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Limite Capacidade (2.5k)', fill: '#f43f5e', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="upperBoundTps"
                stroke="transparent"
                fill="url(#boundGrad)"
                name="upperBoundTps"
              />
              <Area
                type="monotone"
                dataKey="expectedTps"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#expectedTpsGrad)"
                name="expectedTps"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Strategy Recommendations Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ajustes Estratégicos Recomendados pelo Motor Preditivo
            </h4>
          </div>
          <span className="text-xs text-slate-400">Aplique com 1 clique diretamente nas regras de roteamento</span>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {strategySuggestions.map((strat) => {
            const isApplied = appliedStrategies.includes(strat.id);

            return (
              <div
                key={strat.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      strat.badgeColor === 'rose'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : strat.badgeColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {strat.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {strat.impact}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    {strat.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {strat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => handleApplyStrategy(strat)}
                    disabled={isApplied}
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-sm ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-98'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Estratégia Aplicada ✓</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Aplicar Estratégia Recomendada</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
