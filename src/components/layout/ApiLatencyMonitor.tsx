import React, { useState, useEffect, useRef } from 'react';
import { 
  Server, 
  Radio, 
  Cpu, 
  Globe2, 
  Lock, 
  ChevronDown, 
  ArrowRight, 
  AlertTriangle, 
  Bell, 
  BellRing, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  RotateCw,
  Sliders,
  Database
} from 'lucide-react';

interface ApiLatencyMonitorProps {
  onOpenProvidersModal: () => void;
}

export const ApiLatencyMonitor: React.FC<ApiLatencyMonitorProps> = ({ onOpenProvidersModal }) => {
  const [showStatusPopover, setShowStatusPopover] = useState<boolean>(false);
  const [currentLatency, setCurrentLatency] = useState<number>(22);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([18, 22, 19, 24, 20, 21, 23, 19, 22, 20, 25, 22]);
  const [consecutiveHighLatencyCount, setConsecutiveHighLatencyCount] = useState<number>(0);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [uptimeStat] = useState<number>(99.994);
  const [activeTps, setActiveTps] = useState<number>(1420);
  const [isSimulatingSpike, setIsSimulatingSpike] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const alertedCountRef = useRef<number>(0);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationStatus(perm);
        if (perm === 'granted') {
          setAlertFeedback('Permissão para notificações do navegador ativada com sucesso!');
          setTimeout(() => setAlertFeedback(null), 3500);
        }
      } catch (e) {
        console.error('Notification permission error:', e);
      }
    }
  };

  // Play audio chime when alert triggers
  const playWarningChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Ignored if browser policy blocks autoplay before interaction
    }
  };

  // Trigger Native Browser Notification
  const triggerBrowserNotification = (latencyMs: number) => {
    playWarningChime();
    setIsAlertActive(true);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification('⚠️ Alerta de Latência da API Nercash (>500ms)', {
            body: `O tempo de resposta da API Nercash ultrapassou 500ms por 3 requisições consecutivas (${latencyMs}ms). Mecanismo de failover sugerido.`,
            tag: 'nercash-high-latency-alert',
            icon: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=64&auto=format&fit=crop&q=80'
          });
          notif.onclick = () => {
            window.focus();
            setShowStatusPopover(true);
          };
        } catch (e) {
          console.warn('Native notification failed:', e);
        }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          setNotificationStatus(perm);
          if (perm === 'granted') {
            triggerBrowserNotification(latencyMs);
          }
        });
      }
    }

    setAlertFeedback(`🚨 Alerta Disparado: 3 requisições consecutivas acima de 500ms (${latencyMs}ms)! Notificação enviada.`);
  };

  // Process latency step & check >= 3 consecutive threshold
  const processLatencyTick = (newLatency: number) => {
    setCurrentLatency(newLatency);
    setLatencyHistory(prev => [...prev.slice(-14), newLatency]);

    if (newLatency > 500) {
      setConsecutiveHighLatencyCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
          triggerBrowserNotification(newLatency);
        }
        return next;
      });
    } else {
      setConsecutiveHighLatencyCount(0);
      if (isAlertActive && !isSimulatingSpike) {
        setIsAlertActive(false);
      }
    }
  };

  // Regular periodic healthy telemetry ping
  useEffect(() => {
    if (isSimulatingSpike) return;

    const interval = setInterval(() => {
      const normalLatency = 16 + Math.floor(Math.random() * 8);
      processLatencyTick(normalLatency);
      setActiveTps(1380 + Math.floor(Math.random() * 80));
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingSpike, isAlertActive]);

  // Interactive Test: Simulate 3x Consecutive Spike (>500ms)
  const handleSimulateConsecutiveSpikes = () => {
    setIsSimulatingSpike(true);
    setAlertFeedback('Iniciando simulação de 3 requisições com latência severa (>500ms)...');

    // Step 1: 540ms
    setTimeout(() => {
      processLatencyTick(540);
    }, 400);

    // Step 2: 610ms
    setTimeout(() => {
      processLatencyTick(610);
    }, 1200);

    // Step 3: 585ms -> Triggers 3rd consecutive alert
    setTimeout(() => {
      processLatencyTick(585);
      setIsSimulatingSpike(false);
    }, 2000);
  };

  // Reset to normal healthy latency
  const handleResetLatency = () => {
    setIsSimulatingSpike(false);
    setIsAlertActive(false);
    setConsecutiveHighLatencyCount(0);
    processLatencyTick(18);
    setAlertFeedback('Latência normalizada para 18ms. Métricas do gateway operacionais.');
    setTimeout(() => setAlertFeedback(null), 3000);
  };

  const isDegraded = currentLatency > 500 || consecutiveHighLatencyCount > 0 || isAlertActive;

  return (
    <div className="relative">
      {/* Trigger Button with Live Ping Indicator */}
      <button
        id="header-gateway-status-widget"
        type="button"
        onClick={() => setShowStatusPopover(!showStatusPopover)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
          isDegraded
            ? 'border-rose-300 bg-rose-50/90 text-rose-900 ring-2 ring-rose-400/40 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 animate-pulse'
            : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/60 text-slate-800 hover:border-emerald-400 dark:border-emerald-900/60 dark:from-emerald-950/40 dark:to-teal-950/30 dark:text-slate-200'
        }`}
        title="Monitor de Latência em Tempo Real e Notificações de SLA"
      >
        <span className="relative flex h-2 w-2">
          {isDegraded ? (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
            </>
          ) : (
            <>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </>
          )}
        </span>
        
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className={`font-bold ${isDegraded ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {uptimeStat}%
          </span>
          <span className="text-slate-400">•</span>
          <span className={`font-bold ${isDegraded ? 'text-rose-700 dark:text-rose-300 font-extrabold' : 'text-slate-600 dark:text-slate-300'}`}>
            {currentLatency}ms
          </span>
          {consecutiveHighLatencyCount > 0 && (
            <span className="rounded bg-rose-200 px-1 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-200">
              {consecutiveHighLatencyCount}/3 Picos
            </span>
          )}
          <span className="hidden text-slate-400 sm:inline">•</span>
          <span className="hidden text-indigo-600 dark:text-indigo-400 sm:inline">{activeTps} TPS</span>
        </div>

        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showStatusPopover ? 'rotate-180' : ''}`} />
      </button>

      {/* Latency & Gateway Microservices Popover */}
      {showStatusPopover && (
        <div className="absolute right-0 top-full mt-2 z-50 w-96 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-fade-in dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Telemetria de Latência da API Nercash
              </h4>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isDegraded 
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {isDegraded ? 'Degradação / Alerta' : 'Operacional SLA'}
            </span>
          </div>

          {/* Feedback message */}
          {alertFeedback && (
            <div className="mt-3 rounded-xl border border-amber-300/60 bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-200 animate-fade-in">
              {alertFeedback}
            </div>
          )}

          {/* Critical Alert Banner if consecutive spikes >= 3 */}
          {consecutiveHighLatencyCount >= 3 && (
            <div className="mt-3 rounded-xl border border-rose-400 bg-rose-50 p-3 text-xs text-rose-900 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-200 animate-pulse">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Alerta Crítico: Limite de 500ms Violado 3x!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Foram registradas 3 requisições consecutivas com tempo de resposta superior a 500ms. A notificação de navegador foi enviada.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Latency Histogram / Sparkline Bars */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Histórico Recente de Latência (15 requisições)
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                Atual: <strong className={currentLatency > 500 ? 'text-rose-600 font-extrabold' : 'text-emerald-600'}>{currentLatency}ms</strong>
              </span>
            </div>
            
            <div className="flex items-end gap-1 h-12 rounded-xl bg-slate-50 p-2 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              {latencyHistory.map((lat, idx) => {
                const heightPercent = Math.min(100, Math.max(15, (lat / 650) * 100));
                const isHigh = lat > 500;
                return (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-xs transition-all ${
                        isHigh ? 'bg-rose-500' : lat > 100 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-white shadow">
                      {lat}ms
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>0ms</span>
              <span className="text-amber-500">Alvo &lt;50ms</span>
              <span className="text-rose-500">Limite 500ms</span>
            </div>
          </div>

          {/* Browser Notification Permission Widget */}
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-indigo-50/70 p-2.5 text-xs dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Notificações do Navegador</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Status: {notificationStatus === 'granted' ? 'Ativada ✅' : notificationStatus === 'denied' ? 'Bloqueada ❌' : 'Pendente ⚠️'}
                </p>
              </div>
            </div>
            {notificationStatus !== 'granted' && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 transition-colors"
              >
                Permitir
              </button>
            )}
          </div>

          {/* Microservices Latency Breakdown */}
          <div className="mt-3.5 space-y-1.5 text-xs">
            <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Rotas & Microsserviços
            </h5>
            
            {/* Service 1: Ingress */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">API Ingress (SP GRU)</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {currentLatency > 500 ? `${Math.round(currentLatency * 0.4)}ms` : '18ms'}
              </span>
            </div>

            {/* Service 2: ML Engine */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">XGBoost ML Decision</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {currentLatency > 500 ? `${Math.round(currentLatency * 0.35)}ms` : '22ms'}
              </span>
            </div>

            {/* Service 3: Bacen Pix */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5 text-teal-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">SPI Bacen Pix Direto</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
                {currentLatency > 500 ? `${Math.round(currentLatency * 0.25)}ms` : '35ms'}
              </span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="mt-4 border-t border-slate-100 pt-3 space-y-2 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSimulatingSpike}
                onClick={handleSimulateConsecutiveSpikes}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-900/80 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Simular 3x Pico &gt;500ms</span>
              </button>

              <button
                type="button"
                onClick={handleResetLatency}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Normalizar telemetria"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Resetar</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span>SLA Contratual: 99.99%</span>
              <button
                type="button"
                onClick={() => {
                  setShowStatusPopover(false);
                  onOpenProvidersModal();
                }}
                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span>Histórico de Provedores</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
