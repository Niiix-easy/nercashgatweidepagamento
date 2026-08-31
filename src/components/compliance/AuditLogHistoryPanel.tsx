import React from 'react';
import { usePayment } from '../../context/PaymentContext';
import { History, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const AuditLogHistoryPanel: React.FC = () => {
  const { auditLogs } = usePayment();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-violet-600 text-white">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log de Auditoria de Operações</h3>
          <p className="text-[10px] text-slate-500">Histórico rastreável de exportações, alterações em lote e ações sensíveis.</p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-3">
        {auditLogs.map(log => (
          <div key={log.id} className="flex gap-3 text-xs p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <div className={`mt-0.5 ${log.severity === 'critical' ? 'text-rose-500' : 'text-indigo-500'}`}>
              {log.severity === 'critical' ? <AlertTriangle className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-slate-200">{log.action}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400">{log.details}</p>
              <p className="text-[9px] font-mono text-slate-400 pt-1">{new Date(log.timestamp).toLocaleString()} | Actor: {log.actor.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
