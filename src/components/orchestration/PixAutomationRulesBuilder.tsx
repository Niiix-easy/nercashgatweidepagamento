import React, { useState } from 'react';
import { Workflow, Play, Plus, Save, Clock, RefreshCcw, ShieldAlert, Smartphone, ArrowRight } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const PixAutomationRulesBuilder: React.FC = () => {
  const { addToast } = usePayment();
  const [isSaving, setIsSaving] = useState(false);
  
  const [rules, setRules] = useState([
    {
      id: 'pix-rule-1',
      name: 'Pix Auto-Refund (Reconciliation Timeout)',
      trigger: 'pix_payment_received',
      condition: 'reconciliation_status == "unmatched" && time_elapsed > 300', // 5 minutes (300s)
      action: 'auto_refund',
      active: true
    },
    {
      id: 'pix-rule-2',
      name: 'Pix Fraud Hold',
      trigger: 'pix_payment_received',
      condition: 'risk_score > 85',
      action: 'manual_review',
      active: false
    }
  ]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Pix Automation Engine', 'Low-code rules updated and deployed successfully.', 'success');
    }, 800);
  };

  const toggleRule = (idx: number) => {
    const newRules = [...rules];
    newRules[idx].active = !newRules[idx].active;
    setRules(newRules);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pix Automation Rules</h2>
            <p className="text-sm text-slate-500">Visual low-code workflows for instant payment reconciliation & auto-refunds.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Deploying...' : 'Deploy Workflows'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rules.map((rule, idx) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${rule.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <Workflow className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{rule.name}</h3>
              </div>
              <button
                onClick={() => toggleRule(idx)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  rule.active ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    rule.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-stretch gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 dark:bg-slate-950 dark:border-slate-800">
              {/* Trigger Node */}
              <div className="flex-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Trigger Event</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Play className="h-4 w-4 text-indigo-500" />
                  {rule.trigger}
                </div>
              </div>
              
              <div className="flex items-center justify-center px-2">
                <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Condition Node */}
              <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">Condition</span>
                <div className="flex items-center gap-2 text-sm font-mono text-amber-700 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  {rule.condition}
                </div>
              </div>

              <div className="flex items-center justify-center px-2">
                <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-600 rotate-90 md:rotate-0" />
              </div>

              {/* Action Node */}
              <div className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">Action</span>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  <RefreshCcw className="h-4 w-4" />
                  {rule.action.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-4 text-sm font-semibold text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 transition-all dark:border-slate-800 dark:bg-slate-900/20 dark:hover:border-teal-500/30 dark:hover:bg-teal-900/20 dark:hover:text-teal-400">
          <Plus className="h-4 w-4" />
          Create Pix Automation Rule
        </button>
      </div>
    </div>
  );
};
