import React, { useState, useEffect, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import {
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Play,
  Pause,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Server,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Code,
  ShieldAlert,
  Activity,
  Layers,
  ChevronDown,
  Terminal,
  Send,
  Sparkles,
  Flame,
  CheckCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export interface ApiErrorRecord {
  id: string;
  provider: 'stone' | 'cielo' | 'rede' | 'mercadopago' | 'pix_spi' | 'adyen' | 'clearsale' | 'konduto';
  providerName: string;
  statusCode: number;
  statusText: string;
  type: '4xx' | '5xx';
  endpoint: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  timestamp: string;
  latencyMs: number;
  errorMessage: string;
  rootCause: string;
  suggestedAction: string;
  retryStatus: 'pending' | 'retrying' | 'resolved' | 'failed';
  retryCount: number;
  resolvedProvider?: string;
  resolvedLatencyMs?: number;
  idempotencyKey: string;
  requestHeaders: Record<string, string>;
  requestPayload: Record<string, any>;
  responseBody: Record<string, any>;
}

const INITIAL_ERROR_RECORDS: ApiErrorRecord[] = [
  {
    id: 'err_live_948201',
    provider: 'cielo',
    providerName: 'Cielo E-Commerce 3.0',
    statusCode: 504,
    statusText: 'Gateway Timeout',
    type: '5xx',
    endpoint: 'https://api.cieloecommerce.cielo.com.br/1/sales',
    method: 'POST',
    timestamp: new Date(Date.now() - 14 * 1000).toISOString(),
    latencyMs: 12450,
    errorMessage: 'Upstream gateway timeout: Cielo Authorization Core did not respond within 12000ms threshold.',
    rootCause: 'Instabilidade transitória no Switch Autorizador Visa/Mastercard da adquirente Cielo.',
    suggestedAction: 'Executar retry automático chaveando roteamento para Stone ou Rede.',
    retryStatus: 'pending',
    retryCount: 0,
    idempotencyKey: 'idemp_cielo_948201_84820',
    requestHeaders: {
      'Content-Type': 'application/json',
      'MerchantId': 'e84b9012-cielo-prod-2026',
      'MerchantKey': 'sk_live_cielo_sec_****************',
      'Idempotency-Key': 'idemp_cielo_948201_84820',
      'X-Trace-Id': 'nercash_trace_948201_01'
    },
    requestPayload: {
      MerchantOrderId: 'ord_nercash_2026_9482',
      Customer: {
        Name: 'Thiago Alcantara Ribeiro',
        Email: 'thiago.alcantara@gmail.com',
        Identity: '348.910.238-19'
      },
      Payment: {
        Type: 'CreditCard',
        Amount: 48900,
        Installments: 3,
        CreditCard: {
          CardNumber: '401200******8891',
          Holder: 'THIAGO A RIBEIRO',
          ExpirationDate: '09/2028',
          Brand: 'Visa'
        }
      }
    },
    responseBody: {
      Code: '504',
      Message: 'Gateway Timeout from host 10.240.18.91: Operation timed out waiting for issuer socket response.',
      Timestamp: new Date(Date.now() - 14 * 1000).toISOString()
    }
  },
  {
    id: 'err_live_948202',
    provider: 'stone',
    providerName: 'Stone Pagamentos Gateway',
    statusCode: 429,
    statusText: 'Too Many Requests',
    type: '4xx',
    endpoint: 'https://api.stone.com.br/v2/charges',
    method: 'POST',
    timestamp: new Date(Date.now() - 48 * 1000).toISOString(),
    latencyMs: 145,
    errorMessage: 'Rate limit exceeded: Tenant exceeded quota of 800 req/sec on Stone Production tier.',
    rootCause: 'Disparo concentrado de transações em flash sale ultrapassando a taxa contratada por segundo.',
    suggestedAction: 'Aplicar token bucket rate limiter local e acionar buffer assíncrono.',
    retryStatus: 'pending',
    retryCount: 0,
    idempotencyKey: 'idemp_stone_948202_7482',
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer sk_live_stone_****************',
      'Idempotency-Key': 'idemp_stone_948202_7482'
    },
    requestPayload: {
      amount: 19990,
      currency: 'BRL',
      payment_method: 'credit_card',
      capture: true,
      metadata: { campaign: 'flash_sale_summer' }
    },
    responseBody: {
      error: 'rate_limit_exceeded',
      message: 'Rate limit threshold (800 req/s) exceeded. Retry-After: 2s',
      retry_after: 2
    }
  },
  {
    id: 'err_live_948203',
    provider: 'pix_spi',
    providerName: 'Banco Central do Brasil (SPI / DICT)',
    statusCode: 503,
    statusText: 'Service Unavailable',
    type: '5xx',
    endpoint: 'https://spi.bcb.gov.br/api/v2/pix/cob',
    method: 'POST',
    timestamp: new Date(Date.now() - 95 * 1000).toISOString(),
    latencyMs: 3400,
    errorMessage: 'BACEN SPI SPI_ERROR_TIMEOUT: Janela de liquidação instantânea indisponível no PSP emissor.',
    rootCause: 'PSP participante do DICT em janela de manutenção programada noturna.',
    suggestedAction: 'Regerar cobrança Pix através do PSP de contingência bancária (Itaú SPI).',
    retryStatus: 'resolved',
    retryCount: 1,
    resolvedProvider: 'Mercado Pago Pix SPI Backup',
    resolvedLatencyMs: 280,
    idempotencyKey: 'idemp_pix_948203_bcb',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-Certificate-Thumbprint': 'ICP_BRASIL_A3_NERCASH_VAULT_2026',
      'Idempotency-Key': 'idemp_pix_948203_bcb'
    },
    requestPayload: {
      calendario: { expiracao: 3600 },
      devedor: { cpf: '12345678909', nome: 'Mariana Souza' },
      valor: { original: '150.00' },
      chave: 'financeiro@nercash.com.br'
    },
    responseBody: {
      type: 'https://pix.bcb.gov.br/erro/503',
      title: 'Serviço Indisponível no PSP Conectado',
      status: 503,
      detail: 'O participante direto está temporariamente fora de operação no SPI.'
    }
  },
  {
    id: 'err_live_948204',
    provider: 'rede',
    providerName: 'Rede Itaú e-Rede',
    statusCode: 422,
    statusText: 'Unprocessable Entity',
    type: '4xx',
    endpoint: 'https://api.userede.com.br/v1/transactions',
    method: 'POST',
    timestamp: new Date(Date.now() - 140 * 1000).toISOString(),
    latencyMs: 320,
    errorMessage: 'Card invalid: BIN range not supported by current sub-merchant acquiring contract.',
    rootCause: 'Tentativa de cobrança de cartão internacional corporativo em terminal sem habilitação Cross-Border.',
    suggestedAction: 'Rotear automaticamente via Adyen Global Acquiring.',
    retryStatus: 'pending',
    retryCount: 0,
    idempotencyKey: 'idemp_rede_948204_4812',
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic cmVkZV91c2VyXzIwMjY6c2tfbGl2ZV8qKioq',
      'Idempotency-Key': 'idemp_rede_948204_4812'
    },
    requestPayload: {
      capture: true,
      kind: 'credit',
      reference: 'ref_nercash_corp_9941',
      amount: 125000,
      cardNumber: '510510******1190'
    },
    responseBody: {
      returnCode: '105',
      returnMessage: 'Cross-border BIN processing not authorized for merchant MCC 5734.'
    }
  },
  {
    id: 'err_live_948205',
    provider: 'mercadopago',
    providerName: 'Mercado Pago Gateway',
    statusCode: 500,
    statusText: 'Internal Server Error',
    type: '5xx',
    endpoint: 'https://api.mercadopago.com/v1/payments',
    method: 'POST',
    timestamp: new Date(Date.now() - 210 * 1000).toISOString(),
    latencyMs: 4100,
    errorMessage: 'Internal Server Error: DB connection pool exhausted on Mercado Pago cluster.',
    rootCause: 'Pico de tráfego interno na infraestrutura Mercado Pago.',
    suggestedAction: 'Circuit breaker acionado. Ativar fallback dinâmico para Stone.',
    retryStatus: 'resolved',
    retryCount: 1,
    resolvedProvider: 'Stone Pagamentos Gateway',
    resolvedLatencyMs: 195,
    idempotencyKey: 'idemp_mp_948205_5510',
    requestHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer APP_USR_mp_live_****************',
      'Idempotency-Key': 'idemp_mp_948205_5510'
    },
    requestPayload: {
      transaction_amount: 320.50,
      token: 'tok_card_mp_948205',
      description: 'Plano Pro Anual',
      installments: 1
    },
    responseBody: {
      status: 500,
      error: 'internal_error',
      message: 'Unexpected database lock in payment processing engine'
    }
  },
  {
    id: 'err_live_948206',
    provider: 'adyen',
    providerName: 'Adyen Global Payments',
    statusCode: 401,
    statusText: 'Unauthorized',
    type: '4xx',
    endpoint: 'https://checkout-test.adyen.com/v70/payments',
    method: 'POST',
    timestamp: new Date(Date.now() - 320 * 1000).toISOString(),
    latencyMs: 95,
    errorMessage: 'Invalid API Key: Authentication credentials expired or IP not in whitelist.',
    rootCause: 'Chave de API Adyen renovada recentemente sem atualização da chave no cofre do tenant.',
    suggestedAction: 'Atualizar token de autenticação no cofre de credenciais e sincronizar.',
    retryStatus: 'pending',
    retryCount: 0,
    idempotencyKey: 'idemp_adyen_948206_1189',
    requestHeaders: {
      'Content-Type': 'application/json',
      'X-API-Key': 'AQEyhmfxLIj...exp_2026',
      'Idempotency-Key': 'idemp_adyen_948206_1189'
    },
    requestPayload: {
      amount: { currency: 'USD', value: 8900 },
      reference: 'ord_global_adyen_2026',
      merchantAccount: 'NercashEcomBR'
    },
    responseBody: {
      status: 401,
      errorCode: '000',
      message: 'HTTP Status 401 Unauthorized - Invalid API Credential'
    }
  }
];

export const LiveApiErrorMonitor: React.FC = () => {
  const { acquirers, addAuditLog } = usePayment();
  const [errorRecords, setErrorRecords] = useState<ApiErrorRecord[]>(INITIAL_ERROR_RECORDS);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | '4xx' | '5xx'>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterRetryStatus, setFilterRetryStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active payload inspector modal
  const [inspectedError, setInspectedError] = useState<ApiErrorRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live simulation ticker: generates random errors when streaming is active
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 30% chance every 8 seconds to capture an error
      if (Math.random() > 0.65) {
        const providers = [
          { key: 'cielo', name: 'Cielo E-Commerce 3.0', code: 504, text: 'Gateway Timeout', type: '5xx' as const, latency: 12100 },
          { key: 'stone', name: 'Stone Pagamentos Gateway', code: 429, text: 'Too Many Requests', type: '4xx' as const, latency: 130 },
          { key: 'rede', name: 'Rede Itaú e-Rede', code: 502, text: 'Bad Gateway', type: '5xx' as const, latency: 4800 },
          { key: 'pix_spi', name: 'Banco Central do Brasil (SPI / DICT)', code: 503, text: 'Service Unavailable', type: '5xx' as const, latency: 3100 },
          { key: 'mercadopago', name: 'Mercado Pago Gateway', code: 422, text: 'Unprocessable Entity', type: '4xx' as const, latency: 290 }
        ];

        const chosen = providers[Math.floor(Math.random() * providers.length)];
        const newRecord: ApiErrorRecord = {
          id: `err_live_${Date.now().toString().slice(-6)}`,
          provider: chosen.key as any,
          providerName: chosen.name,
          statusCode: chosen.code,
          statusText: chosen.text,
          type: chosen.type,
          endpoint: `https://api.${chosen.key}.com.br/v2/transactions`,
          method: 'POST',
          timestamp: new Date().toISOString(),
          latencyMs: chosen.latency + Math.floor(Math.random() * 200),
          errorMessage: `Falha capturada em tempo real na API ${chosen.name}: HTTP ${chosen.code} ${chosen.text}`,
          rootCause: `Instabilidade detectada nos endpoints da adquirente externa (${chosen.name}).`,
          suggestedAction: 'Executar retry imediato com fallback para rota de contingência.',
          retryStatus: 'pending',
          retryCount: 0,
          idempotencyKey: `idemp_${chosen.key}_${Date.now()}`,
          requestHeaders: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer sk_live_${chosen.key}_****************`,
            'Idempotency-Key': `idemp_${chosen.key}_${Date.now()}`
          },
          requestPayload: {
            amount: Math.floor(Math.random() * 50000) + 1000,
            currency: 'BRL',
            customer: { name: 'Comprador Simulado', email: 'cliente@live.com.br' },
            payment_method: 'credit_card'
          },
          responseBody: {
            code: chosen.code,
            error: chosen.text,
            message: `External upstream provider returned HTTP ${chosen.code}`
          }
        };

        setErrorRecords(prev => [newRecord, ...prev.slice(0, 49)]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Handle single payload retry
  const handleRetryPayload = async (errorId: string, fallbackProvider?: string) => {
    const target = errorRecords.find(e => e.id === errorId);
    if (!target) return;

    // Set state to retrying
    setErrorRecords(prev => prev.map(e => e.id === errorId ? { ...e, retryStatus: 'retrying' } : e));

    // Simulate network retry
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const selectedFallback = fallbackProvider || (target.provider === 'cielo' ? 'Stone Pagamentos Gateway' : target.provider === 'stone' ? 'Rede Itaú e-Rede' : 'Adyen Global Payments');
    const fallbackLatency = 160 + Math.floor(Math.random() * 90);

    setErrorRecords(prev => prev.map(e => {
      if (e.id === errorId) {
        return {
          ...e,
          retryStatus: 'resolved',
          retryCount: e.retryCount + 1,
          resolvedProvider: selectedFallback,
          resolvedLatencyMs: fallbackLatency
        };
      }
      return e;
    }));

    if (inspectedError && inspectedError.id === errorId) {
      setInspectedError(prev => prev ? {
        ...prev,
        retryStatus: 'resolved',
        retryCount: prev.retryCount + 1,
        resolvedProvider: selectedFallback,
        resolvedLatencyMs: fallbackLatency
      } : null);
    }

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'FAILED_PAYLOAD_RETRIED',
      category: 'orchestration',
      resourceType: 'ApiErrorRecord',
      resourceId: errorId,
      status: 'success',
      severity: 'low',
      details: `Payload de erro (${target.statusCode} na ${target.providerName}) reenviado com sucesso via ${selectedFallback} (${fallbackLatency}ms).`
    });

    setToastMessage(`Payload ${errorId} reenviado com sucesso via ${selectedFallback} (${fallbackLatency}ms)!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle bulk retry of all pending errors
  const handleBulkRetryAll = async () => {
    const pendingItems = errorRecords.filter(e => e.retryStatus === 'pending');
    if (pendingItems.length === 0) return;

    setErrorRecords(prev => prev.map(e => e.retryStatus === 'pending' ? { ...e, retryStatus: 'retrying' } : e));
    await new Promise(r => setTimeout(r, 1200));

    setErrorRecords(prev => prev.map(e => {
      if (e.retryStatus === 'retrying') {
        return {
          ...e,
          retryStatus: 'resolved',
          retryCount: e.retryCount + 1,
          resolvedProvider: 'Multi-Acquirer Contingency Cluster',
          resolvedLatencyMs: 190
        };
      }
      return e;
    }));

    setToastMessage(`${pendingItems.length} payloads com falha foram reprocessados e resolvidos!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manual Trigger to simulate specific error scenario
  const handleSimulateCustomError = (type: '504_cielo' | '429_stone' | '503_spi') => {
    let newRec: ApiErrorRecord;
    if (type === '504_cielo') {
      newRec = {
        id: `err_cielo_${Date.now().toString().slice(-6)}`,
        provider: 'cielo',
        providerName: 'Cielo E-Commerce 3.0',
        statusCode: 504,
        statusText: 'Gateway Timeout',
        type: '5xx',
        endpoint: 'https://api.cieloecommerce.cielo.com.br/1/sales',
        method: 'POST',
        timestamp: new Date().toISOString(),
        latencyMs: 12050,
        errorMessage: 'HTTP 504 Gateway Timeout: Tempo limite de 12s excedido sem resposta do autorizador.',
        rootCause: 'Queda de conexão no barramento principal de cartões da Cielo.',
        suggestedAction: 'Roteamento contingencial imediato para Stone ou Rede.',
        retryStatus: 'pending',
        retryCount: 0,
        idempotencyKey: `idemp_cielo_${Date.now()}`,
        requestHeaders: { 'Content-Type': 'application/json', 'Idempotency-Key': `idemp_cielo_${Date.now()}` },
        requestPayload: { amount: 89000, method: 'credit_card', installments: 6 },
        responseBody: { error: 'Gateway Timeout', status: 504 }
      };
    } else if (type === '429_stone') {
      newRec = {
        id: `err_stone_${Date.now().toString().slice(-6)}`,
        provider: 'stone',
        providerName: 'Stone Pagamentos Gateway',
        statusCode: 429,
        statusText: 'Too Many Requests',
        type: '4xx',
        endpoint: 'https://api.stone.com.br/v2/charges',
        method: 'POST',
        timestamp: new Date().toISOString(),
        latencyMs: 110,
        errorMessage: 'HTTP 429 Too Many Requests: Limite de requisições concorrentes atingido.',
        rootCause: 'Rajada de tráfego instantânea em concorrência alta.',
        suggestedAction: 'Ativar backoff exponencial e enfileiramento inteligente.',
        retryStatus: 'pending',
        retryCount: 0,
        idempotencyKey: `idemp_stone_${Date.now()}`,
        requestHeaders: { 'Content-Type': 'application/json', 'Idempotency-Key': `idemp_stone_${Date.now()}` },
        requestPayload: { amount: 25000, method: 'pix' },
        responseBody: { error: 'rate_limit_exceeded', limit: 800 }
      };
    } else {
      newRec = {
        id: `err_spi_${Date.now().toString().slice(-6)}`,
        provider: 'pix_spi',
        providerName: 'Banco Central do Brasil (SPI / DICT)',
        statusCode: 503,
        statusText: 'Service Unavailable',
        type: '5xx',
        endpoint: 'https://spi.bcb.gov.br/api/v2/pix/cob',
        method: 'POST',
        timestamp: new Date().toISOString(),
        latencyMs: 3100,
        errorMessage: 'HTTP 503 Service Unavailable: Indisponibilidade temporária na rede DICT.',
        rootCause: 'Manutenção periódica de nós no Banco Central.',
        suggestedAction: 'Regerar cobrança Pix via PSP parceiro secundário.',
        retryStatus: 'pending',
        retryCount: 0,
        idempotencyKey: `idemp_spi_${Date.now()}`,
        requestHeaders: { 'Content-Type': 'application/json', 'Idempotency-Key': `idemp_spi_${Date.now()}` },
        requestPayload: { valor: { original: '450.00' }, chave: 'pix@empresa.com.br' },
        responseBody: { status: 503, title: 'DICT Offline' }
      };
    }

    setErrorRecords(prev => [newRec, ...prev]);
    setToastMessage(`Erro simulado capturado: HTTP ${newRec.statusCode} na ${newRec.providerName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered List
  const filteredRecords = useMemo(() => {
    return errorRecords.filter(rec => {
      if (filterType !== 'all' && rec.type !== filterType) return false;
      if (filterProvider !== 'all' && rec.provider !== filterProvider) return false;
      if (filterRetryStatus !== 'all' && rec.retryStatus !== filterRetryStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          rec.id.toLowerCase().includes(q) ||
          rec.providerName.toLowerCase().includes(q) ||
          rec.statusCode.toString().includes(q) ||
          rec.statusText.toLowerCase().includes(q) ||
          rec.endpoint.toLowerCase().includes(q) ||
          rec.errorMessage.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [errorRecords, filterType, filterProvider, filterRetryStatus, searchQuery]);

  // Aggregate Metrics
  const totalErrors = errorRecords.length;
  const count4xx = errorRecords.filter(e => e.type === '4xx').length;
  const count5xx = errorRecords.filter(e => e.type === '5xx').length;
  const countPending = errorRecords.filter(e => e.retryStatus === 'pending').length;
  const countResolved = errorRecords.filter(e => e.retryStatus === 'resolved').length;
  const retrySuccessRate = totalErrors > 0 ? Math.round((countResolved / (countResolved + countPending || 1)) * 100) : 100;

  // Chart data: Distribution by Status Code
  const statusCodeChartData = useMemo(() => {
    const map: Record<string, number> = {};
    errorRecords.forEach(e => {
      const label = `${e.statusCode} ${e.statusText.split(' ')[0]}`;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([code, count]) => ({
      name: code,
      count,
      color: code.startsWith('5') ? '#f43f5e' : '#f59e0b'
    }));
  }, [errorRecords]);

  // Chart data: Distribution by Provider
  const providerChartData = useMemo(() => {
    const map: Record<string, number> = {};
    errorRecords.forEach(e => {
      map[e.providerName] = (map[e.providerName] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [errorRecords]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 animate-fade-in shadow-md">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Telemetry Status */}
      <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-rose-50/80 via-slate-50 to-amber-50/80 p-5 shadow-sm dark:border-slate-800 dark:from-rose-950/30 dark:via-slate-900/50 dark:to-amber-950/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live API Error Monitor (HTTP 4xx & 5xx)
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  Captura em Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interceptação ao vivo de códigos de erro de adquirentes externas (Stone, Cielo, Rede, Mercado Pago, SPI) com reenvio automático de payloads falhos
              </p>
            </div>
          </div>

          {/* Quick Simulation & Live Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveStreaming(prev => !prev)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                isLiveStreaming
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isLiveStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isLiveStreaming ? 'Stream Ativo (Pausar)' : 'Pausado (Retomar)'}</span>
            </button>

            {countPending > 0 && (
              <button
                type="button"
                onClick={handleBulkRetryAll}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reenviar Todos Pendentes ({countPending})</span>
              </button>
            )}

            {/* Test error triggers */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 px-1">Simular:</span>
              <button
                type="button"
                onClick={() => handleSimulateCustomError('504_cielo')}
                className="rounded-lg px-2 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
              >
                504 Cielo
              </button>
              <button
                type="button"
                onClick={() => handleSimulateCustomError('429_stone')}
                className="rounded-lg px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
              >
                429 Stone
              </button>
              <button
                type="button"
                onClick={() => handleSimulateCustomError('503_spi')}
                className="rounded-lg px-2 py-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300"
              >
                503 SPI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Errors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Erros Capturados</span>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalErrors}</span>
            <span className="text-xs text-rose-600 font-semibold">100% monitorado</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            <span>Últimos 15 minutos</span>
          </div>
        </div>

        {/* Card 2: 5xx Server Outages */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm dark:border-rose-950/60 dark:bg-rose-950/20">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">5xx Falhas do Provedor</span>
            <Server className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-300">{count5xx}</span>
            <span className="text-xs font-semibold text-rose-600">500, 502, 503, 504</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600/80 dark:text-rose-400 font-medium">
            Timeouts & Quedas em Provedores Externos
          </div>
        </div>

        {/* Card 3: 4xx Client / Rate Limits */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">4xx Rejeições / Quota</span>
            <Flame className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300">{count4xx}</span>
            <span className="text-xs font-semibold text-amber-600">429, 422, 401, 403</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600/80 dark:text-amber-400 font-medium">
            Rate limits, BIN incompatível & Auth
          </div>
        </div>

        {/* Card 4: Retry & Auto-Heal Rate */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-950/60 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Auto-Heal / Retry</span>
            <CheckCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {countResolved} <span className="text-sm font-normal text-slate-500">resolvidos</span>
            </span>
            <span className="text-xs font-bold text-emerald-600">{retrySuccessRate}% taxa</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium">
            {countPending} payloads aguardando retry
          </div>
        </div>
      </div>

      {/* Visual Charts: Error Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Distribuição por Código de Status HTTP (Ao Vivo)
          </h4>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCodeChartData} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {statusCodeChartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Provedores Mais Impactados
          </h4>
          <div className="space-y-3">
            {providerChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-900 dark:text-white">{item.count} erros</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {Math.round((item.count / totalErrors) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, erro, endpoint, provedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Todos ({totalErrors})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('5xx')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterType === '5xx'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              5xx Server ({count5xx})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('4xx')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterType === '4xx'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              4xx Client ({count4xx})
            </button>
          </div>

          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Todos os Provedores</option>
            <option value="stone">Stone</option>
            <option value="cielo">Cielo</option>
            <option value="rede">Rede</option>
            <option value="mercadopago">Mercado Pago</option>
            <option value="pix_spi">Banco Central SPI</option>
            <option value="adyen">Adyen</option>
          </select>

          <select
            value={filterRetryStatus}
            onChange={(e) => setFilterRetryStatus(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Status: Todos</option>
            <option value="pending">Apenas Pendentes ({countPending})</option>
            <option value="resolved">Resolvidos / Retried ({countResolved})</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Exibindo {filteredRecords.length} de {totalErrors} erros capturados
        </div>
      </div>

      {/* Live Error Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Status HTTP</th>
                <th className="px-4 py-3">Provedor & Endpoint</th>
                <th className="px-4 py-3">Diagnóstico & Causa Raiz</th>
                <th className="px-4 py-3">Latência</th>
                <th className="px-4 py-3">Estado de Retry</th>
                <th className="px-4 py-3 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum erro de API encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const is5xx = record.type === '5xx';
                  const isResolved = record.retryStatus === 'resolved';
                  const isRetrying = record.retryStatus === 'retrying';

                  return (
                    <tr 
                      key={record.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer"
                      onClick={() => setInspectedError(record)}
                    >
                      {/* Status Code */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black font-mono shadow-xs ${
                            is5xx
                              ? 'border border-rose-500/40 bg-rose-600 text-white'
                              : 'border border-amber-500/40 bg-amber-500 text-slate-950 font-bold'
                          }`}>
                            <span>{record.statusCode}</span>
                            <span className="text-[10px] font-medium opacity-90">{record.statusText}</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {new Date(record.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </td>

                      {/* Provider & Endpoint */}
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                          <span>{record.providerName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" title={record.endpoint}>
                          {record.method} {record.endpoint.replace('https://', '')}
                        </div>
                      </td>

                      {/* Error & Root Cause */}
                      <td className="px-4 py-3.5 max-w-[320px]">
                        <p className="font-semibold text-rose-600 dark:text-rose-400 truncate text-xs">
                          {record.errorMessage}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          💡 {record.suggestedAction}
                        </p>
                      </td>

                      {/* Latency */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`font-mono font-bold text-xs ${
                          record.latencyMs > 4000 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {record.latencyMs.toLocaleString()} ms
                        </span>
                        {record.latencyMs > 4000 && (
                          <span className="block text-[10px] text-rose-500 font-semibold">Timeout Alto</span>
                        )}
                      </td>

                      {/* Retry Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isResolved ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Resolvido ({record.resolvedProvider})</span>
                          </div>
                        ) : isRetrying ? (
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs animate-pulse">
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Reenviando...</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Pendente ({record.retryCount} tentativas)
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRetryPayload(record.id)}
                            disabled={isRetrying || isResolved}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                              isResolved
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95'
                            }`}
                            title="Reenviar este payload com rota contingencial automática"
                          >
                            <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                            <span>{isResolved ? 'Resolvido' : 'Reenviar (Retry)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectedError(record)}
                            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            title="Inspecionar Payload JSON e Headers"
                          >
                            <Code className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYLOAD & DIAGNOSTIC INSPECTOR DRAWER */}
      {inspectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-white ${
                  inspectedError.type === '5xx' ? 'bg-rose-600' : 'bg-amber-600'
                }`}>
                  HTTP {inspectedError.statusCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Inspeção de Payload & Diagnóstico: {inspectedError.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedError(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Summary Card */}
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Provedor</span>
                    <span className="font-bold text-slate-900 dark:text-white">{inspectedError.providerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Latência</span>
                    <span className="font-bold text-rose-500">{inspectedError.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Idempotency Key</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate block">{inspectedError.idempotencyKey}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Estado</span>
                    <span className={`font-bold ${inspectedError.retryStatus === 'resolved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {inspectedError.retryStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error details callout */}
              <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                <p className="font-bold text-xs mb-1">Causa Raiz & Ação Sugerida:</p>
                <p className="text-[11px] leading-relaxed">{inspectedError.rootCause}</p>
                <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                  ➔ {inspectedError.suggestedAction}
                </p>
              </div>

              {/* Request JSON Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">Request JSON Payload:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(inspectedError.requestPayload, null, 2), 'payload')}
                    className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {copiedKey === 'payload' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'payload' ? 'Copiado!' : 'Copiar JSON'}</span>
                  </button>
                </div>
                <pre className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-400 border border-slate-800">
                  {JSON.stringify(inspectedError.requestPayload, null, 2)}
                </pre>
              </div>

              {/* Provider Response Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">External Provider Response (Erro Bruto):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(inspectedError.responseBody, null, 2), 'response')}
                    className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {copiedKey === 'response' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'response' ? 'Copiado!' : 'Copiar Resposta'}</span>
                  </button>
                </div>
                <pre className="max-h-36 overflow-y-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-rose-400 border border-slate-800">
                  {JSON.stringify(inspectedError.responseBody, null, 2)}
                </pre>
              </div>

              {/* Re-execute cURL command preview */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-xs block mb-1">Comando cURL de Reprodução:</span>
                <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 font-mono text-[10px] text-slate-300 border border-slate-800">
                  <span className="truncate pr-2">
                    curl -X {inspectedError.method} "{inspectedError.endpoint}" -H "Idempotency-Key: {inspectedError.idempotencyKey}" -d '...'
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`curl -X ${inspectedError.method} "${inspectedError.endpoint}" -H "Content-Type: application/json" -H "Idempotency-Key: ${inspectedError.idempotencyKey}" -d '${JSON.stringify(inspectedError.requestPayload)}'`, 'curl')}
                    className="shrink-0 rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-slate-700"
                  >
                    {copiedKey === 'curl' ? 'Copiado!' : 'Copiar cURL'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="text-[11px] text-slate-500">
                {inspectedError.retryStatus === 'resolved' ? (
                  <span className="text-emerald-500 font-bold">
                    ✓ Resolvido via {inspectedError.resolvedProvider} ({inspectedError.resolvedLatencyMs}ms)
                  </span>
                ) : (
                  <span>Pronto para reexecução imediata com fallback de rota</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {inspectedError.retryStatus !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleRetryPayload(inspectedError.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reenviar Payload com Fallback</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setInspectedError(null)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
