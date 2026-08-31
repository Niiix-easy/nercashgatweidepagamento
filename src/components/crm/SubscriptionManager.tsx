import React, { useState } from 'react';
import { CalendarDays, Play, Pause, XCircle, Search, RefreshCcw, MoreHorizontal, FileText, Activity } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const SubscriptionManager: React.FC = () => {
  const { addToast } = usePayment();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub_91F8z2', customer: 'Netflix BR', plan: 'Premium 4K', amount: 55.90, status: 'active', nextBilling: '2026-09-10', cycle: 'monthly' },
    { id: 'sub_X72Lq4', customer: 'Spotify Pessoal', plan: 'Individual', amount: 21.90, status: 'active', nextBilling: '2026-09-02', cycle: 'monthly' },
    { id: 'sub_M34Kp9', customer: 'Gympass', plan: 'Silver', amount: 129.90, status: 'paused', nextBilling: '-', cycle: 'monthly' },
    { id: 'sub_R11Bc7', customer: 'Adobe Creative Cloud', plan: 'All Apps', amount: 224.00, status: 'past_due', nextBilling: '2026-08-28', cycle: 'monthly' },
  ]);

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status: newStatus } : s));
    addToast('Subscription Management', `Assinatura ${newStatus === 'active' ? 'retomada' : 'pausada'} com sucesso.`, 'success');
  };

  const filteredSubs = subscriptions.filter(s => 
    s.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subscription & Recurring Billing</h2>
            <p className="text-sm text-slate-500">Gestão de assinaturas, ciclos de faturamento e dunning.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">MRR Ativo</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">R$ 14.5K</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Assinaturas Ativas</span>
          <span className="text-2xl font-bold text-emerald-600">342</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Inadimplência (Dunning)</span>
          <span className="text-2xl font-bold text-rose-600">4.2%</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Churn Mensal</span>
          <span className="text-2xl font-bold text-amber-600">1.8%</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            Active Billing Cycles
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar cliente ou plano..."
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
                <th className="px-5 py-3 font-medium">ID Assinatura</th>
                <th className="px-5 py-3 font-medium">Cliente & Plano</th>
                <th className="px-5 py-3 font-medium">Valor / Ciclo</th>
                <th className="px-5 py-3 font-medium">Próxima Cobrança</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSubs.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-[11px] font-medium text-slate-500">{sub.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{sub.customer}</span>
                      <span className="text-[10px] text-slate-500">{sub.plan}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">R$ {sub.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{sub.cycle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{sub.nextBilling}</span>
                  </td>
                  <td className="px-5 py-3">
                    {sub.status === 'active' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Ativa
                      </span>
                    )}
                    {sub.status === 'paused' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        Pausada
                      </span>
                    )}
                    {sub.status === 'past_due' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                        Inadimplente
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(sub.id, sub.status)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                        title={sub.status === 'active' ? "Pausar" : "Retomar"}
                      >
                        {sub.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
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
