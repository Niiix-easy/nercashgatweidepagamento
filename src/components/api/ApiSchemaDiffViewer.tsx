import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { GitCompare, AlertTriangle, CheckCircle2, ArrowRight, FileCode, ShieldAlert, Sparkles } from 'lucide-react';

export const ApiSchemaDiffViewer: React.FC = () => {
  const { addToast } = usePayment();
  const [versionA, setVersionA] = useState<string>('v1.8.4 (Stable)');
  const [versionB, setVersionB] = useState<string>('v2.0.0-rc1 (Next)');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const diffItems = [
    {
      field: 'POST /api/v1/payments/intent',
      changeType: 'breaking',
      description: 'Campo obrigatório "acquirer_routing_key" foi renomeado para "gateway_routing_hash".',
      impact: 'Alto - Risco de falha em transações legadas se não atualizado no payload.',
      recommendation: 'Atualizar payload do SDK ou configurar mapeamento de compatibilidade reversa.'
    },
    {
      field: 'GET /api/v1/charges/{id}',
      changeType: 'non_breaking',
      description: 'Adicionado campo opcional "pix_end_to_end_id" na resposta JSON.',
      impact: 'Baixo - Nenhum impacto em clientes existentes.',
      recommendation: 'Nenhuma ação necessária.'
    },
    {
      field: 'POST /api/v1/webhooks/verify',
      changeType: 'breaking',
      description: 'Header de assinatura alterado de "X-Nercash-Signature" para "X-Nercash-Sha256-HMAC".',
      impact: 'Crítico - Validação de webhooks falhará se o verificador não for atualizado.',
      recommendation: 'Atualizar middleware de validação de webhook no servidor do lojista.'
    }
  ];

  const handleRunDiffAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      addToast('API Schema Diff', `Comparação concluída entre ${versionA} e ${versionB}. Detectadas 2 mudanças críticas (breaking) e 1 adição.`, 'warning');
    }, 700);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">API Schema Diff Viewer & Breaking Change Detector</h3>
              <p className="text-xs text-slate-500">Compare contratos OpenAPI entre versões para identificar impactos imediatos na integração do lojista</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300">De:</span>
              <select
                value={versionA}
                onChange={(e) => setVersionA(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold text-indigo-600 outline-none dark:text-indigo-400"
              >
                <option>v1.8.4 (Stable)</option>
                <option>v1.7.0</option>
              </select>
              <span className="text-slate-400">para</span>
              <select
                value={versionB}
                onChange={(e) => setVersionB(e.target.value)}
                className="bg-transparent font-mono text-xs font-bold text-emerald-600 outline-none dark:text-emerald-400"
              >
                <option>v2.0.0-rc1 (Next)</option>
                <option>v1.9.0-beta</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleRunDiffAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <GitCompare className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Comparando...' : 'Analisar Diff'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Relatório de Impacto Contratual (Breaking Changes)</h4>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                2 Breaking Changes
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                1 Adição Segura
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {diffItems.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                  item.changeType === 'breaking'
                    ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                    : 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-indigo-500" />
                    {item.field}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.changeType === 'breaking'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {item.changeType === 'breaking' ? '⚠️ BREAKING CHANGE' : '✓ NON-BREAKING'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Impacto:</span>
                    <span className="text-slate-800 dark:text-slate-200">{item.impact}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block">Remediação Recomendada:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
