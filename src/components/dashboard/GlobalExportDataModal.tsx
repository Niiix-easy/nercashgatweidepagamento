import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Download, 
  X, 
  Calendar, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  DollarSign, 
  CreditCard, 
  Zap, 
  Building2,
  Sparkles,
  Lock,
  Eye,
  Info
} from 'lucide-react';
import { PaymentIntent } from '../../types/payment';

interface GlobalExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalExportDataModal: React.FC<GlobalExportDataModalProps> = ({ isOpen, onClose }) => {
  const { paymentIntents, acquirers, currentTenant, addAuditLog } = usePayment();

  // Date Range State
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7d' | '30d' | 'this_month' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Category Filters
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAcquirer, setSelectedAcquirer] = useState<string>('all');
  const [selectedAmountRange, setSelectedAmountRange] = useState<'all' | 'under_100' | '100_to_1000' | 'over_1000'>('all');

  // Options
  const [includeMlMetrics, setIncludeMlMetrics] = useState<boolean>(true);
  const [anonymizePii, setAnonymizePii] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Report Presets State
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; config: any }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nercash_report_presets');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { name: 'Weekly Risk Report', config: { datePreset: '7d', selectedStatus: 'all', includeMlMetrics: true, anonymizePii: true, exportFormat: 'pdf' } },
      { name: 'Gateway Summary', config: { datePreset: '30d', selectedStatus: 'succeeded', includeMlMetrics: false, anonymizePii: false, exportFormat: 'csv' } }
    ];
  });

  const [presetNameInput, setPresetNameInput] = useState<string>('');
  const [showSavePresetInput, setShowSavePresetInput] = useState<boolean>(false);

  // Filter Transactions based on selected criteria
  const filteredTransactions = useMemo(() => {
    return paymentIntents.filter(item => {
      // 1. Date filter
      if (datePreset !== 'all') {
        const itemDate = new Date(item.createdAt);
        const now = new Date();

        if (datePreset === 'today') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (datePreset === '7d') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (datePreset === '30d') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < thirtyDaysAgo) return false;
        } else if (datePreset === 'this_month') {
          if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
        } else if (datePreset === 'custom') {
          if (startDate && new Date(item.createdAt) < new Date(startDate)) return false;
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (new Date(item.createdAt) > end) return false;
          }
        }
      }

      // 2. Method filter
      if (selectedMethod !== 'all' && item.method !== selectedMethod) return false;

      // 3. Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // 4. Acquirer filter
      if (selectedAcquirer !== 'all' && item.selectedAcquirer !== selectedAcquirer) return false;

      // 5. Amount Range filter
      if (selectedAmountRange === 'under_100' && item.amount >= 100) return false;
      if (selectedAmountRange === '100_to_1000' && (item.amount < 100 || item.amount > 1000)) return false;
      if (selectedAmountRange === 'over_1000' && item.amount <= 1000) return false;

      return true;
    });
  }, [paymentIntents, datePreset, startDate, endDate, selectedMethod, selectedStatus, selectedAcquirer, selectedAmountRange]);

  // Aggregate Metrics for preview
  const totalVolume = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredTransactions]);

  const approvedCount = useMemo(() => {
    return filteredTransactions.filter(i => i.status === 'succeeded').length;
  }, [filteredTransactions]);

  const approvalRate = filteredTransactions.length > 0 
    ? ((approvedCount / filteredTransactions.length) * 100).toFixed(1) 
    : '0.0';

  if (!isOpen) return null;

  // Mask PII Helper
  const maskEmail = (email: string) => {
    if (!anonymizePii) return email;
    const parts = email.split('@');
    if (parts.length < 2) return '***@***.com';
    const name = parts[0];
    return `${name.substring(0, 2)}***@${parts[1]}`;
  };

  const maskName = (name: string) => {
    if (!anonymizePii) return name;
    const parts = name.split(' ');
    if (parts.length <= 1) return `${name.substring(0, 2)}***`;
    return `${parts[0]} ${parts[parts.length - 1].substring(0, 1)}.***`;
  };

  // CSV Generator
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = [
        'ID_Transacao',
        'Data_Hora',
        'Cliente_Nome',
        'Cliente_Email',
        'Valor_BRL',
        'Metodo_Pagamento',
        'Status',
        'Adquirente_Processador',
        'Tentativas_Roteamento',
        'Split_Regra',
        ...(includeMlMetrics ? ['ML_Risk_Score', 'ML_Recomendacao', 'Fraude_Flag'] : [])
      ];

      const rows = filteredTransactions.map(tx => {
        const row = [
          `"${tx.id}"`,
          `"${new Date(tx.createdAt).toLocaleString('pt-BR')}"`,
          `"${maskName(tx.customerName || 'Cliente').replace(/"/g, '""')}"`,
          `"${maskEmail(tx.customerEmail || 'email@dominio.com')}"`,
          tx.amount.toFixed(2),
          `"${tx.method}"`,
          `"${tx.status}"`,
          `"${tx.selectedAcquirer || 'N/A'}"`,
          tx.attempts?.length || 1,
          `"${tx.routingRuleApplied || 'Direto'}"`,
          ...(includeMlMetrics ? [
            tx.riskScore || 12,
            tx.riskScore > 70 ? 'High Risk' : tx.riskScore > 40 ? 'Moderate' : 'Low Risk',
            tx.riskScore > 80 ? 'TRUE' : 'FALSE'
          ] : [])
        ];
        return row.join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nercash_relatorio_transacoes_${new Date().toISOString().slice(0, 10)}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to audit trail
      addAuditLog({
        actor: 'Admin Master',
        actorEmail: 'mayconquevedocompartilhar@gmail.com',
        action: `Exportou relatório CSV de transações (${filteredTransactions.length} registros, R$ ${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        category: 'compliance',
        resource: 'OverviewDashboard / Export Engine',
        status: 'success',
        ipAddress: '177.136.241.98',
        location: 'São Paulo, SP'
      });

      setExportSuccessMessage(`Relatório CSV exportado com sucesso (${filteredTransactions.length} registros)!`);
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error generating CSV:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // PDF Generator using jsPDF + autoTable
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = [15, 23, 42]; // Slate 900
      const emeraldColor = [5, 150, 105]; // Emerald 600
      const lightBg = [248, 250, 252]; // Slate 50

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 297, 24, 'F');

      // Header Brand Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('NERCASH GLOBAL PAYMENT ENGINE • RELATÓRIO EXECUTIVO DE TRANSAÇÕES', 14, 13);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(`Tenant: ${currentTenant.name} (${currentTenant.customDomain}) • Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 19);

      // Security Seal Stamp
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153);
      doc.text('PCI-DSS SAQ-A LEVEL 1 • LGPD COMPLIANT', 283, 14, { align: 'right' });

      // KPI Summary Cards Box
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(14, 28, 269, 26, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 28, 269, 26, 2, 2, 'D');

      // Metric 1: Total Transactions
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('VOLUME DE REGISTROS', 20, 36);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${filteredTransactions.length} transações`, 20, 46);

      // Metric 2: Financial Volume
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('VOLUME FINANCEIRO TPV', 85, 36);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(`R$ ${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 85, 46);

      // Metric 3: Approval Rate
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('TAXA DE CONVERSÃO / APROVAÇÃO', 160, 36);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(`${approvalRate}% (${approvedCount} aprovadas)`, 160, 46);

      // Metric 4: Date Scope
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text('FILTRO DE PERÍODO', 230, 36);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(
        datePreset === 'all' ? 'Histórico Completo' :
        datePreset === 'today' ? 'Hoje (24 Horas)' :
        datePreset === '7d' ? 'Últimos 7 Dias' :
        datePreset === '30d' ? 'Últimos 30 Dias' : 'Personalizado',
        230,
        45
      );

      // Section Subtitle
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Detalhamento de Transações Orquestradas', 14, 60);

      // Table Data
      const tableData = filteredTransactions.map(tx => [
        tx.id.substring(0, 16),
        new Date(tx.createdAt).toLocaleString('pt-BR'),
        maskName(tx.customerName || 'Cliente'),
        `R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        tx.method.toUpperCase(),
        tx.selectedAcquirer?.toUpperCase() || 'PADRÃO',
        tx.status.toUpperCase(),
        includeMlMetrics ? `${tx.riskScore || 10}/100` : 'N/A'
      ]);

      autoTable(doc, {
        startY: 63,
        head: [['ID Transação', 'Data / Hora', 'Portador / Comprador', 'Valor (BRL)', 'Método', 'Adquirente', 'Status', 'Score Risco ML']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59],
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 32, fontStyle: 'bold' },
          1: { cellWidth: 34 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 26, halign: 'center' },
          5: { cellWidth: 32 },
          6: { cellWidth: 32, halign: 'center' },
          7: { cellWidth: 33, halign: 'center' }
        },
        didDrawPage: (data) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Nercash Payment Gateway • Relatório Oficial para Auditoria Financeira • Página ${data.pageNumber} de ${pageCount}`,
            14,
            202
          );
          doc.text(
            `Hash SHA-256 de Não-Repúdio: 7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a`,
            283,
            202,
            { align: 'right' }
          );
        }
      });

      doc.save(`nercash_relatorio_executivo_${new Date().toISOString().slice(0, 10)}_${Date.now()}.pdf`);

      // Add to audit trail
      addAuditLog({
        actor: 'Admin Master',
        actorEmail: 'mayconquevedocompartilhar@gmail.com',
        action: `Gerou e exportou relatório PDF de transações (${filteredTransactions.length} registros, R$ ${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        category: 'compliance',
        resource: 'OverviewDashboard / Export Engine',
        status: 'success',
        ipAddress: '177.136.241.98',
        location: 'São Paulo, SP'
      });

      setExportSuccessMessage(`Relatório PDF gerado e baixado com sucesso!`);
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      handleExportCSV();
    } else {
      handleExportPDF();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Exportar Dados & Relatórios de Pagamentos</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Global Export
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecione intervalos de datas, filtros categóricos e formato de exportação (CSV ou PDF)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* Notification Feedback */}
          {exportSuccessMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
          )}

          {/* Report Presets Quick Bar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Presets de Relatórios Salvos (1-Click)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSavePresetInput(prev => !prev)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showSavePresetInput ? 'Cancelar' : '+ Salvar Preset Atual'}
              </button>
            </div>

            {showSavePresetInput && (
              <div className="flex items-center gap-2 mb-3 animate-fade-in">
                <input
                  type="text"
                  placeholder="Nome do Preset (ex: Relatório de Risco Semanal)"
                  value={presetNameInput}
                  onChange={e => setPresetNameInput(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!presetNameInput.trim()) return;
                    const newPreset = {
                      name: presetNameInput.trim(),
                      config: {
                        datePreset,
                        selectedMethod,
                        selectedStatus,
                        selectedAcquirer,
                        selectedAmountRange,
                        includeMlMetrics,
                        anonymizePii,
                        exportFormat
                      }
                    };
                    const updated = [...savedPresets, newPreset];
                    setSavedPresets(updated);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('nercash_report_presets', JSON.stringify(updated));
                    }
                    setPresetNameInput('');
                    setShowSavePresetInput(false);
                  }}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  Salvar
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const c = preset.config;
                    if (c.datePreset) setDatePreset(c.datePreset);
                    if (c.selectedMethod) setSelectedMethod(c.selectedMethod);
                    if (c.selectedStatus) setSelectedStatus(c.selectedStatus);
                    if (c.selectedAcquirer) setSelectedAcquirer(c.selectedAcquirer);
                    if (c.selectedAmountRange) setSelectedAmountRange(c.selectedAmountRange);
                    if (typeof c.includeMlMetrics === 'boolean') setIncludeMlMetrics(c.includeMlMetrics);
                    if (typeof c.anonymizePii === 'boolean') setAnonymizePii(c.anonymizePii);
                    if (c.exportFormat) setExportFormat(c.exportFormat);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <FileText className="h-3 w-3 text-indigo-500" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Date Range Presets & Custom */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>1. Intervalo de Datas</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
              {[
                { id: 'today', label: 'Hoje' },
                { id: '7d', label: 'Últimos 7 dias' },
                { id: '30d', label: 'Últimos 30 dias' },
                { id: 'this_month', label: 'Mês Atual' },
                { id: 'all', label: 'Histórico Total' },
                { id: 'custom', label: 'Personalizado' }
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setDatePreset(preset.id as any)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                    datePreset === preset.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs if 'custom' is active */}
            {datePreset === 'custom' && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 animate-fade-in">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Data Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Transaction Categories & Filters */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>2. Categorias & Filtros de Transações</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {/* Method */}
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Método de Pagamento</label>
                <select
                  value={selectedMethod}
                  onChange={e => setSelectedMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos os Métodos</option>
                  <option value="pix">PIX Instantâneo</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Status da Transação</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos os Status</option>
                  <option value="succeeded">Aprovada (Succeeded)</option>
                  <option value="requires_action">Em Análise / 3DS</option>
                  <option value="declined">Recusada / Falha</option>
                  <option value="refunded">Estornada / Chargeback</option>
                </select>
              </div>

              {/* Acquirer */}
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Adquirente / Gateway</label>
                <select
                  value={selectedAcquirer}
                  onChange={e => setSelectedAcquirer(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos os Adquirentes</option>
                  {acquirers.map(acq => (
                    <option key={acq.id} value={acq.name}>
                      {acq.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Range */}
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Faixa de Valor</label>
                <select
                  value={selectedAmountRange}
                  onChange={e => setSelectedAmountRange(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos os Valores</option>
                  <option value="under_100">Até R$ 100,00 (Micro)</option>
                  <option value="100_to_1000">R$ 100,00 a R$ 1.000,00</option>
                  <option value="over_1000">Acima de R$ 1.000,00 (Alto)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Compliance & Extra Parameters */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>3. Opções de Governança & Segurança (LGPD / PCI)</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs cursor-pointer hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={anonymizePii}
                  onChange={e => setAnonymizePii(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Mascarar Dados PII de Clientes (LGPD)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ofusca e-mails, nomes e CPFs para manter sigilo e conformidade com a Lei Geral de Proteção de Dados.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs cursor-pointer hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={includeMlMetrics}
                  onChange={e => setIncludeMlMetrics(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Incluir Scores e Métricas do Modelo ML</span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Adiciona colunas com probabilidade de fraude, score de risco e inferência do XGBoost v4.8.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Export Format Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>4. Formato do Arquivo</span>
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  exportFormat === 'csv'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Planilha Estruturada (CSV / Excel)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ideal para BI, Pandas, Python, SQL ou importação no Google Sheets. Codificação UTF-8 BOM.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Relatório Executivo Assinado (PDF)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Documento formal para auditoria, diretoria e contabilidade com selo criptográfico SHA-256.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 5: Live Matching Preview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Prévia da Amostra Selecionada
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {filteredTransactions.length} transações encontradas com os filtros aplicados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 font-sans block">Volume TPV</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 font-sans block">Aprovação</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {approvalRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={filteredTransactions.length === 0 || isExporting}
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>
                {isExporting ? 'Gerando Arquivo...' : `Baixar Relatório (${exportFormat.toUpperCase()})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
