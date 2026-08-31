import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { GitFork, Layers, Zap, ArrowRight, CheckCircle2, ShieldCheck, Play, Sparkles } from 'lucide-react';

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'pix' | 'card_failover' | 'anti_fraud' | 'international';
  description: string;
  stepsCount: number;
  estimatedLatency: string;
  successRate: string;
  nodes: Array<{ label: string; type: string; provider: string }>;
}

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl_high_volume_pix',
    name: 'High-Volume Pix Instant Routing',
    category: 'pix',
    description: 'Roteamento instantâneo otimizado para alta volumetria Pix com fallback automático para Banco Central / PSP primário e secundário.',
    stepsCount: 4,
    estimatedLatency: '110ms',
    successRate: '99.8%',
    nodes: [
      { label: 'Webhook Recebido', type: 'trigger', provider: 'Nercash Core' },
      { label: 'Validação Anti-Fraude & Limite', type: 'condition', provider: 'ML Guard' },
      { label: 'Split & Emissão QR Code Pix', type: 'action', provider: 'Banco Central / PSP A' },
      { label: 'Confirmação Instantânea (Webhook Callback)', type: 'output', provider: 'Merchant API' }
    ]
  },
  {
    id: 'tpl_global_card_failover',
    name: 'Global Card Failover & Multi-Acquirer',
    category: 'card_failover',
    description: 'Estratégia de failover em cascata para transações de cartão de crédito entre Cielo, Stone, Adyen e Stripe com re-tentativa inteligente (Smart Retry).',
    stepsCount: 5,
    estimatedLatency: '240ms',
    successRate: '99.4%',
    nodes: [
      { label: 'Autorização Cartão (BIN Check)', type: 'trigger', provider: 'Gateway Core' },
      { label: 'Tentativa Primária (Cielo API)', type: 'action', provider: 'Cielo' },
      { label: 'Tratamento de Erro 5xx / Time-out', type: 'condition', provider: 'Failover Engine' },
      { label: 'Failover Secundário (Stone / Adyen)', type: 'action', provider: 'Stone / Adyen' },
      { label: 'Confirmação de Captura', type: 'output', provider: 'Database' }
    ]
  },
  {
    id: 'tpl_b2b_split_settlement',
    name: 'B2B Marketplace Split Settlement',
    category: 'international',
    description: 'Divisão automática de pagamentos entre múltiplos fornecedores e comissão da plataforma com retenção de garantia (Escrow).',
    stepsCount: 4,
    estimatedLatency: '180ms',
    successRate: '99.9%',
    nodes: [
      { label: 'Captura Pagamento Marketplace', type: 'trigger', provider: 'Checkout API' },
      { label: 'Cálculo de Split Dinâmico (Taxas & Fornecedor)', type: 'compute', provider: 'Ledger Engine' },
      { label: 'Repasse Automático D+1 (PIX/TED)', type: 'action', provider: 'Banking Partner' },
      { label: 'Geração de Nota Fiscal & Recibo', type: 'output', provider: 'ERP Connector' }
    ]
  }
];

export const WorkflowTemplateLibrary: React.FC<{ onSelectTemplate: (template: WorkflowTemplate) => void }> = ({ onSelectTemplate }) => {
  const { addToast } = usePayment();
  const [selectedTpl, setSelectedTpl] = useState<WorkflowTemplate>(TEMPLATES[0]);

  const handleApplyTemplate = (tpl: WorkflowTemplate) => {
    setSelectedTpl(tpl);
    onSelectTemplate(tpl);
    addToast('Workflow Template Library', `Template "${tpl.name}" aplicado com sucesso ao canvas de roteamento low-code!`, 'success');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Template Library & Routing Patterns</h3>
            <p className="text-xs text-slate-500">Selecione padrões de pagamento validados pelo mercado para iniciar instantaneamente o design do grafo low-code</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Templates Disponíveis</h4>
          <div className="space-y-2.5">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTpl(tpl)}
                className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer space-y-2 ${
                  selectedTpl.id === tpl.id
                    ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{tpl.name}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {tpl.successRate} Sucesso
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>{tpl.stepsCount} Etapas</span>
                  <span>•</span>
                  <span>Latência média: {tpl.estimatedLatency}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/50 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Template Selecionado</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedTpl.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{selectedTpl.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyTemplate(selectedTpl)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Aplicar ao Canvas</span>
              </button>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Fluxo de Grafo Low-Code ({selectedTpl.stepsCount} Etapas)</h5>
              <div className="space-y-2">
                {selectedTpl.nodes.map((node, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-mono text-xs font-bold dark:bg-indigo-950 dark:text-indigo-300">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">{node.label}</span>
                      <span className="text-[11px] font-mono text-slate-400">Provedor/Módulo: {node.provider}</span>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 uppercase">
                      {node.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <p className="text-xs text-indigo-900 dark:text-indigo-200">
              Ao aplicar este template, o Orchestration Engine configurará automaticamente as regras de failover e os webhooks de rastreabilidade em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
