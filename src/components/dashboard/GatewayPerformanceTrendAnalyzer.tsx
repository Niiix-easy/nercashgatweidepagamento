import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { TrendingUp, Activity, Zap, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const trendData = [
  { time: '08:00', latency: 85, load: 32, predictedLatency: 82 },
  { time: '10:00', latency: 98, load: 45, predictedLatency: 95 },
  { time: '12:00', latency: 145, load: 78, predictedLatency: 130 },
  { time: '14:00', latency: 132, load: 71, predictedLatency: 125 },
  { time: '16:00', latency: 110, load: 55, predictedLatency: 105 },
  { time: '18:00', latency: 180, load: 92, predictedLatency: 165 },
  { time: '20:00', latency: 95, load: 40, predictedLatency: 90 },
];

export const GatewayPerformanceTrendAnalyzer: React.FC = () => {
  const { addToast } = usePayment();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshTrends = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      addToast('Gateway Trend Analyzer', 'Tendências de latência e correlação de carga atualizadas com dados em tempo real.', 'success');
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gateway Performance Trend & Load Correlation Analyzer</h3>
            <p className="text-xs text-slate-500">Correlação histórica de latência de API com carga do sistema e projeção preditiva por machine learning</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshTrends}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-500 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Correlação'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="latency" name="Latência Real (ms)" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="predictedLatency" name="Latência Preditiva (ML)" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="load" name="Carga Sistema (%)" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Insights de Gargalo & Rotas</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-white block">Pico de Carga às 18:00</strong>
                <span className="text-slate-500 text-[11px]">Latência sobe para 180ms devido ao volume de webhooks simultâneos.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-white block">Rota Stone/Cielo Otimizada</strong>
                <span className="text-slate-500 text-[11px]">O modelo preditivo recomenda balanceamento dinâmico em horários de pico.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
