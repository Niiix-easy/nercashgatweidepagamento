import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { crossTabBus } from '../../services/crossTabBus';
import { 
  Server, 
  Zap, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  RotateCcw, 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Download, 
  FileSpreadsheet, 
  Flame, 
  Radio, 
  Layers, 
  RefreshCw,
  Terminal,
  Gauge
} from 'lucide-react';

export interface WebhookWorker {
  id: string;
  name: string;
  type: 'core' | 'autoscaled_spike' | 'manual';
  zone: string;
  status: 'running' | 'scaling_up' | 'cooldown' | 'draining' | 'stopped';
  cpuPercent: number;
  memoryMb: number;
  currentRps: number;
  handledTotal: number;
  startedAt: string;
  uptimeSeconds: number;
}

export interface ScalingEventLog {
  id: string;
  timestamp: string;
  trigger: 'ANOMALY_SPIKE_DETECTED' | 'MANUAL_OVERRIDE' | 'QUEUE_THRESHOLD_EXCEEDED' | 'COOLDOWN_SCALE_DOWN' | 'HEALTH_HEAL';
  source: string;
  anomalyScore: number;
  workersBefore: number;
  workersAfter: number;
  rpsBefore: number;
  rpsPeak: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REJECTED';
  details: string;
}

export const OrchestrationAutoScaler: React.FC = () => {
  const { addToast } = usePayment();

  // Auto-Scaler Policy Configuration
  const [scaleMode, setScaleMode] = useState<'adaptive_ml' | 'aggressive' | 'cost_optimized' | 'manual'>('adaptive_ml');
  const [minWorkers, setMinWorkers] = useState<number>(3);
  const [maxWorkers, setMaxWorkers] = useState<number>(20);
  const [targetConcurrencyPerWorker, setTargetConcurrencyPerWorker] = useState<number>(180); // req/s per worker
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(65); // Trigger scale-up when anomaly score > 65%
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(30);
  const [isAutoScalingEnabled, setIsAutoScalingEnabled] = useState<boolean>(true);

  // Real-time Traffic Telemetry
  const [currentRps, setCurrentRps] = useState<number>(380);
  const [queueDepth, setQueueDepth] = useState<number>(24);
  const [processingLatencyMs, setProcessingLatencyMs] = useState<number>(14);
  const [anomalyScore, setAnomalyScore] = useState<number>(18);
  const [isSpikeActive, setIsSpikeActive] = useState<boolean>(false);
  const [spikeReason, setSpikeReason] = useState<string>('Tráfego Orgânico Estável');

  // Worker Fleet State
  const [workers, setWorkers] = useState<WebhookWorker[]>([
    {
      id: 'worker-core-01',
      name: 'Ingress-Worker-01 (Master)',
      type: 'core',
      zone: 'sa-east-1a (São Paulo)',
      status: 'running',
      cpuPercent: 32,
      memoryMb: 148,
      currentRps: 130,
      handledTotal: 184500,
      startedAt: '12h atrás',
      uptimeSeconds: 43200
    },
    {
      id: 'worker-core-02',
      name: 'Ingress-Worker-02 (Core)',
      type: 'core',
      zone: 'sa-east-1b (São Paulo)',
      status: 'running',
      cpuPercent: 28,
      memoryMb: 142,
      currentRps: 125,
      handledTotal: 179200,
      startedAt: '12h atrás',
      uptimeSeconds: 43200
    },
    {
      id: 'worker-core-03',
      name: 'Ingress-Worker-03 (Core)',
      type: 'core',
      zone: 'us-east-1a (Virginia Edge)',
      status: 'running',
      cpuPercent: 30,
      memoryMb: 136,
      currentRps: 125,
      handledTotal: 168400,
      startedAt: '12h atrás',
      uptimeSeconds: 43200
    }
  ]);

  // Scaling Audit Event Logs
  const [scalingLogs, setScalingLogs] = useState<ScalingEventLog[]>([
    {
      id: 'scale_evt_101',
      timestamp: 'Hoje, 10:14:22',
      trigger: 'ANOMALY_SPIKE_DETECTED',
      source: 'IntelligenceHub / XGBoost Anomaly Monitor',
      anomalyScore: 84,
      workersBefore: 3,
      workersAfter: 7,
      rpsBefore: 420,
      rpsPeak: 2450,
      status: 'COMPLETED',
      details: 'Spike massivo detectado em webhooks Pix (SPI). +4 workers provisionados em 380ms.'
    },
    {
      id: 'scale_evt_102',
      timestamp: 'Hoje, 10:22:45',
      trigger: 'COOLDOWN_SCALE_DOWN',
      source: 'AutoScaler Cooldown Daemon',
      anomalyScore: 19,
      workersBefore: 7,
      workersAfter: 3,
      rpsBefore: 2450,
      rpsPeak: 380,
      status: 'COMPLETED',
      details: 'Tráfego normalizado. Drenagem de 4 workers dinâmicos concluída sem perda de mensagens.'
    }
  ]);

  // Historical Telemetry Sparkline points
  const [telemetryHistory, setTelemetryHistory] = useState<Array<{ rps: number; capacity: number; anomaly: number; timestamp: string }>>([
    { rps: 340, capacity: 540, anomaly: 12, timestamp: '11:40' },
    { rps: 380, capacity: 540, anomaly: 15, timestamp: '11:42' },
    { rps: 410, capacity: 540, anomaly: 18, timestamp: '11:44' },
    { rps: 390, capacity: 540, anomaly: 14, timestamp: '11:46' },
    { rps: 420, capacity: 540, anomaly: 22, timestamp: '11:48' },
    { rps: 380, capacity: 540, anomaly: 18, timestamp: '11:50' }
  ]);

  // Derived Cluster Capacity
  const activeWorkersCount = workers.filter(w => w.status === 'running' || w.status === 'scaling_up').length;
  const totalClusterCapacityRps = activeWorkersCount * targetConcurrencyPerWorker;
  const clusterUtilizationPercent = Math.min(100, Math.round((currentRps / Math.max(1, totalClusterCapacityRps)) * 100));

  // Listen to CrossTab Events or Anomaly Detectors
  useEffect(() => {
    const unsubscribe = crossTabBus.subscribe('ANOMALY_SPIKE_DETECTED', (payload: any) => {
      if (isAutoScalingEnabled) {
        triggerAutoScalingFromAnomaly(payload?.score || 85, payload?.reason || 'Spike reportado pelo IntelligenceHub');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAutoScalingEnabled, activeWorkersCount, maxWorkers, targetConcurrencyPerWorker]);

  // Real-time jitter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        if (w.status !== 'running') return w;
        const jitterCpu = Math.min(98, Math.max(10, w.cpuPercent + Math.round((Math.random() - 0.5) * 8)));
        const jitterRps = Math.max(0, Math.round(currentRps / Math.max(1, activeWorkersCount) + (Math.random() - 0.5) * 15));
        return {
          ...w,
          cpuPercent: jitterCpu,
          currentRps: jitterRps,
          handledTotal: w.handledTotal + jitterRps
        };
      }));

      // Update telemetry history
      setTelemetryHistory(prev => {
        const next = [...prev.slice(1)];
        next.push({
          rps: currentRps,
          capacity: totalClusterCapacityRps,
          anomaly: anomalyScore,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [currentRps, activeWorkersCount, totalClusterCapacityRps, anomalyScore]);

  // Execute Auto-scale provisioning when anomaly or spike detected
  const triggerAutoScalingFromAnomaly = (score: number, reason: string) => {
    setIsSpikeActive(true);
    setAnomalyScore(score);
    setSpikeReason(reason);
    
    // Simulate spike RPS surge
    const surgeRps = Math.round(1800 + Math.random() * 1600); // 1800 - 3400 RPS
    setCurrentRps(surgeRps);
    setQueueDepth(Math.round(180 + Math.random() * 240));
    setProcessingLatencyMs(Math.round(48 + Math.random() * 35));

    // Calculate required workers to absorb surge
    const targetWorkersNeeded = Math.min(
      maxWorkers, 
      Math.max(activeWorkersCount + 2, Math.ceil(surgeRps / targetConcurrencyPerWorker) + 1)
    );
    const workersToAdd = Math.max(1, targetWorkersNeeded - activeWorkersCount);

    const newWorkerList: WebhookWorker[] = [];
    const zones = ['sa-east-1a (São Paulo)', 'sa-east-1b (São Paulo)', 'sa-east-1c (Campinas Edge)', 'us-east-1a (Virginia)'];

    for (let i = 0; i < workersToAdd; i++) {
      const workerNum = activeWorkersCount + i + 1;
      newWorkerList.push({
        id: `worker-autoscale-${Date.now()}-${i}`,
        name: `Autoscale-Worker-${workerNum.toString().padStart(2, '0')} (Spike-Absorber)`,
        type: 'autoscaled_spike',
        zone: zones[i % zones.length],
        status: 'scaling_up',
        cpuPercent: 12,
        memoryMb: 110,
        currentRps: 0,
        handledTotal: 0,
        startedAt: 'Provisionando...',
        uptimeSeconds: 0
      });
    }

    setWorkers(prev => [...prev, ...newWorkerList]);

    // Record Event Log
    const newLog: ScalingEventLog = {
      id: `scale_evt_${Date.now()}`,
      timestamp: `Hoje, ${new Date().toLocaleTimeString('pt-BR')}`,
      trigger: 'ANOMALY_SPIKE_DETECTED',
      source: 'IntelligenceHub / XGBoost Anomaly Monitor',
      anomalyScore: score,
      workersBefore: activeWorkersCount,
      workersAfter: activeWorkersCount + workersToAdd,
      rpsBefore: currentRps,
      rpsPeak: surgeRps,
      status: 'IN_PROGRESS',
      details: `Pico de anomalia (${score}/100) detectado: ${reason}. Provisionando +${workersToAdd} workers para manter latência < 30ms.`
    };
    setScalingLogs(prev => [newLog, ...prev]);

    addToast(
      '⚡ Auto-Scaler: Provisionamento Automático',
      `Anomalia (${score}/100) detectada! Provisionando +${workersToAdd} workers. Capacidade do cluster expandida para ${targetWorkersNeeded * targetConcurrencyPerWorker} req/s.`,
      'warning'
    );

    // Complete scaling up in 600ms
    setTimeout(() => {
      setWorkers(prev => prev.map(w => w.status === 'scaling_up' ? { ...w, status: 'running', startedAt: 'Recém iniciado' } : w));
      setProcessingLatencyMs(16);
      setScalingLogs(prev => prev.map(log => log.id === newLog.id ? { ...log, status: 'COMPLETED' } : log));
      addToast(
        '✓ Auto-Scaler: Cluster Estabilizado',
        `Todos os ${workersToAdd} workers estão 100% ativos e processando a fila sem retenção.`,
        'success'
      );
    }, 1200);
  };

  // Simulate Cooldown & Scale Down
  const handleTriggerCooldown = () => {
    setIsSpikeActive(false);
    setAnomalyScore(14);
    setSpikeReason('Tráfego Normalizado (Pós-Spike)');
    setCurrentRps(360);
    setQueueDepth(12);
    setProcessingLatencyMs(11);

    const dynamicWorkers = workers.filter(w => w.type === 'autoscaled_spike');
    if (dynamicWorkers.length === 0) {
      addToast('Auto-Scaler', 'Nenhum worker dinâmico pendente de desalocação.', 'info');
      return;
    }

    // Put into draining status
    setWorkers(prev => prev.map(w => w.type === 'autoscaled_spike' ? { ...w, status: 'draining' } : w));

    addToast('Auto-Scaler: Cooldown Iniciado', `Drenando conexões de ${dynamicWorkers.length} workers dinâmicos com segurança...`, 'info');

    setTimeout(() => {
      setWorkers(prev => prev.filter(w => w.type !== 'autoscaled_spike'));
      
      const log: ScalingEventLog = {
        id: `scale_evt_${Date.now()}`,
        timestamp: `Hoje, ${new Date().toLocaleTimeString('pt-BR')}`,
        trigger: 'COOLDOWN_SCALE_DOWN',
        source: 'AutoScaler Cooldown Daemon',
        anomalyScore: 14,
        workersBefore: activeWorkersCount,
        workersAfter: minWorkers,
        rpsBefore: currentRps,
        rpsPeak: 360,
        status: 'COMPLETED',
        details: `Tráfego estabilizado. ${dynamicWorkers.length} workers desalocados para otimização de custo cloud.`
      };
      setScalingLogs(prev => [log, ...prev]);

      addToast('✓ Auto-Scaler: Cooldown Concluído', 'Cluster retornado à frota base mínima com zero drop de requisições.', 'success');
    }, 1800);
  };

  // Manual Worker Add
  const handleAddManualWorker = () => {
    if (workers.length >= maxWorkers) {
      addToast('Limite Máximo Atingido', `O cluster já está no limite máximo de ${maxWorkers} workers.`, 'error');
      return;
    }

    const workerNum = workers.length + 1;
    const newWorker: WebhookWorker = {
      id: `worker-manual-${Date.now()}`,
      name: `Manual-Worker-${workerNum.toString().padStart(2, '0')}`,
      type: 'manual',
      zone: 'sa-east-1a (São Paulo)',
      status: 'running',
      cpuPercent: 20,
      memoryMb: 128,
      currentRps: Math.round(currentRps / (workers.length + 1)),
      handledTotal: 0,
      startedAt: 'Agora',
      uptimeSeconds: 0
    };

    setWorkers(prev => [...prev, newWorker]);
    addToast('Worker Manual Provisionado', `${newWorker.name} adicionado ao pool de processamento.`, 'success');
  };

  // Manual Worker Remove
  const handleRemoveWorker = (id: string) => {
    const target = workers.find(w => w.id === id);
    if (!target) return;
    if (target.type === 'core') {
      addToast('Ação Bloqueada', 'Workers de tipo "core" são protegidos contra remoção manual.', 'error');
      return;
    }

    setWorkers(prev => prev.filter(w => w.id !== id));
    addToast('Worker Desalocado', `${target.name} removido do cluster.`, 'info');
  };

  // Export Scaling Logs
  const handleExportLogs = () => {
    const csvContent = [
      'ID,Timestamp,Trigger,Source,AnomalyScore,WorkersBefore,WorkersAfter,RpsPeak,Status,Details',
      ...scalingLogs.map(l => `"${l.id}","${l.timestamp}","${l.trigger}","${l.source}",${l.anomalyScore},${l.workersBefore},${l.workersAfter},${l.rpsPeak},"${l.status}","${l.details}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_autoscaler_audit_logs_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Logs Exportados', 'Relatório CSV de eventos de auto-scaling baixado com sucesso.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-teal-500 text-white shadow-lg shadow-indigo-500/20">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Orchestration Webhook Auto-Scaler & Dynamic Worker Fleet
                </h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isSpikeActive 
                    ? 'bg-rose-100 text-rose-700 animate-pulse dark:bg-rose-950/60 dark:text-rose-400' 
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}>
                  <Radio className="h-3 w-3" />
                  {isSpikeActive ? 'SPIKE BURST ATIVO' : 'ESTÁVEL (ONLINE)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provisionamento autônomo de micro-workers em resposta a picos de tráfego e anomalias detectadas pelo IntelligenceHub
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => triggerAutoScalingFromAnomaly(88, 'Simulação de Spike: Flash Sale Pix (Surge +2,800 RPS)')}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              title="Dispara um pico de tráfego artificial para testar a reação do motor de auto-scaling"
            >
              <Flame className="h-4 w-4" />
              <span>Simular Spike (2.8k RPS)</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerCooldown}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="Simula o resfriamento de tráfego e desliga os workers dinâmicos"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Cooldown / Resfriar</span>
            </button>

            <button
              type="button"
              onClick={handleAddManualWorker}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+1 Worker Manual</span>
            </button>

            <button
              type="button"
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              title="Exportar registros de auto-scaling para CSV"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Logs</span>
            </button>
          </div>
        </div>

        {/* 4 Core Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          {/* Card 1: Live RPS & Utilization */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Taxa de Ingress (RPS)</span>
              <Activity className={`h-4 w-4 ${currentRps > 1000 ? 'text-rose-500' : 'text-emerald-500'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                {currentRps.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-semibold">req/segundo</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span>Uso da Capacidade</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{clusterUtilizationPercent}% ({totalClusterCapacityRps} max)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden dark:bg-slate-700">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    clusterUtilizationPercent > 85 ? 'bg-rose-500' : clusterUtilizationPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${clusterUtilizationPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Active Worker Fleet */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Frota de Workers</span>
              <Cpu className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                {activeWorkersCount}
              </span>
              <span className="text-xs text-slate-400 font-semibold">de {maxWorkers} max</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px]">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">
                {workers.filter(w => w.type === 'core').length} Core + {workers.filter(w => w.type === 'autoscaled_spike').length} Auto-Spike
              </span>
            </div>
          </div>

          {/* Card 3: Anomaly & Spike Index */}
          <div className={`rounded-xl border p-4 transition-all ${
            anomalyScore > anomalyThreshold 
              ? 'border-rose-200 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30' 
              : 'border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Índice de Anomalia IA</span>
              <ShieldAlert className={`h-4 w-4 ${anomalyScore > anomalyThreshold ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`font-mono text-2xl font-black ${anomalyScore > anomalyThreshold ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {anomalyScore}/100
              </span>
              <span className="text-[11px] font-bold text-slate-500">Limiar: {anomalyThreshold}%</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium" title={spikeReason}>
              {spikeReason}
            </div>
          </div>

          {/* Card 4: Webhook Ingress Queue & Latency */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fila & Latência P99</span>
              <Gauge className="h-4 w-4 text-teal-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                {processingLatencyMs}ms
              </span>
              <span className="text-xs text-slate-400 font-semibold font-mono">({queueDepth} na fila)</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>SLA P99 Garantido (&lt; 50ms)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Scaler Policy Settings & SVG Sparkline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Scaling Policy Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Políticas de Auto-Scaling
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">Motor Ativo:</span>
              <button
                type="button"
                onClick={() => {
                  setIsAutoScalingEnabled(!isAutoScalingEnabled);
                  addToast('Auto-Scaler', `Motor de auto-scaling ${!isAutoScalingEnabled ? 'ativado' : 'pausado'}.`, 'info');
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAutoScalingEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoScalingEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Modo de Operação</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'adaptive_ml', label: 'Adaptive ML (IA)', desc: 'Previsão preditiva via XGBoost' },
                { id: 'aggressive', label: 'Agressivo (Burst)', desc: 'Escala imediata em &lt; 200ms' },
                { id: 'cost_optimized', label: 'Econômico', desc: 'Máximo aproveitamento por pod' },
                { id: 'manual', label: 'Manual Fixo', desc: 'Apenas ajuste administrativo' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setScaleMode(m.id as any);
                    addToast('Modo de Escala Alterado', `Política alterada para ${m.label}.`, 'info');
                  }}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                    scaleMode === m.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                  }`}
                >
                  <div className="font-bold">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Workers Mínimos (Core)</span>
                <span className="font-mono text-indigo-600 font-bold">{minWorkers} pods</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={minWorkers}
                onChange={(e) => setMinWorkers(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Workers Máximos (Teto de Segurança)</span>
                <span className="font-mono text-indigo-600 font-bold">{maxWorkers} pods</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                value={maxWorkers}
                onChange={(e) => setMaxWorkers(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Limiar de Disparo por Anomalia</span>
                <span className="font-mono text-rose-600 font-bold">&gt; {anomalyThreshold}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-rose-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Tempo de Cooldown / Resfriamento</span>
                <span className="font-mono text-slate-600 font-bold">{cooldownSeconds}s</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={cooldownSeconds}
                onChange={(e) => setCooldownSeconds(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Real-Time Telemetry Curve & Scaling Dynamics */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Volume de Requisições (RPS) vs. Frota de Workers Ativos
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shadow-sm" />
                Volume Ingress ({currentRps} req/s)
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500 shadow-sm" />
                Workers Ativos ({activeWorkersCount} pods)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="h-1.5 w-4 border-b-2 border-dashed border-emerald-500" />
                Capacidade Máx ({totalClusterCapacityRps} req/s)
              </span>
            </div>
          </div>

          {/* SVG Visual Telemetry Chart with Dual Axis */}
          <div className="relative h-64 w-full rounded-xl bg-slate-950 p-4 overflow-hidden border border-slate-800 flex flex-col justify-between">
            {/* Background Grid & Axis Labels */}
            <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-15">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-b border-r border-slate-400" />
              ))}
            </div>

            {/* Left Axis Label (RPS) */}
            <div className="absolute left-2 top-3 z-10 font-mono text-[9px] text-indigo-400 font-bold">
              ▲ 4.0k RPS
            </div>
            <div className="absolute left-2 bottom-3 z-10 font-mono text-[9px] text-slate-500">
              ▼ 0 RPS
            </div>

            {/* Right Axis Label (Workers) */}
            <div className="absolute right-2 top-3 z-10 font-mono text-[9px] text-amber-400 font-bold text-right">
              {maxWorkers} Pods ▲
            </div>
            <div className="absolute right-2 bottom-3 z-10 font-mono text-[9px] text-amber-500/70 text-right">
              {minWorkers} Pods (Min)
            </div>

            {/* Dual Graphic SVG */}
            <svg className="absolute inset-0 h-full w-full px-10 py-6 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rpsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="workerBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Cluster Capacity Safe Ceiling Line */}
              {(() => {
                const ceilingY = Math.max(10, 160 - (totalClusterCapacityRps / 4000) * 130);
                return (
                  <g>
                    <line 
                      x1="0" 
                      y1={ceilingY} 
                      x2="100%" 
                      y2={ceilingY} 
                      stroke="#10b981" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                      opacity="0.85"
                    />
                    <text x="10" y={ceilingY - 4} fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      CAPACIDADE DO CLUSTER ({totalClusterCapacityRps} RPS)
                    </text>
                  </g>
                );
              })()}

              {/* Step / Bars for Active Workers Count across historical timeline */}
              {telemetryHistory.map((pt, idx) => {
                const stepWidth = 100 / telemetryHistory.length;
                const x = `${idx * stepWidth + stepWidth * 0.15}%`;
                const barWidth = `${stepWidth * 0.7}%`;
                const estimatedWorkers = Math.max(minWorkers, Math.ceil(pt.capacity / targetConcurrencyPerWorker));
                const barHeight = Math.max(8, (estimatedWorkers / maxWorkers) * 110);
                const y = 175 - barHeight;

                return (
                  <g key={`bar-${idx}`} className="transition-all duration-300">
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="url(#workerBarGradient)"
                      rx="3"
                      opacity="0.65"
                    />
                    <text
                      x={`${idx * stepWidth + stepWidth * 0.5}%`}
                      y={y - 4}
                      fill="#fbbf24"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {estimatedWorkers}w
                    </text>
                  </g>
                );
              })}

              {/* Continuous RPS Spline Area and Line */}
              {(() => {
                const points = telemetryHistory.map((pt, idx) => {
                  const x = (idx / (telemetryHistory.length - 1)) * 100;
                  const y = 175 - (Math.min(4000, pt.rps) / 4000) * 140;
                  return { x, y, rps: pt.rps };
                });

                const polyPoints = points.map(p => `${p.x}%,${p.y}`).join(' ');
                const areaPoints = `0%,175 ${polyPoints} 100%,175`;

                return (
                  <>
                    <polygon points={areaPoints} fill="url(#rpsAreaGradient)" />
                    <polyline
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                      points={polyPoints}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, i) => (
                      <g key={`pt-${i}`}>
                        <circle
                          cx={`${p.x}%`}
                          cy={p.y}
                          r={p.rps > 1200 ? "5" : "3.5"}
                          fill={p.rps > 1200 ? "#f43f5e" : "#6366f1"}
                          className={p.rps > 1200 ? "animate-ping" : ""}
                        />
                        <circle
                          cx={`${p.x}%`}
                          cy={p.y}
                          r="3.5"
                          fill={p.rps > 1200 ? "#f43f5e" : "#6366f1"}
                        />
                        <text
                          x={`${p.x}%`}
                          y={p.y - 8}
                          fill={p.rps > 1200 ? "#fda4af" : "#c7d2fe"}
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.rps}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Bottom Timeline Legend */}
            <div className="z-10 flex items-center justify-between text-xs text-slate-400 pt-2">
              <span className="font-mono text-[10px] text-slate-500">T-10m (Histórico de Ingress)</span>
              <div className="flex items-center gap-2">
                {isSpikeActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 animate-pulse bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    <Flame className="h-3 w-3" /> Pico Ativo: +{currentRps} RPS
                  </span>
                )}
                <span className="font-mono text-[10px] text-slate-300 font-bold">
                  Agora ({activeWorkersCount} MicroVMs Ativas • {clusterUtilizationPercent}% Carga)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Explanation Banner */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              <strong>Zero-Downtime Guarantee:</strong> O auto-scaler provisiona microVMs com warm-pool em <strong>&lt; 400ms</strong> ao cruzar o limiar de anomalia, garantindo processamento contínuo de webhooks e transações financeiras.
            </span>
          </div>
        </div>
      </div>

      {/* Active Worker Fleet Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Instâncias Ativas da Frota de Workers ({workers.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Tempo médio de resposta: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{processingLatencyMs}ms</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map(w => (
            <div
              key={w.id}
              className={`rounded-xl border p-4 transition-all relative overflow-hidden ${
                w.status === 'scaling_up'
                  ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30'
                  : w.status === 'draining'
                  ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40'
              }`}
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    w.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                    w.status === 'scaling_up' ? 'bg-indigo-500 animate-ping' : 'bg-amber-500'
                  }`} />
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {w.name}
                  </span>
                </div>
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  w.type === 'core'
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                    : w.type === 'autoscaled_spike'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                }`}>
                  {w.type === 'core' ? 'Core Pool' : w.type === 'autoscaled_spike' ? 'Auto-Spike' : 'Manual'}
                </span>
              </div>

              {/* Specs & Metrics */}
              <div className="text-[11px] text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Região / Zona:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{w.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput Atual:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{w.currentRps} req/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Uso de CPU / Memória:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{w.cpuPercent}% / {w.memoryMb}MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Processado:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{w.handledTotal.toLocaleString()} webhooks</span>
                </div>
              </div>

              {/* Progress bar for CPU */}
              <div className="mt-3">
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      w.cpuPercent > 80 ? 'bg-rose-500' : w.cpuPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${w.cpuPercent}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              {w.type !== 'core' && (
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveWorker(w.id)}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                  >
                    Desalocar Worker
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Scaling & Anomaly Audit Event Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Trilha de Auditoria & Ações do Auto-Scaler ({scalingLogs.length})
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Sincronizado com Anomaly Monitor via Broadcast Channel
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 dark:border-slate-800">
                <th className="pb-2.5">Horário</th>
                <th className="pb-2.5">Gatilho / Origem</th>
                <th className="pb-2.5">Score IA</th>
                <th className="pb-2.5">Workers (Antes → Depois)</th>
                <th className="pb-2.5">Pico de RPS</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Detalhes da Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {scalingLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-3">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.trigger}</span>
                    <span className="block text-[10px] text-slate-400">{log.source}</span>
                  </td>
                  <td className="py-3 font-mono">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      log.anomalyScore > 65 
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' 
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.anomalyScore}/100
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {log.workersBefore} → {log.workersAfter} pods
                  </td>
                  <td className="py-3 font-mono text-slate-700 dark:text-slate-300">
                    {log.rpsPeak.toLocaleString()} req/s
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      log.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}>
                      {log.status === 'COMPLETED' ? <CheckCircle2 className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 animate-spin" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate" title={log.details}>
                    {log.details}
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
