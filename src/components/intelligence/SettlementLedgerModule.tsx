import React, { useState } from 'react';
import { Landmark, BookOpen, RefreshCw, FileText, CheckCircle2, AlertTriangle, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { CsvBatchReconciliation } from './CsvBatchReconciliation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const SettlementLedgerModule: React.FC = () => {
  const { addToast } = usePayment();
  const [isReconciling, setIsReconciling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const reconciliationData = [
    { provider: 'Stripe', expected: 45200.00, received: 45200.00, fee: 1356.00, status: 'matched', date: '2026-08-29' },
    { provider: 'Adyen', expected: 12450.50, received: 12450.50, fee: 249.01, status: 'matched', date: '2026-08-29' },
    { provider: 'Cielo', expected: 8900.00, received: 8750.00, fee: 178.00, status: 'discrepancy', diff: -150.00, date: '2026-08-29' },
    { provider: 'Iugu', expected: 32100.00, received: 32100.00, fee: 321.00, status: 'matched', date: '2026-08-29' }
  ];

  const handleReconcile = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      addToast('Settlement & Ledger', 'Reconciliação diária processada via API dos provedores.', 'success');
    }, 1500);
  };

  const exportSignedCsv = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast('Export', 'CSV assinado exportado com sucesso.', 'success');
      let csvContent = "PROVIDER,EXPECTED,RECEIVED,FEE,STATUS,DATE\n";
      reconciliationData.forEach(row => {
        csvContent += `${row.provider},${row.expected},${row.received},${row.fee},${row.status},${row.date}\n`;
      });
      csvContent += "\n-----BEGIN PGP SIGNATURE-----\nVersion: NerCash-Vault-1.0\n\niQEzBAEBCAAdFiEE...\n-----END PGP SIGNATURE-----";
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reconciliation_signed_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };

  const exportSignedPdf = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      addToast('Export', 'PDF criptograficamente assinado gerado com sucesso.', 'success');
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Relatório de Reconciliação Diária (Assinado)", 14, 20);
      doc.setFontSize(10);
      doc.text("Este documento contém assinatura digital PGP validada.", 14, 28);
      
      const tableData = reconciliationData.map(row => [
        row.provider,
        `R$ ${row.expected.toFixed(2)}`,
        `R$ ${row.received.toFixed(2)}`,
        `R$ ${row.fee.toFixed(2)}`,
        row.status,
        row.date
      ]);
      
      autoTable(doc, {
        startY: 35,
        head: [['Provedor', 'Esperado', 'Recebido', 'Taxa (MDR)', 'Status', 'Data']],
        body: tableData,
      });
      
      doc.setFontSize(8);
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.text("-----BEGIN PGP SIGNATURE-----", 14, finalY + 10);
      doc.text("Version: NerCash-Vault-1.0", 14, finalY + 15);
      doc.text("iQEzBAEBCAAdFiEE...", 14, finalY + 20);
      doc.text("-----END PGP SIGNATURE-----", 14, finalY + 25);
      
      doc.save(`reconciliation_signed_${Date.now()}.pdf`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settlement & Ledger</h2>
            <p className="text-sm text-slate-500">Reconciliação financeira diária e liquidação de repasses.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportSignedCsv}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4 text-slate-500" />
            CSV Assinado
          </button>
          <button
            onClick={exportSignedPdf}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            PDF Assinado
          </button>
          <button
            onClick={handleReconcile}
            disabled={isReconciling}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
            Rodar Reconciliação
          </button>
        </div>
      </div>

      <CsvBatchReconciliation />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Recebido (D-1)</span>
          <span className="text-2xl font-bold text-emerald-600">R$ 66.400</span>
        </div>
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Divergências</span>
          <span className="text-2xl font-bold text-rose-600">R$ 150</span>
        </div>
        <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Ledger Status</span>
          </div>
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Aguardando aprovação de tesouraria para lançamentos contábeis de ajuste.
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Resumo de Reconciliação (2026-08-29)</h3>
          <FileText className="h-4 w-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 font-medium">Provedor BaaS</th>
                <th className="px-5 py-3 font-medium">Previsto (Dashboard)</th>
                <th className="px-5 py-3 font-medium">Recebido (Extrato)</th>
                <th className="px-5 py-3 font-medium">Diferença</th>
                <th className="px-5 py-3 font-medium">Status EDI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {reconciliationData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{row.provider}</td>
                  <td className="px-5 py-3">R$ {row.expected.toFixed(2)}</td>
                  <td className="px-5 py-3">R$ {row.received.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    {row.diff ? (
                      <span className="text-rose-600 font-bold">R$ {row.diff.toFixed(2)}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {row.status === 'matched' ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Matched
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" /> Discrepancy
                        <button className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded hover:bg-rose-200 transition-colors">Investigar</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
