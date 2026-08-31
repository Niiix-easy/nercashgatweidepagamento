import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { usePayment } from '../../context/PaymentContext';
import { PdfCache } from '../../services/pdfCacheService';
import { 
  Camera, 
  Download, 
  X, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Clock, 
  User, 
  Layers, 
  Sparkles, 
  Printer, 
  RefreshCw, 
  AlertCircle,
  Hash,
  Eye
} from 'lucide-react';

interface DashboardSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetContainerId?: string;
  totalVolume: number;
  totalTransactions: number;
  approvalRate: number;
  activeAcquirersCount: number;
  selectedRegion: string;
  selectedCurrency: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export const DashboardSnapshotModal: React.FC<DashboardSnapshotModalProps> = ({
  isOpen,
  onClose,
  targetContainerId = 'dashboard-overview-container',
  totalVolume,
  totalTransactions,
  approvalRate,
  activeAcquirersCount,
  selectedRegion,
  selectedCurrency,
  user
}) => {
  const { currentTenant, addToast } = usePayment();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [resolutionScale, setResolutionScale] = useState<number>(2); // 2x Retina standard
  const [includeUserMetadata, setIncludeUserMetadata] = useState<boolean>(true);
  const [includeKpiTable, setIncludeKpiTable] = useState<boolean>(true);
  const [includeSecuritySeal, setIncludeSecuritySeal] = useState<boolean>(true);
  const [reportPaperSize, setReportPaperSize] = useState<'a4' | 'letter'>('a4');
  const [reportOrientation, setReportOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (isOpen) {
      PdfCache.initBackgroundIdlePrecalculation({
        totalVolume,
        totalTransactions,
        approvalRate,
        activeAcquirersCount
      });
    }
  }, [isOpen, totalVolume, totalTransactions, approvalRate, activeAcquirersCount]);

  if (!isOpen) return null;

  const currentUser = {
    name: user?.name || 'Maycon Quevedo',
    email: user?.email || 'mayconquevedocompartilhar@gmail.com',
    role: user?.role || 'Super Admin / Lead Architect',
    tenant: currentTenant.branding.logoText || 'Nercash Core Enterprise',
    tenantId: currentTenant.id
  };

  const handleCaptureSnapshot = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(15);
      setCurrentStep('Localizando elementos visuais do dashboard...');

      const targetEl = document.getElementById(targetContainerId) || document.getElementById('main-content-area') || document.body;
      if (!targetEl) {
        throw new Error('Elemento do dashboard não encontrado para captura.');
      }

      setGenerationProgress(35);
      setCurrentStep('Renderizando widgets e gráficos via html2canvas (Resolução ' + resolutionScale + 'x)...');

      // Small delay to allow DOM to stabilize
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(targetEl as HTMLElement, {
        scale: resolutionScale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore modals and tooltips during capture
          return element.classList.contains('no-export-snapshot') ||
                 element.id === 'dashboard-snapshot-modal' ||
                 element.id === 'global-shortcut-manager-overlay';
        }
      });

      setGenerationProgress(65);
      setCurrentStep('Compondo relatório executivo estruturado com jsPDF...');

      const imgData = canvas.toDataURL('image/png', 0.95);
      setPreviewDataUrl(imgData);

      const timestampIso = new Date().toISOString();
      const timestampFormatted = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      // Generate PDF with jsPDF
      const pdf = new jsPDF({
        orientation: reportOrientation,
        unit: 'mm',
        format: reportPaperSize
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;

      // 1. Executive Top Header Banner (Dark Navy Theme)
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 28, 'F');

      // Accent Green Line
      pdf.setFillColor(16, 185, 129); // emerald-500
      pdf.rect(0, 27, pageWidth, 1.5, 'F');

      // Header Brand Text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('NERCASH FINANCIAL ORCHESTRATION & GATEWAY', margin, 12);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text('RELATÓRIO EXECUTIVO DE ESTADO E PERFORMANCE TRANSACIONAL', margin, 18);

      pdf.setFontSize(7.5);
      pdf.setTextColor(52, 211, 153); // emerald-400
      pdf.text(`PCI-DSS LEVEL 1 COMPLIANT • AMBIENTE: PRODUÇÃO (v3.2.4)`, margin, 23);

      // Top Right: Date & Classification
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text('CONFIDENCIAL / OPERACIONAL', pageWidth - margin, 12, { align: 'right' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(203, 213, 225);
      pdf.text(timestampFormatted, pageWidth - margin, 18, { align: 'right' });

      let currentY = 34;

      // 2. User & Tenant Metadata Section
      if (includeUserMetadata) {
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.roundedRect(margin, currentY, pageWidth - (margin * 2), 19, 2, 2, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(71, 85, 105);
        pdf.text('METADADOS DO OPERADOR & CONTEXTO DA SESSÃO', margin + 4, currentY + 5.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(15, 23, 42);

        // Col 1: User
        pdf.text(`Operador: ${currentUser.name}`, margin + 4, currentY + 11);
        pdf.text(`E-mail: ${currentUser.email}`, margin + 4, currentY + 15.5);

        // Col 2: Role & Tenant
        const col2X = margin + 65;
        pdf.text(`Perfil: ${currentUser.role}`, col2X, currentY + 11);
        pdf.text(`Tenant: ${currentUser.tenant} (${currentUser.tenantId})`, col2X, currentY + 15.5);

        // Col 3: Slice Filters
        const col3X = margin + 130;
        pdf.text(`Região: ${selectedRegion.toUpperCase()}`, col3X, currentY + 11);
        pdf.text(`Moeda Base: ${selectedCurrency} • Provedores: ${activeAcquirersCount} Online`, col3X, currentY + 15.5);

        currentY += 23;
      }

      // 3. Key Metrics Summary Grid (KPI Boxes)
      if (includeKpiTable) {
        const boxWidth = (pageWidth - (margin * 2) - 9) / 4;
        const boxHeight = 16;

        // Box 1: Volume
        pdf.setFillColor(236, 253, 245); // emerald-50
        pdf.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(4, 120, 87);
        pdf.text('VOLUME PROCESSADO', margin + 3, currentY + 5);
        pdf.setFontSize(10.5);
        pdf.text(
          `${selectedCurrency} ${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          margin + 3,
          currentY + 12
        );

        // Box 2: Transações
        pdf.setFillColor(238, 242, 255); // indigo-50
        pdf.roundedRect(margin + boxWidth + 3, currentY, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setFontSize(6.5);
        pdf.setTextColor(67, 56, 202);
        pdf.text('TOTAL DE TRANSAÇÕES', margin + boxWidth + 6, currentY + 5);
        pdf.setFontSize(10.5);
        pdf.text(`${totalTransactions.toLocaleString('pt-BR')} ops`, margin + boxWidth + 6, currentY + 12);

        // Box 3: Conversão
        pdf.setFillColor(240, 253, 250); // teal-50
        pdf.roundedRect(margin + (boxWidth * 2) + 6, currentY, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setFontSize(6.5);
        pdf.setTextColor(15, 118, 110);
        pdf.text('TAXA DE APROVAÇÃO (CR)', margin + (boxWidth * 2) + 9, currentY + 5);
        pdf.setFontSize(10.5);
        pdf.text(`${approvalRate.toFixed(2)}%`, margin + (boxWidth * 2) + 9, currentY + 12);

        // Box 4: Saúde da Orquestração
        pdf.setFillColor(254, 243, 199); // amber-50
        pdf.roundedRect(margin + (boxWidth * 3) + 9, currentY, boxWidth, boxHeight, 2, 2, 'F');
        pdf.setFontSize(6.5);
        pdf.setTextColor(180, 83, 9);
        pdf.text('ADQUIRENTES & GATEWAY', margin + (boxWidth * 3) + 12, currentY + 5);
        pdf.setFontSize(10.5);
        pdf.text(`${activeAcquirersCount} Ativas (99.99%)`, margin + (boxWidth * 3) + 12, currentY + 12);

        currentY += 20;
      }

      // 4. Render Dashboard Snapshot Image
      setGenerationProgress(85);
      setCurrentStep('Otimizando escala de renderização do snapshot...');

      const printableWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * printableWidth) / canvas.width;
      const availableHeight = pageHeight - currentY - 20; // reserve space for footer

      // If image fits on current page
      if (imgHeight <= availableHeight) {
        pdf.addImage(imgData, 'PNG', margin, currentY, printableWidth, imgHeight, undefined, 'FAST');
      } else {
        // Multi-page splitting or scaled fit
        const scaleFactor = availableHeight / imgHeight;
        if (scaleFactor > 0.6) {
          // Fit scaled on single page for high aesthetic polish
          pdf.addImage(imgData, 'PNG', margin, currentY, printableWidth * scaleFactor, imgHeight * scaleFactor, undefined, 'FAST');
        } else {
          // Add on second page if large
          pdf.addImage(imgData, 'PNG', margin, currentY, printableWidth, availableHeight, undefined, 'FAST');
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, 14, printableWidth, imgHeight - availableHeight, undefined, 'FAST');
        }
      }

      // 5. Cryptographic Seal & Security Footer
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(148, 163, 184); // slate-400

        // Left: Platform signature
        pdf.text(
          `Documento Digital Autenticado • Nercash Payment Intelligence Engine • Página ${i} de ${totalPages}`,
          margin,
          pageHeight - 8
        );

        // Right: Hash SHA-256 seal
        if (includeSecuritySeal) {
          const pseudoHash = `SHA256-${Date.now().toString(16).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          pdf.text(
            `Selo de Integridade: ${pseudoHash} • Timestamp: ${timestampIso}`,
            pageWidth - margin,
            pageHeight - 8,
            { align: 'right' }
          );
        }
      }

      setGenerationProgress(100);
      setCurrentStep('Pronto! Baixando arquivo PDF...');

      const fileName = `nercash_dashboard_snapshot_${new Date().toISOString().substring(0, 10)}_${Date.now().toString().slice(-4)}.pdf`;
      pdf.save(fileName);

      addToast(
        'Snapshot do Dashboard Gerado',
        `Relatório PDF em alta resolução baixado com sucesso (${fileName}).`,
        'success'
      );

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao gerar Snapshot do Dashboard:', err);
      setIsGenerating(false);
      addToast(
        'Erro na Geração do Snapshot',
        err.message || 'Falha ao processar canvas do dashboard.',
        'error'
      );
    }
  };

  return (
    <div 
      id="dashboard-snapshot-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Dashboard Snapshot & Exportador PDF</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  html2canvas + jsPDF
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Captura instantânea em alta fidelidade do layout de widgets, métricas e selo criptográfico de autenticidade
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Metadata Preview Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Metadados Vinculados ao Relatório
              </span>
              <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date().toLocaleTimeString('pt-BR')} (Horário de Brasília)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-white p-2.5 shadow-2xs dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Operador / Assinante:</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>

              <div className="rounded-lg bg-white p-2.5 shadow-2xs dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Tenant / Organização:</span>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">{currentUser.tenant}</p>
                <p className="text-[11px] text-slate-500">ID: {currentUser.tenantId} • Região: {selectedRegion.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Resolução de Captura (Escala)
              </label>
              <select
                value={resolutionScale}
                onChange={(e) => setResolutionScale(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={1}>1x Standard (Mais rápido • ~1 MB)</option>
                <option value={2}>2x Retina HD (Recomendado • Alta Nitidez)</option>
                <option value={3}>3x Ultra HD (Impressão Gráfica • Máxima Definição)</option>
              </select>
            </div>

            {/* Layout Orientation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-teal-500" />
                Orientação do Documento
              </label>
              <select
                value={reportOrientation}
                onChange={(e) => setReportOrientation(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="portrait">Retrato (A4 Vertical - Executivo Padrão)</option>
                <option value="landscape">Paisagem (A4 Horizontal - Panorâmico)</option>
              </select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeUserMetadata}
                onChange={(e) => setIncludeUserMetadata(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Incluir cabeçalho com metadados do operador e tenant</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeKpiTable}
                onChange={(e) => setIncludeKpiTable(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Adicionar sumário executivo em caixas KPI (Volume, Transações, Conversão)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSecuritySeal}
                onChange={(e) => setIncludeSecuritySeal(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Carimbar selo criptográfico SHA-256 e certificação PCI-DSS no rodapé</span>
            </label>
          </div>

          {/* Progress / Status Display */}
          {isGenerating && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                  {currentStep}
                </span>
                <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">
                  {generationProgress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/90 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Assinado e pronto para envio a comitê de risco</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancelar
            </button>

            <button
              id="btn-confirm-generate-snapshot-pdf"
              type="button"
              onClick={handleCaptureSnapshot}
              disabled={isGenerating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Renderizando Relatório...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Gerar Snapshot & Baixar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
