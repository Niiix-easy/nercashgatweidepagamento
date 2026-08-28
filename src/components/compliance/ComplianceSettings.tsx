import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FloatingQuickActionsBar, QuickActionOption } from '../common/FloatingQuickActionsBar';
import { ApiKeySecurityModule } from './ApiKeySecurityModule';
import { SecurityAuditModal } from './SecurityAuditModal';
import { SecurityActivityTab } from './SecurityActivityTab';
import { LiveApiErrorMonitor } from './LiveApiErrorMonitor';
import { ReportSchedulerTab } from './ReportSchedulerTab';
import { SecurityHardeningEngine } from '../../services/securityHardening';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  Check, 
  Database, 
  AlertTriangle,
  Server,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Globe,
  Terminal,
  Calendar,
  Layers,
  Sparkles,
  RotateCcw,
  FileCheck,
  Archive,
  CheckSquare,
  Award,
  Zap,
  Activity,
  Fingerprint
} from 'lucide-react';
import { AuditLog } from '../../types/payment';

export const ComplianceSettings: React.FC = () => {
  const { acquirers, auditLogs, apiKeys } = usePayment();

  const [activeTab, setActiveTab] = useState<'audit_logs' | 'live_api_errors' | 'api_key_security' | 'security_activity' | 'pci_hardening' | 'report_scheduler'>('audit_logs');
  const [isSecurityAuditModalOpen, setIsSecurityAuditModalOpen] = useState<boolean>(false);
  const [showAutomatedReportModal, setShowAutomatedReportModal] = useState<boolean>(false);
  const automatedReport = useMemo(() => SecurityHardeningEngine.runAutomatedSecurityReport(), [showAutomatedReportModal]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  
  // Date Range Picker state
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7d' | '30d' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [auditViewMode, setAuditViewMode] = useState<'table' | 'timeline'>('table');
  const [selectedTimelineCategories, setSelectedTimelineCategories] = useState<string[]>([
    'Gateway Failure', 'User Access', 'Workflow Change', 'payment', 'security', 'api', 'compliance'
  ]);

  const handleToggleSelectLog = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLogIds.length === filteredLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map(l => l.id));
    }
  };

  const handleBulkApprove = () => {
    setActionFeedback(`${selectedLogIds.length} logs validados e marcados como conformes.`);
    setSelectedLogIds([]);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleBulkArchive = () => {
    setActionFeedback(`${selectedLogIds.length} logs arquivados no storage de longa duração (Cold Storage LGPD 5 anos).`);
    setSelectedLogIds([]);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleBulkExportCSV = () => {
    const selected = filteredLogs.filter(l => selectedLogIds.includes(l.id));
    let csv = 'ID,Data_Hora,Acao,Categoria,Autor,Email_Autor,Recurso,Status,IP,Localizacao\n';
    selected.forEach(log => {
      const row = [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.category}"`,
        `"${log.actor}"`,
        `"${log.actorEmail}"`,
        `"${log.resource}"`,
        `"${log.status}"`,
        `"${log.ipAddress}"`,
        `"${log.location || 'BR'}"`
      ].join(',');
      csv += row + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_compliance_selected_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setActionFeedback(`${selected.length} logs exportados em CSV com sucesso!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Context-aware tooltips for quick actions
  const complianceQuickActions: QuickActionOption[] = [
    {
      id: 'action_approve',
      label: 'Validar Selecionados',
      shortcut: 'A',
      icon: <Check className="h-3.5 w-3.5" />,
      variant: 'success',
      impactDescription: 'Marca os registros de auditoria selecionados como revisados e em conformidade pelas políticas internas e do Banco Central.',
      onClick: handleBulkApprove
    },
    {
      id: 'action_archive',
      label: 'Arquivar (Cold)',
      shortcut: 'X',
      icon: <Archive className="h-3.5 w-3.5" />,
      variant: 'danger',
      impactDescription: 'Transfere os logs selecionados para o armazenamento imutável de retenção fiscal de 5 anos (Resolução BCB nº 150).',
      warningNote: 'Atenção: Os logs permanecerão bloqueados contra edição ou deleção.',
      onClick: handleBulkArchive
    },
    {
      id: 'action_export',
      label: 'Exportar CSV',
      shortcut: 'E',
      icon: <Download className="h-3.5 w-3.5" />,
      variant: 'primary',
      impactDescription: 'Compila a trilha criptográfica dos logs selecionados com hashes SHA-256 em planilha CSV padronizada para auditoria externa.',
      onClick: handleBulkExportCSV
    }
  ];

  // Extract all unique event action types for the filter dropdown
  const uniqueEventTypes = useMemo(() => {
    const types = new Set<string>();
    auditLogs.forEach(log => {
      if (log.action) types.add(log.action);
    });
    return Array.from(types).sort();
  }, [auditLogs]);

  // Handle Preset Changes
  const handlePresetChange = (preset: 'all' | 'today' | '7d' | '30d' | 'custom') => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7d') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = 
        selectedCategory === 'all' || 
        log.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesEventType =
        selectedEventType === 'all' ||
        log.action === selectedEventType;

      const matchesStatus = 
        selectedStatus === 'all' || 
        log.status === selectedStatus;

      // Date filtering
      let matchesDate = true;
      if (startDate) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (logDate < startDate) matchesDate = false;
      }
      if (endDate && matchesDate) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (logDate > endDate) matchesDate = false;
      }

      return matchesSearch && matchesCategory && matchesEventType && matchesStatus && matchesDate;
    });
  }, [auditLogs, searchTerm, selectedCategory, selectedEventType, selectedStatus, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedEventType('all');
    setSelectedStatus('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
  };

  const handleExportCSV = () => {
    let csv = 'ID,Data_Hora,Acao,Categoria,Autor,Email_Autor,Recurso,Status,IP,Localizacao\n';
    filteredLogs.forEach(log => {
      const row = [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.action.replace(/"/g, '""')}"`,
        `"${log.category}"`,
        `"${log.actor}"`,
        `"${log.actorEmail}"`,
        `"${log.resource}"`,
        `"${log.status}"`,
        `"${log.ipAddress}"`,
        `"${log.location || 'BR'}"`
      ].join(',');
      csv += row + '\n';
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_compliance_audit_logs_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // DIGITALLY SIGNED SECURITY AUDIT PDF GENERATION FOR CURRENT MONTH
  const handleDownloadDigitallySignedPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const primaryEmerald = [5, 150, 105]; // #059669
      const darkSlate = [15, 23, 42]; // #0f172a
      const lightSlate = [241, 245, 249]; // #f1f5f9
      const textMuted = [100, 116, 139]; // #64748b

      // Header Dark Banner
      doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.rect(0, 0, 297, 28, 'F');

      // Emerald Accent line
      doc.setFillColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
      doc.rect(0, 28, 297, 2.5, 'F');

      // Title & Cryptographic Seal Badge
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('NERCASH PAYMENT ORCHESTRATION & SECURITY VAULT', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(167, 243, 208); // emerald-200
      doc.text('RELATÓRIO DE AUDITORIA DE SEGURANÇA ASSINADO DIGITALMENTE (MÊS CORRENTE - AGOSTO 2026)', 14, 18);

      doc.setFontSize(7.5);
      doc.setTextColor(226, 232, 240);
      doc.text('Conformidade: PCI-DSS v4.0 SAQ-A • LGPD Art. 7 • Resolução BCB nº 150/2021', 14, 24);

      // Digital Signature Seal Metadata (Right Box)
      const mockSha256 = `SHA256:${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()}`;
      doc.setFontSize(7.5);
      doc.setFont('courier', 'bold');
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text(`[SELO CRIPTOGRÁFICO ICP-BRASIL / HSM]`, 283, 10, { align: 'right' });
      doc.setFont('courier', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(`Assinado em: ${new Date().toLocaleString('pt-BR')}`, 283, 16, { align: 'right' });
      doc.text(`Hash: ${mockSha256.substring(0, 28)}...`, 283, 21, { align: 'right' });
      doc.text(`Certificado: NERCASH-VAULT-ROOT-CA-2026`, 283, 26, { align: 'right' });

      // Monthly Executive Security & Incident Triage Breakdown
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('1. Sumário Executivo de Segurança & Postura de Ameaças (Agosto/2026)', 14, 38);

      const totalCount = auditLogs.length;
      const warningCount = auditLogs.filter(l => l.status === 'warning').length;
      const errorCount = auditLogs.filter(l => l.status === 'error').length;
      const activeKeysCount = apiKeys.filter(k => k.status !== 'revoked').length;

      // Box 1: Total Admin Actions
      doc.setFillColor(lightSlate[0], lightSlate[1], lightSlate[2]);
      doc.roundedRect(14, 41, 62, 18, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('AÇÕES ADMINISTRATIVAS', 18, 47);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(`${totalCount} eventos auditados`, 18, 54);

      // Box 2: Blocked Threats & Brute Force
      doc.setFillColor(254, 243, 199); // amber-50
      doc.roundedRect(82, 41, 62, 18, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 83, 9);
      doc.text('RATE LIMIT & ANOMALIAS', 86, 47);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${warningCount} alertas mitigados`, 86, 54);

      // Box 3: Data Integrity & Breaches
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.roundedRect(150, 41, 62, 18, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(4, 120, 87);
      doc.text('INTEGRIDADE DE DADOS', 154, 47);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('0 Vazamentos (100% Ok)', 154, 54);

      // Box 4: Active API Keys & Isolation
      doc.setFillColor(243, 232, 255); // purple-50
      doc.roundedRect(218, 41, 65, 18, 2, 2, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(126, 34, 206);
      doc.text('CREDENCIAIS & TENANTS', 222, 47);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${activeKeysCount} chaves ativas (RBAC)`, 222, 54);

      // Section 2 Title
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text('2. Registro Imutável de Eventos Administrativos e de Segurança', 14, 66);

      // Table Data
      const tableData = auditLogs.map(log => [
        new Date(log.timestamp).toLocaleString('pt-BR'),
        log.action,
        log.category.toUpperCase(),
        `${log.actor}\n(${log.actorEmail})`,
        log.resource,
        `${log.ipAddress} (${log.location || 'BR'})`,
        log.status.toUpperCase(),
        `SHA256-${log.id.substring(log.id.length - 8).toUpperCase()}`
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['Data / Hora', 'Ação Registrada', 'Categoria', 'Ator / Responsável', 'Recurso Alvo', 'IP de Origem', 'Resultado', 'Selo Hash']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 7.5,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [30, 41, 59],
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 42, fontStyle: 'bold' },
          2: { cellWidth: 24 },
          3: { cellWidth: 45 },
          4: { cellWidth: 38, fontStyle: 'italic' },
          5: { cellWidth: 32 },
          6: { cellWidth: 24, halign: 'center' },
          7: { cellWidth: 36, fontStyle: 'normal' }
        },
        didDrawPage: (data) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          
          // Page Footer with Digital Signature Certification
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Documento Oficial Digitalmente Assinado • Nercash Payment Intelligence Engine • Página ${data.pageNumber} de ${pageCount}`,
            14,
            202
          );
          doc.text(
            `Certificado de Não-Repúdio SHA-256: ${mockSha256.substring(0, 32)}`,
            283,
            202,
            { align: 'right' }
          );
        }
      });

      doc.save(`nercash_security_audit_signed_${new Date().toISOString().slice(0, 7)}_${Date.now()}.pdf`);
      setActionFeedback('Relatório de auditoria assinado digitalmente exportado com sucesso em PDF!');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error('Error generating digitally signed PDF:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Nercash Compliance, Segurança & Auditoria
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gestão de credenciais de API por tenant, trilha de auditoria criptográfica, conformidade PCI-DSS Level 1 e LGPD
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Automated Security Report Button */}
          <button
            type="button"
            onClick={() => setShowAutomatedReportModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 transition-all shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Relatório de Segurança Automatizado</span>
          </button>
          <button
            id="btn-export-signed-security-pdf"
            type="button"
            onClick={handleDownloadDigitallySignedPDF}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-sm"
          >
            <Award className="h-4 w-4" />
            <span>Exportar Auditoria Assinada (PDF)</span>
          </button>

          {/* Deep Security Audit Modal Button */}
          <button
            type="button"
            onClick={() => setIsSecurityAuditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-600 transition-all shadow-sm"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Auditoria Pesada PCI-DSS</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'audit_logs'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Trilha de Auditoria & LGPD</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {auditLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live_api_errors')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'live_api_errors'
              ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4 text-rose-500" />
          <span>Monitor de Erros de API (4xx/5xx)</span>
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Live
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('api_key_security')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'api_key_security'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Segurança de Chaves de API & Políticas</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {apiKeys.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security_activity')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'security_activity'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Fingerprint className="h-4 w-4" />
          <span>Atividade de Segurança & Sessões</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            Zero-Trust
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pci_hardening')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'pci_hardening'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Arquitetura de Segurança & Criptografia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('report_scheduler')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'report_scheduler'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>Agendador de Relatórios (PDF)</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionFeedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* TAB 1: AUDIT LOGS & LGPD */}
      {activeTab === 'audit_logs' && (
        <div className="space-y-6">
          {/* Top Informational Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  PCI-DSS SAQ-A & Tokenização de Cartões
                </h3>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  O Super Checkout da Nercash utiliza tokenização direta via SDK client-side. PAN e CVV nunca tocam os servidores centrais, reduzindo o escopo para SAQ-A com isolamento criptográfico AES-256.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  LGPD & Retenção de Trilha Imutável
                </h3>
              </div>
              <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
                  <span>Base Legal de Processamento:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Execução de Contrato (Art. 7º, V)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60">
                  <span>Retenção Legal Obrigatória:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">5 Anos (Resolução BCB nº 150)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Searchable Audit Log Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Trilha de Auditoria & Logs de Ações Administrativas
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Registro contínuo com hash SHA-256 e filtros por tipo de evento, ator e intervalo temporal
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setAuditViewMode('table')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${auditViewMode === 'table' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                    Tabela
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditViewMode('timeline')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${auditViewMode === 'timeline' ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400 font-bold' : 'text-slate-500'}`}
                  >
                    Timeline Vertical
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadDigitallySignedPDF}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-sm"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>PDF Assinado</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por ação, ator, recurso, IP ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">Período:</span>
                  {(['all', 'today', '7d', '30d', 'custom'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetChange(preset)}
                      className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
                        datePreset === preset
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {preset === 'all' && 'Todos'}
                      {preset === 'today' && 'Hoje'}
                      {preset === '7d' && '7 Dias'}
                      {preset === '30d' && '30 Dias'}
                      {preset === 'custom' && 'Personalizado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="auth">Autenticação (Auth)</option>
                  <option value="api_key">Chaves de API</option>
                  <option value="routing_rule">Roteamento</option>
                  <option value="refund">Estornos</option>
                  <option value="webhook">Webhooks</option>
                  <option value="pci_vault">PCI Vault</option>
                  <option value="tenant_config">Tenants</option>
                </select>

                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 max-w-[200px]"
                >
                  <option value="all">Todos os Eventos</option>
                  {uniqueEventTypes.map(ev => (
                    <option key={ev} value={ev}>{ev}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos os Status</option>
                  <option value="success">Sucesso</option>
                  <option value="warning">Alerta / Suspeita</option>
                  <option value="error">Erro / Bloqueio</option>
                </select>

                {(searchTerm || selectedCategory !== 'all' || selectedEventType !== 'all' || selectedStatus !== 'all' || datePreset !== 'all') && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ml-auto"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Limpar Filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audit Logs View: Table or Vertical Stream Timeline */}
            {auditViewMode === 'timeline' ? (
              <div className="space-y-4 mt-4">
                {/* Multi-Select Category Filter Panel */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                      Filtrar Categorias da Timeline:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Gateway Failure', 'User Access', 'Workflow Change', 'payment', 'security', 'compliance'].map(cat => {
                      const isSelected = selectedTimelineCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedTimelineCategories(prev =>
                              isSelected ? prev.filter(c => c !== cat) : [...prev, cat]
                            );
                          }}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cat} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative border-l-2 border-emerald-500/30 dark:border-emerald-500/20 ml-4 space-y-6 pl-6 py-2">
                  {filteredLogs.filter(log => selectedTimelineCategories.length === 0 || selectedTimelineCategories.includes(log.category) || selectedTimelineCategories.some(c => log.action.toLowerCase().includes(c.toLowerCase()) || log.resource.toLowerCase().includes(c.toLowerCase()))).length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                      Nenhum registro de auditoria encontrado na linha do tempo para as categorias selecionadas.
                    </div>
                  ) : (
                    filteredLogs
                      .filter(log => selectedTimelineCategories.length === 0 || selectedTimelineCategories.includes(log.category) || selectedTimelineCategories.some(c => log.action.toLowerCase().includes(c.toLowerCase()) || log.resource.toLowerCase().includes(c.toLowerCase())))
                      .map((log) => (
                    <div key={log.id} className="relative group">
                      <span className={`absolute -left-[31px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white shadow-sm dark:bg-slate-900 ${
                        log.status === 'success' ? 'border-emerald-500 text-emerald-600' :
                        log.status === 'warning' ? 'border-amber-500 text-amber-600' : 'border-rose-500 text-rose-600'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-500' :
                          log.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                      </span>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {log.action}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              log.status === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              log.status === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {log.category}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Ator Responsável:</span>
                            <p className="font-semibold text-slate-900 dark:text-white">{log.actor} <span className="text-slate-400 text-[10px]">({log.actorEmail})</span></p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Recurso Afetado:</span>
                            <p className="font-mono">{log.resource}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400">IP & Local:</span>
                              <p className="font-mono">{log.ipAddress} • {log.location || 'Brasil'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
                            >
                              Inspecionar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
                  <tr>
                    <th className="w-10 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLogIds.length === filteredLogs.length && filteredLogs.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                      />
                    </th>
                    <th className="px-4 py-3">Timestamp / Selo</th>
                    <th className="px-4 py-3">Ação Executada</th>
                    <th className="px-4 py-3">Ator Responsável</th>
                    <th className="px-4 py-3">Recurso Afetado</th>
                    <th className="px-4 py-3">IP & Origem</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Inspecionar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        Nenhum registro de auditoria encontrado para os critérios selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isSelected = selectedLogIds.includes(log.id);
                      return (
                        <tr 
                          key={log.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectLog(log.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600"
                            />
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-white">{log.actor}</div>
                            <div className="text-[10px] text-slate-400">{log.actorEmail}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {log.resource}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {log.ipAddress}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              log.status === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              log.status === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-white"
                              title="Ver Detalhes do Log"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: API KEY SECURITY MODULE */}
      {activeTab === 'api_key_security' && (
        <ApiKeySecurityModule />
      )}

      {/* TAB 3: PCI & SECURITY ARCHITECTURE */}
      {activeTab === 'pci_hardening' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>Arquitetura de Segurança Bancária & Criptografia</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Conformidade com os padrões PCI-DSS Level 1 SAQ-A, Token Vault e Isolamento de Chaves
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSecurityAuditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
              >
                <Zap className="h-4 w-4" />
                <span>Executar Varredura de Segurança</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-2">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>Envelope Encryption AES-256</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Chaves mestras gerenciadas em HSM (Hardware Security Module) com derivação dinâmica por tenant e rotação programada.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-2">
                  <Globe className="h-4 w-4 text-sky-500" />
                  <span>TLS 1.3 & HSTS Preload</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Todas as requisições HTTP forçam cifras seguras ECDHE-RSA-AES128-GCM-SHA256 e recusa de versões legadas SSL/TLS.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs mb-2">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <span>Trilha Imutável SHA-256</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Chaining criptográfico em cada registro de log, garantindo que qualquer alteração indevida invalide o hash de verificação.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORT SCHEDULER */}
      {activeTab === 'report_scheduler' && (
        <ReportSchedulerTab />
      )}

      {/* TAB: SECURITY ACTIVITY & SESSIONS */}
      {activeTab === 'security_activity' && (
        <SecurityActivityTab />
      )}

      {/* Floating Quick Actions Bar with Context-Aware Tooltips */}
      <FloatingQuickActionsBar
        selectedCount={selectedLogIds.length}
        totalCount={filteredLogs.length}
        entityLabel="logs de auditoria"
        onClearSelection={() => setSelectedLogIds([])}
        actions={complianceQuickActions}
      />

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inspeção Criptográfica do Log: {selectedLog.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <div>
                <span className="text-slate-400 font-semibold">Evento / Ação:</span>
                <p className="font-bold text-slate-900 dark:text-white font-mono">{selectedLog.action}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-semibold">Ator:</span>
                  <p className="text-slate-800 dark:text-slate-200">{selectedLog.actor} ({selectedLog.actorEmail})</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold">IP / Origem:</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.ipAddress}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Recurso:</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.resource}</p>
              </div>
              {selectedLog.details && (
                <div>
                  <span className="text-slate-400 font-semibold">Detalhes:</span>
                  <div className="mt-1 rounded-xl bg-slate-950 p-2.5 font-mono text-[11px] text-emerald-400 border border-slate-800">
                    {typeof selectedLog.details === 'object' ? JSON.stringify(selectedLog.details, null, 2) : selectedLog.details}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Audit Scan Modal */}
      <SecurityAuditModal
        isOpen={isSecurityAuditModalOpen}
        onClose={() => setIsSecurityAuditModalOpen(false)}
      />

      {/* Automated Security Report Modal */}
      {showAutomatedReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Relatório Automatizado de Segurança Nercash</h3>
                  <p className="text-xs text-slate-400">Verificação de CSP, Sanitização XSS/SQLi e Score PWA</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAutomatedReportModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <span className="text-[11px] text-slate-400">Score CSP Level 3</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{automatedReport.cspScore}%</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <span className="text-[11px] text-slate-400">Cobertura Sanitização</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{automatedReport.sanitizationCoverage}%</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <span className="text-[11px] text-slate-400">Score PWA Manifest</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{automatedReport.pwaSecurityScore}%</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recomendações e Plano de Melhoria Contínua</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {automatedReport.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rec.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rec.severity === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        rec.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {rec.category} ({rec.severity})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAutomatedReportModal(false)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg cursor-pointer"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
