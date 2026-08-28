import React, { useState, useEffect, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { FloatingQuickActionsBar, QuickActionOption } from '../common/FloatingQuickActionsBar';
import { 
  Cpu, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Sliders, 
  History, 
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Eye,
  Info,
  Download,
  FileJson,
  FileSpreadsheet,
  Share2,
  Split,
  Trophy,
  Percent,
  TrendingUp,
  BarChart3,
  Flame,
  ArrowUpRight,
  ShieldAlert,
  Save,
  Clock,
  FileText,
  FileDown
} from 'lucide-react';
import { RoutingRule, PaymentIntent, PaymentMethodType } from '../../types/payment';
import { OrchestrationStatsPanel } from './OrchestrationStatsPanel';

export const OrchestrationHub: React.FC = () => {
  const { 
    acquirers, 
    routingRules, 
    paymentIntents, 
    processPaymentIntent, 
    addRoutingRule, 
    toggleRoutingRule, 
    deleteRoutingRule,
    refundPaymentIntent,
    currentTenant
  } = usePayment();

  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'rules' | 'intents' | 'ab_testing'>('simulator');
  const [selectedIntentForModal, setSelectedIntentForModal] = useState<PaymentIntent | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Auto-save Mechanism State (saves graph & rules to sessionStorage every 30s)
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Selection states for quick actions
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [selectedIntentIds, setSelectedIntentIds] = useState<string[]>([]);

  // 30-Second Auto-save effect
  useEffect(() => {
    // Initial auto-save timestamp
    setLastAutoSaved(new Date().toLocaleTimeString('pt-BR'));

    const autoSaveInterval = setInterval(() => {
      setIsAutoSaving(true);
      try {
        const payload = {
          timestamp: new Date().toISOString(),
          routingRules,
          abExperiment: {
            abSplitPercentage,
            abProviderA,
            abProviderB,
            abExperimentStatus
          },
          tenant: currentTenant.id
        };
        sessionStorage.setItem('nercash_orchestration_autosave', JSON.stringify(payload));
        setLastAutoSaved(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.warn('Auto-save error:', err);
      } finally {
        setTimeout(() => setIsAutoSaving(false), 600);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [routingRules, currentTenant.id]);

  // A/B Testing State
  const [abSplitPercentage, setAbSplitPercentage] = useState<number>(5); // 5% canary traffic to Provider B
  const [abProviderA, setAbProviderA] = useState<string>('acq_stone');
  const [abProviderB, setAbProviderB] = useState<string>('acq_mp');
  const [abExperimentStatus, setAbExperimentStatus] = useState<'running' | 'paused' | 'concluded'>('running');
  const [abSimulatedStream, setAbSimulatedStream] = useState<{ id: string; amount: number; provider: string; approved: boolean; latency: number }[]>([
    { id: 'tx_ab_101', amount: 350.00, provider: 'Stone (95% Control)', approved: true, latency: 26 },
    { id: 'tx_ab_102', amount: 890.00, provider: 'Stone (95% Control)', approved: true, latency: 28 },
    { id: 'tx_ab_103', amount: 120.00, provider: 'Stone (95% Control)', approved: true, latency: 24 },
    { id: 'tx_ab_104', amount: 1500.00, provider: 'Mercado Pago (5% Canary)', approved: true, latency: 21 },
    { id: 'tx_ab_105', amount: 480.00, provider: 'Stone (95% Control)', approved: true, latency: 29 },
  ]);
  const [abTestWinnerPromoted, setAbTestWinnerPromoted] = useState<boolean>(false);

  // Form states for simulator
  const [simAmount, setSimAmount] = useState<number>(850.00);
  const [simMethod, setSimMethod] = useState<PaymentMethodType>('credit_card');
  const [simName, setSimName] = useState<string>('Carlos Eduardo Mendes');
  const [simEmail, setSimEmail] = useState<string>('carlos.mendes@empresa.com.br');
  const [simDoc, setSimDoc] = useState<string>('193.402.812-44');
  const [simCardNumber, setSimCardNumber] = useState<string>('3410 4402 9912 3019'); // Itaú BIN
  const [simInstallments, setSimInstallments] = useState<number>(3);
  const [simIsVpn, setSimIsVpn] = useState<boolean>(false);
  const [simErrorType, setSimErrorType] = useState<'none' | 'technical_timeout' | 'bank_declined'>('none');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<PaymentIntent | null>(null);

  // Form state for creating a new routing rule
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleDesc, setNewRuleDesc] = useState<string>('');
  const [newRulePriority, setNewRulePriority] = useState<number>(5);
  const [newRuleMethod, setNewRuleMethod] = useState<PaymentMethodType | ''>('credit_card');
  const [newRuleBinBank, setNewRuleBinBank] = useState<string>('');
  const [newRuleMinAmount, setNewRuleMinAmount] = useState<string>('');
  const [newRulePrimaryAcq, setNewRulePrimaryAcq] = useState<string>(acquirers[0]?.id || '');
  const [newRuleAntifraud, setNewRuleAntifraud] = useState<'clearsale' | 'konduto' | 'internal_ml' | 'none'>('clearsale');
  const [newRuleFallback, setNewRuleFallback] = useState<string[]>([]);

  // Function to download comprehensive Configuration Summary in Markdown
  const handleDownloadConfigSummaryMarkdown = () => {
    const timestamp = new Date().toLocaleString('pt-BR');
    const activeRulesCount = routingRules.filter(r => r.active).length;
    const onlineAcquirersCount = acquirers.filter(a => a.healthStatus === 'up' && !a.circuitBreakerTripped).length;

    let md = `# Resumo de Configuração de Roteamento Inteligente & Orquestração
**Plataforma:** Nercash Payment Orchestration Core v3.2  
**Tenant:** ${currentTenant.name} (${currentTenant.customDomain})  
**Data de Emissão:** ${timestamp}  
**SLA Global Contratual:** 99.99% • PCI-DSS Level 1 Compliance  

---

## 1. Visão Executiva de Orquestração
- **Total de Regras Configuradas:** ${routingRules.length} (${activeRulesCount} ativas, ${routingRules.length - activeRulesCount} pausadas)
- **Provedores de Pagamento Conectados:** ${acquirers.length} (${onlineAcquirersCount} operando com 100% de saúde)
- **Modo de Contingência (Failover Automático):** Habilitado (Timeout Limiar: 1000ms)
- **Engine Antifraude / ML:** Híbrido (XGBoost v2.4 + ClearSale/Konduto Step-up)
- **A/B Testing Canary Traffic:** ${abExperimentStatus === 'running' ? `Ativo (${abSplitPercentage}% para ${abProviderB})` : 'Inativo'}

---

## 2. Matriz de Regras de Roteamento Inteligente (Ordem de Avaliação em Cascata)

| Prioridade | Nome da Regra | Condição / Gatilho | Adquirente Primário | Cascata Fallback | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${routingRules.map(r => {
  const prio = r.priority;
  const conds = [
    r.condition.binBank ? `BIN: ${r.condition.binBank}` : '',
    r.condition.minAmount ? `Valor >= R$ ${r.condition.minAmount}` : '',
    r.condition.method ? `Método: ${r.condition.method.toUpperCase()}` : ''
  ].filter(Boolean).join('; ') || 'Geral (Default)';
  const primAcq = acquirers.find(a => a.id === r.action.primaryAcquirerId)?.name || r.action.primaryAcquirerId;
  const fallbacks = (r.action.fallbackAcquirerIds || []).map(fId => acquirers.find(a => a.id === fId)?.name || fId).join(' -> ') || 'Nenhum';
  const status = r.active ? '🟢 ATIVA' : '⏸️ PAUSADA';
  return `| **#${prio}** | ${r.name} | ${conds} | **${primAcq}** | ${fallbacks} | ${status} |`;
}).join('\n')}

---

## 3. Topologia de Provedores de Pagamento & Saúde Operacional

| Provedor | Código Interno | Latência Média | Taxa Erro (1m) | MDR Base | Circuit Breaker | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${acquirers.map(a => {
  const cb = a.circuitBreakerTripped ? '⚠️ DISPARADO' : '🛡️ NORMAL';
  const status = a.healthStatus === 'up' ? '🟢 ONLINE' : '🔴 DEGRADADO';
  return `| **${a.name}** | \`${a.id}\` | ${a.latencyMs}ms | ${a.errorRate1m.toFixed(2)}% | ${a.feePercentage}% | ${cb} | ${status} |`;
}).join('\n')}

---

## 4. Política de Contingência & Estratégia de Fallback (Circuit Breaker)
1. **Deteção de Anomalia:** Se um adquirente registrar taxa de erro > 15% em janela deslizante de 60s, o circuit breaker entra em modo *Half-Open*.
2. **Cascata de Transbordo (Zero Downtime):** Requisições são automaticamente direcionadas para a 2ª adquirente da regra ativa em < 120ms.
3. **Retentativa Inteligente com Re-tokenização:** Token PAN é re-submetido no HSM sem solicitar dados novamente ao comprador.

---

## 5. Experimento de Tráfego A/B Canary
- **Provedor Controle (A):** ${acquirers.find(a => a.id === abProviderA)?.name || abProviderA} (95% do volume)
- **Provedor Canary (B):** ${acquirers.find(a => a.id === abProviderB)?.name || abProviderB} (${abSplitPercentage}% do volume)
- **Objetivo:** Avaliar taxas de conversão líquida e ganho de MDR sem impacto no checkout principal.

---
*Documento gerado automaticamente pelo Nercash Payment Orchestration Engine. Assinado digitalmente para conformidade PCI-DSS.*
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_config_summary_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback('Resumo de Configuração baixado com sucesso em formato Markdown (.md)!');
    setTimeout(() => setExportFeedback(null), 4000);
  };

  // Bulk operations on Rules
  const handleBulkToggleRules = (activate: boolean) => {
    selectedRuleIds.forEach(id => {
      const rule = routingRules.find(r => r.id === id);
      if (rule && rule.active !== activate) {
        toggleRoutingRule(id);
      }
    });
    setExportFeedback(`${selectedRuleIds.length} regras ${activate ? 'ativadas' : 'pausadas'} com sucesso!`);
    setSelectedRuleIds([]);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleBulkDeleteRules = () => {
    selectedRuleIds.forEach(id => deleteRoutingRule(id));
    setExportFeedback(`${selectedRuleIds.length} regras excluídas com sucesso.`);
    setSelectedRuleIds([]);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const rulesQuickActions: QuickActionOption[] = [
    {
      id: 'rule_act',
      label: 'Ativar Selecionadas',
      shortcut: 'A',
      icon: <Check className="h-3.5 w-3.5" />,
      variant: 'success',
      impactDescription: 'Ativa as regras de roteamento selecionadas no motor dinâmico. O tráfego transacional passará a avaliar as novas condições em tempo real.',
      onClick: () => handleBulkToggleRules(true)
    },
    {
      id: 'rule_pause',
      label: 'Pausar Selecionadas',
      shortcut: 'X',
      icon: <XCircle className="h-3.5 w-3.5" />,
      variant: 'warning',
      impactDescription: 'Desativa temporariamente a aplicação destas regras. As transações elegíveis cairão nas regras prioritárias ou no gateway padrão.',
      onClick: () => handleBulkToggleRules(false)
    },
    {
      id: 'rule_export',
      label: 'Exportar Resumo (.md)',
      shortcut: 'E',
      icon: <FileDown className="h-3.5 w-3.5" />,
      variant: 'primary',
      impactDescription: 'Gera e baixa um arquivo de documentação técnica em Markdown contendo a arquitetura e os parâmetros das regras selecionadas.',
      onClick: handleDownloadConfigSummaryMarkdown
    }
  ];

  // Bulk operations on Payment Intents
  const handleBulkRefundIntents = () => {
    selectedIntentIds.forEach(id => refundPaymentIntent(id));
    setExportFeedback(`${selectedIntentIds.length} transações enviadas para estorno com sucesso.`);
    setSelectedIntentIds([]);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const intentsQuickActions: QuickActionOption[] = [
    {
      id: 'intent_refund',
      label: 'Estornar Selecionadas',
      shortcut: 'R',
      icon: <RotateCcw className="h-3.5 w-3.5" />,
      variant: 'danger',
      impactDescription: 'Executa a chamada de estorno integral de saldo junto às adquirentes de cada transação selecionada.',
      warningNote: 'Atenção: Ação financeira irreversível com notificação imediata aos bancos emissores.',
      onClick: handleBulkRefundIntents
    },
    {
      id: 'intent_export',
      label: 'Exportar CSV',
      shortcut: 'E',
      icon: <Download className="h-3.5 w-3.5" />,
      variant: 'primary',
      impactDescription: 'Compila todos os metadados das transações selecionadas (Score ML, Adquirente, Tentativas, Latência) em planilha CSV formatada.',
      onClick: () => handleExportCSV('intents')
    }
  ];

  // Export functions
  const handleExportJSON = (type: 'all' | 'rules' | 'metrics') => {
    let exportData: any = {};
    const timestamp = new Date().toISOString();

    if (type === 'rules' || type === 'all') {
      exportData.routingRules = routingRules;
      exportData.acquirers = acquirers;
    }

    if (type === 'metrics' || type === 'all') {
      const approvedCount = paymentIntents.filter(p => p.status === 'approved').length;
      const declinedCount = paymentIntents.filter(p => p.status === 'declined').length;
      const totalVolume = paymentIntents
        .filter(p => p.status === 'approved')
        .reduce((acc, curr) => acc + curr.amount, 0);

      exportData.metrics = {
        totalIntents: paymentIntents.length,
        approvedCount,
        declinedCount,
        approvalRate: paymentIntents.length > 0 ? (approvedCount / paymentIntents.length) * 100 : 0,
        totalVolumeBRL: totalVolume,
        acquirerBreakdown: acquirers.map(a => ({
          name: a.name,
          provider: a.provider,
          healthStatus: a.healthStatus,
          latencyMs: a.latencyMs,
          errorRate1m: a.errorRate1m,
          feePercentage: a.feePercentage,
          circuitBreakerTripped: a.circuitBreakerTripped
        }))
      };
      exportData.intents = paymentIntents;
    }

    exportData.metadata = {
      system: 'Nercash Smart Routing Engine v3.2',
      exportedAt: timestamp,
      tenant: 'Nercash Core Platform'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_routing_${type}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`Arquivo JSON (${type}) exportado com sucesso!`);
    setTimeout(() => setExportFeedback(null), 3500);
    setShowExportModal(false);
  };

  const handleExportCSV = (type: 'rules' | 'metrics' | 'intents') => {
    let csvContent = '';
    let filename = '';

    if (type === 'rules') {
      filename = `nercash_routing_rules_${Date.now()}.csv`;
      csvContent = 'ID,Nome,Descricao,Prioridade,Status,Metodo,BIN_Banco,Valor_Minimo,Adquirente_Primaria,Antifraude,Fallback_Chain\n';
      routingRules.forEach(rule => {
        const row = [
          `"${rule.id}"`,
          `"${rule.name.replace(/"/g, '""')}"`,
          `"${rule.description.replace(/"/g, '""')}"`,
          rule.priority,
          rule.active ? 'Ativa' : 'Inativa',
          `"${rule.condition.method || 'Todos'}"`,
          `"${rule.condition.binBank || 'Qualquer'}"`,
          rule.condition.minAmount || 0,
          `"${rule.action.primaryAcquirerId}"`,
          `"${rule.action.antifraudProvider}"`,
          `"${rule.action.fallbackChain.join(' -> ')}"`
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (type === 'metrics') {
      filename = `nercash_acquirer_metrics_${Date.now()}.csv`;
      csvContent = 'ID,Adquirente,Provedor,Status_Saude,Latencia_ms,Taxa_Erro_1min,Taxa_MDR_Pct,Circuit_Breaker\n';
      acquirers.forEach(acq => {
        const row = [
          `"${acq.id}"`,
          `"${acq.name}"`,
          `"${acq.provider}"`,
          `"${acq.healthStatus}"`,
          acq.latencyMs,
          `${acq.errorRate1m}%`,
          `${acq.feePercentage}%`,
          acq.circuitBreakerTripped ? 'Desarmado (Down)' : 'Armado (Ativo)'
        ].join(',');
        csvContent += row + '\n';
      });
    } else if (type === 'intents') {
      filename = `nercash_payment_intents_${Date.now()}.csv`;
      csvContent = 'ID,Status,Valor_BRL,Metodo,Cliente_Nome,Cliente_Email,Adquirente_Usada,Score_Risco,Antifraude_Status,Tentativas_Failover,Timestamp\n';
      paymentIntents.forEach(pi => {
        const row = [
          `"${pi.id}"`,
          `"${pi.status}"`,
          pi.amount.toFixed(2),
          `"${pi.method}"`,
          `"${(pi.customerName || 'Cliente').replace(/"/g, '""')}"`,
          `"${pi.customerEmail || 'cliente@email.com'}"`,
          `"${pi.selectedAcquirerId}"`,
          pi.riskScore,
          `"${pi.antifraudDecision}"`,
          pi.attempts.length,
          `"${pi.createdAt}"`
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(`Arquivo CSV (${type}) exportado com sucesso!`);
    setTimeout(() => setExportFeedback(null), 3500);
    setShowExportModal(false);
  };

  // Executa simulação
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    setSimResult(null);

    try {
      const intent = await processPaymentIntent({
        amount: Number(simAmount),
        method: simMethod,
        customerName: simName,
        customerEmail: simEmail,
        customerDocument: simDoc,
        cardNumber: simMethod === 'credit_card' ? simCardNumber : undefined,
        cardInstallments: simInstallments,
        simulateError: simErrorType,
        isVpn: simIsVpn
      });

      setSimResult(intent);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRulePrimaryAcq) return;

    addRoutingRule({
      merchantId: 'merchant_default',
      name: newRuleName,
      description: newRuleDesc || 'Regra personalizada de roteamento inteligente Nercash',
      priority: Number(newRulePriority),
      active: true,
      condition: {
        method: newRuleMethod ? (newRuleMethod as PaymentMethodType) : undefined,
        binBank: newRuleBinBank || undefined,
        minAmount: newRuleMinAmount ? Number(newRuleMinAmount) : undefined
      },
      action: {
        primaryAcquirerId: newRulePrimaryAcq,
        antifraudProvider: newRuleAntifraud,
        fallbackChain: newRuleFallback.length > 0 ? newRuleFallback : acquirers.filter(a => a.id !== newRulePrimaryAcq).map(a => a.id)
      }
    });

    setShowAddRuleModal(false);
    setNewRuleName('');
    setNewRuleDesc('');
    setNewRuleBinBank('');
    setNewRuleMinAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Export Toast Notification */}
      {exportFeedback && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs & Export Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Nercash Payment Intelligence & Orchestration Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pipeline de decisão preditiva, regras condicionais, failover multi-adquirente e exportação de telemetria
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 30s Auto-Save Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoSaving ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold">{isAutoSaving ? 'Salvando...' : 'Auto-save (30s)'}</span>
            {lastAutoSaved && (
              <span className="font-mono text-[10px] text-slate-400">
                • {lastAutoSaved}
              </span>
            )}
          </div>

          {/* Download Config Summary (.md) Trigger */}
          <button
            id="btn-download-config-summary-md"
            type="button"
            onClick={handleDownloadConfigSummaryMarkdown}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            title="Gera e faz download de um documento Markdown completo com todas as regras, adquirentes e estratégias"
          >
            <FileDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Baixar Resumo (.md)</span>
          </button>

          {/* Export Button */}
          <button
            id="btn-export-orchestration"
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exportar Configs</span>
          </button>

          {/* Sub-tab navigation */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setActiveSubTab('simulator')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Play className="h-3.5 w-3.5 text-emerald-500" />
              <span>Simulador / Test Lab</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rules')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'rules'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-500" />
              <span>Regras de Roteamento ({routingRules.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('intents')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'intents'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5 text-emerald-500" />
              <span>Histórico de Intents ({paymentIntents.length})</span>
            </button>

            <button
              id="tab-ab-testing"
              onClick={() => setActiveSubTab('ab_testing')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'ab_testing'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Split className="h-3.5 w-3.5 text-indigo-500" />
              <span>A/B Testing Canary ({abSplitPercentage}%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Exportar Configurações & Métricas Nercash
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gere arquivos estruturados em formato JSON ou CSV para auditoria e BI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Option 1: Full JSON Package */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileJson className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Pacote Completo de Orquestração (JSON)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Todas as regras ativas, adquirentes, métricas calculadas e log de intents.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportJSON('all')}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-indigo-500"
                  >
                    Baixar JSON
                  </button>
                </div>
              </div>

              {/* Option 2: Routing Rules JSON & CSV */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sliders className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Regras de Roteamento & Failover
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Configurações condicionais de prioridade, BIN e adquirentes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJSON('rules')}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportCSV('rules')}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 3: Acquirer Performance Metrics */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Métricas de Sucesso & Adquirentes
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Latências médias, taxas de erro 1m, MDR e circuit breakers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExportJSON('metrics')}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportCSV('metrics')}
                      className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-amber-500"
                    >
                      CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Option 4: Payment Intents Transaction Log */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Log de Transações & Intents ({paymentIntents.length})
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Histórico completo com decisões de antifraude e failover.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCSV('intents')}
                    className="rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-teal-500"
                  >
                    Baixar CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. SUB-TAB: SIMULATOR / TEST LAB */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Transaction Input Controls (5 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Parâmetros de Entrada da Transação
                </h3>
              </div>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Live Test
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Valor & Método */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Método
                  </label>
                  <select
                    value={simMethod}
                    onChange={(e) => setSimMethod(e.target.value as PaymentMethodType)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="pix">PIX Instantâneo</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="wallet">Carteira Digital</option>
                  </select>
                </div>
              </div>

              {/* Dados do Comprador */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Nome do Comprador
                </label>
                <input
                  type="text"
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    CPF / Documento
                  </label>
                  <input
                    type="text"
                    value={simDoc}
                    onChange={(e) => setSimDoc(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Cartão & Parcelas (se aplicável) */}
              {simMethod === 'credit_card' && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        Número do Cartão (BIN Itaú 341)
                      </label>
                      <input
                        type="text"
                        value={simCardNumber}
                        onChange={(e) => setSimCardNumber(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        Parcelas
                      </label>
                      <select
                        value={simInstallments}
                        onChange={(e) => setSimInstallments(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value={1}>1x à vista</option>
                        <option value={3}>3x sem juros</option>
                        <option value={6}>6x sem juros</option>
                        <option value={12}>12x parcelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulação de Cenários de Erro / Anomalias */}
              <div className="space-y-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 dark:border-amber-950 dark:bg-amber-950/20">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                  Cenários de Teste de Contingência:
                </span>
                
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="simErrorType"
                      checked={simErrorType === 'none'}
                      onChange={() => setSimErrorType('none')}
                      className="text-indigo-600"
                    />
                    <span>Fluxo Normal (100% Sucesso na 1ª tentativa)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="simErrorType"
                      checked={simErrorType === 'technical_timeout'}
                      onChange={() => setSimErrorType('technical_timeout')}
                      className="text-indigo-600"
                    />
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Simular Timeout na 1ª Adquirente (&gt;1000ms Failover Automático)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="simErrorType"
                      checked={simErrorType === 'bank_declined'}
                      onChange={() => setSimErrorType('bank_declined')}
                      className="text-indigo-600"
                    />
                    <span className="text-rose-700 dark:text-rose-400">
                      Simular Recusa Bancária (Saldo insuficiente / Bloqueio emissor)
                    </span>
                  </label>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={simIsVpn}
                        onChange={(e) => setSimIsVpn(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Simular Conexão Suspeita (VPN / IP Estrangeiro)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botão de Disparo */}
              <button
                onClick={handleRunSimulator}
                disabled={isSimulating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>Executando Pipeline de Decisão...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Executar Pipeline de Orquestração</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Decision Tree Execution (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Árvore de Decisão em Tempo Real
                  </h3>
                </div>
                {simResult && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                    simResult.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    Status Final: {simResult.status.toUpperCase()}
                  </span>
                )}
              </div>

              {!simResult ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <Cpu className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600 stroke-1" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Aguardando execução do pipeline
                  </p>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    Configure os parâmetros à esquerda e clique em &quot;Executar Pipeline&quot; para visualizar a decisão do XGBoost e a cadeia de failover.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Step 1: Risk Model Evaluation */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                          1
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Payment Intelligence: Modelo de Risco (XGBoost)
                        </span>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        simResult.riskScore > 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        Risk Score: {simResult.riskScore} / 100 ({simResult.riskLevel})
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                        <span className="text-slate-400">Device Trust:</span>
                        <p className="font-semibold">{simResult.riskFeatures.deviceTrust}%</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                        <span className="text-slate-400">Velocity:</span>
                        <p className="font-semibold">{simResult.riskFeatures.velocityScore}/100</p>
                      </div>
                      <div className="rounded-lg bg-white p-2 dark:bg-slate-900">
                        <span className="text-slate-400">BIN Risk:</span>
                        <p className="font-semibold">{simResult.riskFeatures.cardBinRisk}%</p>
                      </div>
                    </div>

                    {simResult.riskFeatures.behavioralAnomalies.length > 0 && (
                      <div className="mt-2.5 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        <strong>Anomalias detectadas:</strong> {simResult.riskFeatures.behavioralAnomalies.join(' • ')}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Routing Rule & Provider Selection */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                          2
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Roteamento & Antifraude Escolhido
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3 text-xs dark:bg-slate-900">
                      <div>
                        <span className="text-slate-400">Adquirente Primário:</span>
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                          {acquirers.find(a => a.id === simResult.selectedAcquirer)?.name || simResult.selectedAcquirer}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Antifraude:</span>
                        <p className="font-bold uppercase text-slate-700 dark:text-slate-200">
                          {simResult.selectedAntifraud || 'Internal ML'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Orchestration Execution Chain & Failover Logs */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                          3
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Histórico de Tentativas da Fallback Chain ({simResult.attempts.length})
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {simResult.attempts.map(att => {
                        const isApproved = att.status === 'approved';
                        const isError = att.status === 'technical_error';

                        return (
                          <div
                            key={att.attemptNumber}
                            className={`rounded-lg border p-3 text-xs ${
                              isApproved
                                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : isError
                                  ? 'border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                                  : 'border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span>Tentativa #{att.attemptNumber}: {att.acquirerName}</span>
                              <span>{att.latencyMs} ms</span>
                            </div>
                            {att.errorMessage && (
                              <p className="mt-1 text-[11px] opacity-90">
                                <strong>Log:</strong> {att.errorMessage}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB-TAB: ROUTING RULES */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Regras Condicionais de Roteamento
                </h3>
                {selectedRuleIds.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {selectedRuleIds.length} selecionadas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Regras avaliadas em cascata por prioridade decrescente para direcionar o tráfego
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedRuleIds.length === routingRules.length) {
                    setSelectedRuleIds([]);
                  } else {
                    setSelectedRuleIds(routingRules.map(r => r.id));
                  }
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {selectedRuleIds.length === routingRules.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>

              <button
                onClick={() => setShowAddRuleModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Regra de Roteamento</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {routingRules.map(rule => {
              const primaryAcq = acquirers.find(a => a.id === rule.action.primaryAcquirerId);
              const isSelected = selectedRuleIds.includes(rule.id);

              return (
                <div
                  key={rule.id}
                  className={`flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all md:flex-row md:items-center ${
                    isSelected 
                      ? 'border-indigo-400 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-950/20' 
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar regra ${rule.name}`}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedRuleIds(prev => 
                          prev.includes(rule.id) ? prev.filter(id => id !== rule.id) : [...prev, rule.id]
                        );
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          PRIORIDADE {rule.priority}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {rule.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rule.description}
                      </p>

                      {/* Condition badges */}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        {rule.condition.binBank && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Banco Emissor / BIN: <strong>{rule.condition.binBank}</strong>
                          </span>
                        )}
                        {rule.condition.minAmount && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Valor Mín: <strong>R$ {rule.condition.minAmount}</strong>
                          </span>
                        )}
                        {rule.condition.method && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Método: <strong>{rule.condition.method.toUpperCase()}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                          <ArrowRight className="h-3 w-3" /> Destino: {primaryAcq?.name || rule.action.primaryAcquirerId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => toggleRoutingRule(rule.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        rule.active
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      {rule.active ? 'Ativa' : 'Pausada'}
                    </button>
                    <button
                      onClick={() => deleteRoutingRule(rule.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Quick Actions Bar for Rules */}
          <FloatingQuickActionsBar
            selectedCount={selectedRuleIds.length}
            entityLabel="regras"
            onClearSelection={() => setSelectedRuleIds([])}
            actions={rulesQuickActions}
          />
        </div>
      )}

      {/* 3. SUB-TAB: PAYMENT INTENTS TABLE */}
      {activeSubTab === 'intents' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Transações & Payment Intents Processados
                </h3>
                {selectedIntentIds.length > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {selectedIntentIds.length} selecionadas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico detalhado de tentativas, adquirente vencedor e score de risco
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-3 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todas as transações"
                      checked={paymentIntents.length > 0 && selectedIntentIds.length === paymentIntents.length}
                      onChange={() => {
                        if (selectedIntentIds.length === paymentIntents.length) {
                          setSelectedIntentIds([]);
                        } else {
                          setSelectedIntentIds(paymentIntents.map(p => p.id));
                        }
                      }}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3">ID / Data</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Adquirente</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paymentIntents.map(pi => {
                  const isApproved = pi.status === 'approved';
                  const isDeclined = pi.status === 'declined';
                  const isRefunded = pi.status === 'refunded';
                  const isSelected = selectedIntentIds.includes(pi.id);

                  return (
                    <tr 
                      key={pi.id} 
                      className={`transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar intent ${pi.id}`}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIntentIds(prev => 
                              prev.includes(pi.id) ? prev.filter(id => id !== pi.id) : [...prev, pi.id]
                            );
                          }}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{pi.id}</span>
                        <div className="text-[10px] text-slate-400">
                          {new Date(pi.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white">{pi.customerName}</div>
                        <div className="text-[10px] text-slate-400">{pi.customerDocument}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        R$ {pi.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 uppercase font-semibold text-slate-600 dark:text-slate-300">
                        {pi.selectedMethod} {pi.cardInstallments ? `(${pi.cardInstallments}x)` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {acquirers.find(a => a.id === pi.selectedAcquirer)?.name || pi.selectedAcquirer || 'SPI'}
                        </span>
                        {pi.attempts.length > 1 && (
                          <div className="mt-0.5 text-[10px] font-semibold text-amber-600">
                            {pi.attempts.length} tentativas (Failover)
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                          pi.riskScore > 50 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {pi.riskScore} ({pi.riskLevel})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isApproved 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isDeclined
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isRefunded
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-800'
                        }`}>
                          {pi.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedIntentForModal(pi)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            Detalhes
                          </button>
                          {isApproved && (
                            <button
                              onClick={() => refundPaymentIntent(pi.id)}
                              className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300"
                            >
                              Estornar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Floating Quick Actions Bar for Payment Intents */}
          <FloatingQuickActionsBar
            selectedCount={selectedIntentIds.length}
            entityLabel="transações"
            onClearSelection={() => setSelectedIntentIds([])}
            actions={intentsQuickActions}
          />
        </div>
      )}

      {/* SUB-TAB: A/B TESTING CANARY EXPERIMENTATION */}
      {activeSubTab === 'ab_testing' && (
        <div className="space-y-6">
          {/* Header & Winner Promotion Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 p-6 shadow-sm dark:border-indigo-900/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                  <Split className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Roteamento A/B Testing • Canary Traffic Split
                    </h3>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {abExperimentStatus === 'running' ? '● Experimento Ativo' : 'Experimento Pausado'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
                    Direcione uma fração controlada do tráfego (ex: <strong>5% de tráfego Canary</strong>) entre dois provedores de pagamento concorrentes para comparar taxas de conversão reais, latência de autorização e custo de MDR antes do rollout total.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAbExperimentStatus(prev => prev === 'running' ? 'paused' : 'running')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                    abExperimentStatus === 'running'
                      ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {abExperimentStatus === 'running' ? 'Pausar Experimento' : 'Iniciar Experimento'}
                </button>

                <button
                  onClick={() => {
                    setAbTestWinnerPromoted(true);
                    setExportFeedback('Provedor B (Mercado Pago) promovido com sucesso para 100% do tráfego!');
                    setTimeout(() => setExportFeedback(null), 4500);
                  }}
                  disabled={abTestWinnerPromoted}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Trophy className="h-4 w-4 text-amber-300" />
                  <span>{abTestWinnerPromoted ? 'Vencedor Promovido (100%)' : 'Promover Provedor B a 100%'}</span>
                </button>
              </div>
            </div>

            {abTestWinnerPromoted && (
              <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Configuração de roteamento atualizada: Mercado Pago agora recebe 100% do tráfego de cartões de crédito. Ganho de conversão estimado em +R$ 18.400 / mês.</span>
                </div>
                <button onClick={() => setAbTestWinnerPromoted(false)} className="text-[11px] text-emerald-700 underline">Desfazer</button>
              </div>
            )}
          </div>

          {/* Traffic Split Controls & Presets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Configuração de Split de Tráfego & Provedores
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ajuste a porcentagem exata de tráfego canary enviada ao Provedor B para validação estatística.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Split Slider (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Divisão Atual:</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-white">
                      Provedor A ({100 - abSplitPercentage}%) vs Provedor B ({abSplitPercentage}%)
                    </span>
                  </div>

                  {/* Preset buttons */}
                  <div className="flex items-center gap-1">
                    {[5, 10, 20, 50].map(val => (
                      <button
                        key={val}
                        onClick={() => setAbSplitPercentage(val)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          abSplitPercentage === val
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {val === 5 ? '5% (Canary Padrão)' : `${val}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={abSplitPercentage}
                    onChange={(e) => setAbSplitPercentage(Number(e.target.value))}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>1% (Ultra Canary)</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">5% (Recomendado)</span>
                    <span>25%</span>
                    <span>50% (Equilibrado)</span>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="h-5 w-full overflow-hidden rounded-xl bg-slate-100 flex dark:bg-slate-800 shadow-inner">
                  <div 
                    style={{ width: `${100 - abSplitPercentage}%` }} 
                    className="flex items-center justify-center bg-slate-700 text-[10px] font-bold text-white transition-all"
                  >
                    Controle: {100 - abSplitPercentage}% (Stone)
                  </div>
                  <div 
                    style={{ width: `${abSplitPercentage}%` }} 
                    className="flex items-center justify-center bg-indigo-600 text-[10px] font-bold text-white transition-all"
                  >
                    {abSplitPercentage}% (Canary)
                  </div>
                </div>
              </div>

              {/* Provider Selection (5 cols) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Provedor A (Controle {100 - abSplitPercentage}%)
                  </label>
                  <select
                    value={abProviderA}
                    onChange={(e) => setAbProviderA(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="acq_stone">Stone (Pagar.me Engine)</option>
                    <option value="acq_cielo">Cielo 3.0 API</option>
                    <option value="acq_rede">Rede Itaú Global</option>
                  </select>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <label className="block text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    Provedor B (Canary {abSplitPercentage}%)
                  </label>
                  <select
                    value={abProviderB}
                    onChange={(e) => setAbProviderB(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-indigo-200 bg-white p-2 text-xs font-bold text-slate-900 outline-none dark:border-indigo-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="acq_mp">Mercado Pago / Mercado Livre</option>
                    <option value="acq_adyen">Adyen Fast Auth</option>
                    <option value="acq_asaas">Asaas Sub-Adquirente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Cards: Provider A vs Provider B Metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Card Provedor A */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 font-bold text-xs text-slate-800 dark:bg-slate-700 dark:text-white">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Provedor A: Stone (Controle)
                    </h4>
                    <p className="text-[11px] text-slate-500">Roteamento padrão de produção ({100 - abSplitPercentage}%)</p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Baseline
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500">Taxa de Conversão</span>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">94.8%</p>
                  <span className="text-[10px] text-slate-400">12.450 transações</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500">Latência Média</span>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">28ms</p>
                  <span className="text-[10px] text-slate-400">p99: 110ms</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500">Taxa MDR Negociada</span>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">2.10%</p>
                  <span className="text-[10px] text-slate-400">Crédito 1x</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500">Taxa de Chargeback</span>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">0.06%</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">Dentro do SLA</span>
                </div>
              </div>
            </div>

            {/* Card Provedor B (Canary Winner) */}
            <div className="rounded-2xl border-2 border-indigo-500/80 bg-gradient-to-b from-indigo-50/40 to-white p-5 shadow-lg dark:border-indigo-500/60 dark:from-slate-900 dark:to-slate-900">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3 dark:border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-xs text-white shadow-sm">
                    B
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Provedor B: Mercado Pago ({abSplitPercentage}% Canary)
                      </h4>
                      <span className="flex items-center text-[10px] font-bold text-emerald-600">
                        <TrendingUp className="h-3 w-3" /> +1.6% Uplift
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Tráfego de validação experimental</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Trophy className="h-3 w-3 text-amber-500" /> Vencedor Estatístico
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-indigo-50/60 p-3 dark:bg-indigo-950/40">
                  <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold">Taxa de Conversão</span>
                  <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">96.4%</p>
                  <span className="text-[10px] text-emerald-600 font-bold">+1.60% vs Controle</span>
                </div>
                <div className="rounded-xl bg-indigo-50/60 p-3 dark:bg-indigo-950/40">
                  <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold">Latência Média</span>
                  <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">21ms</p>
                  <span className="text-[10px] text-emerald-600 font-bold">25% mais rápido</span>
                </div>
                <div className="rounded-xl bg-indigo-50/60 p-3 dark:bg-indigo-950/40">
                  <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold">Taxa MDR Negociada</span>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">1.95%</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Economia de 0.15%</span>
                </div>
                <div className="rounded-xl bg-indigo-50/60 p-3 dark:bg-indigo-950/40">
                  <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold">Significância Estatística</span>
                  <p className="mt-1 text-lg font-extrabold text-indigo-600 dark:text-indigo-400">98.8%</p>
                  <span className="text-[10px] text-indigo-600 font-bold">p-value &lt; 0.012 (Conclusivo)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Canary Traffic Dispatch Simulator */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Dispatch Stream ({100 - abSplitPercentage}% / {abSplitPercentage}%)
                </h4>
                <p className="text-xs text-slate-500">
                  Amostragem em tempo real das requisições despachadas de acordo com o peso de split configurado.
                </p>
              </div>

              <button
                onClick={() => {
                  const isCanary = Math.random() * 100 < abSplitPercentage;
                  const newTx = {
                    id: `tx_ab_${Date.now().toString().slice(-4)}`,
                    amount: 150 + Math.floor(Math.random() * 900),
                    provider: isCanary ? `Mercado Pago (${abSplitPercentage}% Canary)` : `Stone (${100 - abSplitPercentage}% Control)`,
                    approved: true,
                    latency: isCanary ? 20 + Math.floor(Math.random() * 5) : 25 + Math.floor(Math.random() * 8)
                  };
                  setAbSimulatedStream(prev => [newTx, ...prev.slice(0, 7)]);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Simular Despacho de Transação</span>
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {abSimulatedStream.map(tx => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs transition-all dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-500">{tx.id}</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {tx.amount.toFixed(2)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      tx.provider.includes('Canary')
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {tx.provider}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">{tx.latency}ms</span>
                    <span className="flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                      <CheckCircle className="h-3 w-3" /> APROVADA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Routing Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateRule} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Adicionar Nova Regra de Roteamento
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Nome da Regra</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rota Específica Bradesco (BIN 237)"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">BIN / Banco (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 237 (Bradesco)"
                    value={newRuleBinBank}
                    onChange={(e) => setNewRuleBinBank(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 500"
                    value={newRuleMinAmount}
                    onChange={(e) => setNewRuleMinAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Adquirente Destino</label>
                  <select
                    value={newRulePrimaryAcq}
                    onChange={(e) => setNewRulePrimaryAcq(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {acquirers.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Antifraude</label>
                  <select
                    value={newRuleAntifraud}
                    onChange={(e) => setNewRuleAntifraud(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="clearsale">ClearSale v3</option>
                    <option value="konduto">Konduto AI</option>
                    <option value="internal_ml">Internal ML Core</option>
                    <option value="none">Nenhum (Zero Fricção)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Salvar Regra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Intent Details */}
      {selectedIntentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detalhes da Transação: {selectedIntentForModal.id}
              </h3>
              <button
                onClick={() => setSelectedIntentForModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <span className="text-slate-400">Valor Total:</span>
                  <p className="font-bold text-slate-900 dark:text-white">R$ {selectedIntentForModal.amount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>
                  <p className="font-bold uppercase text-emerald-600">{selectedIntentForModal.status}</p>
                </div>
                <div>
                  <span className="text-slate-400">Cliente:</span>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedIntentForModal.customerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">CPF:</span>
                  <p className="font-mono text-slate-900 dark:text-white">{selectedIntentForModal.customerDocument}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Tentativas Registradas:</span>
                <div className="mt-2 space-y-1.5">
                  {selectedIntentForModal.attempts.map(att => (
                    <div key={att.attemptNumber} className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex justify-between font-semibold">
                        <span>#{att.attemptNumber} - {att.acquirerName}</span>
                        <span className={att.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>
                          {att.status.toUpperCase()} ({att.latencyMs}ms)
                        </span>
                      </div>
                      {att.errorMessage && (
                        <p className="mt-0.5 text-slate-500">{att.errorMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedIntentForModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING STATS PANEL (MEMORY & FPS) */}
      <OrchestrationStatsPanel />
    </div>
  );
};
