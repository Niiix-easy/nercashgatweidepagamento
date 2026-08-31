import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Search, Sparkles, Filter, ShieldAlert, CheckCircle2, FileText, Download, ArrowRight, RefreshCw } from 'lucide-react';

export const ComplianceAuditQueryEngine: React.FC = () => {
  const { auditLogs, paymentIntents, apiKeys } = usePayment();
  const [naturalQuery, setNaturalQuery] = useState<string>('');
  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const samplePrompts = [
    'Mostrar transações falhas com cartão nas últimas 24h',
    'Auditar acessos suspeitos por IP de alto risco / VPN',
    'Listar eventos de alteração de regras de roteamento',
    'Erros críticos de webhook com código 5xx'
  ];

  // Combined audit data source across modules
  const allAuditRecords = useMemo(() => {
    const logs = auditLogs.map(l => ({
      id: l.id,
      timestamp: l.timestamp,
      module: 'Audit Trail',
      actor: l.actor || 'System / Admin',
      action: l.action,
      details: l.details,
      severity: l.severity || 'info',
      status: l.status || 'success'
    }));

    const intents = paymentIntents.filter(p => p.status === 'failed' || p.status === 'declined').map(p => ({
      id: p.id,
      timestamp: p.createdAt,
      module: 'Payment Intent',
      actor: p.customerName,
      action: `Falha de Transação (${p.method})`,
      details: `Tentativa de R$ ${p.amount.toFixed(2)} recusada pelo adquirente (${p.acquirerId}).`,
      severity: 'high',
      status: 'error'
    }));

    return [...logs, ...intents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, paymentIntents]);

  const filteredRecords = useMemo(() => {
    return allAuditRecords.filter(item => {
      const query = naturalQuery.toLowerCase();
      const matchesQuery = !query || 
        item.action.toLowerCase().includes(query) ||
        item.details.toLowerCase().includes(query) ||
        item.actor.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query);

      if (activeFilterTag === 'errors' && item.status !== 'error' && item.severity !== 'high') return false;
      if (activeFilterTag === 'payments' && item.module !== 'Payment Intent') return false;
      if (activeFilterTag === 'security' && !item.action.toLowerCase().includes('segurança') && !item.details.toLowerCase().includes('ip')) return false;

      return matchesQuery;
    });
  }, [allAuditRecords, naturalQuery, activeFilterTag]);

  const handleRunNlQuery = (promptText: string) => {
    setNaturalQuery(promptText);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 400);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Audit Query Engine (Natural Language)</h3>
              <p className="text-xs text-slate-500">Pesquise e filtre registros de auditoria em todos os módulos da plataforma usando linguagem natural</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold font-mono text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
              {filteredRecords.length} Registros Encontrados
            </span>
          </div>
        </div>

        {/* Natural Language Input Bar */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            </div>
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="Ex: 'Mostrar pagamentos falhos acima de R$ 500', 'Auditar acessos por VPN'..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Sugestões de Consultas:</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunNlQuery(prompt)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                ✨ {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveFilterTag('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeFilterTag === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Todos os Módulos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('errors')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeFilterTag === 'errors' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Apenas Falhas & Erros Criticos
          </button>
          <button
            type="button"
            onClick={() => setActiveFilterTag('payments')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeFilterTag === 'payments' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Transações de Pagamento
          </button>
        </div>

        {/* Results Records Table */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Data / Hora (UTC)</th>
                  <th className="p-3">Ação / Evento</th>
                  <th className="p-3">Ator / Cliente</th>
                  <th className="p-3">Detalhes</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRecords.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {rec.module}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{new Date(rec.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{rec.action}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{rec.actor}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{rec.details}</td>
                    <td className="p-3 text-right">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        rec.status === 'error' || rec.severity === 'high'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {rec.status === 'error' ? 'Falha / Alerta' : 'Conforme'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
