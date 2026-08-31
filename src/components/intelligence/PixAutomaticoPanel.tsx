import React, { useState } from 'react';
import { Zap, CalendarClock, CheckCircle2, History, RefreshCcw } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const PixAutomaticoPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [isSyncing, setIsSyncing] = useState(false);

  const schedules = [
    { id: 'sub-1', user: 'joao@example.com', amount: 49.90, nextCharge: '2026-09-01', status: 'active', lastStatus: 'paid' },
    { id: 'sub-2', user: 'maria@example.com', amount: 199.90, nextCharge: '2026-09-05', status: 'active', lastStatus: 'paid' },
    { id: 'sub-3', user: 'carlos@example.com', amount: 29.90, nextCharge: '2026-08-31', status: 'pending_auth', lastStatus: 'awaiting' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Pix Automático', 'Status de pagamentos SPI sincronizados.', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gestão de Pix Automático</h2>
            <p className="text-sm text-slate-500">Acompanhe cobranças recorrentes via SPI (Sistema de Pagamentos Instantâneos).</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Sincronizar SPI
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Mandatos Ativos</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">1,248</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Aprovação (30d)</span>
          <span className="text-2xl font-bold text-teal-600">98.5%</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">TPV Projetado</span>
          <span className="text-2xl font-bold text-slate-800 dark:text-white">R$ 142K</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Próximas Cobranças</h3>
          <CalendarClock className="h-4 w-4 text-slate-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 font-medium">Usuário</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Próximo Venc.</th>
                <th className="px-5 py-3 font-medium">Status Mandato</th>
                <th className="px-5 py-3 font-medium">Última Transação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{schedule.user}</td>
                  <td className="px-5 py-3">R$ {schedule.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">{schedule.nextCharge}</td>
                  <td className="px-5 py-3">
                    {schedule.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Aguardando Auth
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {schedule.lastStatus === 'paid' ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pago
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                        <History className="h-3.5 w-3.5" /> -
                      </span>
                    )}
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
