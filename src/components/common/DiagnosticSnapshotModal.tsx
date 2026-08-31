import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { FileText, Download, Copy, CheckCircle2, X, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface DiagnosticSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticSnapshotModal: React.FC<DiagnosticSnapshotModalProps> = ({ isOpen, onClose }) => {
  const { paymentIntents, acquirers, auditLogs, currentTenant, displayDensity, theme, language, currency } = usePayment();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const snapshotData = {
    timestamp: new Date().toISOString(),
    appVersion: 'v4.8.2-enterprise',
    environment: 'production',
    tenant: {
      id: currentTenant.id,
      name: currentTenant.name,
      environment: currentTenant.environment
    },
    settings: {
      theme,
      displayDensity,
      language,
      currency
    },
    systemMetrics: {
      activePaymentIntents: paymentIntents.length,
      connectedAcquirers: acquirers.map(a => ({ id: a.id, name: a.name, status: a.healthStatus, errorRate: a.errorRate })),
      auditLogsCount: auditLogs.length,
      memoryUsageMb: Math.round((performance as any)?.memory?.usedJSHeapSize ? (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 42.8),
      fpsEstimate: 60
    },
    recentErrors: auditLogs.filter(l => l.severity === 'high' || l.status === 'error').slice(0, 10),
    performanceLogs: [
      { event: 'AppBoot', latencyMs: 142, status: 'OK' },
      { event: 'WasmCryptographyEngineInit', latencyMs: 38, status: 'OK' },
      { event: 'OfflineQueueSync', latencyMs: 12, status: 'OK' }
    ]
  };

  const jsonString = JSON.stringify(snapshotData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nercash-diagnostic-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Diagnostic Snapshot & Support Ticket Bundle</h3>
              <p className="text-xs text-slate-500">Bundle JSON contendo estado atual, logs de performance e rastreamento de erros</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-500 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 max-h-72 overflow-y-auto">
            <pre>{jsonString}</pre>
          </div>
          <p className="text-xs text-slate-500">
            💡 Este bundle está pronto para anexar a tickets de suporte na Central de Atendimento Nercash Enterprise ou enviar diretamente para a equipe de engenharia.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer transition-all"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-slate-500" />}
            <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar JSON'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500 cursor-pointer transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Baixar Arquivo .JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
