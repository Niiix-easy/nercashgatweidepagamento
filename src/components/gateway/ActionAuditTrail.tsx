import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { ShieldCheck, Calendar, Search, Filter, Hash, User, Activity } from 'lucide-react';

export const ActionAuditTrail: React.FC = () => {
  const { auditLogs } = usePayment();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => 
    log.action.includes('BULK') || log.action.includes('PCI_') || log.action.includes('CHARGEBACK_')
  ).filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            Action Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Registro imutável de ações em lote realizadas no PCI Token Vault e Chargebacks.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar log, ator ou ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Data/Hora</th>
              <th className="px-4 py-3 font-semibold">Ator (Usuário)</th>
              <th className="px-4 py-3 font-semibold">Ação Realizada</th>
              <th className="px-4 py-3 font-semibold">Detalhes (JSON)</th>
              <th className="px-4 py-3 font-semibold">Hash SHA-256</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {log.actor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{log.actor.name}</div>
                        <div className="text-[10px] text-slate-500">{log.actor.ipAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      log.severity === 'critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                      log.severity === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                    <div className="max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    <div className="flex items-center gap-1" title={log.hashSha256}>
                      <Hash className="h-3 w-3" />
                      {log.hashSha256?.substring(0, 16)}...
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nenhuma ação em lote registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
