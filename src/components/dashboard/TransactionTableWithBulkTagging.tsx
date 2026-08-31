import React, { useState, useMemo, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { PaymentIntent } from '../../types/payment';
import { BatchActionConfirmationModal } from '../common/BatchActionConfirmationModal';
import {
  CheckSquare,
  Square,
  Tag,
  Plus,
  X,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Download,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Layers,
  MoreHorizontal,
  Trash2
} from 'lucide-react';

const PREDEFINED_TAGS = [
  { name: 'VIP Whitelist', color: 'emerald' },
  { name: 'Investigar Fraude', color: 'rose' },
  { name: 'Estorno Solicitado', color: 'amber' },
  { name: 'Reconciliação Pendente', color: 'indigo' },
  { name: 'Prioridade Alta', color: 'purple' },
  { name: 'CRM Lead Quente', color: 'blue' },
  { name: 'Chargeback Contestável', color: 'orange' },
  { name: 'B2B Corporativo', color: 'cyan' },
];

export const TransactionTableWithBulkTagging: React.FC = () => {
  const { 
    paymentIntents, 
    bulkTagPaymentIntents, 
    updatePaymentIntentStatus, 
    batchReconcile,
    markAsFraudulent,
    displayDensity, 
    currentTenant 
  } = usePayment();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
  const [tagsToApply, setTagsToApply] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<{ isOpen: boolean; type: 'reconcile' | 'fraud' | 'export' } | null>(null);

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    updatePaymentIntentStatus(selectedIds, 'approved');
    setFeedbackToast(`${selectedIds.length} transação(ões) aprovada(s) em lote.`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleBatchReject = () => {
    if (selectedIds.length === 0) return;
    updatePaymentIntentStatus(selectedIds, 'declined');
    setFeedbackToast(`${selectedIds.length} transação(ões) rejeitada(s) em lote.`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleConfirmAction = () => {
    if (!modalAction) return;
    
    switch (modalAction.type) {
      case 'reconcile':
        batchReconcile(selectedIds);
        setFeedbackToast(`${selectedIds.length} transação(ões) reconciliada(s) com sucesso.`);
        break;
      case 'fraud':
        markAsFraudulent(selectedIds);
        setFeedbackToast(`${selectedIds.length} transação(ões) marcada(s) como FRAUDE e bloqueadas.`);
        break;
      case 'export':
        handleBatchExport();
        setFeedbackToast(`${selectedIds.length} transação(ões) exportada(s) para CSV.`);
        break;
    }
    
    setSelectedIds([]);
    setModalAction(null);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleBatchReconcile = () => {
    if (selectedIds.length === 0) return;
    batchReconcile(selectedIds);
    setFeedbackToast(`${selectedIds.length} transação(ões) reconciliada(s) com sucesso.`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleBatchFraud = () => {
    if (selectedIds.length === 0) return;
    markAsFraudulent(selectedIds);
    setFeedbackToast(`${selectedIds.length} transação(ões) marcada(s) como FRAUDE e bloqueadas.`);
    setSelectedIds([]);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleBatchExport = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = paymentIntents.filter(pi => selectedIds.includes(pi.id));
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["ID,Amount,Status,Customer,Date"].join(",") + "\n" +
      selectedItems.map(i => `${i.id},${i.amount},${i.status},"${i.customerName}",${i.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nercash_selected_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackToast(`${selectedIds.length} transação(ões) exportada(s) com sucesso.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleBatchFlagAudit = () => {
    if (selectedIds.length === 0) return;
    bulkTagPaymentIntents(selectedIds, ['FlaggedForAudit', 'ComplianceReview']);
    setFeedbackToast(`${selectedIds.length} transação(ões) marcada(s) para Auditoria & Compliance.`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Global Keyboard Shortcuts (Shift+A for batch approve, Shift+R for batch reject)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleBatchApprove();
        }
      } else if (e.shiftKey && e.key.toLowerCase() === 'r') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleBatchReject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Available tags across all payment intents for filtering
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    paymentIntents.forEach(pi => {
      if (pi.tags && Array.isArray(pi.tags)) {
        pi.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [paymentIntents]);

  // Filtered transactions
  const filteredIntents = useMemo(() => {
    return paymentIntents.filter(pi => {
      // Search term
      const matchesSearch = 
        pi.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pi.customer?.name || pi.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pi.customer?.email || pi.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pi.tags && pi.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

      // Status filter
      const matchesStatus = statusFilter === 'all' || pi.status === statusFilter;

      // Tag filter
      const matchesTag = tagFilter === 'all' || (pi.tags && pi.tags.includes(tagFilter));

      return matchesSearch && matchesStatus && matchesTag;
    });
  }, [paymentIntents, searchTerm, statusFilter, tagFilter]);

  const isAllSelected = filteredIntents.length > 0 && selectedIds.length === filteredIntents.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < filteredIntents.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIntents.map(pi => pi.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleApplySelectedTags = () => {
    if (tagsToApply.length === 0) return;
    bulkTagPaymentIntents(selectedIds, tagsToApply);
    setFeedbackToast(`${tagsToApply.length} tag(s) aplicadas em ${selectedIds.length} transação(ões) selecionada(s).`);
    setIsTagModalOpen(false);
    setTagsToApply([]);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tagsToApply.includes(trimmed)) {
      setTagsToApply(prev => [...prev, trimmed]);
      setCustomTagInput('');
    }
  };

  const toggleTagToApply = (tagName: string) => {
    setTagsToApply(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleQuickTag = (tag: string) => {
    if (selectedIds.length === 0) return;
    bulkTagPaymentIntents(selectedIds, [tag]);
    setFeedbackToast(`Tag "${tag}" vinculada a ${selectedIds.length} transação(ões).`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Helper for tag color
  const getTagBadgeColor = (tag: string) => {
    const found = PREDEFINED_TAGS.find(pt => pt.name.toLowerCase() === tag.toLowerCase());
    const color = found ? found.color : 'slate';

    switch (color) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
      case 'rose': return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
      case 'cyan': return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-800';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const isCompact = displayDensity === 'compact';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden space-y-4 p-5">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header with Title & Density Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Transações & Etiquetagem em Lote (Bulk Tagging)
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredIntents.length} registros
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isCompact 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' 
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              Modo {isCompact ? 'Compacto (Alta Densidade)' : 'Confortável'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecione múltiplos pagamentos para categorização, regras antifraude e pós-processamento no CRM
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar ID, cardholder, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8.5 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">Todos os Status</option>
            <option value="succeeded">Aprovados</option>
            <option value="requires_action">Ação Necessária (3DS)</option>
            <option value="canceled">Cancelados / Recusados</option>
          </select>

          {/* Tag Filter */}
          {allAvailableTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="h-8.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="all">Todas as Tags</option>
              {allAvailableTags.map(t => (
                <option key={t} value={t}>Tag: {t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar (when ≥ 1 rows selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-linear-to-r from-indigo-50 to-purple-50 p-3 shadow-md dark:border-indigo-900/60 dark:from-slate-800 dark:to-indigo-950/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              {selectedIds.length}
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {selectedIds.length} {selectedIds.length === 1 ? 'transação selecionada' : 'transações selecionadas'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Tag Pills */}
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Atalhos rápidos:</span>
            {PREDEFINED_TAGS.slice(0, 4).map(pt => (
              <button
                key={pt.name}
                type="button"
                onClick={() => handleQuickTag(pt.name)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                <Tag className="h-3 w-3 text-indigo-500" />
                <span>+ {pt.name}</span>
              </button>
            ))}

            {/* Open Full Tag Modal Button */}
            <button
              id="btn-open-bulk-tag-modal"
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Gerenciar Tags ({selectedIds.length})</span>
            </button>

            {/* Batch Approve (Shift+A) */}
            <button
              type="button"
              onClick={handleBatchApprove}
              title="Aprovar Selecionadas (Shift+A)"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Aprovar (Shift+A)</span>
            </button>

            {/* Batch Reject (Shift+R) */}
            <button
              type="button"
              onClick={handleBatchReject}
              title="Rejeitar Selecionadas (Shift+R)"
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Rejeitar (Shift+R)</span>
            </button>

            {/* Batch Reconcile */}
            <button
              type="button"
              onClick={() => setModalAction({ isOpen: true, type: 'reconcile' })}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Conciliar</span>
            </button>

            {/* Mark as Fraudulent */}
            <button
              type="button"
              onClick={() => setModalAction({ isOpen: true, type: 'fraud' })}
              className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400 transition-all"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Marcar Fraude</span>
            </button>

            {/* Export Selected */}
            <button
              type="button"
              onClick={() => setModalAction({ isOpen: true, type: 'export' })}
              title="Exportar Transações Selecionadas em CSV"
              className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-700 dark:bg-slate-800 dark:text-indigo-300 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar ({selectedIds.length})</span>
            </button>

            {/* Flag for Audit */}
            <button
              type="button"
              onClick={handleBatchFlagAudit}
              title="Marcar para Auditoria & Compliance"
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300 transition-all"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Flag p/ Auditoria</span>
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Limpar Seleção
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <th className={`w-10 ${isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}`}>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title={isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isIndeterminate ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded border border-indigo-600 bg-indigo-600 text-white">
                      <div className="h-0.5 w-2 bg-white" />
                    </div>
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>ID / Data</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Cardholder & Email</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Valor (BRL)</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Método & Bandeira</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Status</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Score Risco</th>
              <th className={isCompact ? 'py-2 px-2.5' : 'py-3.5 px-4'}>Tags & Etiquetas CRM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {filteredIntents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                  Nenhuma transação encontrada com os filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredIntents.map((intent) => {
                const isSelected = selectedIds.includes(intent.id);
                const isSucceeded = intent.status === 'succeeded';
                const isRequiresAction = intent.status === 'requires_action';

                return (
                  <tr
                    key={intent.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <button
                        type="button"
                        onClick={() => handleToggleSelectRow(intent.id)}
                        className="flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* ID & Date */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <div className="flex flex-col">
                        <span className={`font-mono font-bold text-slate-900 dark:text-white ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                          {intent.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(intent.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <div className="flex flex-col">
                        <span className={`font-bold text-slate-800 dark:text-slate-200 ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                          {intent.customerName || 'Cliente'}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {intent.customerEmail || 'cliente@email.com'}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <span className={`font-mono font-bold text-slate-900 dark:text-white ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                        R$ {(intent.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Method */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <div className="flex items-center gap-1.5">
                        <span className="capitalize text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {(intent.paymentMethodTypes || ['card']).join(', ')}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isSucceeded
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isRequiresAction
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isSucceeded && <CheckCircle2 className="h-3 w-3" />}
                        {isRequiresAction && <Clock className="h-3 w-3" />}
                        <span>{isSucceeded ? 'Aprovado' : isRequiresAction ? '3DS Pendente' : 'Recusado'}</span>
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        12/100
                      </span>
                    </td>

                    {/* Tags List */}
                    <td className={isCompact ? 'py-1.5 px-2.5' : 'py-3 px-4'}>
                      <div className="flex flex-wrap items-center gap-1">
                        {intent.tags && intent.tags.length > 0 ? (
                          intent.tags.map(t => (
                            <span
                              key={t}
                              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${getTagBadgeColor(t)}`}
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIds([intent.id]);
                              setIsTagModalOpen(true);
                            }}
                            className="flex items-center gap-1 rounded border border-dashed border-slate-300 px-1.5 py-0.5 text-[10px] text-slate-400 hover:border-slate-500 hover:text-slate-700 dark:border-slate-700 dark:hover:text-slate-300"
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>Adicionar tag</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Tagging Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Aplicar Tags em Lote ({selectedIds.length} selecionadas)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Custom Tag Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Criar Nova Tag Personalizada:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: Auditoria Black Friday, Cliente VIP..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Predefined Tags Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Tags Recomendadas:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {PREDEFINED_TAGS.map(pt => {
                  const isSelected = tagsToApply.includes(pt.name);
                  return (
                    <button
                      key={pt.name}
                      type="button"
                      onClick={() => toggleTagToApply(pt.name)}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3" />}
                      <span>{pt.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Tags summary */}
            {tagsToApply.length > 0 && (
              <div className="rounded-xl bg-indigo-50/80 p-3 text-xs dark:bg-indigo-950/40">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                  Tags selecionadas para aplicar ({tagsToApply.length}):
                </span>
                <div className="flex flex-wrap gap-1">
                  {tagsToApply.map(t => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-md bg-white border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-slate-800 dark:border-indigo-800 dark:text-indigo-300"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => toggleTagToApply(t)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={tagsToApply.length === 0}
                onClick={handleApplySelectedTags}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all"
              >
                Salvar & Aplicar Tags
              </button>
            </div>
          </div>
        </div>
      )}

      {modalAction && (
        <BatchActionConfirmationModal
          isOpen={modalAction.isOpen}
          onClose={() => setModalAction(null)}
          onConfirm={handleConfirmAction}
          actionType={modalAction.type}
          count={selectedIds.length}
        />
      )}
    </div>
  );
};
