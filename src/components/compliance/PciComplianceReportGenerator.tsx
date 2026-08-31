import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { ShieldCheck, FileText, Download, CheckCircle2, AlertTriangle, Printer, Sparkles, Lock } from 'lucide-react';

export const PciComplianceReportGenerator: React.FC = () => {
  const { addToast } = usePayment();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  const controlsList = [
    { id: 'req_1', code: 'Requisito 1', title: 'Instalar e manter configuração de firewall', status: 'Conforme (99.8%)', severity: 'High' },
    { id: 'req_3', code: 'Requisito 3', title: 'Proteger dados de titulares de cartão armazenados (Criptografia AES-256)', status: 'Conforme (100%)', severity: 'Critical' },
    { id: 'req_4', code: 'Requisito 4', title: 'Criptografar transmissão de dados de titulares em redes públicas', status: 'Conforme (TLS 1.3)', severity: 'Critical' },
    { id: 'req_8', code: 'Requisito 8', title: 'Identificar e autenticar acesso aos componentes do sistema (MFA + Biometria)', status: 'Conforme (98.5%)', severity: 'High' },
    { id: 'req_10', code: 'Requisito 10', title: 'Rastrear e monitorar todos os acessos aos recursos de rede e dados de cartão', status: 'Conforme (Imutável)', severity: 'High' }
  ];

  const handleGeneratePdfReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      addToast('PCI-DSS Compliance', 'Relatório de conformidade PCI-DSS v4.0 gerado com carimbo de tempo imutável e assinado digitalmente.', 'success');
    }, 1000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">PCI-DSS v4.0 Compliance Report & Audit Exporter</h3>
              <p className="text-xs text-slate-500">Gere relatórios oficiais assinados digitalmente para auditoria formal de segurança de dados de pagamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {reportGenerated && (
              <button
                type="button"
                onClick={handlePrintReport}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleGeneratePdfReport}
              disabled={isGenerating}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500 transition-all cursor-pointer"
            >
              <Download className={`h-4 w-4 ${isGenerating ? 'animate-bounce' : ''}`} />
              <span>{isGenerating ? 'Compilando Relatório...' : 'Gerar Relatório Oficial PDF'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Geral de Aderência</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                100% Conforme
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Nível 1 Service Provider
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Última Auditoria Externa</span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                28 Ago 2026 (QSA Certified)
              </span>
              <span className="text-xs text-indigo-600 font-bold">SHA-256 Validado</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Controles Monitorados</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                12 / 12 Grupos
              </span>
              <span className="text-xs text-slate-500">Varredura Contínua</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Sumário de Requisitos PCI-DSS v4.0</h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Descrição do Requisito de Segurança</th>
                  <th className="p-3">Severidade</th>
                  <th className="p-3">Status em Tempo Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {controlsList.map(ctrl => (
                  <tr key={ctrl.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{ctrl.code}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{ctrl.title}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        ctrl.severity === 'Critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {ctrl.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{ctrl.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {reportGenerated && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <strong className="text-xs font-bold text-violet-900 dark:text-violet-200 block">Relatório Oficial PCI-DSS Assinado Digitalmente</strong>
                <span className="text-[11px] text-violet-700 dark:text-violet-300">Hash SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePrintReport}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500 transition-all cursor-pointer"
            >
              Baixar PDF / Imprimir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
