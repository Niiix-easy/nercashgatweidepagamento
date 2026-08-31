import React, { useState } from 'react';
import { Network, Activity, ArrowRight, Save, Plus, Trash2, Sliders } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const SmartRoutingDashboard: React.FC = () => {
  const { acquirers, addToast } = usePayment();
  const [rules, setRules] = useState([
    { id: 'rule-1', name: 'High Success Rate Route', condition: 'amount > 1000', providers: ['stripe', 'adyen'], latencyThreshold: 500, minSuccessRate: 95 },
    { id: 'rule-2', name: 'Low Latency Fallback', condition: 'amount <= 1000', providers: ['cielo', 'stone'], latencyThreshold: 200, minSuccessRate: 85 }
  ]);
  
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [overrideProvider, setOverrideProvider] = useState('iugu');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Smart Routing', 'Cascading failover rules updated successfully.', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Smart Routing Engine</h2>
            <p className="text-sm text-slate-500">Configure cascading failover rules based on latency and success rates.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Regras'}
        </button>
      </div>

      {/* Manual Override Panel */}
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm dark:border-rose-950 dark:bg-rose-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Manual Routing Override
            </h3>
            <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-1">
              Força todo o tráfego para um provedor específico. Ignora as regras de failover. Útil para incident response.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isManualOverride && (
              <select
                value={overrideProvider}
                onChange={(e) => setOverrideProvider(e.target.value)}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-bold text-rose-900 shadow-sm outline-none dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
              >
                <option value="iugu">Iugu</option>
                <option value="juno">Juno</option>
                <option value="asaas">Asaas</option>
                <option value="stripe">Stripe</option>
                <option value="adyen">Adyen</option>
              </select>
            )}
            <button
              onClick={() => setIsManualOverride(!isManualOverride)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isManualOverride ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isManualOverride ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className={`space-y-4 ${isManualOverride ? 'opacity-50 pointer-events-none' : ''}`}>
        {rules.map((rule, idx) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[idx].name = e.target.value;
                    setRules(newRules);
                  }}
                  className="font-bold text-slate-900 bg-transparent border-none outline-none focus:ring-0 dark:text-white"
                />
              </div>
              <button className="text-slate-400 hover:text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Condição</label>
                <input
                  type="text"
                  value={rule.condition}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[idx].condition = e.target.value;
                    setRules(newRules);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cascata de Provedores</label>
                <div className="flex items-center gap-2">
                  {rule.providers.map((p, pIdx) => (
                    <React.Fragment key={pIdx}>
                      <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                        {acquirers.find(a => a.id === p)?.name || p}
                      </span>
                      {pIdx < rule.providers.length - 1 && <ArrowRight className="h-3 w-3 text-slate-400" />}
                    </React.Fragment>
                  ))}
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:border-slate-700 dark:hover:text-slate-300">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Constraints</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-500">Max Latency</span>
                    <span className="text-[10px] font-bold text-amber-600">{rule.latencyThreshold}ms</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-500">Min Success</span>
                    <span className="text-[10px] font-bold text-emerald-600">{rule.minSuccessRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-4 text-sm font-semibold text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all dark:border-slate-800 dark:bg-slate-900/20 dark:hover:border-indigo-500/30 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400">
          <Plus className="h-4 w-4" />
          Adicionar Nova Regra
        </button>
      </div>
    </div>
  );
};
