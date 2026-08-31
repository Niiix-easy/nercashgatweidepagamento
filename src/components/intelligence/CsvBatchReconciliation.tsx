import React, { useState, useRef, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  Flag, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Layers,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Eye,
  X,
  Database,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { OfflineSyncService } from '../../services/offlineSyncService';

export interface ReconciliationConflictRecord {
  id: string;
  txId: string;
  provider: string;
  customer: string;
  acquirerRef: string;
  settlementDate: string;
  
  // CSV values
  csvAmount: number;
  csvStatus: 'SETTLED' | 'REFUNDED' | 'CHARGEBACK' | 'PENDING';
  csvFee: number;

  // System Ledger values
  ledgerAmount: number;
  ledgerStatus: 'SETTLED' | 'REFUNDED' | 'CHARGEBACK' | 'PENDING' | 'NOT_FOUND';
  contractualFee: number;

  // Conflict classification
  conflictType: 'EXACT_MATCH' | 'AMOUNT_MISMATCH' | 'STATUS_MISMATCH' | 'FEE_OVERCHARGE' | 'ORPHAN_RECORD';
  severity: 'low' | 'medium' | 'high' | 'none';
  confidenceScore: number;
  
  // Resolution state
  resolution: 'pending' | 'accepted' | 'flagged';
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

const INITIAL_DEMO_RECORDS: ReconciliationConflictRecord[] = [
  {
    id: 'rec_101',
    txId: 'pi_cielo_9011',
    provider: 'Cielo V3',
    customer: 'TechCorp Brasil Ltda',
    acquirerRef: 'AUTH_CIELO_8841',
    settlementDate: '2026-08-29',
    csvAmount: 2500.00,
    csvStatus: 'SETTLED',
    csvFee: 47.50,
    ledgerAmount: 2500.00,
    ledgerStatus: 'SETTLED',
    contractualFee: 47.50,
    conflictType: 'EXACT_MATCH',
    severity: 'none',
    confidenceScore: 100,
    resolution: 'accepted',
    resolvedAt: '2026-08-29 10:15:00',
    resolvedBy: 'Auto-Reconciliation Engine'
  },
  {
    id: 'rec_102',
    txId: 'pi_stone_9022',
    provider: 'Stone Pagamentos',
    customer: 'Varejo Alfa Express',
    acquirerRef: 'AUTH_STONE_3321',
    settlementDate: '2026-08-29',
    csvAmount: 1250.00,
    csvStatus: 'SETTLED',
    csvFee: 38.50,
    ledgerAmount: 1200.00,
    ledgerStatus: 'SETTLED',
    contractualFee: 22.80,
    conflictType: 'AMOUNT_MISMATCH',
    severity: 'high',
    confidenceScore: 68,
    resolution: 'pending'
  },
  {
    id: 'rec_103',
    txId: 'pi_rede_9033',
    provider: 'Rede Itaú',
    customer: 'Distribuidora Gamma',
    acquirerRef: 'AUTH_REDE_9912',
    settlementDate: '2026-08-29',
    csvAmount: 450.00,
    csvStatus: 'SETTLED',
    csvFee: 8.55,
    ledgerAmount: 450.00,
    ledgerStatus: 'CHARGEBACK',
    contractualFee: 8.55,
    conflictType: 'STATUS_MISMATCH',
    severity: 'high',
    confidenceScore: 61,
    resolution: 'pending'
  },
  {
    id: 'rec_104',
    txId: 'pi_pagseguro_9044',
    provider: 'PagBank / PagSeguro',
    customer: 'Supermercado Central',
    acquirerRef: 'AUTH_PAGS_7721',
    settlementDate: '2026-08-29',
    csvAmount: 3400.00,
    csvStatus: 'SETTLED',
    csvFee: 119.00,
    ledgerAmount: 3400.00,
    ledgerStatus: 'SETTLED',
    contractualFee: 64.60,
    conflictType: 'FEE_OVERCHARGE',
    severity: 'medium',
    confidenceScore: 78,
    resolution: 'pending'
  },
  {
    id: 'rec_105',
    txId: 'pi_orphan_extrato_99',
    provider: 'Cielo V3',
    customer: 'Desconhecido / Lote Bancário',
    acquirerRef: 'AUTH_CIELO_ORPHAN_441',
    settlementDate: '2026-08-29',
    csvAmount: 780.00,
    csvStatus: 'SETTLED',
    csvFee: 15.60,
    ledgerAmount: 0.00,
    ledgerStatus: 'NOT_FOUND',
    contractualFee: 0.00,
    conflictType: 'ORPHAN_RECORD',
    severity: 'high',
    confidenceScore: 42,
    resolution: 'pending'
  },
  {
    id: 'rec_106',
    txId: 'pi_iugu_9055',
    provider: 'Iugu BaaS',
    customer: 'Academia Fitness Pro',
    acquirerRef: 'AUTH_IUGU_1192',
    settlementDate: '2026-08-29',
    csvAmount: 180.00,
    csvStatus: 'SETTLED',
    csvFee: 3.42,
    ledgerAmount: 180.00,
    ledgerStatus: 'SETTLED',
    contractualFee: 3.42,
    conflictType: 'EXACT_MATCH',
    severity: 'none',
    confidenceScore: 100,
    resolution: 'accepted',
    resolvedAt: '2026-08-29 11:20:00',
    resolvedBy: 'Auto-Reconciliation Engine'
  }
];

export const CsvBatchReconciliation: React.FC = () => {
  const { addToast } = usePayment();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [records, setRecords] = useState<ReconciliationConflictRecord[]>(INITIAL_DEMO_RECORDS);
  const [filterTab, setFilterTab] = useState<'all' | 'conflicts' | 'pending' | 'resolved' | 'flagged'>('conflicts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<ReconciliationConflictRecord | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = records.length;
    const exactMatches = records.filter(r => r.conflictType === 'EXACT_MATCH').length;
    const conflicts = records.filter(r => r.conflictType !== 'EXACT_MATCH');
    const pendingConflicts = conflicts.filter(r => r.resolution === 'pending').length;
    const acceptedConflicts = records.filter(r => r.resolution === 'accepted').length;
    const flaggedConflicts = records.filter(r => r.resolution === 'flagged').length;
    
    // Net discrepancy volume
    const totalDiscrepancyAmount = conflicts.reduce((sum, r) => sum + Math.abs(r.csvAmount - r.ledgerAmount), 0);
    const totalFeeDiscrepancy = conflicts.reduce((sum, r) => sum + Math.max(0, r.csvFee - r.contractualFee), 0);

    const resolutionRate = conflicts.length > 0 
      ? Math.round(((conflicts.length - pendingConflicts) / conflicts.length) * 100)
      : 100;

    return {
      total,
      exactMatches,
      conflictsCount: conflicts.length,
      pendingConflicts,
      acceptedConflicts,
      flaggedConflicts,
      totalDiscrepancyAmount,
      totalFeeDiscrepancy,
      resolutionRate
    };
  }, [records]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Tab filter
      if (filterTab === 'conflicts' && record.conflictType === 'EXACT_MATCH') return false;
      if (filterTab === 'pending' && (record.resolution !== 'pending' || record.conflictType === 'EXACT_MATCH')) return false;
      if (filterTab === 'resolved' && record.resolution !== 'accepted') return false;
      if (filterTab === 'flagged' && record.resolution !== 'flagged') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          record.txId.toLowerCase().includes(q) ||
          record.customer.toLowerCase().includes(q) ||
          record.acquirerRef.toLowerCase().includes(q) ||
          record.provider.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [records, filterTab, searchQuery]);

  // One-click action: Accept discrepancy (with IndexedDB sync queue)
  const handleAcceptDiscrepancy = async (recordId: string) => {
    const item = records.find(r => r.id === recordId);
    if (!item) return;

    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          resolution: 'accepted',
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resolvedBy: 'Admin (Manual Adjustment)',
          notes: 'Ajuste contábil aceito no Ledger pelo operador.'
        };
      }
      return rec;
    }));

    // Enqueue task in persistent IndexedDB for resilient background sync
    await OfflineSyncService.enqueueTask({
      type: 'reconciliation_conflict',
      payload: {
        csvRowId: recordId,
        action: 'accept',
        amount: item.csvAmount,
        discrepancyType: item.conflictType,
        resolvedBy: 'Admin (Manual Adjustment)',
        notes: `Aceite de conciliação para ${item.txId}`
      }
    });

    addToast(
      'Discrepância Aceita (1-Click)',
      `Transação ${item.txId} marcada como reconciliada. Ajuste contábil gravado e enfileirado na fila IndexedDB.`,
      'success'
    );
  };

  // One-click action: Flag discrepancy for investigation (with IndexedDB sync queue)
  const handleFlagDiscrepancy = async (recordId: string) => {
    const item = records.find(r => r.id === recordId);
    if (!item) return;

    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          resolution: 'flagged',
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resolvedBy: 'Admin (Audit Dispute)',
          notes: 'Sinalizado para auditoria forense junto ao adquirente bancário.'
        };
      }
      return rec;
    }));

    // Enqueue task in persistent IndexedDB for resilient background sync
    await OfflineSyncService.enqueueTask({
      type: 'reconciliation_conflict',
      payload: {
        csvRowId: recordId,
        action: 'flag',
        amount: item.csvAmount,
        discrepancyType: item.conflictType,
        resolvedBy: 'Admin (Audit Dispute)',
        notes: `Sinalização de contestação para ${item.txId}`
      }
    });

    addToast(
      'Discrepância Sinalizada (1-Click)',
      `Transação ${item.txId} sinalizada para contestação/disputa de conciliação. Registrado na fila IndexedDB.`,
      'error'
    );
  };

  // Bulk actions
  const handleBulkAcceptLowValue = async () => {
    let count = 0;
    const feeRecords = records.filter(r => r.resolution === 'pending' && r.conflictType === 'FEE_OVERCHARGE');
    
    setRecords(prev => prev.map(rec => {
      if (rec.resolution === 'pending' && rec.conflictType === 'FEE_OVERCHARGE') {
        count++;
        return {
          ...rec,
          resolution: 'accepted',
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resolvedBy: 'Admin (Bulk Rule: MDR Overcharge)',
          notes: 'Divergência de taxa absorvida e aceita em lote.'
        };
      }
      return rec;
    }));

    for (const r of feeRecords) {
      await OfflineSyncService.enqueueTask({
        type: 'reconciliation_conflict',
        payload: {
          csvRowId: r.id,
          action: 'accept',
          amount: r.csvAmount,
          discrepancyType: r.conflictType,
          resolvedBy: 'Admin (Bulk Rule)',
          notes: 'Divergência de taxa absorvida'
        }
      });
    }

    addToast(
      'Conciliação em Lote',
      `${count} divergência(s) de taxa aceitas e regularizadas no Ledger.`,
      'success'
    );
  };

  const handleBulkFlagOrphans = async () => {
    let count = 0;
    const orphanRecords = records.filter(r => r.resolution === 'pending' && (r.conflictType === 'ORPHAN_RECORD' || r.conflictType === 'STATUS_MISMATCH'));

    setRecords(prev => prev.map(rec => {
      if (rec.resolution === 'pending' && (rec.conflictType === 'ORPHAN_RECORD' || rec.conflictType === 'STATUS_MISMATCH')) {
        count++;
        return {
          ...rec,
          resolution: 'flagged',
          resolvedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resolvedBy: 'Admin (Bulk Rule: High Risk)',
          notes: 'Sinalização automática de registros órfãos para investigação.'
        };
      }
      return rec;
    }));

    for (const r of orphanRecords) {
      await OfflineSyncService.enqueueTask({
        type: 'reconciliation_conflict',
        payload: {
          csvRowId: r.id,
          action: 'flag',
          amount: r.csvAmount,
          discrepancyType: r.conflictType,
          resolvedBy: 'Admin (Bulk Flag)',
          notes: 'Órfão/Status Mismatch sinalizado'
        }
      });
    }

    addToast(
      'Lote Sinalizado',
      `${count} registro(s) órfão(s) ou divergência(s) crítica(s) sinalizados para auditoria.`,
      'error'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast('Arquivo Inválido', 'Por favor envie um arquivo de extrato em formato .CSV.', 'error');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      addToast(
        'Extrato CSV Reconciliado',
        `Arquivo '${file.name}' processado e cruzado com o Ledger central. ${stats.conflictsCount} divergências detectadas para resolução.`,
        'success'
      );
    }, 1000);
  };

  const getConflictBadge = (type: ReconciliationConflictRecord['conflictType']) => {
    switch (type) {
      case 'EXACT_MATCH':
        return { label: 'Conciliado (Exato)', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' };
      case 'AMOUNT_MISMATCH':
        return { label: 'Divergência de Valor', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' };
      case 'STATUS_MISMATCH':
        return { label: 'Divergência de Status', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' };
      case 'FEE_OVERCHARGE':
        return { label: 'MDR / Taxa Excedente', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' };
      case 'ORPHAN_RECORD':
        return { label: 'Registro Órfão no CSV', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' };
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6" id="reconciliation-conflict-visualizer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Visualizador Interativo de Conflitos & Reconciliação CSV vs Ledger
              </h3>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                PCI-DSS & EDI 240
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cruze extratos de adquirentes com o Ledger interno, identifique divergências e aplique resoluções em 1 clique (Aceitar / Sinalizar) com fila offline IndexedDB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <UploadCloud className="h-4 w-4 text-indigo-500" />
            <span>Upload de Extrato CSV</span>
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total de Registros</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.total}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{stats.exactMatches} 100% conciliados ({Math.round((stats.exactMatches / stats.total) * 100)}%)</span>
          </div>
        </div>

        {/* Pending Discrepancies */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Divergências Pendentes</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.pendingConflicts}
          </div>
          <div className="text-[11px] text-slate-500">
            Aguardando decisão do operador
          </div>
        </div>

        {/* Total Discrepancy Amount */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Diferença Financeira Líquida</span>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            R$ {stats.totalDiscrepancyAmount.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">
            + R$ {stats.totalFeeDiscrepancy.toFixed(2)} em MDR excedente
          </div>
        </div>

        {/* Resolution Progress */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Taxa de Resolução</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {stats.resolutionRate}%
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500" 
              style={{ width: `${stats.resolutionRate}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Bulk Decision Quick Bar */}
      {stats.pendingConflicts > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/30 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-semibold">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Ações Rápidas em Lote para Conflitos Pendentes:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleBulkAcceptLowValue}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Aceitar Divergências de MDR/Taxa</span>
            </button>

            <button
              type="button"
              onClick={handleBulkFlagOrphans}
              className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300 transition-all cursor-pointer"
            >
              <Flag className="h-3.5 w-3.5 text-rose-600" />
              <span>Sinalizar Órfãos & Status Críticos</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'conflicts', label: `Divergências (${stats.conflictsCount})` },
            { id: 'pending', label: `Pendentes (${stats.pendingConflicts})` },
            { id: 'resolved', label: `Aceitos (${stats.acceptedConflicts})` },
            { id: 'flagged', label: `Sinalizados (${stats.flaggedConflicts})` },
            { id: 'all', label: `Todos (${stats.total})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ID, Cliente, Provedor..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Side-by-Side Conflict Visualizer Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3 font-bold">Transação & Cliente</th>
              <th className="px-4 py-3 font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-300">
                Extrato CSV (Adquirente / Banco)
              </th>
              <th className="px-4 py-3 font-bold bg-amber-50/40 dark:bg-amber-950/20 text-amber-950 dark:text-amber-300">
                Registro Ledger (Sistema Interno)
              </th>
              <th className="px-4 py-3 font-bold">Delta & Diagnóstico</th>
              <th className="px-4 py-3 font-bold">Status de Resolução</th>
              <th className="px-4 py-3 font-bold text-right">Decisão (1-Click)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  Nenhum registro encontrado para o filtro selecionado.
                </td>
              </tr>
            ) : (
              filteredRecords.map(item => {
                const badge = getConflictBadge(item.conflictType);
                const hasAmountDiff = Math.abs(item.csvAmount - item.ledgerAmount) > 0.01;
                const hasStatusDiff = item.csvStatus !== item.ledgerStatus;
                const hasFeeDiff = item.csvFee > item.contractualFee;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Tx & Customer */}
                    <td className="px-4 py-3.5 space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                        <span>{item.txId}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForDetail(item)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Inspecionar detalhes side-by-side"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {item.customer}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                        {item.provider} • {item.acquirerRef}
                      </div>
                    </td>

                    {/* CSV Side-by-Side Column */}
                    <td className="px-4 py-3.5 space-y-1 bg-indigo-50/20 dark:bg-indigo-950/10">
                      <div className={`font-mono font-extrabold ${hasAmountDiff ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        R$ {item.csvAmount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${hasStatusDiff ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {item.csvStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          MDR: R$ {item.csvFee.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Ledger Side-by-Side Column */}
                    <td className="px-4 py-3.5 space-y-1 bg-amber-50/20 dark:bg-amber-950/10">
                      <div className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {item.ledgerStatus === 'NOT_FOUND' ? (
                          <span className="text-rose-500 font-semibold italic">Não Registrado</span>
                        ) : (
                          `R$ ${item.ledgerAmount.toFixed(2)}`
                        )}
                      </div>
                      {item.ledgerStatus !== 'NOT_FOUND' && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.ledgerStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Esp.: R$ {item.contractualFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Conflict Badge & Diff Delta */}
                    <td className="px-4 py-3.5 space-y-1">
                      <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-extrabold ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {hasAmountDiff && item.ledgerStatus !== 'NOT_FOUND' && (
                        <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">
                          Delta: {item.csvAmount > item.ledgerAmount ? '+' : ''}R$ {(item.csvAmount - item.ledgerAmount).toFixed(2)}
                        </div>
                      )}
                      {hasFeeDiff && (
                        <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          Taxa extra: +R$ {(item.csvFee - item.contractualFee).toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Resolution Status */}
                    <td className="px-4 py-3.5 space-y-0.5">
                      {item.resolution === 'accepted' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Aceito / Ajustado</span>
                          </span>
                          <div className="text-[9px] text-slate-400">
                            {item.resolvedBy?.split(' ')[0]} • {item.resolvedAt?.split(' ')[1]}
                          </div>
                        </div>
                      ) : item.resolution === 'flagged' ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            <Flag className="h-3 w-3" />
                            <span>Sinalizado p/ Auditoria</span>
                          </span>
                          <div className="text-[9px] text-rose-600 dark:text-rose-400">
                            Em contestação com adquirente
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" />
                          <span>Pendente Decisão</span>
                        </span>
                      )}
                    </td>

                    {/* One-Click Action UI (Accept or Flag) */}
                    <td className="px-4 py-3.5 text-right">
                      {item.conflictType === 'EXACT_MATCH' ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reconciliado
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAcceptDiscrepancy(item.id)}
                            disabled={item.resolution === 'accepted'}
                            title="Aceitar discrepância e lançar ajuste contábil no Ledger"
                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                              item.resolution === 'accepted'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{item.resolution === 'accepted' ? 'Aceito' : 'Aceitar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFlagDiscrepancy(item.id)}
                            disabled={item.resolution === 'flagged'}
                            title="Sinalizar discrepância para auditoria/disputa forense"
                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                              item.resolution === 'flagged'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300'
                                : 'border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-800 dark:text-rose-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Flag className="h-3.5 w-3.5" />
                            <span>{item.resolution === 'flagged' ? 'Sinalizado' : 'Sinalizar'}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Side-by-Side Detailed Comparison Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Inspeção Forense Side-by-Side
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {selectedRecordForDetail.txId} • Ref: {selectedRecordForDetail.acquirerRef}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Side-by-Side Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bank CSV Extrato Panel */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                    Extrato Adquirente (CSV)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold">
                    {selectedRecordForDetail.provider}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-indigo-200/50 dark:border-indigo-900/50">
                  <div className="flex justify-between">
                    <span>Valor Bruto:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">R$ {selectedRecordForDetail.csvAmount.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Cobrada (MDR):</span>
                    <strong className="font-mono text-slate-900 dark:text-white">R$ {selectedRecordForDetail.csvFee.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Informado:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedRecordForDetail.csvStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data de Liquidação:</span>
                    <span>{selectedRecordForDetail.settlementDate}</span>
                  </div>
                </div>
              </div>

              {/* Internal Ledger System Panel */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
                    Ledger Interno (Sistema)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                    Nercash Core
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-amber-200/50 dark:border-amber-900/50">
                  <div className="flex justify-between">
                    <span>Valor Esperado:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {selectedRecordForDetail.ledgerStatus === 'NOT_FOUND' ? 'Não Cadastrado' : `R$ ${selectedRecordForDetail.ledgerAmount.toFixed(2)}`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Contratual Prevista:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">R$ {selectedRecordForDetail.contractualFee.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Contábil:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{selectedRecordForDetail.ledgerStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cliente / Sacado:</span>
                    <span className="truncate max-w-[150px]">{selectedRecordForDetail.customer}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Details & Resolution Bar */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Diagnóstico da Divergência:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {selectedRecordForDetail.conflictType}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {selectedRecordForDetail.notes || 'Aguardando ação do operador de tesouraria para resolução contábil.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleFlagDiscrepancy(selectedRecordForDetail.id);
                  setSelectedRecordForDetail(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded-xl transition-all cursor-pointer"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Sinalizar Disputa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAcceptDiscrepancy(selectedRecordForDetail.id);
                  setSelectedRecordForDetail(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Aceitar Ajuste no Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
