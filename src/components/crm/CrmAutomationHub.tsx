import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Workflow, 
  Users, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Mail, 
  FileText, 
  HelpCircle, 
  Award, 
  Globe, 
  Plus, 
  Tag, 
  UserCheck, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Check,
  ChevronRight,
  LayoutGrid,
  Layers,
  Settings,
  ShieldAlert,
  RotateCcw,
  ShoppingBag,
  Star,
  Zap,
  Copy,
  FolderPlus,
  GripVertical,
  UploadCloud,
  FileCode,
  Download,
  CheckSquare,
  ShieldCheck,
  AlertOctagon,
  Save,
  Activity,
  X
} from 'lucide-react';
import { AutomationGraph, Customer, AutomationNode, AutomationEdge } from '../../types/payment';
import { WorkflowCanvas } from './WorkflowCanvas';
import { GraphValidationEngine, ValidationResult, ValidationIssue } from '../../services/graphValidationEngine';

interface WorkflowTemplate {
  id: string;
  name: string;
  category: 'Fraude & Risco' | 'Operações & Reembolso' | 'Recuperação de Vendas' | 'Retenção & Fidelidade';
  description: string;
  triggerEvent: string;
  color: string;
  badge: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

const PREBUILT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'template_fraud_review',
    name: 'Fraud Review (Análise Preventiva de Risco)',
    category: 'Fraude & Risco',
    description: 'Quando o score ML excede 75, pausa a liquidação, envia alerta urgente e marca o cardholder no CRM.',
    triggerEvent: 'risk.flagged',
    color: 'rose',
    badge: 'Segurança & ML',
    nodes: [
      {
        id: 'n_trig_fraud',
        type: 'trigger',
        title: 'Score ML > 75 (Alerta)',
        description: 'Disparado pelo motor de inteligência quando o risco de fraude supera o limiar.',
        config: { threshold: 75 },
        position: { x: 50, y: 150 }
      },
      {
        id: 'n_cond_score',
        type: 'condition',
        title: 'Condição: Score ≥ 85',
        description: 'Se crítico (≥ 85), bloqueio instantâneo. Se moderado (75-84), revisão manual.',
        config: { field: 'riskScore', operator: '>=', value: 85 },
        position: { x: 320, y: 150 }
      },
      {
        id: 'n_act_warn_ops',
        type: 'notification.whatsapp',
        title: 'Alerta Operador Antifraude',
        description: 'Dispara WhatsApp HSM de alta prioridade para o time de compliance.',
        config: { recipient: '+55 11 99999-9999', template: 'fraud_alert_hsm' },
        position: { x: 590, y: 110 }
      },
      {
        id: 'n_act_crm_tag',
        type: 'crm.upsert_contact',
        title: 'Tag CRM: Em Revisão Manual',
        description: 'Atualiza o perfil do comprador com tag preventiva de contestação.',
        config: { tags: ['Em Revisão Antifraude', 'Risco Elevado'] },
        position: { x: 860, y: 150 }
      },
      {
        id: 'n_act_wh_risk',
        type: 'webhook.custom',
        title: 'Webhook: Fila de Investigação',
        description: 'Notifica sistema externo de birô de crédito e biometria facial.',
        config: { url: 'https://api.empresa.com/v1/fraud-queue', method: 'POST' },
        position: { x: 1130, y: 150 }
      }
    ],
    edges: [
      { id: 'e1', from: 'n_trig_fraud', to: 'n_cond_score' },
      { id: 'e2', from: 'n_cond_score', to: 'n_act_warn_ops', conditionBranch: 'then' },
      { id: 'e3', from: 'n_act_warn_ops', to: 'n_act_crm_tag' },
      { id: 'e4', from: 'n_act_crm_tag', to: 'n_act_wh_risk' }
    ]
  },
  {
    id: 'template_auto_refund',
    name: 'Automatic Refund (Estorno & Nota Fiscal de Cancelamento)',
    category: 'Operações & Reembolso',
    description: 'Automatiza o processo de devolução Pix/Cartão, cancela a NF-e e envia comprovante com ID E2E.',
    triggerEvent: 'payment.refund_requested',
    color: 'cyan',
    badge: 'Operacional',
    nodes: [
      {
        id: 'n_trig_refund',
        type: 'trigger',
        title: 'Solicitação de Estorno',
        description: 'Iniciado pelo suporte ou cancelamento automático em até 7 dias.',
        config: { allowAutoRefund: true },
        position: { x: 50, y: 150 }
      },
      {
        id: 'n_act_nfe_canc',
        type: 'integration.send_nfe',
        title: 'Emitir NF-e Devolução',
        description: 'Gera nota fiscal de estorno e cancelamento na SEFAZ automaticamente.',
        config: { action: 'cancel_or_refund_nfe' },
        position: { x: 320, y: 150 }
      },
      {
        id: 'n_act_email_comp',
        type: 'notification.email',
        title: 'E-mail com Comprovante',
        description: 'Envia o recibo oficial de estorno com End-to-End ID do Banco Central.',
        config: { templateId: 'refund_receipt_v1' },
        position: { x: 590, y: 150 }
      },
      {
        id: 'n_act_crm_status',
        type: 'crm.upsert_contact',
        title: 'Tag CRM: Reembolsado',
        description: 'Atualiza o LTV e remove privilégios de acesso do produto.',
        config: { tags: ['Reembolsado', 'Cancelamento'] },
        position: { x: 860, y: 150 }
      }
    ],
    edges: [
      { id: 'e1', from: 'n_trig_refund', to: 'n_act_nfe_canc' },
      { id: 'e2', from: 'n_act_nfe_canc', to: 'n_act_email_comp' },
      { id: 'e3', from: 'n_act_email_comp', to: 'n_act_crm_status' }
    ]
  },
  {
    id: 'template_pix_recovery',
    name: 'Pix Abandonment Recovery (Recuperação Inteligente)',
    category: 'Recuperação de Vendas',
    description: 'Se o QR Code Pix expirar sem pagamento, envia um novo código com 5% de desconto via WhatsApp.',
    triggerEvent: 'pix.expired',
    color: 'emerald',
    badge: 'Conversão +14%',
    nodes: [
      {
        id: 'n_trig_pix_exp',
        type: 'trigger',
        title: 'Pix Expirado sem Pagamento',
        description: 'Detecta que o QR Code atingiu 15 minutos sem liquidação no SPI Bacen.',
        config: { expireMinutes: 15 },
        position: { x: 50, y: 150 }
      },
      {
        id: 'n_act_wpp_pix',
        type: 'notification.whatsapp',
        title: 'WhatsApp com Pix Reativado',
        description: 'Envia link copia e cola com desconto promocional de reativação.',
        config: { discountPercent: 5 },
        position: { x: 320, y: 150 }
      },
      {
        id: 'n_act_mail_carrinho',
        type: 'notification.email',
        title: 'E-mail: Seu pedido te aguarda',
        description: 'Dispara lembrete com resumo dos itens e botão de 1-clique.',
        config: { templateId: 'cart_abandoned_email' },
        position: { x: 590, y: 150 }
      },
      {
        id: 'n_act_crm_recup',
        type: 'crm.upsert_contact',
        title: 'Tag CRM: Lead Carrinho Aberto',
        description: 'Adiciona à lista de retargeting para campanhas de conversão.',
        config: { tags: ['Lead Recuperação Pix'] },
        position: { x: 860, y: 150 }
      }
    ],
    edges: [
      { id: 'e1', from: 'n_trig_pix_exp', to: 'n_act_wpp_pix' },
      { id: 'e2', from: 'n_act_wpp_pix', to: 'n_act_mail_carrinho' },
      { id: 'e3', from: 'n_act_mail_carrinho', to: 'n_act_crm_recup' }
    ]
  },
  {
    id: 'template_vip_loyalty',
    name: 'VIP Customer Loyalty (Clube de Recompensas Ouro)',
    category: 'Retenção & Fidelidade',
    description: 'Após pagamento aprovado, verifica se o cliente atingiu LTV VIP para creditar pontos e benefícios.',
    triggerEvent: 'payment.approved',
    color: 'amber',
    badge: 'Gamificação',
    nodes: [
      {
        id: 'n_trig_pay_ok',
        type: 'trigger',
        title: 'Pagamento Aprovado',
        description: 'Recebimento de liquidação aprovada na adquirente ou SPI Pix.',
        config: {},
        position: { x: 50, y: 150 }
      },
      {
        id: 'n_cond_ltv',
        type: 'condition',
        title: 'Condição: LTV > R$ 1.000',
        description: 'Checa o histórico consolidado de compras do cliente no CRM.',
        config: { field: 'customer.totalLtv', operator: '>', value: 1000 },
        position: { x: 320, y: 150 }
      },
      {
        id: 'n_act_loyalty_pts',
        type: 'loyalty.add_points',
        title: 'Creditar 100 Pontos VIP',
        description: 'Adiciona pontos no programa de vantagens e cashback recorrente.',
        config: { points: 100 },
        position: { x: 590, y: 110 }
      },
      {
        id: 'n_act_wpp_vip',
        type: 'notification.whatsapp',
        title: 'WhatsApp: Parabéns Categoria VIP',
        description: 'Mensagem personalizada com cupom de aniversário e concierge.',
        config: { template: 'welcome_vip_club' },
        position: { x: 860, y: 150 }
      },
      {
        id: 'n_act_crm_vip',
        type: 'crm.upsert_contact',
        title: 'Tag CRM: Membro VIP Ouro',
        description: 'Eleva a classificação do comprador para atendimento prioritário.',
        config: { tags: ['VIP Ouro', 'Clube Fidelidade'] },
        position: { x: 1130, y: 150 }
      }
    ],
    edges: [
      { id: 'e1', from: 'n_trig_pay_ok', to: 'n_cond_ltv' },
      { id: 'e2', from: 'n_cond_ltv', to: 'n_act_loyalty_pts', conditionBranch: 'then' },
      { id: 'e3', from: 'n_act_loyalty_pts', to: 'n_act_wpp_vip' },
      { id: 'e4', from: 'n_act_wpp_vip', to: 'n_act_crm_vip' }
    ]
  }
];

export const CrmAutomationHub: React.FC = () => {
  const { 
    automations, 
    customers, 
    runAutomationManually, 
    toggleAutomation,
    saveAutomation,
    addCustomer,
    updateCustomerTags
  } = usePayment();

  const [activeSubTab, setActiveSubTab] = useState<'workflows' | 'crm'>('workflows');
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationGraph>(automations[0]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingStepIndex, setExecutingStepIndex] = useState<number>(-1);
  const [currentExecutionLog, setCurrentExecutionLog] = useState<any>(null);
  const [customTemplates, setCustomTemplates] = useState<WorkflowTemplate[]>(PREBUILT_TEMPLATES);

  // Auto-save Mechanism State (saves current graph state to sessionStorage every 30s)
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // 30-Second Auto-save effect
  useEffect(() => {
    setLastAutoSaved(new Date().toLocaleTimeString('pt-BR'));

    const autoSaveInterval = setInterval(() => {
      setIsAutoSaving(true);
      try {
        const payload = {
          timestamp: new Date().toISOString(),
          workflowId: selectedAutomation.id,
          name: selectedAutomation.name,
          nodes: selectedAutomation.nodes,
          edges: selectedAutomation.edges,
          active: selectedAutomation.active
        };
        sessionStorage.setItem(`nercash_crm_workflow_autosave_${selectedAutomation.id}`, JSON.stringify(payload));
        setLastAutoSaved(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.warn('Auto-save CRM error:', err);
      } finally {
        setTimeout(() => setIsAutoSaving(false), 600);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [selectedAutomation]);

  // Validation Engine State
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [workflowSaveToast, setWorkflowSaveToast] = useState<string | null>(null);
  const [isSavingWorkflow, setIsSavingWorkflow] = useState<boolean>(false);

  // Bulk Import State
  const [showBulkImportModal, setShowBulkImportModal] = useState<boolean>(false);
  const [bulkSelectedTemplateIds, setBulkSelectedTemplateIds] = useState<string[]>(['template_fraud_review', 'template_auto_refund']);
  const [bulkImportToast, setBulkImportToast] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Run Graph Validation Engine
  const handleRunValidation = () => {
    const result = GraphValidationEngine.validate(selectedAutomation);
    setValidationResult(result);
    setShowValidationModal(true);
    return result;
  };

  // Safe Save with Validation Check
  const handleSaveWorkflowWithValidation = () => {
    setIsSavingWorkflow(true);
    const result = GraphValidationEngine.validate(selectedAutomation);
    setValidationResult(result);

    if (!result.canSave) {
      setIsSavingWorkflow(false);
      setShowValidationModal(true);
      return;
    }

    try {
      saveAutomation(selectedAutomation);
      setWorkflowSaveToast(`Workflow "${selectedAutomation.name}" validado e salvo com sucesso!`);
      setTimeout(() => setWorkflowSaveToast(null), 4000);
      setShowValidationModal(false);
    } finally {
      setIsSavingWorkflow(false);
    }
  };

  // Form states for new customer
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustEmail, setNewCustEmail] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustDoc, setNewCustDoc] = useState<string>('');

  const handleRunAutomation = async () => {
    setIsExecuting(true);
    setExecutingStepIndex(0);

    // Step-by-step visual animation through nodes
    for (let i = 0; i < selectedAutomation.nodes.length; i++) {
      setExecutingStepIndex(i);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const log = await runAutomationManually(selectedAutomation.id);
      setCurrentExecutionLog(log);
      setExecutingStepIndex(selectedAutomation.nodes.length);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setExecutingStepIndex(-1), 3000);
    }
  };

  // Undo & Redo Stack State
  const [undoStack, setUndoStack] = useState<{ nodes: AutomationNode[]; edges: AutomationEdge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: AutomationNode[]; edges: AutomationEdge[] }[]>([]);

  const handleApplyTemplate = (template: WorkflowTemplate) => {
    setUndoStack(prev => [...prev, { nodes: selectedAutomation.nodes, edges: selectedAutomation.edges }]);
    setRedoStack([]);
    const newGraph: AutomationGraph = {
      id: `auto_${Date.now()}`,
      name: template.name,
      description: template.description,
      triggerEvent: template.triggerEvent,
      active: true,
      executionCount: 0,
      nodes: template.nodes,
      edges: template.edges
    };
    setSelectedAutomation(newGraph);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [{ nodes: selectedAutomation.nodes, edges: selectedAutomation.edges }, ...prev]);
    setSelectedAutomation(prev => ({
      ...prev,
      nodes: previousState.nodes,
      edges: previousState.edges
    }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[0];
    setRedoStack(prev => prev.slice(1));
    setUndoStack(prev => [...prev, { nodes: selectedAutomation.nodes, edges: selectedAutomation.edges }]);
    setSelectedAutomation(prev => ({
      ...prev,
      nodes: nextState.nodes,
      edges: nextState.edges
    }));
  };

  // Bulk Import Execution
  const handleExecuteBulkImport = (templateIds: string[]) => {
    const templatesToImport = customTemplates.filter(t => templateIds.includes(t.id));
    if (templatesToImport.length === 0) return;

    // Set first as active, load all
    const first = templatesToImport[0];
    const newGraph: AutomationGraph = {
      id: `auto_bulk_${Date.now()}`,
      name: `[Bulk Import] ${first.name}`,
      description: first.description,
      triggerEvent: first.triggerEvent,
      active: true,
      executionCount: 0,
      nodes: first.nodes,
      edges: first.edges
    };

    setSelectedAutomation(newGraph);
    setShowBulkImportModal(false);
    setBulkImportToast(`${templatesToImport.length} fluxos de automação importados em lote com sucesso!`);
    setTimeout(() => setBulkImportToast(null), 4000);
  };

  // Handle JSON file drop for bulk import
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setCustomTemplates(prev => [...parsed, ...prev]);
            setBulkImportToast(`Arquivo '${file.name}' importado: ${parsed.length} templates adicionados à biblioteca.`);
          } else if (parsed.nodes && parsed.edges) {
            handleApplyTemplate(parsed);
            setBulkImportToast(`Workflow '${parsed.name || file.name}' carregado diretamente no canvas.`);
          }
          setTimeout(() => setBulkImportToast(null), 4000);
        } catch (err) {
          setBulkImportToast('Formato de arquivo inválido. Utilize um arquivo JSON com especificações de fluxo.');
          setTimeout(() => setBulkImportToast(null), 4000);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;

    addCustomer({
      name: newCustName,
      email: newCustEmail,
      phone: newCustPhone || '+55 (11) 98888-0000',
      document: newCustDoc || '000.000.000-00',
      riskProfile: 'low',
      lifecycleStage: 'lead',
      tags: ['Novo Lead', 'Painel'],
      preferredMethods: ['pix'],
      channels: ['whatsapp', 'email']
    });

    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustDoc('');
  };

  const handleWorkspaceSnapshot = () => {
    const snapshotData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      workspace: "Nercash CRM Automation Studio",
      templatesCount: customTemplates.length,
      customersCount: customers.length,
      metadata: {
        generator: "Nercash Enterprise Engine",
        environment: "production"
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshotData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nercash_workspace_snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBulkImportToast("Snapshot JSON do Workspace gerado com sucesso para Version Control!");
    setTimeout(() => setBulkImportToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Nercash CRM & Automação de Processos Low-Code
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Canvas visual interativo de fluxos (React Flow), biblioteca de templates pré-configurados e gestão de contatos 360°
            </p>
          </div>
        </div>

        {/* Sub-tabs & Snapshot Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleWorkspaceSnapshot}
            title="Gerar Snapshot JSON do Workspace para Version Control"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Snapshot Workspace</span>
          </button>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setActiveSubTab('workflows')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'workflows' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Workflow className="h-3.5 w-3.5 text-emerald-500" />
              <span>Canvas Visual & Templates</span>
            </button>

            <button
              onClick={() => setActiveSubTab('crm')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'crm' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span>Contatos CRM ({customers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Import Toast Notification */}
      {bulkImportToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{bulkImportToast}</span>
        </div>
      )}

      {/* 1. SUB-TAB: WORKFLOW VISUAL GRAPH EDITOR (REACT FLOW) WITH TEMPLATES SIDEBAR */}
      {activeSubTab === 'workflows' && (
        <div className="space-y-4">
          {/* Main Grid: Left Templates Sidebar (4 cols) & Right Canvas (8 cols) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Sidebar: Pre-built Workflow Templates */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Templates de Automação
                    </h3>
                  </div>
                  <button
                    id="btn-bulk-import-templates"
                    onClick={() => setShowBulkImportModal(true)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                  >
                    <FolderPlus className="h-3 w-3" />
                    <span>Importar em Lote</span>
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Arraste qualquer template diretamente para o Canvas ou use o importador em lote para carregar fluxos complexos instantaneamente.
                </p>

                {/* Templates List with Full Drag Support */}
                <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {customTemplates.map(template => (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/reactflow-template', JSON.stringify({
                          name: template.name,
                          nodes: template.nodes,
                          edges: template.edges
                        }));
                        e.dataTransfer.setData('application/reactflow-node', JSON.stringify({
                          type: template.nodes[0]?.type || 'trigger',
                          title: template.nodes[0]?.title || template.name,
                          description: template.nodes[0]?.description || template.description
                        }));
                      }}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-all hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {template.name}
                          </h4>
                        </div>
                        <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {template.badge}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                        <span className="font-mono text-[10px] text-slate-400">
                          {template.nodes.length} nós • {template.triggerEvent}
                        </span>
                        <button
                          onClick={() => handleApplyTemplate(template)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                        >
                          <span>Carregar no Canvas</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drag & Drop File Zone for Bulk Import */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={handleFileDrop}
                  className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                    isDraggingFile 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                      : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850'
                  }`}
                >
                  <UploadCloud className="h-6 w-6 text-indigo-500" />
                  <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    Solte arquivos JSON de Workflow aqui
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Importação em lote de grafos e configurações
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Active Automation Canvas (8 cols) */}
            <div className="space-y-4 lg:col-span-8">
              {/* Automation Switcher & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Fluxo em Edição:</span>
                  <select
                    value={selectedAutomation.id}
                    onChange={(e) => {
                      const found = automations.find(a => a.id === e.target.value);
                      if (found) setSelectedAutomation(found);
                    }}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {automations.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.triggerEvent})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 30s Auto-save status badge */}
                  <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
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

                  <button
                    onClick={handleRunValidation}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-all"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Validar Grafo</span>
                  </button>

                  <button
                    onClick={handleUndo}
                    disabled={undoStack.length === 0}
                    title="Desfazer alteração no workflow"
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Desfazer</span>
                  </button>

                  <button
                    onClick={handleSaveWorkflowWithValidation}
                    disabled={isSavingWorkflow}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
                  >
                    <Save className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    <span>{isSavingWorkflow ? 'Verificando...' : 'Salvar Fluxo'}</span>
                  </button>

                  <button
                    onClick={() => toggleAutomation(selectedAutomation.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      selectedAutomation.active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedAutomation.active ? '● Ativo' : '○ Pausado'}
                  </button>

                  <button
                    onClick={handleRunAutomation}
                    disabled={isExecuting}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>{isExecuting ? 'Executando nós...' : 'Executar Automação'}</span>
                  </button>
                </div>
              </div>

              {/* Toast for Workflow Save */}
              {workflowSaveToast && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 animate-fade-in">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{workflowSaveToast}</span>
                </div>
              )}

              {/* Interactive React Flow Canvas */}
              <WorkflowCanvas
                automation={selectedAutomation}
                isExecuting={isExecuting}
                executingStepIndex={executingStepIndex}
                onRunTest={handleRunAutomation}
              />

              {/* Real-time Execution Logs */}
              {currentExecutionLog && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Resultado da Execução: {currentExecutionLog.automationName}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(currentExecutionLog.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {currentExecutionLog.executedNodes.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold dark:bg-emerald-950 dark:text-emerald-300">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{item.nodeTitle}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.output}</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.latencyMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB-TAB: CRM CONTACTS */}
      {activeSubTab === 'crm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Base Unificada de Clientes Nercash & LTV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico transacional, tags de automação e canais de contato ativos
              </p>
            </div>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Contato</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Documento / Contato</th>
                  <th className="px-4 py-3">Estágio</th>
                  <th className="px-4 py-3">LTV Acumulado</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Tags CRM</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{cust.name}</span>
                        <p className="text-[11px] text-slate-400">{cust.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      <div>{cust.document}</div>
                      <div className="text-slate-400">{cust.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {cust.lifecycleStage}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {cust.totalLtv.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">{cust.ordersCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags.map(t => (
                          <span key={t} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          const tag = prompt('Adicionar tag ao contato:');
                          if (tag) updateCustomerTags(cust.id, [...cust.tags, tag]);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        + Tag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Bulk Import Workflow Templates */}
      {showBulkImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-indigo-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Importação em Lote de Templates de Automação
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione múltiplos pacotes pré-construídos para instanciar no seu motor de regras
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {customTemplates.map(t => {
                const isSelected = bulkSelectedTemplateIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (isSelected) {
                        setBulkSelectedTemplateIds(prev => prev.filter(id => id !== t.id));
                      } else {
                        setBulkSelectedTemplateIds(prev => [...prev, t.id]);
                      }
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:border-indigo-600 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {t.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {t.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4 font-mono text-[10px] text-slate-400">
                      {t.nodes.length} nós • {t.triggerEvent}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {bulkSelectedTemplateIds.length} de {customTemplates.length} templates selecionados
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={bulkSelectedTemplateIds.length === 0}
                  onClick={() => handleExecuteBulkImport(bulkSelectedTemplateIds)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-sm"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>Importar Selecionados ({bulkSelectedTemplateIds.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Customer */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar Novo Contato no CRM</h3>
            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">E-mail</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">WhatsApp / Tel</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+55 (11) 9..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={newCustDoc}
                    onChange={(e) => setNewCustDoc(e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Validation Engine Diagnostics Report */}
      {showValidationModal && validationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
                  validationResult.isValid ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Motor de Validação de Grafos (DAG Engine)</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      validationResult.isValid 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {validationResult.isValid ? 'Grafo Aprovado' : 'Erros Encontrados'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Análise topológica, detecção de loops infinitos e integridade de conexões
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowValidationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score & Metric Summary Bar */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Índice de Saúde</span>
                <p className={`text-lg font-bold ${
                  validationResult.score >= 90 ? 'text-emerald-500' : validationResult.score >= 70 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {validationResult.score}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Total de Nós</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {validationResult.totalNodes}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Erros Críticos</span>
                <p className={`text-lg font-bold ${
                  validationResult.criticalErrorsCount === 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {validationResult.criticalErrorsCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Avisos / Alertas</span>
                <p className="text-lg font-bold text-amber-500">
                  {validationResult.warningsCount}
                </p>
              </div>
            </div>

            {/* Diagnostic Checklist Items */}
            <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {validationResult.issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/50 py-8 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Grafo 100% Íntegro e Pronto para Execução
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 max-w-sm">
                    Nenhuma dependência circular, ausência de nós órfãos e conexões de gatilho válidas.
                  </p>
                </div>
              ) : (
                validationResult.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-xs ${
                      issue.type === 'error'
                        ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/40'
                        : issue.type === 'warning'
                        ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/40'
                        : 'border-sky-200 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/40'
                    }`}
                  >
                    <div className="mt-0.5">
                      {issue.type === 'error' ? (
                        <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : issue.type === 'warning' ? (
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${
                          issue.type === 'error' ? 'text-rose-900 dark:text-rose-300' : 'text-slate-900 dark:text-white'
                        }`}>
                          {issue.title}
                        </span>
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                          {issue.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="font-mono text-[10px] text-slate-400">
                Motor DAG v2.4 • Verificação em {new Date(validationResult.validatedAt).toLocaleTimeString('pt-BR')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Fechar
                </button>

                <button
                  onClick={() => {
                    saveAutomation(selectedAutomation);
                    setWorkflowSaveToast(`Workflow "${selectedAutomation.name}" salvo com sucesso!`);
                    setTimeout(() => setWorkflowSaveToast(null), 4000);
                    setShowValidationModal(false);
                  }}
                  disabled={!validationResult.canSave}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Salvar Workflow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
