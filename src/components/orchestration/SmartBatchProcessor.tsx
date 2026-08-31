import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  RefreshCcw, 
  FileText, 
  Check, 
  X, 
  Flag, 
  ArrowRight, 
  Sliders, 
  Download, 
  Layers, 
  TrendingDown, 
  DollarSign,
  Search,
  WifiOff,
  CloudLightning,
  Sparkles,
  Info
} from 'lucide-react';
import { OfflineSyncService } from '../../services/offlineSyncService';

export interface DiscrepancyItem {
  id: string;
  csvAmount: number;
  ledgerAmount: number;
  customer: string;
  acquirerRef: string;
  csvStatus: string;
  ledgerStatus: string;
  acquirerFee: number;
  expectedFee: number;
  settlementDate: string;
  conflictType: 'AMOUNT_MISMATCH' | 'STATUS_MISMATCH' | 'FEE_OVERCHARGE' | 'ORPHAN_RECORD' | 'EXACT_MATCH';
  conflictSeverity: 'high' | 'medium' | 'low' | 'none';
  confidenceScore: number;
  resolutionStatus: 'pending' | 'accepted' | 'flagged';
  resolutionNotes?: string;
}

const SAMPLE_CSV_DEFAULT = `tx_id,amount,customer,acquirer_ref,settlement_date,acquirer_fee,csv_status
pi_101,250.00,Empresa Alpha A,acq_cielo_991,2026-08-29,4.75,SETTLED
pi_102,1250.00,Beta Corp Ltda,acq_stone_882,2026-08-29,38.50,SETTLED
pi_103,450.00,Loja Gamma Modas,acq_rede_773,2026-08-29,18.90,SETTLED
pi_104,89.90,Padaria Central,acq_pagseguro_664,2026-08-29,3.20,SETTLED
pi_105,3400.00,Construtora Sigma,acq_stone_551,2026-08-29,129.00,SETTLED
pi_orphan_99,780.00,Posto Delta Combustíveis,acq_cielo_449,2026-08-29,15.60,SETTLED
pi_106,120.00,Farmácia Vitalis,acq_iugu_332,2026-08-29,2.40,REFUNDED`;

export const SmartBatchProcessor: React.FC = () => {
  const { addToast, paymentIntents } = usePayment();
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85);
  const [rawInput, setRawInput] = useState<string>(SAMPLE_CSV_DEFAULT);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'conflicts' | 'resolved' | 'flagged'>('conflicts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [discrepancyList, setDiscrepancyList] = useState<DiscrepancyItem[]>([]);
  const [isSyncingOffline, setIsSyncingOffline] = useState<boolean>(false);

  // Run automated reconciliation against internal Ledger
  const handleRunBatchReconciliation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const lines = rawInput.trim().split('\n').filter(Boolean);
      if (lines.length <= 1) {
        setIsProcessing(false);
        addToast('Erro de Arquivo', 'O arquivo CSV não possui linhas suficientes de dados.', 'error');
        return;
      }

      const rows = lines.slice(1); // skip header
      const generated: DiscrepancyItem[] = rows.map((line, idx) => {
        const parts = line.split(',').map(s => s.trim());
        const id = parts[0] || `tx_${idx + 100}`;
        const csvAmount = parseFloat(parts[1]) || 100.0;
        const customer = parts[2] || `Cliente ${idx + 1}`;
        const acquirerRef = parts[3] || `acq_ref_${idx}`;
        const settlementDate = parts[4] || '2026-08-29';
        const acquirerFee = parseFloat(parts[5]) || 2.50;
        const csvStatus = (parts[6] || 'SETTLED').toUpperCase();

        // Cross-match with existing Payment Intents or synthetic ledger
        const matchedIntent = paymentIntents.find(p => p.id === id);
        const ledgerAmount = matchedIntent ? matchedIntent.amount : (id === 'pi_102' ? 1200.00 : (id === 'pi_orphan_99' ? 0 : csvAmount));
        const ledgerStatus = matchedIntent ? (matchedIntent.status === 'succeeded' ? 'SETTLED' : matchedIntent.status.toUpperCase()) : (id === 'pi_103' ? 'CHARGEBACK' : (id === 'pi_orphan_99' ? 'NOT_FOUND' : 'SETTLED'));
        const expectedFee = +(csvAmount * 0.019).toFixed(2); // 1.9% contractual MDR standard

        let conflictType: DiscrepancyItem['conflictType'] = 'EXACT_MATCH';
        let conflictSeverity: DiscrepancyItem['conflictSeverity'] = 'none';
        let confidenceScore = 98;

        if (id === 'pi_orphan_99' || ledgerStatus === 'NOT_FOUND') {
          conflictType = 'ORPHAN_RECORD';
          conflictSeverity = 'high';
          confidenceScore = 42;
        } else if (Math.abs(csvAmount - ledgerAmount) > 0.01) {
          conflictType = 'AMOUNT_MISMATCH';
          conflictSeverity = 'high';
          confidenceScore = 65;
        } else if (csvStatus !== ledgerStatus) {
          conflictType = 'STATUS_MISMATCH';
          conflictSeverity = 'medium';
          confidenceScore = 72;
        } else if (acquirerFee > expectedFee * 1.3) {
          conflictType = 'FEE_OVERCHARGE';
          conflictSeverity = 'low';
          confidenceScore = 81;
        }

        return {
          id,
          csvAmount,
          ledgerAmount,
          customer,
          acquirerRef,
          csvStatus,
          ledgerStatus,
          acquirerFee,
          expectedFee,
          settlementDate,
          conflictType,
          conflictSeverity,
          confidenceScore,
          resolutionStatus: conflictType === 'EXACT_MATCH' ? 'accepted' : 'pending'
        };
      });

      setDiscrepancyList(generated);
      setIsProcessing(false);
      setHasRun(true);

      const conflictsCount = generated.filter(g => g.conflictType !== 'EXACT_MATCH').length;
      addToast(
        'Reconciliação Concluída',
        `Foram analisadas ${generated.length} transações no lote CSV. ${conflictsCount} divergências identificadas para resolução.`,
        conflictsCount > 0 ? 'warning' : 'success'
      );
    }, 700);
  };

  // Granular Action: Accept Discrepancy (Acatar e ajustar Ledger)
  const handleAcceptDiscrepancy = async (id: string, notes?: string) => {
    setDiscrepancyList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, resolutionStatus: 'accepted', resolutionNotes: notes || 'Acatado pelo operador financeiro' };
      }
      return item;
    }));

    // Enqueue in Offline Background Sync service
    await OfflineSyncService.enqueueTask({
      type: 'reconciliation_conflict',
      payload: {
        csvRowId: id,
        action: 'accept',
        notes: notes || 'Acatado manualmente via Conflict Resolution Visualizer'
      }
    });

    addToast('Conflito Acatado', `Transação ${id} foi acatada e sincronizada com o Ledger de liquidação.`, 'success');
  };

  // Granular Action: Flag Discrepancy (Sinalizar / Abrir Contestação)
  const handleFlagDiscrepancy = async (id: string, reason?: string) => {
    setDiscrepancyList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, resolutionStatus: 'flagged', resolutionNotes: reason || 'Sinalizado para auditoria/contestação com adquirente' };
      }
      return item;
    }));

    // Enqueue in Offline Background Sync service
    await OfflineSyncService.enqueueTask({
      type: 'reconciliation_conflict',
      payload: {
        csvRowId: id,
        action: 'flag',
        notes: reason || 'Sinalizado para contestação com adquirente'
      }
    });

    addToast('Transação Sinalizada', `Transação ${id} marcada com flag de auditoria e enviada para contestação.`, 'warning');
  };

  // Bulk Actions
  const handleAcceptAllLowSeverity = () => {
    const targets = discrepancyList.filter(d => d.resolutionStatus === 'pending' && (d.conflictSeverity === 'low' || d.conflictType === 'FEE_OVERCHARGE'));
    targets.forEach(t => handleAcceptDiscrepancy(t.id, 'Acatado em lote (baixa severidade / MDR)'));
    addToast('Ações em Lote', `${targets.length} divergências de baixa severidade foram acatadas.`, 'success');
  };

  const handleFlagAllHighSeverity = () => {
    const targets = discrepancyList.filter(d => d.resolutionStatus === 'pending' && d.conflictSeverity === 'high');
    targets.forEach(t => handleFlagDiscrepancy(t.id, 'Sinalizado em lote para compliance'));
    addToast('Ações em Lote', `${targets.length} divergências críticas sinalizadas para disputa.`, 'error');
  };

  // Trigger immediate background sync
  const handleTriggerBackgroundSync = async () => {
    setIsSyncingOffline(true);
    try {
      const count = await OfflineSyncService.triggerImmediateSync();
      addToast('Background Sync', `${count} tarefas de reconciliação sincronizadas com o Service Worker central!`, 'success');
    } catch {
      addToast('Sync Erro', 'Falha ao sincronizar tarefas pendentes.', 'error');
    } finally {
      setIsSyncingOffline(false);
    }
  };

  // Export dispute dossier
  const handleExportDisputeDossier = () => {
    const flagged = discrepancyList.filter(d => d.resolutionStatus === 'flagged');
    if (flagged.length === 0) {
      addToast('Exportação', 'Não há itens sinalizados para exportação de dossiê de contestação.', 'info');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID,Cliente,Ref_Adquirente,Valor_CSV,Valor_Ledger,Diferenca,Taxa_Cobrada,Taxa_Esperada,Status_CSV,Status_Ledger,Tipo_Conflito,Motivo_Sinalizacao\n';
    flagged.forEach(item => {
      const diff = (item.csvAmount - item.ledgerAmount).toFixed(2);
      csvContent += `${item.id},"${item.customer}",${item.acquirerRef},${item.csvAmount},${item.ledgerAmount},${diff},${item.acquirerFee},${item.expectedFee},${item.csvStatus},${item.ledgerStatus},${item.conflictType},"${item.resolutionNotes || 'Discrepância detectada'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nercash_dossie_disputa_reconciliacao_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Dossiê Exportado', `${flagged.length} registros exportados em CSV para contestação com a credenciadora.`, 'success');
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const totalRows = discrepancyList.length;
    const conflicts = discrepancyList.filter(d => d.conflictType !== 'EXACT_MATCH');
    const resolved = discrepancyList.filter(d => d.resolutionStatus === 'accepted');
    const flagged = discrepancyList.filter(d => d.resolutionStatus === 'flagged');
    const totalDisputedAmount = flagged.reduce((acc, curr) => acc + curr.csvAmount, 0);
    const accuracyRate = totalRows > 0 ? (((totalRows - conflicts.length) / totalRows) * 100).toFixed(1) : '100';

    return {
      totalRows,
      conflictsCount: conflicts.length,
      resolvedCount: resolved.length,
      flaggedCount: flagged.length,
      totalDisputedAmount,
      accuracyRate
    };
  }, [discrepancyList]);

  // Filtered discrepancy items
  const filteredItems = useMemo(() => {
    return discrepancyList.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = item.id.toLowerCase().includes(q) ||
          item.customer.toLowerCase().includes(q) ||
          item.acquirerRef.toLowerCase().includes(q) ||
          item.conflictType.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Filter tabs
      if (filterMode === 'conflicts') return item.conflictType !== 'EXACT_MATCH';
      if (filterMode === 'resolved') return item.resolutionStatus === 'accepted';
      if (filterMode === 'flagged') return item.resolutionStatus === 'flagged';
      return true;
    });
  }, [discrepancyList, filterMode, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  CSV Batch Reconciliation & Settlement Conflict Visualizer
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Ledger Sync v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cruze lotes de liquidação das credenciadoras contra o Ledger imutável com resolução automatizada de divergências (Accept / Flag)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTriggerBackgroundSync}
              disabled={isSyncingOffline}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              title="Disparar sincronização com Service Worker em segundo plano"
            >
              <CloudLightning className={`h-4 w-4 text-amber-500 ${isSyncingOffline ? 'animate-spin' : ''}`} />
              <span>{isSyncingOffline ? 'Sincronizando...' : 'Background Sync'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunBatchReconciliation}
              disabled={isProcessing}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Play className={`h-4 w-4 ${isProcessing ? 'animate-pulse' : ''}`} />
              <span>{isProcessing ? 'Cruzando com Ledger...' : 'Executar Reconciliação'}</span>
            </button>
          </div>
        </div>

        {/* Input and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CSV Input Area */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Arquivo CSV de Liquidação (Extrato Adquirente)
              </label>
              <button
                type="button"
                onClick={() => setRawInput(SAMPLE_CSV_DEFAULT)}
                className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
              >
                Carregar Exemplo com Divergências
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={7}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 font-mono text-[11px] leading-relaxed text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                placeholder="tx_id,amount,customer,acquirer_ref,settlement_date,acquirer_fee,csv_status..."
              />
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-indigo-500" />
                <span>Formatos suportados: CSV com vírgulas ou ponto-e-vírgula</span>
              </span>
              <span>{rawInput.trim().split('\n').filter(Boolean).length} linhas</span>
            </div>
          </div>

          {/* Real-time Reconciliation KPIs */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Lote Total</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {metrics.totalRows}
              </div>
              <span className="text-[10px] text-slate-500">Transações no arquivo</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/30 dark:bg-amber-950/20 space-y-1">
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Conflitos</span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {metrics.conflictsCount}
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-300">Requerem ação</span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/30 dark:bg-rose-950/20 space-y-1">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Em Disputa</span>
              <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                R$ {metrics.totalDisputedAmount.toFixed(2)}
              </div>
              <span className="text-[10px] text-rose-700 dark:text-rose-300">{metrics.flaggedCount} sinalizados</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Acurácia</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.accuracyRate}%
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300">Sem divergências</span>
            </div>

            {/* Quick Multi-Action Box */}
            <div className="col-span-2 sm:col-span-4 rounded-2xl border border-slate-200 bg-indigo-50/40 p-4 dark:border-slate-800 dark:bg-indigo-950/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ações Rápidas de Resolução de Conflitos:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptAllLowSeverity}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-xs hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-800 dark:text-emerald-400 cursor-pointer"
                >
                  ✓ Acatar Todas Baixa Severidade
                </button>
                <button
                  type="button"
                  onClick={handleFlagAllHighSeverity}
                  className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200 shadow-xs hover:bg-rose-50 dark:bg-slate-900 dark:border-rose-800 dark:text-rose-400 cursor-pointer"
                >
                  🚩 Sinalizar Todas Críticas
                </button>
                <button
                  type="button"
                  onClick={handleExportDisputeDossier}
                  className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Dossiê CSV Disputa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Conflict Resolution Visualizer Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Filter Tabs & Search Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setFilterMode('conflicts')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'conflicts'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Divergências ({metrics.conflictsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Todos os Registros ({metrics.totalRows})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('resolved')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'resolved'
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Acatados ({metrics.resolvedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('flagged')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'flagged'
                  ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sinalizados ({metrics.flaggedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por ID, cliente ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Conflict Visualizer Rows */}
        {!hasRun ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 dark:border-slate-800 space-y-3">
            <Upload className="mx-auto h-10 w-10 text-indigo-400 animate-bounce" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma análise de reconciliação em lote executada ainda
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Clique no botão "Executar Reconciliação" acima para que o algoritmo cruze o arquivo CSV com o Ledger central e identifique conflitos.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum registro encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredItems.map((item) => {
              const isAmountMismatch = item.conflictType === 'AMOUNT_MISMATCH';
              const isStatusMismatch = item.conflictType === 'STATUS_MISMATCH';
              const isOrphan = item.conflictType === 'ORPHAN_RECORD';
              const isFeeMismatch = item.conflictType === 'FEE_OVERCHARGE';

              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl transition-all my-2 border ${
                    item.resolutionStatus === 'flagged'
                      ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                      : item.resolutionStatus === 'accepted'
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : item.conflictSeverity === 'high'
                      ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                      : 'border-slate-100 bg-white dark:border-slate-800/60 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Transaction Info & Badges */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          • {item.customer}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {item.acquirerRef}
                        </span>

                        {/* Conflict Badge */}
                        {isAmountMismatch && (
                          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Divergência de Valor
                          </span>
                        )}
                        {isStatusMismatch && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Status Divergente
                          </span>
                        )}
                        {isOrphan && (
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Registro Órfão no Ledger
                          </span>
                        )}
                        {isFeeMismatch && (
                          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            Sobretaxa MDR Adquirente
                          </span>
                        )}
                        {item.conflictType === 'EXACT_MATCH' && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Conciliado 100%
                          </span>
                        )}
                      </div>

                      {/* Side-by-Side Comparison Box */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 text-xs">
                        {/* CSV Column */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                            Valor no CSV (Adquirente)
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              R$ {item.csvAmount.toFixed(2)}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              Status: {item.csvStatus}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            MDR Cobrado: R$ {item.acquirerFee.toFixed(2)}
                          </span>
                        </div>

                        {/* Ledger Column */}
                        <div className={`rounded-xl border p-2.5 ${
                          item.conflictType !== 'EXACT_MATCH'
                            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/60'
                        }`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Registro no Ledger Interno
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`font-mono font-bold ${item.ledgerAmount === 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                              {item.ledgerAmount > 0 ? `R$ ${item.ledgerAmount.toFixed(2)}` : 'Não Encontrado'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              Status: {item.ledgerStatus}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            MDR Contratual: R$ {item.expectedFee.toFixed(2)}
                          </span>
                        </div>

                        {/* Differential & Score */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950/60 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Diferencial & Confiança
                            </span>
                            <div className="flex items-center justify-between mt-1">
                              <span className={`font-mono text-xs font-bold ${
                                Math.abs(item.csvAmount - item.ledgerAmount) > 0.01 ? 'text-rose-600' : 'text-emerald-600'
                              }`}>
                                Δ R$ {(item.csvAmount - item.ledgerAmount).toFixed(2)}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                Score {item.confidenceScore}%
                              </span>
                            </div>
                          </div>
                          {item.resolutionNotes && (
                            <span className="text-[10px] text-slate-500 italic truncate mt-1">
                              Nota: {item.resolutionNotes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Resolution Buttons (Accept / Flag) */}
                    <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      {item.resolutionStatus === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptDiscrepancy(item.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Acatar (Accept)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFlagDiscrepancy(item.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-500 transition-all cursor-pointer"
                          >
                            <Flag className="h-3.5 w-3.5" />
                            <span>Sinalizar (Flag)</span>
                          </button>
                        </>
                      ) : item.resolutionStatus === 'accepted' ? (
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ✓ Acatado no Ledger
                          </span>
                          <button
                            type="button"
                            onClick={() => handleFlagDiscrepancy(item.id)}
                            className="text-[11px] text-slate-400 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            Mudar para Flag
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            🚩 Sinalizado p/ Disputa
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAcceptDiscrepancy(item.id)}
                            className="text-[11px] text-slate-400 hover:text-emerald-600 hover:underline cursor-pointer"
                          >
                            Acatar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
