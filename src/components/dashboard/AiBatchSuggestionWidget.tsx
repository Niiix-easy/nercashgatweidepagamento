import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Sparkles, CheckCircle2, XCircle, ShieldCheck, ArrowRight, Layers, Bot, Zap, Check } from 'lucide-react';

export const AiBatchSuggestionWidget: React.FC = () => {
  const { paymentIntents, processPaymentIntent, addAuditLog } = usePayment();
  const [selectedActionGroup, setSelectedActionGroup] = useState<string | null>(null);
  const [processedGroups, setProcessedGroups] = useState<string[]>([]);
  const [isExecutingBatch, setIsExecutingBatch] = useState(false);

  // Filter pending or requires_action intents
  const pendingIntents = paymentIntents.filter(i => i.status === 'requires_action' || i.status === 'processing');

  // Group pending intents by risk similarity / currency / amount tier
  const groups = [
    {
      id: 'group_micro_pix',
      title: 'Micro-transações Pix (R$ 10 - R$ 150)',
      count: pendingIntents.filter(i => i.method === 'pix' && i.amount <= 150).length || 8,
      totalVolume: pendingIntents.filter(i => i.method === 'pix' && i.amount <= 150).reduce((acc, c) => acc + c.amount, 0) || 840,
      suggestedAction: 'approve',
      confidence: '98.4%',
      reason: 'Padrão recorrente de baixo risco. Histórico de chargeback 0.01%.'
    },
    {
      id: 'group_recurring_cc',
      title: 'Assinaturas Cartão Corporativo (Trust Alto)',
      count: pendingIntents.filter(i => i.method === 'credit_card' && i.riskScore < 25).length || 5,
      totalVolume: pendingIntents.filter(i => i.method === 'credit_card' && i.riskScore < 25).reduce((acc, c) => acc + c.amount, 0) || 4750,
      suggestedAction: 'approve',
      confidence: '96.2%',
      reason: 'Clientes VIP com 3DS verificado e dispositivo conhecido.'
    },
    {
      id: 'group_high_risk',
      title: 'Anomalias de Dispositivo / IP Estrangeiro',
      count: pendingIntents.filter(i => i.riskScore >= 70).length || 3,
      totalVolume: pendingIntents.filter(i => i.riskScore >= 70).reduce((acc, c) => acc + c.amount, 0) || 6200,
      suggestedAction: 'reject',
      confidence: '94.8%',
      reason: 'Múltiplas tentativas com cartões distintos no mesmo fingerprint.'
    }
  ];

  const handleExecuteBatch = (groupId: string, action: string) => {
    setIsExecutingBatch(true);
    setTimeout(() => {
      setProcessedGroups(prev => [...prev, groupId]);
      setIsExecutingBatch(false);
      addAuditLog({
        action: `AI Batch ${action === 'approve' ? 'Approval' : 'Rejection'}`,
        category: 'security',
        resourceType: 'PaymentIntent',
        resourceId: groupId,
        status: 'success',
        details: `Executado lote automatizado por IA para o grupo ${groupId} com ação ${action}.`
      });
    }, 900);
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 shadow-sm dark:border-indigo-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-indigo-100 dark:border-indigo-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Batch Suggestion & Smart Clustering</span>
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                XGBoost v4.8
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agrupamento inteligente de transações pendentes para aprovação/rejeição em lote com 1 clique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="h-3.5 w-3.5" />
          <span>3 Lotes Otimizados</span>
        </div>
      </div>

      <div className="space-y-3.5">
        {groups.map(group => {
          const isProcessed = processedGroups.includes(group.id);

          return (
            <div 
              key={group.id}
              className={`rounded-2xl border p-4 transition-all ${
                isProcessed 
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    group.suggestedAction === 'approve' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {group.suggestedAction === 'approve' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{group.title}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md dark:bg-slate-800 dark:text-slate-300">
                        {group.count} transações (R$ {group.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {group.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block uppercase">Confiança IA</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {group.confidence}
                    </span>
                  </div>

                  {!isProcessed ? (
                    <button
                      type="button"
                      disabled={isExecutingBatch}
                      onClick={() => handleExecuteBatch(group.id, group.suggestedAction)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                        group.suggestedAction === 'approve'
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    >
                      <span>{group.suggestedAction === 'approve' ? 'Aprovar Lote' : 'Rejeitar Lote'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <Check className="h-4 w-4" />
                      <span>Lote Executado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
