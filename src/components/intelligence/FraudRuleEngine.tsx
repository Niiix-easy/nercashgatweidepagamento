import React, { useState } from 'react';
import { ShieldAlert, Plus, Trash2, CheckCircle2, Server, Save } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const FraudRuleEngine: React.FC = () => {
  const { addToast } = usePayment();
  const [rules, setRules] = useState([
    { id: 'rule_1', condition: 'amount', operator: '>', value: '5000', action: 'block', active: true },
    { id: 'rule_2', condition: 'country', operator: '!=', value: 'BR', action: 'review', active: true },
    { id: 'rule_3', condition: 'daily_failures', operator: '>=', value: '3', action: 'block', active: true }
  ]);

  const addRule = () => {
    setRules([...rules, { id: `rule_${Date.now()}`, condition: 'amount', operator: '>', value: '', action: 'block', active: true }]);
  };

  const updateRule = (id: string, field: string, value: any) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const saveRules = () => {
    addToast('Fraud Engine', 'Regras de bloqueio atualizadas com sucesso.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fraud Rule Engine</h3>
              <p className="text-xs text-slate-500">Low-code UI para definição de critérios de bloqueio e revisão manual.</p>
            </div>
          </div>
          <button 
            onClick={saveRules}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            <Save className="h-4 w-4" />
            Salvar Regras
          </button>
        </div>

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2 mr-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {index + 1}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">SE</span>
              </div>
              
              <select 
                value={rule.condition}
                onChange={(e) => updateRule(rule.id, 'condition', e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="amount">Valor da Transação</option>
                <option value="country">País do Cartão</option>
                <option value="daily_failures">Falhas Diárias por CPF</option>
                <option value="email_domain">Domínio do Email</option>
              </select>

              <select 
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value=">">Maior que</option>
                <option value="<">Menor que</option>
                <option value=">=">Maior ou igual a</option>
                <option value="==">Igual a</option>
                <option value="!=">Diferente de</option>
                <option value="contains">Contém</option>
              </select>

              <input 
                type="text" 
                value={rule.value}
                onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                placeholder="Valor..."
                className="w-32 flex-1 min-w-[120px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />

              <div className="flex items-center gap-2 mx-2">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ENTÃO</span>
              </div>

              <select 
                value={rule.action}
                onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-bold outline-none ${
                  rule.action === 'block' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/30 dark:text-rose-400' :
                  rule.action === 'review' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-400' :
                  'border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-white'
                }`}
              >
                <option value="block">Bloquear (Hard Decline)</option>
                <option value="review">Enviar para Revisão Manual</option>
                <option value="3ds">Forçar 3DS</option>
              </select>

              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={() => updateRule(rule.id, 'active', !rule.active)}
                  className={`flex h-8 w-12 items-center rounded-full p-1 transition-colors ${rule.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${rule.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </button>
                <button 
                  onClick={() => removeRule(rule.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:hover:bg-rose-900/20"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={addRule}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-sm font-bold text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Nova Regra
          </button>
        </div>
      </div>
    </div>
  );
};
