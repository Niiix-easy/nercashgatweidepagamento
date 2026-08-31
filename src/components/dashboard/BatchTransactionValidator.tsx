import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Search, Play, RefreshCw, Check } from 'lucide-react';

export const BatchTransactionValidator: React.FC = () => {
  const { paymentIntents, auditLogs } = usePayment();
  const [pastedIds, setPastedIds] = useState<string>(
    'pi_883921\npi_991042\npi_772019\npi_nonexistent_1\npi_448102'
  );
  const [validationResults, setValidationResults] = useState<Array<{ id: string; found: boolean; status: string; customer: string; amount: number; source: string; timestamp: string }>>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [hasValidated, setHasValidated] = useState<boolean>(false);

  const handleRunBatchValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      const ids = pastedIds.split('\n').map(s => s.trim()).filter(Boolean);
      const results = ids.map(id => {
        const foundIntent = paymentIntents.find(pi => pi.id === id);
        if (foundIntent) {
          return {
            id,
            found: true,
            status: foundIntent.status,
            customer: foundIntent.customerName,
            amount: foundIntent.amount,
            source: 'Payment Intents Table',
            timestamp: 'Registrado'
          };
        }
        // Check audit logs
        const foundAudit = auditLogs.find(al => al.details.includes(id));
        if (foundAudit) {
          return {
            id,
            found: true,
            status: foundAudit.status,
            customer: foundAudit.userName,
            amount: 0,
            source: 'Audit Log Trail',
            timestamp: foundAudit.timestamp
          };
        }
        return {
          id,
          found: false,
          status: 'NOT_FOUND_OR_ARCHIVED',
          customer: 'Desconhecido',
          amount: 0,
          source: 'Cold Storage / Não Localizado',
          timestamp: 'N/A'
        };
      });

      setValidationResults(results);
      setIsValidating(false);
      setHasValidated(true);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Transaction Validator</h3>
            <p className="text-xs text-slate-500">Valide status, integridade e conformidade de múltiplos IDs de transação contra o log de auditoria</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunBatchValidation}
          disabled={isValidating}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
        >
          <Play className={`h-3.5 w-3.5 ${isValidating ? 'animate-pulse' : ''}`} />
          <span>{isValidating ? 'Validando Lote...' : 'Validar Lote de IDs'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Cole os IDs de Transação (um por linha):
          </label>
          <textarea
            rows={6}
            value={pastedIds}
            onChange={(e) => setPastedIds(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            placeholder="pi_883921&#10;pi_991042&#10;..."
          />
          <p className="text-[11px] text-slate-500">
            O validador cruza os IDs informados com o Core Database e o Cold Storage Audit Trail.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resultado do Lote Validado</h4>
            {hasValidated && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {validationResults.filter(r => r.found).length} / {validationResults.length} Válidos
              </span>
            )}
          </div>

          {!hasValidated ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 dark:border-slate-800 space-y-2">
              <Search className="mx-auto h-8 w-8 text-slate-300" />
              <p className="text-xs font-medium">Clique em "Validar Lote de IDs" para iniciar a verificação de integridade.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800 max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">ID da Transação</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {validationResults.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-mono font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.found ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span>{item.id}</span>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.found ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{item.customer}</td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">{item.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
