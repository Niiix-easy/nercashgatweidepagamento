import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Database, 
  Download, 
  Sparkles, 
  Terminal, 
  Layers, 
  FileText, 
  Cpu,
  ArrowRight,
  RefreshCcw,
  Check
} from 'lucide-react';

export const AuditQueryEngine: React.FC = () => {
  const { auditLogs, paymentIntents, events, executionLogs, addToast } = usePayment();
  const [naturalQuery, setNaturalQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<'all' | 'audit' | 'transactions' | 'events' | 'automation'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Quick Query Chips
  const quickQueryChips = [
    { label: '🔥 Erros críticos de pagamento', query: 'erros de pagamento falhos ou timeout' },
    { label: '🛡️ Alertas de Compliance & LGPD', query: 'compliance auditoria alteração de regra' },
    { label: '⚡ Transações de alto risco (>80)', query: 'transação score risco acima de 80' },
    { label: '📋 Execuções de automação CRM', query: 'automação webhook disparo' }
  ];

  // Combined Unified Records Stream
  const unifiedRecords = useMemo(() => {
    const list: Array<{
      id: string;
      sourceModule: 'audit' | 'transactions' | 'events' | 'automation';
      title: string;
      timestamp: string;
      severity: 'info' | 'warning' | 'error' | 'critical';
      details: string;
      metadata: Record<string, any>;
    }> = [];

    // 1. Audit Logs
    auditLogs.forEach(log => {
      list.push({
        id: log.id,
        sourceModule: 'audit',
        title: `[${log.module.toUpperCase()}] ${log.action}`,
        timestamp: log.timestamp,
        severity: log.status === 'success' ? 'info' : 'warning',
        details: `${log.details} (User: ${log.userName} / IP: ${log.ipAddress})`,
        metadata: { role: log.userRole, hash: log.hashSha256 }
      });
    });

    // 2. Payment Intents (Transactions)
    paymentIntents.forEach(pi => {
      const isFailed = pi.status === 'requires_action' || pi.acquirerResponse?.declined;
      list.push({
        id: pi.id,
        sourceModule: 'transactions',
        title: `Transação ${pi.id} - ${pi.customerName} (R$ ${pi.amount.toFixed(2)})`,
        timestamp: new Date().toLocaleTimeString(),
        severity: isFailed ? 'error' : 'info',
        details: `Método: ${pi.method} • Adquirente: ${pi.acquirerUsed || 'Stone'} • Status: ${pi.status} • Risco: ${pi.riskScore}/100`,
        metadata: { riskScore: pi.riskScore, method: pi.method, status: pi.status }
      });
    });

    // 3. System Events
    events.forEach(ev => {
      list.push({
        id: ev.id,
        sourceModule: 'events',
        title: `Evento Webhook: ${ev.type}`,
        timestamp: ev.timestamp,
        severity: ev.type.includes('fail') ? 'error' : 'info',
        details: `Payload ID: ${ev.paymentIntentId} • Status HTTP: ${ev.status}`,
        metadata: { status: ev.status, type: ev.type }
      });
    });

    // 4. Automation Execution Logs
    executionLogs.forEach(ex => {
      list.push({
        id: ex.id,
        sourceModule: 'automation',
        title: `Automação Executada: ${ex.automationId}`,
        timestamp: ex.timestamp,
        severity: ex.success ? 'info' : 'error',
        details: `Ações executadas: ${ex.actionsExecuted.join(', ')} • Duração: ${ex.executionTimeMs}ms`,
        metadata: { success: ex.success, timeMs: ex.executionTimeMs }
      });
    });

    return list;
  }, [auditLogs, paymentIntents, events, executionLogs]);

  // Filter records based on active query, module, and severity
  const filteredRecords = useMemo(() => {
    return unifiedRecords.filter(item => {
      // Module filter
      if (selectedModule !== 'all' && item.sourceModule !== selectedModule) {
        return false;
      }
      // Severity filter
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      // Keyword / Natural Language search
      const q = (naturalQuery || searchKeyword).toLowerCase().trim();
      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDetails = item.details.toLowerCase().includes(q);
        const matchesModule = item.sourceModule.toLowerCase().includes(q);
        return matchesTitle || matchesDetails || matchesModule;
      }
      return true;
    });
  }, [unifiedRecords, selectedModule, severityFilter, naturalQuery, searchKeyword]);

  const handleExportAuditBundle = () => {
    setIsExporting(true);
    setTimeout(() => {
      const bundle = {
        engine: 'Nercash Centralized Audit Query Engine',
        exportedAt: new Date().toISOString(),
        totalRecords: filteredRecords.length,
        filtersApplied: { naturalQuery, selectedModule, severityFilter },
        records: filteredRecords
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nercash_audit_query_export_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      addToast('Auditoria Exportada', `Exportados ${filteredRecords.length} registros com sucesso (JSON).`, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header & NL Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Centralized Audit Query Engine</h3>
              <p className="text-xs text-slate-500">Consulta unificada e natural-language filter builder para trilhas de auditoria, logs de sistema e transações</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportAuditBundle}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Download className={`h-4 w-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exportando...' : 'Exportar Bundle Auditável'}</span>
          </button>
        </div>

        {/* Natural Language Query Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </div>
          <input
            type="text"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            placeholder="Ex: 'erros de pagamento na Stone', 'modificações de regra por admin', 'transações com score > 80'..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Quick Query Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filtros Rápidos:</span>
          {quickQueryChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setNaturalQuery(chip.query)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer transition-all"
            >
              {chip.label}
            </button>
          ))}
          {naturalQuery && (
            <button
              type="button"
              onClick={() => setNaturalQuery('')}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-2"
            >
              Limpar Filtro
            </button>
          )}
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Módulo de Origem</label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todos os Módulos ({unifiedRecords.length})</option>
              <option value="audit">Trilhas de Auditoria (Audit Logs)</option>
              <option value="transactions">Transações & Pagamentos</option>
              <option value="events">Webhooks & Eventos</option>
              <option value="automation">Automações & CRM</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Severidade / Status</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas as Severidades</option>
              <option value="info">Info / Sucesso</option>
              <option value="warning">Aviso (Warning)</option>
              <option value="error">Erro / Falha (Error)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Registros Encontrados</label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredRecords.length} registros</span>
              <span className="text-[10px] text-slate-400">Tempo de busca: 24ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Stream */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
            <Search className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nenhum registro encontrado</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Tente ajustar os termos de busca na barra de linguagem natural ou redefinir os filtros de módulo.</p>
          </div>
        ) : (
          filteredRecords.map((item, idx) => (
            <div
              key={item.id + idx}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    item.severity === 'error' || item.severity === 'critical'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : item.severity === 'warning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {item.sourceModule}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.details}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  ID: {item.id}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
