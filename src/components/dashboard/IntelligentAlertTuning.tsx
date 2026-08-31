import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Sliders, Bell, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Activity } from 'lucide-react';

export const IntelligentAlertTuning: React.FC = () => {
  const { addToast } = usePayment();
  const [sensitivity, setSensitivity] = useState<number>('medium' as any);
  const [suppressionActive, setSuppressionActive] = useState<boolean>(true);
  const [dynamicThreshold, setDynamicThreshold] = useState<number>(350); // ms
  const [isTuning, setIsTuning] = useState<boolean>(false);
  const [tuningStats, setTuningStats] = useState({
    alertsSuppressedToday: 142,
    noiseReductionPercent: 78.4,
    falsePositiveRate: '1.2%'
  });

  const handleRunTuning = () => {
    setIsTuning(true);
    setTimeout(() => {
      const newThreshold = sensitivity === 'high' ? 250 : sensitivity === 'medium' ? 350 : 500;
      setDynamicThreshold(newThreshold);
      setTuningStats({
        alertsSuppressedToday: Math.floor(120 + Math.random() * 50),
        noiseReductionPercent: Number((75 + Math.random() * 10).toFixed(1)),
        falsePositiveRate: `${(0.8 + Math.random() * 0.8).toFixed(1)}%`
      });
      setIsTuning(false);
      addToast('Intelligent Alert Tuning', `Limiar dinâmico recalculado para ${newThreshold}ms com base no throughput histórico. Ruído suprimido em ${tuningStats.noiseReductionPercent}%.`, 'success');
    }, 700);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Intelligent Alert Tuning & Noise Suppression</h3>
            <p className="text-xs text-slate-500">Elimine o 'alert fatigue' ajustando dinamicamente limiares de latência baseados no throughput histórico e desvio estatístico</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunTuning}
          disabled={isTuning}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-500 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isTuning ? 'animate-spin' : ''}`} />
          <span>{isTuning ? 'Recalculando ML...' : 'Executar Tuner Automático'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Limiar Dinâmico Ativo</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {dynamicThreshold} ms
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Ideal para Throughput
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alertas Suprimidos (Hoje)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {tuningStats.alertsSuppressedToday}
            </span>
            <span className="text-xs text-emerald-600 font-bold">-{tuningStats.noiseReductionPercent}% Ruído</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Taxa de Falsos Positivos</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {tuningStats.falsePositiveRate}
            </span>
            <span className="text-xs text-slate-500">Alta Precisão ML</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Sensibilidade do Modelo de Anomalia</label>
          <div className="grid grid-cols-3 gap-2">
            {(['high', 'medium', 'conservative'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSensitivity(lvl as any)}
                className={`rounded-xl border p-3 text-center text-xs font-bold transition-all cursor-pointer ${
                  sensitivity === lvl
                    ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                {lvl === 'high' ? 'Alta (Rigoroso)' : lvl === 'medium' ? 'Equilibrado' : 'Conservador'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Supressão de Ruído Repetitivo</span>
            <button
              type="button"
              onClick={() => setSuppressionActive(!suppressionActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${suppressionActive ? 'bg-amber-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${suppressionActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Quando ativado, picos de latência transientes que retornam à normalidade em &lt;15s são silenciados automaticamente para evitar cansaço de alertas da equipe de plantão.
          </p>
        </div>
      </div>
    </div>
  );
};
