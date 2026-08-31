import React, { useState } from 'react';
import { Activity, BellRing, Save, Mail, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const UptimeAlertingPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [latencyThreshold, setLatencyThreshold] = useState('800');
  const [errorThreshold, setErrorThreshold] = useState('5');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('Uptime Alerting', 'SLA thresholds and notification channels updated successfully.', 'success');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Uptime & SLA Alerting</h2>
            <p className="text-sm text-slate-500">Configure custom thresholds for provider latency and availability breaches.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SLA Thresholds */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <BellRing className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">SLA Breach Thresholds</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Latency Threshold (ms)</span>
                <span className="text-rose-500">{latencyThreshold}ms</span>
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(e.target.value)}
                className="w-full accent-rose-500"
              />
              <p className="text-[10px] text-slate-500">Alert triggers if API response exceeds this duration.</p>
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Error Rate Threshold (%)</span>
                <span className="text-rose-500">{errorThreshold}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={errorThreshold}
                onChange={(e) => setErrorThreshold(e.target.value)}
                className="w-full accent-rose-500"
              />
              <p className="text-[10px] text-slate-500">Alert triggers if 5xx/4xx error rate exceeds this percentage within 1 minute.</p>
            </div>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Notification Channels</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${emailAlerts ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Notifications</p>
                  <p className="text-[10px] text-slate-500">Send alerts to noc@nercash.com</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500" 
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${pushAlerts ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Push Notifications</p>
                  <p className="text-[10px] text-slate-500">Send alerts to registered mobile devices</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500" 
                checked={pushAlerts}
                onChange={(e) => setPushAlerts(e.target.checked)}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
