import React, { useState } from 'react';
import { Lock, Search, ShieldCheck, Trash2, Key, AlertTriangle, Eye, EyeOff, Filter, Download, UploadCloud } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { FloatingQuickActionsBar, QuickActionOption } from '../common/FloatingQuickActionsBar';
import { BatchTokenIngestionModal } from './BatchTokenIngestionModal';

export const PciTokenVault: React.FC = () => {
  const { addToast, addAuditLog } = usePayment();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLast4, setFilterLast4] = useState('');
  const [filterExp, setFilterExp] = useState('');
  const [isMasked, setIsMasked] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  
  const [tokens, setTokens] = useState([
    { id: 'tok_1J9XyZ2eZvKYlo2C2F8bJ4', customer: 'João Silva', brand: 'visa', last4: '4242', exp: '12/28', created: '2026-08-28 14:30', status: 'active' },
    { id: 'tok_8K2WqA4fPxMRnu5D9C1vT6', customer: 'Maria Santos', brand: 'mastercard', last4: '5555', exp: '09/27', created: '2026-08-25 09:15', status: 'active' },
    { id: 'tok_3L7YhB1mNsTVjo8E4V5xR9', customer: 'Carlos Sousa', brand: 'amex', last4: '1005', exp: '03/29', created: '2026-08-10 11:45', status: 'revoked' },
  ]);

  const handleRevoke = (id: string) => {
    setTokens(tokens.map(t => t.id === id ? { ...t, status: 'revoked' } : t));
    addToast('PCI Vault', `Token ${id.substring(0, 8)}... revoked securely.`, 'success');
  };

  const filteredTokens = tokens.filter(t => 
    (t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterLast4 === '' || t.last4.includes(filterLast4)) &&
    (filterExp === '' || t.exp.includes(filterExp))
  );

  const toggleTokenSelection = (id: string) => {
    setSelectedTokens(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleAllTokens = () => {
    if (selectedTokens.length === filteredTokens.length) {
      setSelectedTokens([]);
    } else {
      setSelectedTokens(filteredTokens.map(t => t.id));
    }
  };

  const vaultQuickActions: QuickActionOption[] = [
    {
      id: 'export',
      label: 'Exportar Lista',
      shortcut: 'E',
      icon: <Download className="h-4 w-4" />,
      variant: 'primary',
      onClick: () => {
        addToast('Exportação', `${selectedTokens.length} tokens exportados em formato encriptado.`, 'success');
        addAuditLog({
          actor: { name: 'Admin User', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
          action: 'PCI_TOKENS_BULK_EXPORT',
          category: 'pci_vault',
          resourceType: 'PciTokenList',
          resourceId: 'multiple',
          status: 'success',
          severity: 'high',
          details: { count: selectedTokens.length, ids: selectedTokens }
        });
        setSelectedTokens([]);
      }
    },
    {
      id: 'revoke',
      label: 'Revogar Selecionados',
      shortcut: 'R',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger',
      warningNote: 'Revogação irreversível.',
      onClick: () => {
        setTokens(tokens.map(t => selectedTokens.includes(t.id) ? { ...t, status: 'revoked' } : t));
        addToast('Revogação em Massa', `${selectedTokens.length} tokens revogados com sucesso.`, 'success');
        addAuditLog({
          actor: { name: 'Admin User', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
          action: 'PCI_TOKENS_BULK_REVOKE',
          category: 'pci_vault',
          resourceType: 'PciTokenList',
          resourceId: 'multiple',
          status: 'success',
          severity: 'critical',
          details: { count: selectedTokens.length, ids: selectedTokens }
        });
        setSelectedTokens([]);
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">PCI-DSS Token Vault</h2>
              <p className="text-sm text-slate-500">Advanced secure management and revocation of tokenized payment methods.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Ingestão em Lote (CSV)</span>
            </button>
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {isMasked ? 'Reveal Tokens' : 'Mask Tokens'}
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Customer ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors w-full sm:w-auto ${showFilters ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl dark:bg-slate-800 w-full sm:w-auto">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              PCI Level 1
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter by Last 4 Digits</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="e.g. 4242"
                  value={filterLast4}
                  onChange={(e) => setFilterLast4(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter by Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  value={filterExp}
                  onChange={(e) => setFilterExp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={filteredTokens.length > 0 && selectedTokens.length === filteredTokens.length}
                    onChange={toggleAllTokens}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Token ID</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Card Data</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTokens.map((token) => (
                <tr key={token.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTokens.includes(token.id)}
                      onChange={() => toggleTokenSelection(token.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Key className="h-3 w-3" />
                    {isMasked ? `tok_••••••••••••••••${token.id.slice(-4)}` : token.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{token.customer}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 dark:bg-slate-800 dark:text-slate-300">{token.brand}</span>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">•••• {token.last4}</span>
                      <span className="text-[10px] text-slate-400">{token.exp}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{token.created}</td>
                  <td className="px-4 py-3">
                    {token.status === 'active' ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {token.status === 'active' ? (
                      <button 
                        onClick={() => handleRevoke(token.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-900/20"
                        title="Revoke Token"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="p-1.5 inline-block text-slate-300 dark:text-slate-600 cursor-not-allowed">
                        <Trash2 className="h-4 w-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
          <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            NerCash stores sensitive card data in strict compliance with <strong>PCI-DSS Level 1</strong>.
            Once revoked, a payment token cannot be reactivated or used for new transactions, 
            and the underlying PAN data is irreversibly blocked.
          </p>
        </div>
      </div>
      
      <FloatingQuickActionsBar
        selectedCount={selectedTokens.length}
        entityLabel="tokens"
        onClearSelection={() => setSelectedTokens([])}
        actions={vaultQuickActions}
      />

      <BatchTokenIngestionModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
      />
    </div>
  );
};
