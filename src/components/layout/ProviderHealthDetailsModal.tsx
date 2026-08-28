import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Calendar, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  Server, 
  ShieldAlert, 
  Check,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { Acquirer } from '../../types/payment';

interface ProviderHealthDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderDetailData {
  id: string;
  name: string;
  category: 'Acquirer' | 'Instant Payment' | 'Global Processor' | 'Banking As A Service';
  currentLatency: number;
  uptime24h: number;
  uptime7d: number;
  errorRate: number;
  slaTarget: number;
  failoverTarget: string;
  maintenanceWindows: {
    id: string;
    title: string;
    start: string;
    end: string;
    status: 'scheduled' | 'in_progress' | 'completed';
    impact: 'None (Zero-Downtime Hot Failover)' | 'Low (Pix Fallback)' | 'Moderate (Card Retries)';
    description: string;
    affectedRoutes: string[];
  }[];
  healthHistory: { time: string; latency: number; status: 'ok' | 'degraded' | 'down' }[];
  pciStatus: string;
}

const PROVIDER_ENRICHED_DATA: Record<string, ProviderDetailData> = {
  stone: {
    id: 'stone',
    name: 'Stone Gateway',
    category: 'Acquirer',
    currentLatency: 18,
    uptime24h: 99.99,
    uptime7d: 99.98,
    errorRate: 0.12,
    slaTarget: 99.95,
    failoverTarget: 'Cielo 3.0 (Backup Automático)',
    pciStatus: 'PCI-DSS 4.0 Validado',
    maintenanceWindows: [
      {
        id: 'maint_st_1',
        title: 'Atualização de Firmware HSM de Criptografia',
        start: '2026-08-30 02:00 BRT',
        end: '2026-08-30 03:30 BRT',
        status: 'scheduled',
        impact: 'None (Zero-Downtime Hot Failover)',
        description: 'Upgrade preventivo de segurança no cluster de chaves de tokenização da adquirente.',
        affectedRoutes: ['Cartão de Crédito Nacional', 'Antifraude Stone']
      }
    ],
    healthHistory: [
      { time: '04:00', latency: 16, status: 'ok' },
      { time: '08:00', latency: 18, status: 'ok' },
      { time: '12:00', latency: 24, status: 'ok' },
      { time: '16:00', latency: 19, status: 'ok' },
      { time: '20:00', latency: 17, status: 'ok' },
      { time: 'Agora', latency: 18, status: 'ok' }
    ]
  },
  cielo: {
    id: 'cielo',
    name: 'Cielo 3.0 API',
    category: 'Acquirer',
    currentLatency: 28,
    uptime24h: 99.97,
    uptime7d: 99.94,
    errorRate: 0.45,
    slaTarget: 99.90,
    failoverTarget: 'Stone Gateway (Hot Standby)',
    pciStatus: 'PCI-DSS Level 1 Certificado',
    maintenanceWindows: [
      {
        id: 'maint_ci_1',
        title: 'Manutenção Periódica de Roteamento 3DS 2.2',
        start: '2026-09-05 03:00 BRT',
        end: '2026-09-05 04:00 BRT',
        status: 'scheduled',
        impact: 'Low (Pix Fallback)',
        description: 'Otimização de rotas com emissores Bradesco, BB e Caixa para redução de fricção 3DS.',
        affectedRoutes: ['3D-Secure 2.0', 'Débito Online']
      }
    ],
    healthHistory: [
      { time: '04:00', latency: 25, status: 'ok' },
      { time: '08:00', latency: 29, status: 'ok' },
      { time: '12:00', latency: 34, status: 'ok' },
      { time: '16:00', latency: 28, status: 'ok' },
      { time: '20:00', latency: 26, status: 'ok' },
      { time: 'Agora', latency: 28, status: 'ok' }
    ]
  },
  adyen: {
    id: 'adyen',
    name: 'Adyen Global',
    category: 'Global Processor',
    currentLatency: 42,
    uptime24h: 100.0,
    uptime7d: 99.99,
    errorRate: 0.05,
    slaTarget: 99.99,
    failoverTarget: 'Stripe International',
    pciStatus: 'PCI-DSS Level 1 / SOC 2 Type II',
    maintenanceWindows: [],
    healthHistory: [
      { time: '04:00', latency: 39, status: 'ok' },
      { time: '08:00', latency: 41, status: 'ok' },
      { time: '12:00', latency: 45, status: 'ok' },
      { time: '16:00', latency: 43, status: 'ok' },
      { time: '20:00', latency: 40, status: 'ok' },
      { time: 'Agora', latency: 42, status: 'ok' }
    ]
  },
  pix_spi: {
    id: 'pix_spi',
    name: 'BACEN SPI Pix Direto',
    category: 'Instant Payment',
    currentLatency: 12,
    uptime24h: 99.995,
    uptime7d: 99.992,
    errorRate: 0.02,
    slaTarget: 99.99,
    failoverTarget: 'Mercado Pago Pix / Asaas Backup',
    pciStatus: 'Bacen DICT & RSFN Compliance',
    maintenanceWindows: [
      {
        id: 'maint_spi_1',
        title: 'Janela Técnica Regular Banco Central do Brasil (RSFN)',
        start: '2026-09-12 00:30 BRT',
        end: '2026-09-12 01:15 BRT',
        status: 'scheduled',
        impact: 'None (Zero-Downtime Hot Failover)',
        description: 'Sincronização de certificados ICP-Brasil de participantes diretos do SPI.',
        affectedRoutes: ['DICT API', 'SPI Mensageria ISO 20022']
      }
    ],
    healthHistory: [
      { time: '04:00', latency: 10, status: 'ok' },
      { time: '08:00', latency: 12, status: 'ok' },
      { time: '12:00', latency: 15, status: 'ok' },
      { time: '16:00', latency: 13, status: 'ok' },
      { time: '20:00', latency: 11, status: 'ok' },
      { time: 'Agora', latency: 12, status: 'ok' }
    ]
  },
  mercadopago: {
    id: 'mercadopago',
    name: 'Mercado Pago Gateway',
    category: 'Acquirer',
    currentLatency: 22,
    uptime24h: 99.96,
    uptime7d: 99.92,
    errorRate: 0.28,
    slaTarget: 99.90,
    failoverTarget: 'Stone Gateway',
    pciStatus: 'PCI-DSS Level 1 Certificado',
    maintenanceWindows: [],
    healthHistory: [
      { time: '04:00', latency: 20, status: 'ok' },
      { time: '08:00', latency: 22, status: 'ok' },
      { time: '12:00', latency: 28, status: 'ok' },
      { time: '16:00', latency: 24, status: 'ok' },
      { time: '20:00', latency: 21, status: 'ok' },
      { time: 'Agora', latency: 22, status: 'ok' }
    ]
  },
  asaas: {
    id: 'asaas',
    name: 'Asaas Finanças & Boletos',
    category: 'Banking As A Service',
    currentLatency: 31,
    uptime24h: 99.95,
    uptime7d: 99.91,
    errorRate: 0.35,
    slaTarget: 99.85,
    failoverTarget: 'Stone Boleto / Pix SPI',
    pciStatus: 'Instituição de Pagamento Autorizada Bacen',
    maintenanceWindows: [
      {
        id: 'maint_as_1',
        title: 'Manutenção de Grade de Registro CIP Boletos',
        start: '2026-09-02 23:00 BRT',
        end: '2026-09-03 00:30 BRT',
        status: 'scheduled',
        impact: 'Low (Pix Fallback)',
        description: 'Ajuste de fila assíncrona para geração de PDF de boletos registrados e DDA.',
        affectedRoutes: ['Boletos Híbridos Pix', 'Webhooks de Notificação']
      }
    ],
    healthHistory: [
      { time: '04:00', latency: 29, status: 'ok' },
      { time: '08:00', latency: 31, status: 'ok' },
      { time: '12:00', latency: 38, status: 'ok' },
      { time: '16:00', latency: 33, status: 'ok' },
      { time: '20:00', latency: 30, status: 'ok' },
      { time: 'Agora', latency: 31, status: 'ok' }
    ]
  }
};

export const ProviderHealthDetailsModal: React.FC<ProviderHealthDetailsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { acquirers, toggleCircuitBreaker, updateAcquirerHealth } = usePayment();
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>('stone');
  const [pingingProviderId, setPingingProviderId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<Record<string, { latency: number; timestamp: string }>>({});

  if (!isOpen) return null;

  const handlePingProvider = (providerId: string) => {
    setPingingProviderId(providerId);
    setTimeout(() => {
      const simulatedLatency = 12 + Math.floor(Math.random() * 25);
      setPingResult(prev => ({
        ...prev,
        [providerId]: {
          latency: simulatedLatency,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        }
      }));
      setPingingProviderId(null);
    }, 600);
  };

  const toggleExpand = (id: string) => {
    setExpandedProviderId(prev => (prev === id ? null : id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Monitor de Saúde dos Provedores & Janelas de Manutenção</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Alta Disponibilidade (99.98% Global)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Telemetria em tempo real, histórico de latência e cronograma de manutenções programadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Provider Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {acquirers.map((acquirer) => {
              const enriched = PROVIDER_ENRICHED_DATA[acquirer.id] || {
                id: acquirer.id,
                name: acquirer.name,
                category: 'Acquirer',
                currentLatency: Math.round(acquirer.latencyAvgMs),
                uptime24h: 99.95,
                uptime7d: 99.92,
                errorRate: acquirer.errorRate1m,
                slaTarget: 99.90,
                failoverTarget: 'Stone Gateway (Automático)',
                pciStatus: 'PCI-DSS Certificado',
                maintenanceWindows: [],
                healthHistory: [
                  { time: '04:00', latency: 20, status: 'ok' },
                  { time: '08:00', latency: 24, status: 'ok' },
                  { time: '12:00', latency: 28, status: 'ok' },
                  { time: '16:00', latency: 22, status: 'ok' },
                  { time: 'Agora', latency: Math.round(acquirer.latencyAvgMs), status: 'ok' }
                ]
              };

              const isExpanded = expandedProviderId === acquirer.id;
              const isHealthy = acquirer.healthStatus === 'up' && !acquirer.circuitBreakerTripped;
              const livePing = pingResult[acquirer.id];

              return (
                <div
                  key={acquirer.id}
                  className={`rounded-2xl border transition-all ${
                    isHealthy
                      ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-850'
                      : 'border-amber-300 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20'
                  } shadow-sm overflow-hidden`}
                >
                  {/* Provider Card Top Summary Bar (Clickable) */}
                  <div
                    onClick={() => toggleExpand(acquirer.id)}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
                        isHealthy ? 'bg-slate-900 dark:bg-slate-800' : 'bg-amber-600'
                      }`}>
                        {acquirer.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {acquirer.name}
                          </h4>
                          <span className="rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {enriched.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isHealthy
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {isHealthy ? '100% Operacional' : 'Degradado / Alerta'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Taxa de Erro: <span className="font-semibold text-slate-700 dark:text-slate-300">{acquirer.errorRate1m}%</span> • Uptime 24h: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{enriched.uptime24h}%</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Metrics & Expand Indicator */}
                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono text-xs">
                        <span className="text-[10px] uppercase text-slate-400 block font-sans">Latência Média</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {livePing ? `${livePing.latency}ms (Live)` : `${Math.round(acquirer.latencyAvgMs)}ms`}
                        </span>
                      </div>

                      <div className="text-right font-mono text-xs hidden sm:block">
                        <span className="text-[10px] uppercase text-slate-400 block font-sans">SLA Alvo</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {enriched.slaTarget}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="text-xs font-semibold hidden md:inline">
                          {isExpanded ? 'Recolher' : 'Ver Detalhes'}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-4 animate-fade-in">
                      {/* Sub-grid 1: Telemetry & Circuit Breaker */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-850">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Rota de Failover Automático</span>
                          <p className="mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span>{enriched.failoverTarget}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Acionamento em caso de 3 timeouts seguidos ou circuit breaker.
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-850">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Conformidade e Certificação</span>
                          <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{enriched.pciStatus}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Criptografia TLS 1.3 ponta a ponta com certificados rotativos.
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-850 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Teste de Conectividade</span>
                            {livePing && (
                              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                {livePing.latency}ms @ {livePing.timestamp}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePingProvider(acquirer.id);
                              }}
                              disabled={pingingProviderId === acquirer.id}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all"
                            >
                              <RefreshCw className={`h-3 w-3 ${pingingProviderId === acquirer.id ? 'animate-spin' : ''}`} />
                              <span>{pingingProviderId === acquirer.id ? 'Pingando...' : 'Testar Ping'}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCircuitBreaker(acquirer.id);
                              }}
                              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                                acquirer.circuitBreakerTripped
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {acquirer.circuitBreakerTripped ? 'Reativar' : 'Cortar Tráfego'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sub-grid 2: Latency History Timeline */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-850">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Histórico de Latência (Últimas 24 Horas)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Amostragem a cada 4h • Média 7D: {enriched.uptime7d}%
                          </span>
                        </div>

                        <div className="grid grid-cols-6 gap-2">
                          {enriched.healthHistory.map((h, i) => (
                            <div key={i} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/60">
                              <span className="text-[10px] text-slate-400 block font-mono">{h.time}</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                                {h.latency}ms
                              </span>
                              <div className="mt-1 flex justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-grid 3: Maintenance Windows Calendar */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-850">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            <span>Janelas de Manutenção Programadas ({enriched.maintenanceWindows.length})</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Failover Ativo em Todas as Janelas
                          </span>
                        </div>

                        {enriched.maintenanceWindows.length === 0 ? (
                          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Nenhuma janela de manutenção agendada para os próximos 30 dias. Sistema em estabilidade plena.</span>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {enriched.maintenanceWindows.map((mw) => (
                              <div
                                key={mw.id}
                                className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs dark:border-amber-900/60 dark:bg-amber-950/30"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {mw.title}
                                    </span>
                                  </div>
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
                                    {mw.impact}
                                  </span>
                                </div>

                                <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {mw.description}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center justify-between border-t border-amber-200/50 pt-1.5 text-[10px] text-slate-500 dark:border-amber-900/40 dark:text-slate-400">
                                  <span>Horário: <strong>{mw.start}</strong> até <strong>{mw.end}</strong></span>
                                  <span>Rotas: {(mw.affectedRoutes || []).join(', ')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Monitoramento Sintético a cada 10s via gRPC Heartbeat</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
          >
            Fechar Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
