import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const SmartInsightsPanel: React.FC = () => {
  const { paymentIntents } = usePayment();
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string>('Há 3 minutos');

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setLastAnalyzedAt(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 mb-5 border-b border-indigo-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart Insights & LLM Payment Anomalies Analysis</span>
              <span className="rounded-full bg-indigo-900/80 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-700">
                Gemini 2.5 Pro Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Análise em linguagem natural de padrões comportamentais e anomalidades em tempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isAnalyzing}
          onClick={handleRunAiAnalysis}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-800 bg-indigo-900/60 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-800/80 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-indigo-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analisando Logs...' : `Atualizado (${lastAnalyzedAt})`}</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/40 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 mb-1">
                Padrão Anômalo Detectado na Região Sudeste
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                O motor Gemini identificou um pico de <strong className="text-white">14.2% em tentativas Pix de alto valor</strong> entre 02h e 04h utilizando fingerprints de dispositivos emulados. O roteador inteligente isolou automaticamente 18 transações de risco e aplicou desafio 3DS adicional, preservando o índice de aprovação global em 98.4%.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold mb-1">Recomendação de Roteamento</span>
            <p className="text-xs text-slate-300 leading-normal">
              Recomenda-se priorizar o adquirente <strong className="text-emerald-400">Stone / Cielo</strong> para cartões de crédito corporativos nas próximas 4 horas devido à queda de latência temporária na rede Rede.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold mb-1">Previsão de Chargeback</span>
            <p className="text-xs text-slate-300 leading-normal">
              A taxa projetada de chargeback para o ciclo semanal está em <strong className="text-emerald-400">0.08%</strong>, abaixo da média regulatória de 0.50% do Banco Central.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
