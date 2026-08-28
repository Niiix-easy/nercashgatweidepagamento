import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCw, 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  Globe, 
  Server, 
  Terminal, 
  Cpu, 
  Layers, 
  Check, 
  Clock, 
  TrendingUp, 
  Eye, 
  ArrowRight,
  ShieldX,
  Radio
} from 'lucide-react';

interface EndpointRateLimit {
  endpoint: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT';
  description: string;
  rpm: number;
  burst: number;
  enabled: boolean;
  sensitive: boolean;
}

interface IpRule {
  id: string;
  ip: string;
  type: 'whitelist' | 'blocklist';
  reason: string;
  addedAt: string;
}

export const RateLimitManagement: React.FC = () => {
  const { currentTenant, tenants, setCurrentTenant, addAuditLog } = usePayment();

  // Tier Presets
  const [selectedTier, setSelectedTier] = useState<'starter' | 'growth' | 'enterprise' | 'custom'>('growth');
  
  // Global Quota Settings
  const [globalRpm, setGlobalRpm] = useState<number>(600);
  const [burstCapacity, setBurstCapacity] = useState<number>(50);
  const [algorithm, setAlgorithm] = useState<'token_bucket' | 'sliding_window' | 'fixed_window'>('token_bucket');
  const [actionOnExceed, setActionOnExceed] = useState<'http_429' | 'soft_queue' | 'drop_rst'>('http_429');
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>(30);

  // Live Telemetry Simulation
  const [currentMinuteUsage, setCurrentMinuteUsage] = useState<number>(342);
  const [blockedToday, setBlockedToday] = useState<number>(18);
  const [secondsUntilReset, setSecondsUntilReset] = useState<number>(24);
  const [isSpikeSimulating, setIsSpikeSimulating] = useState<boolean>(false);
  const [spikeLog, setSpikeLog] = useState<{ id: string; time: string; ip: string; endpoint: string; status: number; message: string }[]>([]);
  const [simulated429Response, setSimulated429Response] = useState<any | null>(null);

  // Endpoint specific rules
  const [endpointRules, setEndpointRules] = useState<EndpointRateLimit[]>([
    {
      endpoint: '/v1/payment-intents',
      method: 'POST',
      description: 'Criação e autorização de pagamentos',
      rpm: 1200,
      burst: 80,
      enabled: true,
      sensitive: false
    },
    {
      endpoint: '/v1/refunds',
      method: 'POST',
      description: 'Estornos e devoluções imediatas (PIX/Cartão)',
      rpm: 60,
      burst: 10,
      enabled: true,
      sensitive: true
    },
    {
      endpoint: '/v1/risk/evaluate',
      method: 'POST',
      description: 'Score de risco e antifraude síncrono',
      rpm: 2500,
      burst: 150,
      enabled: true,
      sensitive: false
    },
    {
      endpoint: '/v1/webhooks',
      method: 'POST',
      description: 'Disparo de simulação e inscrição de endpoints',
      rpm: 300,
      burst: 30,
      enabled: true,
      sensitive: false
    },
    {
      endpoint: '/v1/customers',
      method: 'GET',
      description: 'Consulta de base e score de LTV de clientes',
      rpm: 800,
      burst: 60,
      enabled: true,
      sensitive: false
    }
  ]);

  // IP Rules
  const [ipRules, setIpRules] = useState<IpRule[]>([
    {
      id: 'ip_1',
      ip: '177.18.29.100/32',
      type: 'whitelist',
      reason: 'Gateway Central de E-commerce do Tenant (IP Dedicado)',
      addedAt: '2026-08-20'
    },
    {
      id: 'ip_2',
      ip: '45.154.255.88/32',
      type: 'blocklist',
      reason: 'Carding Botnet Detectada pelo ML Engine (150 req/s)',
      addedAt: '2026-08-26'
    }
  ]);
  const [newIpAddress, setNewIpAddress] = useState<string>('');
  const [newIpType, setNewIpType] = useState<'whitelist' | 'blocklist'>('blocklist');
  const [newIpReason, setNewIpReason] = useState<string>('');
  const [showAddIpModal, setShowAddIpModal] = useState<boolean>(false);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Live countdown and usage drift
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilReset(prev => (prev <= 1 ? 60 : prev - 1));
      if (Math.random() > 0.6) {
        setCurrentMinuteUsage(prev => Math.min(globalRpm + 10, prev + Math.floor(Math.random() * 3)));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [globalRpm]);

  // Tier switch handler
  const handleTierChange = (tier: 'starter' | 'growth' | 'enterprise' | 'custom') => {
    setSelectedTier(tier);
    if (tier === 'starter') {
      setGlobalRpm(60);
      setBurstCapacity(10);
      setRetryAfterSeconds(60);
    } else if (tier === 'growth') {
      setGlobalRpm(600);
      setBurstCapacity(50);
      setRetryAfterSeconds(30);
    } else if (tier === 'enterprise') {
      setGlobalRpm(5000);
      setBurstCapacity(300);
      setRetryAfterSeconds(10);
    }
  };

  // Endpoint RPM modifier
  const handleUpdateEndpointRpm = (endpoint: string, newRpm: number) => {
    setEndpointRules(prev => prev.map(r => r.endpoint === endpoint ? { ...r, rpm: newRpm } : r));
    setSelectedTier('custom');
  };

  const handleToggleEndpoint = (endpoint: string) => {
    setEndpointRules(prev => prev.map(r => r.endpoint === endpoint ? { ...r, enabled: !r.enabled } : r));
    setSelectedTier('custom');
  };

  // Save Policy
  const handleSavePolicy = () => {
    addAuditLog({
      action: 'RATE_LIMIT_POLICY_UPDATED',
      actor: 'Admin Nercash',
      target: `Tenant: ${currentTenant.name}`,
      details: `Nova política de Rate Limit salva: ${globalRpm} RPM, Burst ${burstCapacity}, Algoritmo: ${algorithm}`,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Nercash-Admin-Console',
      status: 'success'
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Export Policy JSON
  const handleExportPolicy = () => {
    const policy = {
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      exportedAt: new Date().toISOString(),
      tier: selectedTier,
      global: {
        rpm: globalRpm,
        burstCapacity,
        algorithm,
        actionOnExceed,
        retryAfterSeconds
      },
      endpoints: endpointRules,
      ipRules
    };

    const blob = new Blob([JSON.stringify(policy, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nercash_ratelimit_policy_${currentTenant.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add IP Rule
  const handleAddIpRule = () => {
    if (!newIpAddress.trim()) return;
    const newRule: IpRule = {
      id: `ip_${Date.now()}`,
      ip: newIpAddress.trim(),
      type: newIpType,
      reason: newIpReason || (newIpType === 'whitelist' ? 'Acesso confiável' : 'Bloqueio preventivo'),
      addedAt: new Date().toISOString().split('T')[0]
    };
    setIpRules(prev => [newRule, ...prev]);
    setNewIpAddress('');
    setNewIpReason('');
    setShowAddIpModal(false);

    addAuditLog({
      action: 'IP_ACCESS_RULE_CREATED',
      actor: 'Admin Nercash',
      target: `${newIpType.toUpperCase()}: ${newRule.ip}`,
      details: newRule.reason,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Nercash-Admin-Console',
      status: 'success'
    });
  };

  const handleDeleteIpRule = (id: string) => {
    setIpRules(prev => prev.filter(r => r.id !== id));
  };

  // Simulate High Velocity Attack / Quota Breach
  const handleSimulateSpikeAttack = () => {
    setIsSpikeSimulating(true);
    setSimulated429Response(null);
    setCurrentMinuteUsage(globalRpm + 45); // Force over quota
    setBlockedToday(prev => prev + 12);

    const timeStr = new Date().toLocaleTimeString('pt-BR');
    const newLogs = [
      { id: '1', time: timeStr, ip: '185.220.101.5', endpoint: '/v1/payment-intents', status: 200, message: 'Request permitida (Token Bucket: 4 tokens restantes)' },
      { id: '2', time: timeStr, ip: '185.220.101.5', endpoint: '/v1/payment-intents', status: 200, message: 'Request permitida (Token Bucket: 1 token restante)' },
      { id: '3', time: timeStr, ip: '185.220.101.5', endpoint: '/v1/payment-intents', status: 429, message: 'QUOTA EXCEDIDA: 429 Too Many Requests (Retry-After: 30s)' },
      { id: '4', time: timeStr, ip: '185.220.101.5', endpoint: '/v1/refunds', status: 429, message: 'QUOTA EXCEDIDA: Interceptado pelo Gateway Ingress Nercash' },
      { id: '5', time: timeStr, ip: '185.220.101.5', endpoint: '/v1/payment-intents', status: 429, message: 'QUOTA EXCEDIDA: IP colocado em quarentena temporária' }
    ];

    setSpikeLog(newLogs);

    setSimulated429Response({
      httpStatus: 429,
      statusText: 'Too Many Requests',
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': `${globalRpm}`,
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': `${Math.floor(Date.now() / 1000) + secondsUntilReset}`,
        'Retry-After': `${retryAfterSeconds}`,
        'X-Nercash-Trace-Id': `trace_429_${Date.now()}`
      },
      body: {
        error: {
          code: 'rate_limit_exceeded',
          message: `Global request quota of ${globalRpm} req/min exceeded for tenant '${currentTenant.id}'. Please throttle your client requests.`,
          current_usage: globalRpm + 45,
          limit: globalRpm,
          retry_after_seconds: retryAfterSeconds,
          doc_url: 'https://docs.nercash.com/v1/rate-limits'
        }
      }
    });

    setIsSpikeSimulating(false);
  };

  const usagePercentage = Math.min(100, Math.round((currentMinuteUsage / globalRpm) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner & Description */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Gestão de Rate Limiting & Prevenção de Abuso
              </h3>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Tenant: {currentTenant.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Defina cotas globais de requisições por minuto (RPM), limites de burst e regras de mitigação contra ataques de força bruta e DoS.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPolicy}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Exportar Política (JSON)</span>
          </button>

          <button
            onClick={handleSavePolicy}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
          >
            {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savedSuccess ? 'Política Salva!' : 'Salvar Política'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Live Telemetry & Quota Consumption */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Quota Consumed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Consumo no Minuto Atual</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              usagePercentage > 85 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
            }`}>
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentMinuteUsage} / {globalRpm}
            </span>
            <span className={`text-xs font-bold ${usagePercentage > 85 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
              {usagePercentage}%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage > 85 ? 'bg-rose-500' : usagePercentage > 60 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Reseta janela em <strong>{secondsUntilReset}s</strong> (Redis Sliding Log)
          </p>
        </div>

        {/* Card 2: Blocked Requests 429 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Requisições Bloqueadas (429)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ShieldX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {blockedToday}
            </span>
            <span className="text-xs font-semibold text-slate-400">bloqueios hoje</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Taxa de Rejeição por Quota: <strong>0.42%</strong> do tráfego total
          </p>
        </div>

        {/* Card 3: Burst Allowance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tolerância a Picos (Burst)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              +{burstCapacity} reqs
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">concorrentes</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Token Bucket capacidade máxima instantânea
          </p>
        </div>

        {/* Card 4: Algoritmo Ativo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Algoritmo de Rate Limiting</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block">
              {algorithm === 'token_bucket' ? 'Token Bucket (Recomendado)' : algorithm === 'sliding_window' ? 'Sliding Window Log' : 'Fixed Window Counter'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Distribuído via Redis Cluster (Latência &lt; 1ms)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Global Tier Config & Attack Simulator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Tier Selection & Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Configuração de Cotas Globais por Tenant</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Selecione um plano de cotas pré-configurado ou ajuste livremente os parâmetros operacionais.
            </p>

            {/* Tier Selector Chips */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
              {[
                { id: 'starter', name: 'Starter', desc: '60 req/min • 10 burst', tag: 'Desenvolvimento' },
                { id: 'growth', name: 'Growth', desc: '600 req/min • 50 burst', tag: 'Padrão Produção' },
                { id: 'enterprise', name: 'Enterprise', desc: '5.000 req/min • 300 burst', tag: 'Alta Escala' },
                { id: 'custom', name: 'Customizado', desc: `${globalRpm} req/min • ${burstCapacity} burst`, tag: 'Manual' }
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => handleTierChange(tier.id as any)}
                  className={`rounded-2xl border p-3.5 text-left transition-all ${
                    selectedTier === tier.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">{tier.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{tier.desc}</span>
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tier.tag}
                  </span>
                </button>
              ))}
            </div>

            {/* Slider 1: Global RPM */}
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Limite Global de Requisições por Minuto (RPM)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={globalRpm}
                    onChange={(e) => {
                      setGlobalRpm(Number(e.target.value) || 60);
                      setSelectedTier('custom');
                    }}
                    className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right font-mono text-xs font-bold text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
                  />
                  <span className="text-xs text-slate-400">RPM</span>
                </div>
              </div>
              <input
                type="range"
                min="60"
                max="10000"
                step="60"
                value={globalRpm}
                onChange={(e) => {
                  setGlobalRpm(Number(e.target.value));
                  setSelectedTier('custom');
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>60 RPM (Mínimo)</span>
                <span>2.500 RPM</span>
                <span>5.000 RPM</span>
                <span>10.000 RPM (VIP)</span>
              </div>
            </div>

            {/* Slider 2: Burst Capacity */}
            <div className="space-y-2 border-t border-slate-100 pt-4 mt-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Capacidade de Burst Instantâneo (Token Bucket)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={burstCapacity}
                    onChange={(e) => {
                      setBurstCapacity(Number(e.target.value) || 10);
                      setSelectedTier('custom');
                    }}
                    className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right font-mono text-xs font-bold text-amber-600 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400"
                  />
                  <span className="text-xs text-slate-400">reqs</span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={burstCapacity}
                onChange={(e) => {
                  setBurstCapacity(Number(e.target.value));
                  setSelectedTier('custom');
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Algorithm & Penalty Action Pickers */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4 mt-4 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Algoritmo de Rate Limiting
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="token_bucket">Token Bucket (Suavização com Burst)</option>
                  <option value="sliding_window">Sliding Window Log (Precisão Estrita)</option>
                  <option value="fixed_window">Fixed Window Counter (Simples)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Ação ao Exceder a Cota
                </label>
                <select
                  value={actionOnExceed}
                  onChange={(e) => setActionOnExceed(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="http_429">HTTP 429 Too Many Requests + Retry-After</option>
                  <option value="soft_queue">Soft-Throttle (Fila com delay de 250ms)</option>
                  <option value="drop_rst">Drop Conexão TCP (Anti-DDoS)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Endpoint Specific Quotas Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Limites Específicos por Endpoint / Rota da API</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rotas sensíveis (como estornos e pagamentos) podem possuir tetos independentes para proteção contra fraudes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                    <th className="py-2.5 px-3">Endpoint & Método</th>
                    <th className="py-2.5 px-3">Descrição da Rota</th>
                    <th className="py-2.5 px-3">Limite (RPM)</th>
                    <th className="py-2.5 px-3">Burst</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {endpointRules.map((rule) => (
                    <tr key={rule.endpoint} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={`inline-block mr-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          rule.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}>
                          {rule.method}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200">{rule.endpoint}</span>
                        {rule.sensitive && (
                          <span className="ml-1.5 rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Sensível
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {rule.description}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={rule.rpm}
                            onChange={(e) => handleUpdateEndpointRpm(rule.endpoint, Number(e.target.value))}
                            className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          />
                          <span className="text-[10px] text-slate-400">RPM</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        +{rule.burst}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleEndpoint(rule.endpoint)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                            rule.enabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {rule.enabled ? 'Ativo' : 'Bypass'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Spike Simulator & IP Access Rules */}
        <div className="space-y-6">
          {/* Abuse Spike Simulator */}
          <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/40 via-white to-orange-50/30 p-6 shadow-sm dark:border-rose-900/60 dark:from-rose-950/20 dark:via-slate-900 dark:to-orange-950/20">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
              <Zap className="h-5 w-5" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Simulador de Ataque & Teste 429
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Dispare um teste de carga massivo contra a API para validar a resposta do interceptador de Rate Limiting Nercash.
            </p>

            <button
              onClick={handleSimulateSpikeAttack}
              disabled={isSpikeSimulating}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-rose-500 active:scale-98 transition-all disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${isSpikeSimulating ? 'animate-spin' : ''}`} />
              <span>{isSpikeSimulating ? 'Disparando Carga...' : 'Simular Pico Abusivo (150 req/s)'}</span>
            </button>

            {/* Simulated RFC Response Preview */}
            {simulated429Response && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-slate-900 p-4 text-xs font-mono text-slate-200 shadow-inner dark:border-rose-900 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                  <span className="font-bold text-rose-400">
                    HTTP/1.1 {simulated429Response.httpStatus} {simulated429Response.statusText}
                  </span>
                  <span className="text-slate-400">Rate Limiter Intercept</span>
                </div>

                <div className="mt-2 space-y-1 text-[10px] text-slate-400">
                  <p><span className="text-indigo-400">X-RateLimit-Limit:</span> {simulated429Response.headers['X-RateLimit-Limit']}</p>
                  <p><span className="text-indigo-400">X-RateLimit-Remaining:</span> {simulated429Response.headers['X-RateLimit-Remaining']}</p>
                  <p><span className="text-indigo-400">Retry-After:</span> {simulated429Response.headers['Retry-After']}s</p>
                  <p><span className="text-indigo-400">X-Nercash-Trace-Id:</span> {simulated429Response.headers['X-Nercash-Trace-Id']}</p>
                </div>

                <pre className="mt-3 overflow-x-auto rounded-lg bg-black/50 p-2 text-[10px] text-emerald-400">
                  {JSON.stringify(simulated429Response.body, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* IP Access Control List (Whitelist & Blocklist) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Regras de IP (Whitelist / Blocklist)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  IPs em whitelist ignoram os limites de quota.
                </p>
              </div>

              <button
                onClick={() => setShowAddIpModal(true)}
                className="flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar IP</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {ipRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`rounded-2xl border p-3 text-xs transition-all ${
                    rule.type === 'whitelist'
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${rule.type === 'whitelist' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{rule.ip}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        rule.type === 'whitelist'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {rule.type}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteIpRule(rule.id)}
                      className="rounded p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remover regra"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {rule.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add IP Modal */}
      {showAddIpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Adicionar Nova Regra de IP
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">Endereço IP ou Bloco CIDR</label>
                <input
                  type="text"
                  placeholder="Ex: 200.189.40.10 ou 192.168.0.0/24"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">Tipo de Regra</label>
                <select
                  value={newIpType}
                  onChange={(e) => setNewIpType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="whitelist">Whitelist (Bypass total de rate limit)</option>
                  <option value="blocklist">Blocklist (Bloqueio total / 403 Forbidden)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-300 block mb-1 font-semibold">Motivo do Registro</label>
                <input
                  type="text"
                  placeholder="Ex: Servidor de aplicação principal do cliente"
                  value={newIpReason}
                  onChange={(e) => setNewIpReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddIpModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddIpRule}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500"
              >
                Salvar Regra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
