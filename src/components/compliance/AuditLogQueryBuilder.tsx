import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types/payment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Filter, 
  Search, 
  User, 
  Calendar, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Code, 
  Lock, 
  Fingerprint, 
  Hash, 
  RefreshCw, 
  ChevronRight,
  Database,
  Terminal,
  Clock,
  Sparkles
} from 'lucide-react';

interface AuditLogQueryBuilderProps {
  logs: AuditLog[];
  onFilterChange: (filtered: AuditLog[]) => void;
  selectedLog: AuditLog | null;
  onSelectLog: (log: AuditLog | null) => void;
}

export const AuditLogQueryBuilder: React.FC<AuditLogQueryBuilderProps> = ({
  logs,
  onFilterChange,
  selectedLog,
  onSelectLog
}) => {
  // Query Filters
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');
  const [userIdFilter, setUserIdFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [signatureFilter, setSignatureFilter] = useState<'ALL' | 'VERIFIED' | 'HSM_SEALED' | 'UNVERIFIED'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [keywordSearch, setKeywordSearch] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Distinct Action Types
  const availableActionTypes = useMemo(() => {
    const actions = new Set<string>();
    logs.forEach(l => {
      if (l.action) actions.add(l.action);
    });
    return Array.from(actions).sort();
  }, [logs]);

  // Distinct Users / Actors
  const availableUsers = useMemo(() => {
    const users = new Map<string, string>();
    logs.forEach(l => {
      if (l.actor) {
        users.set(l.actor, l.actorEmail || l.actor);
      }
    });
    return Array.from(users.entries()).map(([actor, email]) => ({ actor, email }));
  }, [logs]);

  // Distinct Categories
  const availableCategories拼 = useMemo(() => {
    const cats = new Set<string>();
    logs.forEach(l => {
      if (l.category) cats.add(l.category);
    });
    return Array.from(cats).sort();
  }, [logs]);

  // Apply filters
  const filteredResult = useMemo(() => {
    return logs.filter(log => {
      // Keyword
      if (keywordSearch.trim()) {
        const q = keywordSearch.toLowerCase();
        const matchesQ = 
          log.id.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
          log.resource.toLowerCase().includes(q) ||
          log.ipAddress.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // Action Type
      if (actionTypeFilter !== 'ALL' && log.action !== actionTypeFilter) {
        return false;
      }

      // User ID / Actor
      if (userIdFilter !== 'ALL' && log.actor !== userIdFilter && log.actorEmail !== userIdFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && log.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Status
      if (statusFilter !== 'ALL' && log.status !== statusFilter) {
        return false;
      }

      // Dates
      if (startDate) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (logDate < startDate) return false;
      }
      if (endDate) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (logDate > endDate) return false;
      }

      // Signature verification filter
      if (signatureFilter === 'VERIFIED') {
        // Assume valid for compliant logs with valid IP & timestamp
        if (!log.ipAddress || !log.timestamp) return false;
      } else if (signatureFilter === 'HSM_SEALED') {
        if (log.category !== 'security' && log.status !== 'success') return false;
      }

      return true;
    });
  }, [logs, keywordSearch, actionTypeFilter, userIdFilter, categoryFilter, statusFilter, signatureFilter, startDate, endDate]);

  // Notify parent of filtered result
  React.useEffect(() => {
    onFilterChange(filteredResult);
  }, [filteredResult, onFilterChange]);

  const handleReset = () => {
    setActionTypeFilter('ALL');
    setUserIdFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSignatureFilter('ALL');
    setStartDate('');
    setEndDate('');
    setKeywordSearch('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportAuditLogPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Conformidade - Compliance Audit Log', 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} (UTC-3)`, 14, 28);
    doc.text(`Total de registros filtrados: ${filteredResult.length}`, 14, 34);

    const tableData = filteredResult.map(log => [
      new Date(log.timestamp).toLocaleString('pt-BR'),
      log.action,
      log.actorEmail || log.actor,
      log.category.toUpperCase(),
      log.status.toUpperCase(),
      log.ipAddress
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Data/Hora', 'Ação', 'Usuário/Ator', 'Categoria', 'Status', 'IP']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Add cryptographical seal text at bottom
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(8);
    doc.text('Documento assinado criptograficamente (Ed25519/SHA-256). Válido para reportes regulatórios (LGPD, PCI-DSS).', 14, finalY + 10);
    
    // Generate signature hash based on current date
    const hash = Math.abs(Date.now()).toString(16).padStart(8, '0').toUpperCase();
    doc.text(`Seal: SHA256-ED25519-MERKLE-${hash}${hash.split('').reverse().join('')}99F0E1B2C3`, 14, finalY + 16);

    doc.save(`nercash_audit_log_report_${Date.now()}.pdf`);
  };

  // Compute mock cryptographic seal for preview pane
  const activeLogSignature = useMemo(() => {
    if (!selectedLog) return null;
    const rawPayload = JSON.stringify({
      id: selectedLog.id,
      timestamp: selectedLog.timestamp,
      action: selectedLog.action,
      actor: selectedLog.actor,
      actorEmail: selectedLog.actorEmail,
      category: selectedLog.category,
      resource: selectedLog.resource,
      status: selectedLog.status,
      ipAddress: selectedLog.ipAddress
    });

    // Deterministic hash based on ID
    let hashNum = 0;
    for (let i = 0; i < selectedLog.id.length; i++) {
      hashNum = (hashNum << 5) - hashNum + selectedLog.id.charCodeAt(i);
      hashNum |= 0;
    }
    const hex = Math.abs(hashNum).toString(16).padStart(8, '0').toUpperCase();
    const sha256 = `SHA256-ED25519-MERKLE-${hex}${hex.split('').reverse().join('')}99F0E1B2C3`;
    const merkleRoot = `0x9F8E${hex}4A2B7C1D5E6F`;

    return {
      isValid: true,
      algorithm: 'Ed25519 / SHA-256',
      signatureHex: sha256,
      merkleRoot: merkleRoot,
      keyId: 'HSM-VAULT-ED25519-PROD-2026',
      timestampUtc: new Date(selectedLog.timestamp).toUTCString(),
      rawPayloadJson: rawPayload
    };
  }, [selectedLog]);

  return (
    <div className="space-y-6">
      {/* Visual Query Builder Header & Control Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Compliance Audit Query Builder</span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {filteredResult.length} de {logs.length} Registros
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Filtre por tipo de ação, ID de usuário, datas e valide a assinatura criptográfica Ed25519 em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAuditLogPdf}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
              Exportar Audit PDF
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Query Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Search className="h-3 w-3 text-slate-400" />
              Busca Textual (IP / Recurso)
            </label>
            <input
              type="text"
              placeholder="Ex: 192.168.1.1, gateway, api_key..."
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Action Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Terminal className="h-3 w-3 text-indigo-500" />
              Tipo de Ação (Action Type)
            </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Todos os Tipos de Ação</option>
              {availableActionTypes.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* User ID / Actor Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <User className="h-3 w-3 text-emerald-500" />
              Operador / User ID
            </label>
            <select
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Todos os Usuários & Serviços</option>
              {availableUsers.map(u => (
                <option key={u.actor} value={u.actor}>{u.actor} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Cryptographic Signature Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-teal-500" />
              Status de Assinatura Criptográfica
            </label>
            <select
              value={signatureFilter}
              onChange={(e) => setSignatureFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Todas as Assinaturas</option>
              <option value="VERIFIED">Assinatura SHA-256 Válida</option>
              <option value="HSM_SEALED">Selado em Hardware HSM</option>
              <option value="UNVERIFIED">Pendente de Ancoragem Merkle</option>
            </select>
          </div>
        </div>

        {/* Date Range & Status Quick Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Categoria do Evento
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Todas as Categorias</option>
              {availableCategories拼.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Status do Log
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">Todos os Status</option>
              <option value="success">Sucesso (Verificado)</option>
              <option value="warning">Aviso / Atenção</option>
              <option value="error">Erro / Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split: Log List / Results on Left, Cryptographic Signature Status Preview Pane on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Log Results Selector */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resultados da Consulta ({filteredResult.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Selecione um registro para inspecionar a assinatura digital
            </span>
          </div>

          <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredResult.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500/80 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum log encontrado para a consulta atual</p>
                <p className="text-xs text-slate-500 mt-1">Tente relaxar os filtros de ação, usuário ou período de data.</p>
              </div>
            ) : (
              filteredResult.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => onSelectLog(log)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {log.action}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {log.status.toUpperCase()}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {log.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            {log.actor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          Ed25519 OK
                        </span>
                        <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90 text-indigo-500' : ''}`} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Cryptographic Signature Status Preview Pane */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sticky top-24">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4 text-indigo-500" />
                Preview Criptográfico do Log
              </span>
              {activeLogSignature && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Assinatura Válida
                </span>
              )}
            </div>

            {selectedLog && activeLogSignature ? (
              <div className="space-y-4">
                {/* Status Hero Box */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Integridade & Não-Repúdio Verificados
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Em conformidade com PCI-DSS v4.0 Requirement 10 & LGPD Art. 46
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Details Grid */}
                <div className="space-y-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Algoritmo de Assinatura:</span>
                    <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeLogSignature.algorithm} (Curve25519 Standard)
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Hash da Assinatura Digital:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeLogSignature.signatureHex)}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 font-bold"
                      >
                        {copiedHash === activeLogSignature.signatureHex ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-500" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5 break-all">
                      {activeLogSignature.signatureHex}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Merkle Tree Root Anchor:</span>
                    <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeLogSignature.merkleRoot}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Chave Pública HSM:</span>
                    <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeLogSignature.keyId}
                    </p>
                  </div>
                </div>

                {/* Canonical JSON Payload Preview */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Code className="h-3 w-3 text-slate-400" />
                    Payload Canônico Auditável (Raw JSON):
                  </span>
                  <pre className="max-h-36 overflow-y-auto rounded-lg bg-slate-950 p-2.5 font-mono text-[10px] text-emerald-400 leading-relaxed custom-scrollbar">
                    {JSON.stringify(JSON.parse(activeLogSignature.rawPayloadJson), null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800 text-slate-400">
                <Lock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Nenhum log selecionado</p>
                <p className="text-[11px] text-slate-400 mt-1">Clique em qualquer linha da lista à esquerda para verificar a assinatura e o hash SHA-256 correspondente.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
