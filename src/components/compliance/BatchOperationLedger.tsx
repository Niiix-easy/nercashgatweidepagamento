import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { History, RotateCcw, CheckCircle2, ShieldCheck, RefreshCw, Layers, FileSpreadsheet, Sparkles } from 'lucide-react';
import { SmartBatchProcessor } from '../orchestration/SmartBatchProcessor';
import { AuditLogHistoryPanel } from './AuditLogHistoryPanel';

export const BatchOperationLedger: React.FC = () => {
  const { addToast } = usePayment();
  const [activeLedgerTab, setActiveLedgerTab] = useState<'reconciliation_conflicts' | 'undo_stack'>('reconciliation_conflicts');
  const [ledgerHistory, setLedgerHistory] = useState<Array<{ id: string; batchName: string; timestamp: string; affectedCount: number; status: 'active' | 'reverted'; user: string }>>([
    { id: 'batch_109', batchName: 'Reconciliação Lote Noturno PIX/Boleto', timestamp: '2026-08-29 11:30:12', affectedCount: 1420, status: 'active', user: 'admin@nercash.io' },
    { id: 'batch_108', batchName: 'Atualização Prioridade Gateway Stone -> Cielo', timestamp: '2026-08-29 10:15:44', affectedCount: 5, status: 'active', user: 'maycon@nercash.io' },
    { id: 'batch_107', batchName: 'Aplicação de Regra Anti-Fraud Batch #89', timestamp: '2026-08-29 09:02:10', affectedCount: 310, status: 'reverted', user: 'system@ml' }
  ]);
  const [isReverting, setIsReverting] = useState<string | null>(null);

  const handleRevertBatch = (id: string, name: string) => {
    setIsReverting(id);
    setTimeout(() => {
      setLedgerHistory(prev => prev.map(item => item.id === id ? { ...item, status: 'reverted' } : item));
      setIsReverting(null);
      addToast('Batch Ledger', `Lote "${name}" revertido com sucesso para o estado anterior conhecido (Known-good state).`, 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="settlement-ledger-hub">
      {/* Subtab selection header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveLedgerTab('reconciliation_conflicts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeLedgerTab === 'reconciliation_conflicts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Reconciliação de Lotes CSV & Conflict Visualizer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLedgerTab('undo_stack')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeLedgerTab === 'undo_stack'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Ledger de Operações & Undo/Redo Stack</span>
        </button>
      </div>

      {activeLedgerTab === 'reconciliation_conflicts' && (
        <SmartBatchProcessor />
      )}

      {activeLedgerTab === 'undo_stack' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Operation Ledger & Undo/Redo Stack</h3>
                <p className="text-xs text-slate-500">Mantenha o histórico imutável de operações em lote e reverta alterações para um estado conhecido (known-good state)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Histórico de Alterações em Lote & Reversão</h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">ID / Nome da Operação</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Registros Afetados</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3">Status / Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {ledgerHistory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{item.batchName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{item.timestamp}</td>
                      <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">{item.affectedCount} registros</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400 text-[11px]">{item.user}</td>
                      <td className="p-3">
                        {item.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleRevertBatch(item.id, item.batchName)}
                            disabled={isReverting === item.id}
                            className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 transition-all cursor-pointer"
                          >
                            <RotateCcw className={`h-3.5 w-3.5 ${isReverting === item.id ? 'animate-spin' : ''}`} />
                            <span>{isReverting === item.id ? 'Revertendo...' : 'Reverter Lote'}</span>
                          </button>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            ↺ Revertido (Rollback)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <AuditLogHistoryPanel />
        </div>
      )}
    </div>
  );
};
