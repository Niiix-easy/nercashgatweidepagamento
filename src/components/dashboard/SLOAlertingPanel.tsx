import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, Sliders, Server, Zap, CheckCircle2, AlertTriangle, Radio, Send, Volume2 } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';
import { PerformanceMonitor, SLOConfig } from '../../services/performanceMonitor';

interface ProviderSLO {
  id: string;
  name: string;
  p99Threshold: number;
  currentP99: number;
  p95Threshold: number;
  p50Threshold: number;
  enabled: boolean;
  channel: 'slack' | 'webhook' | 'pagerduty';
}

export const SLOAlertingPanel: React.FC = () => {
  const { addToast } = usePayment();
  const [providers, setProviders] = useState<ProviderSLO[]>([
    {
      id: 'asaas',
      name: 'Asaas SPI v3',
      p99Threshold: 300,
      currentP99: 215,
      p95Threshold: 220,
      p50Threshold: 90,
      enabled: true,
      channel: 'slack'
    },
    {
      id: 'iugu',
      name: 'Iugu Core Engine',
      p99Threshold: 400,
      currentP99: 432, // Breach!
      p95Threshold: 310,
      p50Threshold: 140,
      enabled: true,
      channel: 'pagerduty'
    },
    {
      id: 'juno',
      name: 'Juno / Direct Billing',
      p99Threshold: 350,
      currentP99: 180,
      p95Threshold: 240,
      p50Threshold: 95,
      enabled: true,
      channel: 'webhook'
    },
    {
      id: 'stone',
      name: 'Stone Direct Vault',
      p99Threshold: 250,
      currentP99: 195,
      p95Threshold: 180,
      p50Threshold: 65,
      enabled: true,
      channel: 'slack'
    }
  ]);

  // Sync configs to PerformanceMonitor service and subscribe to breaches
  useEffect(() => {
    providers.forEach(p => {
      PerformanceMonitor.updateConfig({
        providerId: p.id,
        p99Threshold: p.p99Threshold,
        p95Threshold: p.p95Threshold,
        p50Threshold: p.p50Threshold,
        enabled: p.enabled,
        channel: p.channel
      });
    });

    const unsubscribe = PerformanceMonitor.onBreach((providerId, metric, config) => {
      addToast(
        `🚨 Violação de SLO Detectada [${config.channel.toUpperCase()}]`,
        `Latência P99 de ${metric.name} atingiu ${metric.p99}ms (Limite configurado: ${config.p99Threshold}ms). Notificação despachada.`,
        'error'
      );
    });

    return () => {
      unsubscribe();
    };
  }, [providers, addToast]);

  const handleThresholdChange = (id: string, newP99: number) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, p99Threshold: newP99 };
        PerformanceMonitor.updateConfig({
          providerId: updated.id,
          p99Threshold: updated.p99Threshold,
          p95Threshold: updated.p95Threshold,
          p50Threshold: updated.p50Threshold,
          enabled: updated.enabled,
          channel: updated.channel
        });
        return updated;
      }
      return p;
    }));
  };

  const handleToggle = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, enabled: !p.enabled };
        PerformanceMonitor.updateConfig({
          providerId: updated.id,
          p99Threshold: updated.p99Threshold,
          p95Threshold: updated.p95Threshold,
          p50Threshold: updated.p50Threshold,
          enabled: updated.enabled,
          channel: updated.channel
        });
        return updated;
      }
      return p;
    }));
  };

  const handleSave = () => {
    providers.forEach(p => {
      PerformanceMonitor.updateConfig({
        providerId: p.id,
        p99Threshold: p.p99Threshold,
        p95Threshold: p.p95Threshold,
        p50Threshold: p.p50Threshold,
        enabled: p.enabled,
        channel: p.channel
      });
    });
    addToast('SLO Alerting Atualizado', 'Limiares de latência P99 sincronizados com o PerformanceMonitor service em tempo real.', 'success');
  };

  const handleTestAlert = (provider: ProviderSLO) => {
    PerformanceMonitor.recordMetric({
      providerId: provider.id,
      name: provider.name,
      p99: provider.currentP99,
      p95: provider.p95Threshold,
      p50: provider.p50Threshold,
      timestamp: new Date().toISOString(),
      status: provider.currentP99 > provider.p99Threshold ? 'breached' : 'healthy'
    });

    if (provider.currentP99 <= provider.p99Threshold) {
      addToast(
        'Simulação de Alerta SLO',
        `[Canal: ${provider.channel.toUpperCase()}] Latência P99 de ${provider.name} está em ${provider.currentP99}ms (dentro do limite de ${provider.p99Threshold}ms).`,
        'info'
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SLO Alerting & Monitoramento de Latência P99</h3>
            <p className="text-xs text-slate-500">Defina limiares customizados de Service Level Objective para cada provedor bancário</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Radio className="h-3 w-3 animate-pulse" /> Telemetria Ativa
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => {
          const isBreached = p.currentP99 > p.p99Threshold;
          const isWarning = p.currentP99 > p.p99Threshold * 0.85 && !isBreached;

          return (
            <div 
              key={p.id} 
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                isBreached 
                  ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20' 
                  : isWarning 
                  ? 'border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20' 
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isBreached 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse' 
                      : isWarning
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                  }`}>
                    {isBreached ? '⚠️ SLO Violado' : isWarning ? '⚡ Alerta Próximo' : '✓ SLO Saudável'}
                  </span>
                  <input 
                    type="checkbox" 
                    checked={p.enabled}
                    onChange={() => handleToggle(p.id)}
                    className="h-4 w-4 rounded accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Latency Comparison Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">P99 Medido: <strong className={isBreached ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>{p.currentP99}ms</strong></span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">Limiar: {p.p99Threshold}ms</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBreached ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(100, (p.currentP99 / 800) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Slider for P99 threshold */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <Sliders className="h-3.5 w-3.5 text-slate-400" />
                  <input 
                    type="range" 
                    min="100" 
                    max="800" 
                    step="25"
                    value={p.p99Threshold}
                    onChange={(e) => handleThresholdChange(p.id, parseInt(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>
                <button 
                  onClick={() => handleTestAlert(p)}
                  className="flex items-center gap-1 rounded bg-slate-200 hover:bg-slate-300 px-2 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Testar Notificação de SLO"
                >
                  <Send className="h-3 w-3" /> Testar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          Notificações automáticas integradas via Webhook, Slack e PagerDuty caso 3 janelas consecutivas violem o SLO.
        </p>
        <button 
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm cursor-pointer"
        >
          <CheckCircle2 className="h-4 w-4" />
          Salvar Configurações de SLO
        </button>
      </div>
    </div>
  );
};

