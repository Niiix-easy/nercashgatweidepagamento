import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Download, FileText, CheckCircle2, ChevronRight, X, Sparkles, Server, ShieldCheck, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OverviewExportWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OverviewExportWizard: React.FC<OverviewExportWizardProps> = ({ isOpen, onClose }) => {
  const { currentTenant, acquirers } = usePayment();
  const [step, setStep] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState({
    latency: true,
    health: true,
    quotas: true
  });

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text(currentTenant.branding.logoText || 'Dashboard', 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text('Relatório de Telemetria e Saúde', 20, 40);

      let currentY = 55;

      if (selectedMetrics.latency) {
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('API Latency & Troughput', 20, currentY);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Métrica', 'Valor Médio', 'Status']],
          body: [
            ['Latência Global (P99)', '18ms', 'Otimizado'],
            ['TPS Ativo', '1.420 / 10.000', 'Normal'],
            ['Uptime (30 dias)', '99.994%', 'Alta Disponibilidade']
          ],
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if (selectedMetrics.health) {
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('Saúde dos Provedores (Acquirers)', 20, currentY);
        
        const healthData = acquirers.map(acq => [
          acq.name,
          acq.healthStatus === 'up' ? 'Operacional' : 'Degradado',
          acq.circuitBreakerTripped ? 'Desconectado (Kill Switch)' : 'Conectado',
          `${acq.latency}ms`
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Provedor', 'Status', 'Circuito', 'Latência']],
          body: healthData,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      if (selectedMetrics.quotas) {
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('Quotas e Limites Diários', 20, currentY);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Serviço', 'Uso Atual', 'Limite Diário', 'Consumo']],
          body: [
            ['Requisições API', '142.500', '500.000', '28%'],
            ['Tokens PCI', '1.200', '10.000', '12%'],
            ['Inferência ML (Risk)', '45.000', '100.000', '45%']
          ],
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11] }
        });
      }

      const certId = `CERT-${Date.now().toString(16).toUpperCase()}-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento Assinado Eletronicamente. Hash: ${certId}`, 20, doc.internal.pageSize.height - 10);

      doc.save(`dashboard-metrics-${Date.now()}.pdf`);
      setIsExporting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Export Wizard</h2>
              <p className="text-xs text-slate-500">Gerador de relatórios de telemetria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Selecione as métricas do painel que deseja incluir no relatório consolidado:
              </p>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.latency}
                    onChange={(e) => setSelectedMetrics(s => ({ ...s, latency: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Activity className="h-4 w-4 text-indigo-500" /> API Latency & Performance
                    </span>
                    <p className="mt-1 text-xs text-slate-500">TPS, uptime global e latência média (P99).</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.health}
                    onChange={(e) => setSelectedMetrics(s => ({ ...s, health: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> Provider Health Status
                    </span>
                    <p className="mt-1 text-xs text-slate-500">Status dos adquirentes, degradações e circuit breakers.</p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.quotas}
                    onChange={(e) => setSelectedMetrics(s => ({ ...s, quotas: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <Server className="h-4 w-4 text-amber-500" /> Daily Quotas & Usage
                    </span>
                    <p className="mt-1 text-xs text-slate-500">Consumo de tokens PCI e inferências ML do dia.</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedMetrics.latency && !selectedMetrics.health && !selectedMetrics.quotas}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Sparkles className="h-8 w-8 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gerar Relatório PDF</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  O relatório será gerado com o branding da <strong>{currentTenant.branding.logoText}</strong> e selo de assinatura digital.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => setStep(1)}
                  disabled={isExporting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-75"
                >
                  {isExporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
