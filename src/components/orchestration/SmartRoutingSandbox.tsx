import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Play, 
  Pause, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Clock, 
  Sliders, 
  PlayCircle,
  GitFork,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Server,
  Layers,
  Flame,
  Settings,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Cpu,
  BarChart3,
  Percent
} from 'lucide-react';

interface ProviderNodeConfig {
  id: string;
  name: string;
  provider: string;
  baseLatency: number;
  baseFee: number;
  simulatedStatus: 'healthy' | 'degraded' | 'down';
}

interface FailoverPathway {
  id: string;
  name: string;
  condition: string;
  primaryProviderId: string;
  trigger1: string;
  secondaryProviderId: string;
  trigger2: string;
  tertiaryProviderId: string;
  terminalAction: string;
}

export const SmartRoutingSandbox: React.FC = () => {
  const { acquirers, addToast } = usePayment();

  // Preset providers with state
  const [providerNodes, setProviderNodes] = useState<Record<string, ProviderNodeConfig>>({
    acq_cielo: { id: 'acq_cielo', name: 'Cielo API V3', provider: 'cielo', baseLatency: 140, baseFee: 2.19, simulatedStatus: 'down' },
    acq_stone: { id: 'acq_stone', name: 'Stone Direct Gateway', provider: 'stone', baseLatency: 95, baseFee: 1.89, simulatedStatus: 'healthy' },
    acq_rede: { id: 'acq_rede', name: 'Redecard Acquirer', provider: 'rede', baseLatency: 160, baseFee: 2.05, simulatedStatus: 'degraded' },
    acq_pagbank: { id: 'acq_pagbank', name: 'PagBank Hub', provider: 'pagbank', baseLatency: 120, baseFee: 1.99, simulatedStatus: 'healthy' },
    acq_asaas: { id: 'acq_asaas', name: 'Asaas BaaS SPI v3', provider: 'asaas', baseLatency: 110, baseFee: 1.45, simulatedStatus: 'healthy' },
    acq_adyen: { id: 'acq_adyen', name: 'Adyen Global EU', provider: 'adyen', baseLatency: 280, baseFee: 2.80, simulatedStatus: 'healthy' }
  });

  // Current Pathway Definition
  const [pathway, setPathway] = useState<FailoverPathway>({
    id: 'pathway_custom_1',
    name: 'Black Friday Failover Resiliency Pathway',
    condition: 'Cartão de Crédito Nacional (Visa / Master / Elo) • Valor > R$ 50,00',
    primaryProviderId: 'acq_cielo',
    trigger1: 'HTTP 504 Gateway Timeout / 100% Downtime',
    secondaryProviderId: 'acq_stone',
    trigger2: 'Soft Decline / 429 Rate Limit',
    tertiaryProviderId: 'acq_pagbank',
    terminalAction: 'Fallback para Pix Dinâmico Instantâneo'
  });

  // Simulation controls
  const [trafficVolume, setTrafficVolume] = useState<number>(250);
  const [ticketAvg, setTicketAvg] = useState<number>(185);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'fast' | 'step'>('fast');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [selectedScenarioPreset, setSelectedScenarioPreset] = useState<string>('cielo_crash');

  // Simulation Results
  const [simulationResults, setSimulationResults] = useState<{
    totalProcessed: number;
    primaryRouted: number;
    primarySuccess: number;
    primaryFailed: number;
    secondaryRouted: number;
    secondarySuccess: number;
    secondaryFailed: number;
    tertiaryRouted: number;
    tertiarySuccess: number;
    tertiaryFailed: number;
    deadLetterRouted: number;
    overallSuccessRate: number;
    revenueProtectedBrl: number;
    totalVolumeBrl: number;
    avgLatencyMs: number;
    withoutFailoverSuccessRate: number;
  } | null>(null);

  // Scenario Presets
  const handleApplyPreset = (presetKey: string) => {
    setSelectedScenarioPreset(presetKey);
    if (presetKey === 'cielo_crash') {
      setProviderNodes(prev => ({
        ...prev,
        acq_cielo: { ...prev.acq_cielo, simulatedStatus: 'down' },
        acq_stone: { ...prev.acq_stone, simulatedStatus: 'healthy' },
        acq_pagbank: { ...prev.acq_pagbank, simulatedStatus: 'healthy' },
        acq_rede: { ...prev.acq_rede, simulatedStatus: 'degraded' }
      }));
      setPathway({
        id: 'path_cielo',
        name: 'Black Friday Cielo Outage Contingency',
        condition: 'Crédito Todos os BINs (Nacional & Internacional)',
        primaryProviderId: 'acq_cielo',
        trigger1: 'HTTP 504 Gateway Timeout / 100% Downtime',
        secondaryProviderId: 'acq_stone',
        trigger2: 'Rate Limit (429) / Latência > 800ms',
        tertiaryProviderId: 'acq_pagbank',
        terminalAction: 'Fallback para Pix Dinâmico Instantâneo'
      });
      addToast('Cenário Carregado', 'Cielo configurada com 100% de downtime para simulação de failover imediato.', 'info');
    } else if (presetKey === 'stone_degraded') {
      setProviderNodes(prev => ({
        ...prev,
        acq_cielo: { ...prev.acq_cielo, simulatedStatus: 'healthy' },
        acq_stone: { ...prev.acq_stone, simulatedStatus: 'down' },
        acq_rede: { ...prev.acq_rede, simulatedStatus: 'healthy' },
        acq_pagbank: { ...prev.acq_pagbank, simulatedStatus: 'healthy' }
      }));
      setPathway({
        id: 'path_stone',
        name: 'Cascata Primária Stone -> Cielo -> Rede',
        condition: 'Bandeiras Mastercard & Elo',
        primaryProviderId: 'acq_stone',
        trigger1: 'Circuit Breaker Ativado (Downtime 100%)',
        secondaryProviderId: 'acq_cielo',
        trigger2: 'Soft Decline / Erro 500',
        tertiaryProviderId: 'acq_rede',
        terminalAction: 'Fila de Re-tentativa Assíncrona'
      });
      addToast('Cenário Carregado', 'Stone configurada como offline com failover para Cielo e Rede.', 'info');
    } else if (presetKey === 'multi_cascade') {
      setProviderNodes(prev => ({
        ...prev,
        acq_cielo: { ...prev.acq_cielo, simulatedStatus: 'down' },
        acq_stone: { ...prev.acq_stone, simulatedStatus: 'down' },
        acq_rede: { ...prev.acq_rede, simulatedStatus: 'degraded' },
        acq_pagbank: { ...prev.acq_pagbank, simulatedStatus: 'healthy' }
      }));
      setPathway({
        id: 'path_multi',
        name: 'Cascata de Catástrofe Multi-Adquirente',
        condition: 'Crédito Alta Volumetria (Peak Traffic)',
        primaryProviderId: 'acq_cielo',
        trigger1: 'HTTP 504 / Total Outage',
        secondaryProviderId: 'acq_stone',
        trigger2: 'HTTP 503 Service Unavailable',
        tertiaryProviderId: 'acq_pagbank',
        terminalAction: 'Oferta de Pix com 5% de Desconto'
      });
      addToast('Cenário Extremo Carregado', 'Simulação de falha simultânea em Cielo e Stone, recuperando tráfego via PagBank.', 'warning');
    }
  };

  // Toggle Provider Status manually
  const toggleProviderStatus = (id: string, newStatus: 'healthy' | 'degraded' | 'down') => {
    setProviderNodes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        simulatedStatus: newStatus
      }
    }));
    addToast('Status de Provedor Atualizado', `${providerNodes[id]?.name || id} alterado para status: ${newStatus.toUpperCase()}`, 'info');
  };

  // Execute Simulation
  const handleRunSimulation = () => {
    setIsRunning(true);
    setActiveStepIndex(0);

    const stepInterval = setInterval(() => {
      setActiveStepIndex(prev => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          return 4;
        }
        return prev + 1;
      });
    }, 350);

    setTimeout(() => {
      const primaryNode = providerNodes[pathway.primaryProviderId];
      const secondaryNode = providerNodes[pathway.secondaryProviderId];
      const tertiaryNode = providerNodes[pathway.tertiaryProviderId];

      // Primary simulation
      let primaryPassRate = primaryNode.simulatedStatus === 'healthy' ? 0.96 : primaryNode.simulatedStatus === 'degraded' ? 0.45 : 0.0;
      const primaryRouted = trafficVolume;
      const primarySuccess = Math.round(primaryRouted * primaryPassRate);
      const primaryFailed = primaryRouted - primarySuccess;

      // Secondary simulation (takes failovers from primary)
      let secondaryPassRate = secondaryNode.simulatedStatus === 'healthy' ? 0.94 : secondaryNode.simulatedStatus === 'degraded' ? 0.40 : 0.0;
      const secondaryRouted = primaryFailed;
      const secondarySuccess = Math.round(secondaryRouted * secondaryPassRate);
      const secondaryFailed = secondaryRouted - secondarySuccess;

      // Tertiary simulation (takes failovers from secondary)
      let tertiaryPassRate = tertiaryNode.simulatedStatus === 'healthy' ? 0.92 : tertiaryNode.simulatedStatus === 'degraded' ? 0.35 : 0.0;
      const tertiaryRouted = secondaryFailed;
      const tertiarySuccess = Math.round(tertiaryRouted * tertiaryPassRate);
      const tertiaryFailed = tertiaryRouted - tertiarySuccess;

      const deadLetterRouted = tertiaryFailed;

      const totalSuccess = primarySuccess + secondarySuccess + tertiarySuccess;
      const overallSuccessRate = Number(((totalSuccess / trafficVolume) * 100).toFixed(1));
      const withoutFailoverSuccessRate = Number(((primarySuccess / trafficVolume) * 100).toFixed(1));
      
      const revenueProtectedBrl = (secondarySuccess + tertiarySuccess) * ticketAvg;
      const totalVolumeBrl = trafficVolume * ticketAvg;

      // Calculate weighted average latency
      let totalLatency = (primarySuccess * primaryNode.baseLatency);
      if (secondarySuccess > 0) {
        totalLatency += secondarySuccess * (primaryNode.baseLatency + 850 + secondaryNode.baseLatency);
      }
      if (tertiarySuccess > 0) {
        totalLatency += tertiarySuccess * (primaryNode.baseLatency + 850 + secondaryNode.baseLatency + 750 + tertiaryNode.baseLatency);
      }
      if (deadLetterRouted > 0) {
        totalLatency += deadLetterRouted * 2500;
      }
      const avgLatencyMs = Math.round(totalLatency / trafficVolume);

      setSimulationResults({
        totalProcessed: trafficVolume,
        primaryRouted,
        primarySuccess,
        primaryFailed,
        secondaryRouted,
        secondarySuccess,
        secondaryFailed,
        tertiaryRouted,
        tertiarySuccess,
        tertiaryFailed,
        deadLetterRouted,
        overallSuccessRate,
        revenueProtectedBrl,
        totalVolumeBrl,
        avgLatencyMs,
        withoutFailoverSuccessRate
      });

      setIsRunning(false);
      addToast(
        'Simulação Concluída', 
        `Dry-run finalizado! Taxa de aprovação final: ${overallSuccessRate}% (Protegidos R$ ${revenueProtectedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
        'success'
      );
    }, 1500);
  };

  // Run on mount once
  useEffect(() => {
    handleRunSimulation();
  }, []);

  const primary = providerNodes[pathway.primaryProviderId] || { name: 'Primário', simulatedStatus: 'healthy', baseLatency: 120 };
  const secondary = providerNodes[pathway.secondaryProviderId] || { name: 'Secundário', simulatedStatus: 'healthy', baseLatency: 100 };
  const tertiary = providerNodes[pathway.tertiaryProviderId] || { name: 'Terciário', simulatedStatus: 'healthy', baseLatency: 110 };

  return (
    <div className="space-y-6 animate-fade-in" id="smart-routing-sandbox-widget">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <GitFork className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Smart Routing Sandbox</h2>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Failover Tree Simulator v3.2
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina caminhos de contingência hipotéticos e visualize em um grafo de árvore como o tráfego é re-roteado em tempo real durante indisponibilidades de adquirentes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRunning ? (
                <Activity className="h-4 w-4 animate-spin text-white" />
              ) : (
                <PlayCircle className="h-4 w-4 text-white" />
              )}
              <span>{isRunning ? 'Executando Roteamento...' : 'Simular Roteamento (Dry-Run)'}</span>
            </button>
          </div>
        </div>

        {/* Preset Scenarios */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Cenários Pré-configurados:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('cielo_crash')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                selectedScenarioPreset === 'cielo_crash'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              🚨 Queda Cielo (100% Downtime)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('stone_degraded')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                selectedScenarioPreset === 'stone_degraded'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              ⚠️ Stone Circuit Breaker & Fallback
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('multi_cascade')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                selectedScenarioPreset === 'multi_cascade'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              ⚡ Cascata Extrema Multi-Adquirente
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Pathway Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Pathway Editor & Simulated Provider Health */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pathway Definition Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-500" />
                Definição do Pipeline de Contingência
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Custom Rules</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  1. Adquirente Primário (Início do Fluxo)
                </label>
                <select
                  value={pathway.primaryProviderId}
                  onChange={(e) => setPathway(p => ({ ...p, primaryProviderId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {(Object.values(providerNodes) as ProviderNodeConfig[]).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name} (Taxa: {node.baseFee}% • Latência: {node.baseLatency}ms)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  2. Gatilho de Failover Primário → Secundário
                </label>
                <select
                  value={pathway.trigger1}
                  onChange={(e) => setPathway(p => ({ ...p, trigger1: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="HTTP 504 Gateway Timeout / 100% Downtime">HTTP 504 Gateway Timeout / Indisponibilidade Total</option>
                  <option value="HTTP 500 / Erro Interno do Provedor">HTTP 500 / Erro Interno do Provedor</option>
                  <option value="Latência > 800ms (SLA Degradado)">Latência &gt; 800ms (SLA Degradado)</option>
                  <option value="Soft Decline (Saldo Insuficiente / Tentar Outra Adquirente)">Soft Decline (Recusa Suave / Tentar Outra)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  3. Adquirente Secundário (1º Nível de Fallback)
                </label>
                <select
                  value={pathway.secondaryProviderId}
                  onChange={(e) => setPathway(p => ({ ...p, secondaryProviderId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {(Object.values(providerNodes) as ProviderNodeConfig[]).map(node => (
                    <option key={node.id} value={node.id} disabled={node.id === pathway.primaryProviderId}>
                      {node.name} (Taxa: {node.baseFee}% • Latência: {node.baseLatency}ms)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  4. Gatilho de Failover Secundário → Terciário
                </label>
                <select
                  value={pathway.trigger2}
                  onChange={(e) => setPathway(p => ({ ...p, trigger2: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="Rate Limit (429) / Latência > 800ms">Rate Limit (429) / Latência &gt; 800ms</option>
                  <option value="HTTP 503 Service Unavailable">HTTP 503 Service Unavailable</option>
                  <option value="Anti-Fraud Friction / Rejeição de Risco">Anti-Fraud Friction / Rejeição de Risco</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  5. Adquirente Terciário (2º Nível de Fallback)
                </label>
                <select
                  value={pathway.tertiaryProviderId}
                  onChange={(e) => setPathway(p => ({ ...p, tertiaryProviderId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {(Object.values(providerNodes) as ProviderNodeConfig[]).map(node => (
                    <option key={node.id} value={node.id} disabled={node.id === pathway.primaryProviderId || node.id === pathway.secondaryProviderId}>
                      {node.name} (Taxa: {node.baseFee}% • Latência: {node.baseLatency}ms)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  6. Ação Terminal (Caso todos os provedores falhem)
                </label>
                <input
                  type="text"
                  value={pathway.terminalAction}
                  onChange={(e) => setPathway(p => ({ ...p, terminalAction: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Provider Health Injection Toggles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                Injeção de Indisponibilidade nos Provedores
              </h3>
              <span className="text-[10px] text-rose-500 font-bold">Live Chaos Testing</span>
            </div>

            <div className="space-y-3">
              {(Object.values(providerNodes) as ProviderNodeConfig[]).map(node => {
                const isSelectedInPathway = [pathway.primaryProviderId, pathway.secondaryProviderId, pathway.tertiaryProviderId].includes(node.id);
                return (
                  <div 
                    key={node.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isSelectedInPathway 
                        ? 'border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/60' 
                        : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          node.simulatedStatus === 'healthy' ? 'bg-emerald-500' :
                          node.simulatedStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
                        }`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {node.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {node.baseLatency}ms • {node.baseFee}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => toggleProviderStatus(node.id, 'healthy')}
                        className={`rounded-lg py-1 font-bold transition-all ${
                          node.simulatedStatus === 'healthy'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        🟢 Online
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProviderStatus(node.id, 'degraded')}
                        className={`rounded-lg py-1 font-bold transition-all ${
                          node.simulatedStatus === 'degraded'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        🟡 Degradação
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProviderStatus(node.id, 'down')}
                        className={`rounded-lg py-1 font-bold transition-all ${
                          node.simulatedStatus === 'down'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        🔴 Downtime (100%)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Traffic Sliders */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Volume de Tráfego Inbound</span>
                  <span className="text-indigo-600 font-mono">{trafficVolume} transações</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={trafficVolume}
                  onChange={(e) => setTrafficVolume(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Ticket Médio Simulado</span>
                  <span className="text-emerald-600 font-mono">R$ {ticketAvg.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1500"
                  step="10"
                  value={ticketAvg}
                  onChange={(e) => setTicketAvg(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tree-Graph & Telemetry Output */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Executive Metrics Bar */}
          {simulationResults && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aprovação c/ Failover</div>
                <div className="text-xl font-extrabold text-emerald-600 mt-1">{simulationResults.overallSuccessRate}%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Sem failover: <span className="text-rose-500 font-semibold">{simulationResults.withoutFailoverSuccessRate}%</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Receita Resgatada</div>
                <div className="text-xl font-extrabold text-indigo-600 mt-1">
                  R$ {(simulationResults.revenueProtectedBrl / 1000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">
                  Salva via contingência
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Failovers Acionados</div>
                <div className="text-xl font-extrabold text-amber-500 mt-1">
                  {simulationResults.secondaryRouted + simulationResults.tertiaryRouted}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Reroteamentos ativos
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Latência Média E2E</div>
                <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  {simulationResults.avgLatencyMs}ms
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Inclui overhead de retry
                </div>
              </div>
            </div>
          )}

          {/* Tree-Graph Visualizer Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GitFork className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grafo em Árvore de Roteamento Hipotético</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Sucesso
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Failover / Desvio
                </span>
              </div>
            </div>

            {/* Tree Graph Container */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-slate-950 p-6 overflow-x-auto text-white shadow-inner min-h-[520px] flex flex-col items-center justify-start space-y-6">
              
              {/* ROOT NODE: Inbound Traffic */}
              <div className="relative flex flex-col items-center z-10">
                <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/50 bg-indigo-950/80 px-5 py-2.5 shadow-lg shadow-indigo-900/30">
                  <Server className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <div className="text-center">
                    <div className="text-xs font-bold text-indigo-200">Tráfego Inbound Global</div>
                    <div className="text-[10px] font-mono text-indigo-400">
                      {trafficVolume} transações • R$ {(trafficVolume * ticketAvg).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                {/* Connecting Line */}
                <div className="h-6 w-0.5 bg-gradient-to-b from-indigo-500 to-slate-600" />
              </div>

              {/* LEVEL 1: Primary Node */}
              <div className="w-full max-w-lg relative flex flex-col items-center">
                <div className={`w-full rounded-xl border p-4 shadow-lg transition-all ${
                  primary.simulatedStatus === 'healthy' 
                    ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200' 
                    : primary.simulatedStatus === 'degraded'
                    ? 'border-amber-500/50 bg-amber-950/30 text-amber-200'
                    : 'border-rose-500/80 bg-rose-950/40 text-rose-200 shadow-rose-900/30 ring-1 ring-rose-500/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${
                        primary.simulatedStatus === 'healthy' ? 'bg-emerald-400' :
                        primary.simulatedStatus === 'degraded' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
                      }`} />
                      <span className="font-bold text-xs">1º Primário: {primary.name}</span>
                    </div>
                    <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono">
                      {primary.simulatedStatus.toUpperCase()}
                    </span>
                  </div>

                  {simulationResults && (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] pt-2 border-t border-white/10 font-mono">
                      <div className="text-emerald-400 flex items-center justify-between">
                        <span>Aprovadas:</span>
                        <strong>{simulationResults.primarySuccess} ({((simulationResults.primarySuccess/trafficVolume)*100).toFixed(0)}%)</strong>
                      </div>
                      <div className="text-rose-400 flex items-center justify-between">
                        <span>Falhadas:</span>
                        <strong>{simulationResults.primaryFailed} ({((simulationResults.primaryFailed/trafficVolume)*100).toFixed(0)}%)</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Outcome Branches */}
                {simulationResults && simulationResults.primaryFailed > 0 && (
                  <div className="flex flex-col items-center mt-2">
                    <div className="rounded-full bg-rose-900/80 border border-rose-500/50 px-3 py-1 text-[10px] font-bold text-rose-300 animate-bounce">
                      ⚡ Reroteando {simulationResults.primaryFailed} txs via ({pathway.trigger1})
                    </div>
                    <div className="h-6 w-0.5 bg-rose-500/80 dashed" />
                  </div>
                )}
              </div>

              {/* LEVEL 2: Secondary Node */}
              <div className="w-full max-w-lg relative flex flex-col items-center">
                <div className={`w-full rounded-xl border p-4 shadow-lg transition-all ${
                  secondary.simulatedStatus === 'healthy' 
                    ? 'border-indigo-500/50 bg-indigo-950/30 text-indigo-200' 
                    : secondary.simulatedStatus === 'degraded'
                    ? 'border-amber-500/50 bg-amber-950/30 text-amber-200'
                    : 'border-rose-500/80 bg-rose-950/40 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${
                        secondary.simulatedStatus === 'healthy' ? 'bg-indigo-400' :
                        secondary.simulatedStatus === 'degraded' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
                      }`} />
                      <span className="font-bold text-xs">2º Fallback Secundário: {secondary.name}</span>
                    </div>
                    <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono">
                      {secondary.simulatedStatus.toUpperCase()}
                    </span>
                  </div>

                  {simulationResults && (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] pt-2 border-t border-white/10 font-mono">
                      <div className="text-emerald-400 flex items-center justify-between">
                        <span>Recuperadas:</span>
                        <strong>{simulationResults.secondarySuccess} txs</strong>
                      </div>
                      <div className="text-rose-400 flex items-center justify-between">
                        <span>Re-falhas:</span>
                        <strong>{simulationResults.secondaryFailed} txs</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary Outcome Branches */}
                {simulationResults && simulationResults.secondaryFailed > 0 && (
                  <div className="flex flex-col items-center mt-2">
                    <div className="rounded-full bg-amber-900/80 border border-amber-500/50 px-3 py-1 text-[10px] font-bold text-amber-300">
                      ⚡ Reroteando {simulationResults.secondaryFailed} txs via ({pathway.trigger2})
                    </div>
                    <div className="h-6 w-0.5 bg-amber-500/80" />
                  </div>
                )}
              </div>

              {/* LEVEL 3: Tertiary Node */}
              <div className="w-full max-w-lg relative flex flex-col items-center">
                <div className={`w-full rounded-xl border p-4 shadow-lg transition-all ${
                  tertiary.simulatedStatus === 'healthy' 
                    ? 'border-teal-500/50 bg-teal-950/30 text-teal-200' 
                    : tertiary.simulatedStatus === 'degraded'
                    ? 'border-amber-500/50 bg-amber-950/30 text-amber-200'
                    : 'border-rose-500/80 bg-rose-950/40 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${
                        tertiary.simulatedStatus === 'healthy' ? 'bg-teal-400' :
                        tertiary.simulatedStatus === 'degraded' ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      <span className="font-bold text-xs">3º Fallback Terciário: {tertiary.name}</span>
                    </div>
                    <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono">
                      {tertiary.simulatedStatus.toUpperCase()}
                    </span>
                  </div>

                  {simulationResults && (
                    <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] pt-2 border-t border-white/10 font-mono">
                      <div className="text-emerald-400 flex items-center justify-between">
                        <span>Recuperadas:</span>
                        <strong>{simulationResults.tertiarySuccess} txs</strong>
                      </div>
                      <div className="text-rose-400 flex items-center justify-between">
                        <span>Incuráveis:</span>
                        <strong>{simulationResults.tertiaryFailed} txs</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dead Letter or Instant Pix Fallback */}
                {simulationResults && (
                  <div className="flex flex-col items-center mt-3">
                    <div className="h-5 w-0.5 bg-slate-600" />
                    <div className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2 text-center text-xs">
                      <span className="text-slate-400 block text-[10px]">Ação Terminal:</span>
                      <span className="font-bold text-amber-400">{pathway.terminalAction}</span>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {simulationResults.deadLetterRouted} transações finalizadas nesta etapa
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Audit & Resilience Report */}
          {simulationResults && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Avaliação de Resiliência Arquitetural</span>
              </div>
              <p>
                Durante a indisponibilidade simulada do provedor primário <strong>{primary.name}</strong>, o mecanismo de failover automático conseguiu redirecionar e aprovar <strong>{simulationResults.secondarySuccess + simulationResults.tertiarySuccess} transações</strong>, elevando a taxa de conversão final de <strong>{simulationResults.withoutFailoverSuccessRate}%</strong> para <strong>{simulationResults.overallSuccessRate}%</strong>, blindando um faturamento de <strong>R$ {simulationResults.revenueProtectedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> sem intervenção manual.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
