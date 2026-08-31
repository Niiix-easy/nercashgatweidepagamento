import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  LayoutDashboard, 
  Cpu, 
  ShoppingCart, 
  Workflow, 
  Code2, 
  Palette, 
  ShieldAlert,
  Server,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Gift,
  Bot,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentTenant } = usePayment();
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(300); // 5 minutes inactivity timer countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSecondsLeft(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = Math.max(0, Math.min(100, (sessionSecondsLeft / 300) * 100));
  const isCritical = sessionSecondsLeft <= 45;

  const menuItems = [
    {
      id: 'overview',
      label: 'Visão Geral & Métricas',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'orchestration',
      label: 'Orchestration & Risco',
      icon: Cpu,
      badge: 'ML Core',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
    },
    {
      id: 'checkout',
      label: 'Super Checkout',
      icon: ShoppingCart,
      badge: 'Adaptativo',
      badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
    },
    {
      id: 'crm',
      label: 'CRM & Automação',
      icon: Workflow,
      badge: 'Low-Code',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
    },
    {
      id: 'api',
      label: 'Open API & Sandbox',
      icon: Code2,
      badge: 'REST v1',
      badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
    },
    {
      id: 'webhooks',
      label: 'Webhook Debugger',
      icon: TrendingUp,
      badge: 'Replay',
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
    },
    {
      id: 'gateway',
      label: 'Gateway Settings',
      icon: Server,
      badge: 'BaaS Core',
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
    },
    {
      id: 'throughput',
      label: 'Throughput Monitor',
      icon: Cpu,
      badge: 'Rate Limits',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
    },
    {
      id: 'cashback',
      label: 'Cashback & Metas',
      icon: Gift,
      badge: 'Admin Metas',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'whitelabel',
      label: 'White Label & Hub',
      icon: Palette,
      badge: 'Multi-tenant',
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
    },
    {
      id: 'compliance',
      label: 'Compliance & Vault',
      icon: ShieldAlert,
      badge: 'LGPD/PCI',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    },
    {
      id: 'intelligence',
      label: 'NerCash Intelligence',
      icon: Sparkles,
      badge: 'Core',
      badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
    }
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      {/* Navigation section */}
      <div className="mb-6">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Módulos da Plataforma
        </p>
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800 dark:text-white dark:ring-slate-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-colors ${
                    isActive 
                      ? 'text-indigo-600 dark:text-indigo-400' 
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  }`} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Architecture Spec Card in Sidebar */}
      <div className="mt-auto space-y-2">
        {/* Portal do Titular LGPD Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-lgpd-portal'))}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50/80 p-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Portal do Titular LGPD</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Assistência AI Copilot Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-user-assistance'))}
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-white animate-pulse" />
            <span>Assistência AI Copilot</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Module Orientation Guide Trigger */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-module-tutorial'))}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 p-2.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Tutorial deste Módulo</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Session Health Progress Bar */}
        <div className={`rounded-xl border p-3 shadow-sm transition-all ${
          isCritical 
            ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 animate-pulse' 
            : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-800/80'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-bold ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {isCritical ? '⚠️ Sessão Expirando!' : 'Saúde da Sessão'}
            </span>
            <span className={`text-[10px] font-mono font-bold ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
              {Math.floor(sessionSecondsLeft / 60)}:{String(sessionSecondsLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
            <div 
              className={`h-full transition-all duration-1000 ${
                isCritical ? 'bg-rose-600 animate-pulse' : progressPercent < 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">
            {isCritical ? 'Inatividade prolongada detectada. Toque para manter.' : 'Temporizador de inatividade Zero-Trust'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Decision Core
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Orquestrador ativo com fallback inteligente e modelo XGBoost de antifraude em tempo real.
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
            <span>Latência Média:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">~210ms</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
