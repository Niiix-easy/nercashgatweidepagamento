import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface BatchActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: 'reconcile' | 'fraud' | 'export';
  count: number;
}

export const BatchActionConfirmationModal: React.FC<BatchActionConfirmationModalProps> = ({ isOpen, onClose, onConfirm, actionType, count }) => {
  if (!isOpen) return null;

  const config = {
    reconcile: {
      title: 'Conciliar Transações em Lote',
      description: `Você está prestes a reconciliar ${count} transações. Esta ação marcará os registros como validados com o BaaS.`,
      confirmText: 'Confirmar Conciliação',
      icon: <ShieldAlert className="h-6 w-6 text-emerald-600" />
    },
    fraud: {
      title: 'Marcar como Fraude',
      description: `ATENÇÃO: Você está marcando ${count} transações como SUSPEITAS DE FRAUDE. Esta ação irá bloquear os pagamentos e adicionar clientes à blacklist imediatamente.`,
      confirmText: 'Confirmar Fraude',
      icon: <AlertTriangle className="h-6 w-6 text-rose-600" />
    },
    export: {
      title: 'Exportar Dados em Lote',
      description: `Você está prestes a exportar ${count} transações para o seu computador em formato CSV seguro.`,
      confirmText: 'Confirmar Exportação',
      icon: <ShieldAlert className="h-6 w-6 text-indigo-600" />
    }
  };

  const c = config[actionType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            {c.icon}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed dark:text-slate-400">
          {c.description}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm ${
              actionType === 'fraud' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {c.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
