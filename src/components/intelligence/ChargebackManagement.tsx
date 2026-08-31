import React, { useState } from 'react';
import { RotateCcw, UploadCloud, FileText, CheckCircle2, XCircle, Search, AlertTriangle, Clock, Download, Check } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { FloatingQuickActionsBar, QuickActionOption } from '../common/FloatingQuickActionsBar';

export const ChargebackManagement: React.FC = () => {
  const { addToast, addAuditLog } = usePayment();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChargebacks, setSelectedChargebacks] = useState<string[]>([]);
  
  const [chargebacks, setChargebacks] = useState([
    { id: 'cb_129XyZ2', amount: 1450.00, customer: 'joao.silva@email.com', date: '2026-08-29', status: 'needs_response', reason: 'Fraude reportada', deadline: '2026-09-05' },
    { id: 'cb_9K2WqA4', amount: 299.90, customer: 'maria.santos@email.com', date: '2026-08-25', status: 'under_review', reason: 'Produto não recebido', deadline: '2026-09-01' },
    { id: 'cb_3L7YhB1', amount: 85.00, customer: 'carlos.sousa@email.com', date: '2026-08-20', status: 'won', reason: 'Fraude reportada', deadline: '-' },
    { id: 'cb_8H1MkL9', amount: 450.00, customer: 'ana.pereira@email.com', date: '2026-08-18', status: 'lost', reason: 'Desacordo comercial', deadline: '-' },
  ]);

  const handleUploadEvidence = (id: string) => {
    // Simulate file upload
    setTimeout(() => {
      setChargebacks(chargebacks.map(c => c.id === id ? { ...c, status: 'under_review' } : c));
      addToast('Defesa de Chargeback', `Documentação enviada para a contestação ${id}`, 'success');
    }, 800);
  };

  const filteredChargebacks = chargebacks.filter(c => 
    c.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedChargebacks(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedChargebacks.length === filteredChargebacks.length) {
      setSelectedChargebacks([]);
    } else {
      setSelectedChargebacks(filteredChargebacks.map(c => c.id));
    }
  };

  const bulkActions: QuickActionOption[] = [
    {
      id: 'accept',
      label: 'Aceitar Estorno',
      shortcut: 'A',
      icon: <Check className="h-4 w-4" />,
      variant: 'danger',
      onClick: () => {
        setChargebacks(chargebacks.map(c => selectedChargebacks.includes(c.id) ? { ...c, status: 'lost' } : c));
        addToast('Ação em Lote', `${selectedChargebacks.length} disputas aceitas (estorno realizado).`, 'success');
        addAuditLog({
          actor: { name: 'Admin User', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
          action: 'CHARGEBACK_BULK_ACCEPTED',
          category: 'payment',
          resourceType: 'ChargebackList',
          resourceId: 'multiple',
          status: 'success',
          severity: 'high',
          details: { count: selectedChargebacks.length, ids: selectedChargebacks }
        });
        setSelectedChargebacks([]);
      }
    },
    {
      id: 'challenge',
      label: 'Contestar (Auto-Defesa)',
      shortcut: 'C',
      icon: <UploadCloud className="h-4 w-4" />,
      variant: 'primary',
      onClick: () => {
        setChargebacks(chargebacks.map(c => selectedChargebacks.includes(c.id) ? { ...c, status: 'under_review' } : c));
        addToast('Ação em Lote', `Defesa automática submetida para ${selectedChargebacks.length} disputas.`, 'success');
        addAuditLog({
          actor: { name: 'Admin User', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
          action: 'CHARGEBACK_BULK_CHALLENGED',
          category: 'payment',
          resourceType: 'ChargebackList',
          resourceId: 'multiple',
          status: 'success',
          severity: 'medium',
          details: { count: selectedChargebacks.length, ids: selectedChargebacks }
        });
        setSelectedChargebacks([]);
      }
    },
    {
      id: 'export',
      label: 'Exportar Detalhes',
      shortcut: 'E',
      icon: <Download className="h-4 w-4" />,
      variant: 'default',
      onClick: () => {
        addToast('Exportação', `Detalhes de ${selectedChargebacks.length} disputas exportados.`, 'success');
        addAuditLog({
          actor: { name: 'Admin User', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
          action: 'CHARGEBACK_BULK_EXPORTED',
          category: 'export',
          resourceType: 'ChargebackList',
          resourceId: 'multiple',
          status: 'success',
          severity: 'medium',
          details: { count: selectedChargebacks.length, ids: selectedChargebacks }
        });
        setSelectedChargebacks([]);
      }
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chargeback Management</h2>
            <p className="text-sm text-slate-500">Gestão e defesa centralizada de disputas e estornos via API dos provedores.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Ações Pendentes</span>
          <span className="text-2xl font-bold text-rose-600">1</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Em Análise</span>
          <span className="text-2xl font-bold text-amber-600">1</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Taxa de Vitória (30d)</span>
          <span className="text-2xl font-bold text-emerald-600">68%</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Valor em Risco</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">R$ 1.749,90</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            Disputas Recentes
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ID ou Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={filteredChargebacks.length > 0 && selectedChargebacks.length === filteredChargebacks.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </th>
                <th className="px-5 py-3 font-medium">ID Disputa</th>
                <th className="px-5 py-3 font-medium">Cliente / Valor</th>
                <th className="px-5 py-3 font-medium">Motivo</th>
                <th className="px-5 py-3 font-medium">Prazo Defesa</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Evidência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredChargebacks.map((cb) => (
                <tr key={cb.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedChargebacks.includes(cb.id)}
                      onChange={() => toggleSelection(cb.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] font-medium text-slate-900 dark:text-white">{cb.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">R$ {cb.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500">{cb.customer}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs">{cb.reason}</td>
                  <td className="px-5 py-3 text-xs flex items-center gap-1">
                    {cb.status === 'needs_response' && <Clock className="h-3 w-3 text-rose-500" />}
                    <span className={cb.status === 'needs_response' ? 'text-rose-600 font-bold dark:text-rose-400' : 'text-slate-400'}>{cb.deadline}</span>
                  </td>
                  <td className="px-5 py-3">
                    {cb.status === 'needs_response' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        <AlertTriangle className="h-3 w-3" /> Pendente
                      </span>
                    )}
                    {cb.status === 'under_review' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3" /> Em Análise
                      </span>
                    )}
                    {cb.status === 'won' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Ganho
                      </span>
                    )}
                    {cb.status === 'lost' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="h-3 w-3" /> Perdido
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {cb.status === 'needs_response' ? (
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <UploadCloud className="h-3 w-3" />
                        <span>Enviar Docs</span>
                        <input type="file" className="hidden" onChange={() => handleUploadEvidence(cb.id)} />
                      </label>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Enviado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <FloatingQuickActionsBar
        selectedCount={selectedChargebacks.length}
        entityLabel="disputas"
        onClearSelection={() => setSelectedChargebacks([])}
        actions={bulkActions}
      />
    </div>
  );
};
