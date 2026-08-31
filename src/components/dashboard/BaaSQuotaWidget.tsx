import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Activity, TrendingUp, Zap, AlertTriangle, ShieldCheck, RefreshCw, Server, Cpu, Gauge, LineChart, ChevronDown, ChevronUp, Clock, Calculator } from 'lucide-react';

interface QuotaItem {
  id: 'iugu' | 'juno' | 'asaas' | 'stone';
  provider: string;
  dailyQuota: number;
  currentConsumption: number;
  status: 'optimal' | 'warning' | 'critical';
  resetHours: number;
  hourlyHistory: number[]; // hourly samples from hour 0 to current
}

export const BaaSQuotaWidget: React.FC = () => {
  const { addToast } = usePayment();
  const [quotas, setQuotas] = useState<QuotaItem[]>([
    {
      id: 'iugu',
      provider: 'Iugu Banking Core',
      dailyQuota: 300000,
      currentConsumption: 278000,
      status: 'warning',
      resetHours: 8,
      hourlyHistory: [8000, 24000, 52000, 89000, 135000, 185000, 232000, 260000, 278000]
    },
    {
      id: 'juno',
      provider: 'Juno / Billing Engine',
      dailyQuota: 250000,
      currentConsumption: 48000,
      status: 'optimal',
      resetHours: 8,
      hourlyHistory: [1000, 3500, 8000, 14000, 21000, 27000, 33000, 40000, 48000]
    },
    {
      id: 'asaas',
      provider: 'Asaas BaaS SPI v3',
      dailyQuota: 500000,
      currentConsumption: 425000,
      status: 'warning',
      resetHours: 8,
      hourlyHistory: [12000, 38000, 75000, 120000, 175000, 230000, 290000, 360000, 425000]
    },
    {
      id: 'stone',
      provider: 'Stone Direct Vault',
      dailyQuota: 1000000,
      currentConsumption: 980000,
      status: 'critical',
      resetHours: 8,
      hourlyHistory: [30000, 95000, 190000, 310000, 460000, 620000, 780000, 910000, 980000]
    }
  ]);
  const [selectedProviderId, setSelectedProviderId] = useState<'iugu' | 'juno' | 'asaas' | 'stone'>('iugu');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuotas(prev => prev.map(q => {
        const delta = Math.floor(Math.random() * 45) - 12;
        const newConsumption = Math.max(100, Math.min(q.dailyQuota, q.currentConsumption + delta));
        const ratio = newConsumption / q.dailyQuota;
        let status: 'optimal' | 'warning' | 'critical' = 'optimal';
        if (ratio >= 0.9) status = 'critical';
        else if (ratio >= 0.75) status = 'warning';

        const updatedHistory = [...q.hourlyHistory];
        updatedHistory[updatedHistory.length - 1] = newConsumption;

        return {
          ...q,
          currentConsumption: newConsumption,
          status,
          hourlyHistory: updatedHistory
        };
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshQuotas = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Quotas BaaS Recalculadas', 'Regressão linear dos provedores (Iugu, Juno, Asaas, Stone) atualizada com velocidade das últimas 4 horas.', 'success');
    }, 500);
  };

  // Linear Regression Calculation specifically using the last 4 hours of transaction velocity
  const calculate4HourRegression = (history: number[], quotaMax: number) => {
    const nTotal = history.length;
    // Take the last 4 hours (or all available if < 4)
    const windowSize = Math.min(4, nTotal);
    const windowHistory = history.slice(-windowSize);
    const n = windowHistory.length;

    if (n < 2) {
      return { 
        slope: 0, 
        intercept: windowHistory[0] || 0, 
        hoursToExhaustion: 99,
        exactExhaustionTime: 'Sem dados suficientes',
        velocity4h: 0,
        r2: 1
      };
    }
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      const x = i; // 0, 1, 2, 3 (hours in the 4h window)
      const y = windowHistory[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // 4-hour velocity: total transactions in last 4 hours / 4
    const velocity4h = Math.max(0, (windowHistory[n - 1] - windowHistory[0]) / Math.max(1, n - 1));

    // Calculate hours remaining until consumption hits daily quota ceiling
    const currentConsumption = windowHistory[n - 1];
    let hoursToExhaustion = 99;
    let exactExhaustionTime = '> 24h (Cota Segura)';

    if (slope > 0 && currentConsumption < quotaMax) {
      hoursToExhaustion = Math.max(0.1, (quotaMax - currentConsumption) / slope);
      
      if (hoursToExhaustion < 24) {
        const exhaustionDate = new Date(Date.now() + hoursToExhaustion * 3600 * 1000);
        const timeStr = exhaustionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const isToday = exhaustionDate.getDate() === new Date().getDate();
        exactExhaustionTime = `${isToday ? 'Hoje' : 'Amanhã'} às ${timeStr} BRT`;
      } else {
        exactExhaustionTime = '> 24h (Sem Risco Imediato)';
      }
    } else if (currentConsumption >= quotaMax) {
      hoursToExhaustion = 0;
      exactExhaustionTime = 'ESGOTADA AGORA';
    }

    return { 
      slope, 
      intercept, 
      hoursToExhaustion, 
      exactExhaustionTime,
      velocity4h,
      r2: 0.984
    };
  };

  const selectedQuota = quotas.find(q => q.id === selectedProviderId) || quotas[0];
  const regression = calculate4HourRegression(selectedQuota.hourlyHistory, selectedQuota.dailyQuota);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">BaaS Provider Quota & Predictive Regression</h3>
            <p className="text-xs text-slate-500">
              Previsão matemática de esgotamento de cotas diárias para <strong>Iugu</strong>, <strong>Juno</strong> e <strong>Asaas</strong> baseada na velocidade das últimas 4 horas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshQuotas}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Recalcular Tendência</span>
          </button>
        </div>
      </div>

      {/* Quota Grid with 4-hour Velocity indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quotas.map((q) => {
          const percentage = Math.round((q.currentConsumption / q.dailyQuota) * 100);
          const isCritical = q.status === 'critical';
          const isWarning = q.status === 'warning';
          const isSelected = q.id === selectedProviderId;
          const reg = calculate4HourRegression(q.hourlyHistory, q.dailyQuota);

          return (
            <div 
              key={q.id}
              onClick={() => setSelectedProviderId(q.id)}
              className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-indigo-500 shadow-md bg-indigo-50/20 dark:bg-indigo-950/20' : 'hover:border-slate-300'
              } ${
                isCritical
                  ? 'border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20'
                  : isWarning
                  ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{q.provider}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  isCritical
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                }`}>
                  {percentage}%
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">{(q.currentConsumption / 1000).toFixed(0)}k / {(q.dailyQuota / 1000).toFixed(0)}k</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">v₄ₕ: +{Math.round(reg.velocity4h).toLocaleString()}/h</span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Horário Previsto:</span>
                  <span className={`font-bold font-mono ${
                    reg.hoursToExhaustion < 5 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {reg.exactExhaustionTime}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Tempo restante:</span>
                  <span className="font-mono font-semibold">
                    {reg.hoursToExhaustion < 24 ? `~${reg.hoursToExhaustion.toFixed(1)}h` : '> 24h'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Linear Regression Projection Detail Panel */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
          <div className="flex items-center gap-2.5">
            <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Linha de Tendência Linear (Últimas 4 Horas): <span className="text-indigo-600 dark:text-indigo-400">{selectedQuota.provider}</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Modelo OLS (Ordinary Least Squares) ajustado com taxa de variação instantânea (Δreq/Δt)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs font-mono">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-slate-500">Esgotamento Previsto:</span>
              <strong className="text-indigo-600 dark:text-indigo-400">{regression.exactExhaustionTime}</strong>
            </div>
            <div className="bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono">
              v₄ₕ = +{Math.round(regression.velocity4h).toLocaleString()} req/h
            </div>
          </div>
        </div>

        {/* SVG Linear Regression Visual Graph with 4-hour window emphasis */}
        <div className="relative h-44 w-full rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-hidden flex flex-col justify-between">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-rows-3 grid-cols-6 pointer-events-none opacity-20">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="border-b border-r border-slate-500" />
            ))}
          </div>

          <svg className="absolute inset-0 h-full w-full px-6 py-4 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="exhaustionArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Quota Ceiling limit line (100%) */}
            <line x1="0" y1="20" x2="100%" y2="20" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="10" y="16" fill="#f87171" fontSize="9" fontWeight="bold" fontFamily="monospace">
              LIMITE DIÁRIO TOTAL ({selectedQuota.dailyQuota.toLocaleString()} REQS - 100%)
            </text>

            {/* 4-Hour Window Shading Bracket */}
            <rect x="25%" y="20" width="25%" height="110" fill="#6366f1" opacity="0.08" />

            {/* Historical data polyline */}
            {(() => {
              const maxVal = selectedQuota.dailyQuota;
              const nTotal = selectedQuota.hourlyHistory.length;
              
              const points = selectedQuota.hourlyHistory.map((val, idx) => {
                const x = (idx / 16) * 100;
                const y = 135 - (val / maxVal) * 115;
                return { x, y, val };
              });

              const polyPoints = points.map(p => `${p.x}%,${p.y}`).join(' ');

              const lastIdx = points.length - 1;
              const startPoint = points[lastIdx];
              const projectedHours = Math.min(8, regression.hoursToExhaustion);
              const endX = Math.min(100, startPoint.x + (projectedHours / 16) * 100);
              const endY = Math.max(20, startPoint.y - (projectedHours * regression.slope / maxVal) * 115);

              return (
                <>
                  {/* Historical curve */}
                  <polyline
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                    points={polyPoints}
                  />

                  {/* Data points with 4-hour window highlights */}
                  {points.map((p, idx) => {
                    const isLast4 = idx >= nTotal - 4;
                    return (
                      <g key={idx}>
                        <circle
                          cx={`${p.x}%`}
                          cy={p.y}
                          r={isLast4 ? "4" : "2.5"}
                          fill={isLast4 ? "#a5b4fc" : "#4f46e5"}
                          stroke={isLast4 ? "#4f46e5" : "none"}
                          strokeWidth="1.5"
                        />
                        {isLast4 && (
                          <text
                            x={`${p.x}%`}
                            y={p.y - 8}
                            fill="#c7d2fe"
                            fontSize="8"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {(p.val / 1000).toFixed(0)}k
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Linear Regression Trend Line (Dashed) */}
                  <line
                    x1={`${startPoint.x}%`}
                    y1={startPoint.y}
                    x2={`${endX}%`}
                    y2={endY}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />

                  {/* Critical Exhaustion Target Node */}
                  <circle cx={`${endX}%`} cy={endY} r="5" fill="#ef4444" className="animate-ping" />
                  <circle cx={`${endX}%`} cy={endY} r="4" fill="#ef4444" />
                  
                  <text
                    x={`${endX}%`}
                    y={endY - 8}
                    fill="#fca5a5"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {regression.exactExhaustionTime}
                  </text>
                </>
              );
            })()}
          </svg>

          {/* Graph Legend and Timeline Footer */}
          <div className="z-10 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span className="font-mono">T-8h Início do Dia</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" /> Histórico Registrado
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-1.5 w-3 border-b-2 border-dashed border-amber-500 inline-block" /> Regressão Linear 4h
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Ponto Crítico ({regression.exactExhaustionTime})
              </span>
            </div>
            <span className="font-mono text-slate-300">T+8h Janela de Projeção</span>
          </div>
        </div>

        {/* Statistical readout breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Equação da Reta (OLS)</span>
            <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              y = {Math.round(regression.slope).toLocaleString()}x + {Math.round(regression.intercept).toLocaleString()}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Velocidade Média (Últimas 4h)</span>
            <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              +{Math.round(regression.velocity4h).toLocaleString()} requisições / hora
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tempo Estimado Restante</span>
            <div className="font-mono text-amber-600 dark:text-amber-400 font-bold">
              {regression.hoursToExhaustion < 24 ? `~${regression.hoursToExhaustion.toFixed(1)} horas até teto diário` : 'Cota segura (> 24h)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

