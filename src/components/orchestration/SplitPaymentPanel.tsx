import React, { useState } from 'react';
import { SplitSquareHorizontal, Plus, Save, Trash2, ArrowRight, DollarSign, Percent } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const SplitPaymentPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [isSaving, setIsSaving] = useState(false);
  
  const [splitRules, setSplitRules] = useState([
    { id: 'rule_1', name: 'Marketplace Padrão (Comissão Vendedor)', receiver: 'Seller_Acc_882', type: 'percentage', value: 85, isRemainder: false },
    { id: 'rule_2', name: 'Taxa de Plataforma', receiver: 'Platform_Acc_Main', type: 'percentage', value: 15, isRemainder: false },
    { id: 'rule_3', name: 'Custo Fixo Logística', receiver: 'Logistics_Acc_1', type: 'fixed', value: 12.50, isRemainder: false },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Split Payment', 'Regras de split atualizadas com sucesso.', 'success');
    }, 800);
  };

  const addRule = () => {
    setSplitRules([...splitRules, { id: `rule_${Date.now()}`, name: 'Nova Regra', receiver: '', type: 'percentage', value: 0, isRemainder: false }]);
  };

  const removeRule = (id: string) => {
    setSplitRules(splitRules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, field: string, value: any) => {
    setSplitRules(splitRules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400">
            <SplitSquareHorizontal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Split Payment Engine</h2>
            <p className="text-sm text-slate-500">Configure a divisão de recebíveis (marketplace, comissionamento) direto na fonte.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Regras de Split'}
        </button>
      </div>

      <div className="space-y-4">
        {splitRules.map((rule, idx) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 w-full">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                  className="font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 dark:text-white w-full"
                  placeholder="Nome da Regra de Split"
                />
              </div>
              <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-rose-500 shrink-0 ml-4">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Conta Recebedora (Sub-Merchant)</label>
                <input
                  type="text"
                  value={rule.receiver}
                  onChange={(e) => updateRule(rule.id, 'receiver', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="ID da Conta Recebedora"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo de Split</label>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button 
                    onClick={() => updateRule(rule.id, 'type', 'percentage')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-semibold ${rule.type === 'percentage' ? 'bg-white shadow-sm text-sky-600 dark:bg-slate-700 dark:text-sky-400' : 'text-slate-500'}`}
                  >
                    <Percent className="h-3 w-3" /> %
                  </button>
                  <button 
                    onClick={() => updateRule(rule.id, 'type', 'fixed')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-xs font-semibold ${rule.type === 'fixed' ? 'bg-white shadow-sm text-sky-600 dark:bg-slate-700 dark:text-sky-400' : 'text-slate-500'}`}
                  >
                    <DollarSign className="h-3 w-3" /> Fixo
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {rule.type === 'fixed' ? 'R$' : ''}
                  </span>
                  <input
                    type="number"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, 'value', parseFloat(e.target.value))}
                    className={`w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white ${rule.type === 'fixed' ? 'pl-8' : 'pr-8'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    {rule.type === 'percentage' ? '%' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button onClick={addRule} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-4 text-sm font-semibold text-slate-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 transition-all dark:border-slate-800 dark:bg-slate-900/20 dark:hover:border-sky-500/30 dark:hover:bg-sky-900/20 dark:hover:text-sky-400">
          <Plus className="h-4 w-4" />
          Adicionar Regra de Comissionamento
        </button>
      </div>
    </div>
  );
};
