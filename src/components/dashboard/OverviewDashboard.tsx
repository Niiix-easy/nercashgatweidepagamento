import React, { useState, useEffect, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { NercashLogo } from '../common/NercashLogo';
import { 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Activity, 
  ArrowUpRight, 
  Zap, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Eye,
  BrainCircuit,
  Filter,
  ShieldCheck,
  Percent,
  DollarSign,
  Bell,
  BellRing,
  AlertOctagon,
  Volume2,
  VolumeX,
  Sliders,
  X,
  UserX,
  Search,
  Check,
  Globe,
  Coins,
  Cpu,
  UserCheck,
  ShieldQuestion,
  RotateCw,
  Award,
  Sparkle,
  SlidersHorizontal,
  ChevronDown,
  Download,
  FileText,
  Camera
} from 'lucide-react';
import { DashboardSnapshotModal } from './DashboardSnapshotModal';
import { PaymentEvent, PaymentIntent } from '../../types/payment';
import { SecurityHardeningEngine } from '../../services/securityHardening';
import { RISK_SCORE_HISTORY_30D } from '../../mock/initialData';
const GeographicalHeatMap = React.lazy(() => import('./GeographicalHeatMap').then(m => ({ default: m.GeographicalHeatMap })));
import { BulkCsvUploadModal } from './BulkCsvUploadModal';
import { GlobalExportDataModal } from './GlobalExportDataModal';
import { OverviewExportWizard } from './OverviewExportWizard';
import { TeamActivityHeatmap } from './TeamActivityHeatmap';
import { AiNaturalLanguageQueryBar, AiParsedFilters } from './AiNaturalLanguageQueryBar';
const MlForecastingWidget = React.lazy(() => import('./MlForecastingWidget').then(m => ({ default: m.MlForecastingWidget })));
import { TransactionTableWithBulkTagging } from './TransactionTableWithBulkTagging';
const GatewayHealthWidget = React.lazy(() => import('./GatewayHealthWidget').then(m => ({ default: m.GatewayHealthWidget })));
import { AiBatchSuggestionWidget } from './AiBatchSuggestionWidget';
import { WalletStreamWidget } from './WalletStreamWidget';
import { SmartInsightsPanel } from './SmartInsightsPanel';
import { ApiUsageAnalyticsWidget } from './ApiUsageAnalyticsWidget';
import { GatewayHealthMatrix } from './GatewayHealthMatrix';
import { GatewayPerformanceHeatmap } from './GatewayPerformanceHeatmap';
import { GatewayPerformanceComparisonWidget } from './GatewayPerformanceComparisonWidget';
import { ResourceConsumptionDashboard } from './ResourceConsumptionDashboard';
import { BrowserPerformanceWidget } from './BrowserPerformanceWidget';
import { BatchTransactionValidator } from './BatchTransactionValidator';
import { GatewayPerformanceTrendAnalyzer } from './GatewayPerformanceTrendAnalyzer';
import { IntelligentAlertTuning } from './IntelligentAlertTuning';
import { GlobalIndustryBenchmarkWidget } from './GlobalIndustryBenchmarkWidget';
import { ApiRateUsageWidget } from './ApiRateUsageWidget';
import { ApiHealthMonitorWidget } from './ApiHealthMonitorWidget';
import { WebhookAlertMonitor } from './WebhookAlertMonitor';
import { AnomalyDetectorService } from './AnomalyDetectorService';
import { LatencyHeatmapWidget } from './LatencyHeatmapWidget';
import { CashbackPerformanceWidget } from './CashbackPerformanceWidget';
import { DataLifecycleManager } from '../../services/dataLifecycleManager';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { UploadCloud } from 'lucide-react';

import { PaymentVolumeTrendVisualizer } from './PaymentVolumeTrendVisualizer';

export interface RiskAlertItem {
  id: string;
  paymentIntentId: string;
  customerName: string;
  amount: number;
  riskScore: number;
  reasons: string[];
  acquirer: string;
  timestamp: string;
  actionTaken?: string;
}

export interface FalsePositiveItem {
  id: string;
  paymentIntentId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  initialRiskScore: number;
  mlTrustScore: number; // e.g. 94% Legitimate
  triggerReason: string;
  residualExplanation: string;
  featureWeights: { feature: string; impact: number; isNegative: boolean }[];
  customerTier: 'VIP Diamante' | 'Cliente Recorrente' | 'Corporativo' | 'Novo Usuário';
  cardBrand: string;
  status: 'pending_review' | 'verified_legitimate' | 'whitelisted' | 'biometric_stepup';
  timestamp: string;
}

import { AlertManager } from './AlertManager';
import { WidgetSuspense } from './WidgetSuspense';
import { BaaSQuotaWidget } from './BaaSQuotaWidget';
import { SLOAlertingPanel } from './SLOAlertingPanel';

export const OverviewDashboard: React.FC = () => {
  const { 
    paymentIntents, 
    acquirers, 
    events, 
    toggleCircuitBreaker, 
    setActiveTab,
    theme,
    processPaymentIntent,
    addToast
  } = usePayment();

  const [selectedEvent, setSelectedEvent] = useState<PaymentEvent | null>(null);
  const [chartMetric, setChartMetric] = useState<'all' | 'risk_score' | 'anomaly_rate' | 'fraud_amount'>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  const [baasAlerts, setBaasAlerts] = useState<string[]>([]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'BAAS_HEARTBEAT_ALERT') {
          setBaasAlerts(prev => [event.data.message, ...prev.slice(0, 4)]);
          addToast('Alerta de Conectividade BaaS', event.data.message, 'warning');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [addToast]);

  // AI Natural Language Query Filter state
  const [aiFilters, setAiFilters] = useState<AiParsedFilters | null>(null);

  // Floating Filter Panel State (Region, Currency, Method)
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'br_sudeste' | 'br_sul' | 'br_nordeste' | 'latam' | 'global'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  const [selectedCurrency, setSelectedCurrency] = useState<'BRL' | 'USD' | 'EUR' | 'ARS' | 'MXN'>('BRL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<'all' | 'pix' | 'credit_card' | 'boleto'>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(true);

  // False Positives Anomaly Insights State
  const [falsePositiveItems, setFalsePositiveItems] = useState<FalsePositiveItem[]>([
    {
      id: 'fp_1',
      paymentIntentId: 'pi_fp_8819',
      customerName: 'Eduardo Prado (VIP Corporativo)',
      customerEmail: 'eduardo.prado@techcorp.com.br',
      amount: 4250.00,
      currency: 'BRL',
      initialRiskScore: 74,
      mlTrustScore: 96,
      triggerReason: 'Divergência de Geolocalização (IP Hotel Frankfurt vs Cartão SP)',
      residualExplanation: 'Cardholder VIP com 48 pedidos aprovados nos últimos 12 meses e Apple Pay tokenizado com biometria facial.',
      featureWeights: [
        { feature: 'IP Internacional (Roaming)', impact: +32, isNegative: true },
        { feature: 'Valor Elevado (> R$ 3k)', impact: +18, isNegative: true },
        { feature: 'Histórico LTV VIP (48x sem chargeback)', impact: -42, isNegative: false },
        { feature: 'Token Apple Pay Criptografado', impact: -25, isNegative: false }
      ],
      customerTier: 'VIP Diamante',
      cardBrand: 'Mastercard Black',
      status: 'pending_review',
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: 'fp_2',
      paymentIntentId: 'pi_fp_8820',
      customerName: 'Beatriz Mendonça (E-commerce Atacado)',
      customerEmail: 'beatriz.m@distribuidora.com.br',
      amount: 8900.00,
      currency: 'BRL',
      initialRiskScore: 78,
      mlTrustScore: 92,
      triggerReason: 'Pico de Velocidade (3 transações de alto valor em 4 minutos)',
      residualExplanation: 'Comprador B2B recorrente aproveitando campanha de desconto relâmpago Pix B2B.',
      featureWeights: [
        { feature: 'Burst de Velocidade Transacional', impact: +38, isNegative: true },
        { feature: 'CNPJ Válido na Receita Federal', impact: -30, isNegative: false },
        { feature: 'Autenticação 3D-Secure 2.0 Sucesso', impact: -28, isNegative: false }
      ],
      customerTier: 'Corporativo',
      cardBrand: 'Visa Infinite',
      status: 'pending_review',
      timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString()
    },
    {
      id: 'fp_3',
      paymentIntentId: 'pi_fp_8821',
      customerName: 'Roberto Klein (Novo Dispositivo iPhone 16)',
      customerEmail: 'roberto.klein@globo.com',
      amount: 1750.00,
      currency: 'BRL',
      initialRiskScore: 68,
      mlTrustScore: 89,
      triggerReason: 'Dispositivo Novo Sem Fingerprint Histórico',
      residualExplanation: 'Dispositivo recém-cadastrado, porém com e-mail corporativo autenticado e CPF sem restrição nos birôs.',
      featureWeights: [
        { feature: 'Device Fingerprint Inédito', impact: +29, isNegative: true },
        { feature: 'Reputação de E-mail Positiva (ClearSale)', impact: -24, isNegative: false },
        { feature: 'Endereço de Entrega Compatível', impact: -18, isNegative: false }
      ],
      customerTier: 'Cliente Recorrente',
      cardBrand: 'Elo Nanquim',
      status: 'pending_review',
      timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString()
    }
  ]);
  const [selectedFpItem, setSelectedFpItem] = useState<FalsePositiveItem | null>(null);
  const [mlActionFeedback, setMlActionFeedback] = useState<string | null>(null);

  // Real-Time Risk Alert System State
  const [riskAlertThreshold, setRiskAlertThreshold] = useState<number>(70);
  const [isAlertsEnabled, setIsAlertsEnabled] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [activeToasts, setActiveToasts] = useState<RiskAlertItem[]>([]);
  const [alertHistory, setAlertHistory] = useState<RiskAlertItem[]>([
    {
      id: 'alert_prev_1',
      paymentIntentId: 'pi_hist_9901',
      customerName: 'Carlos M. (VPN Anônima)',
      amount: 4500.00,
      riskScore: 89,
      reasons: ['IP Divergente do BIN do Cartão', 'Velocidade Anômala (5 tentativas/min)', 'Cardholder com chargeback prévio'],
      acquirer: 'Stone (Bloqueado)',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      actionTaken: 'Bloqueado Automaticamente'
    },
    {
      id: 'alert_prev_2',
      paymentIntentId: 'pi_hist_9902',
      customerName: 'Mariana S. (Dispositivo Suspeito)',
      amount: 1890.00,
      riskScore: 78,
      reasons: ['Device Fingerprint modificado', 'Horário fora do padrão do comprador'],
      acquirer: 'Cielo (Desviado para 3DS)',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      actionTaken: '3D-Secure Solicitado'
    }
  ]);
  const [showAlertConfigDrawer, setShowAlertConfigDrawer] = useState<boolean>(false);
  const [inspectedAlert, setInspectedAlert] = useState<RiskAlertItem | null>(null);
  const [showBulkCsvModal, setShowBulkCsvModal] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [mlModelVersion, setMlModelVersion] = useState<string>('v4.8.2-prod');

  // Keep track of already alerted payment intent IDs to avoid duplicate toasts
  const alertedIntentsRef = useRef<Set<string>>(new Set(['pi_hist_9901', 'pi_hist_9902']));

  // Web Audio Synth Chime for High Risk Alert
  const playAlertSound = () => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio context may require user interaction
    }
  };

  // Monitor paymentIntents for risk score exceeding threshold
  useEffect(() => {
    // Run Data Lifecycle Manager TTL pruning on initial mount
    DataLifecycleManager.runTtlPruning(90, 365);
  }, []);

  useEffect(() => {
    if (!isAlertsEnabled) return;

    paymentIntents.forEach(intent => {
      if (intent.riskScore >= riskAlertThreshold && !alertedIntentsRef.current.has(intent.id)) {
        alertedIntentsRef.current.add(intent.id);

        const reasons: string[] = [];
        if (intent.riskScore > 85) reasons.push('Probabilidade Crítica de Chargeback (>85%)');
        if (intent.amount > 2000) reasons.push('Valor Alto Atípico para o Perfil');
        if (intent.attempts && intent.attempts.length > 1) reasons.push(`Múltiplas Tentativas em Curto Intervalo (${intent.attempts.length}x)`);
        if (reasons.length === 0) reasons.push('Anomalia no Padrão de Navegação / IP');

        const newAlert: RiskAlertItem = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          paymentIntentId: intent.id,
          customerName: intent.customerName || 'Cliente Transacional',
          amount: intent.amount,
          riskScore: intent.riskScore,
          reasons,
          acquirer: intent.selectedAcquirer || 'Adquirente Padrão',
          timestamp: new Date().toISOString(),
          actionTaken: intent.riskScore >= 85 ? 'Intervenção ML Recomendada' : 'Monitoramento Reforçado'
        };

        playAlertSound();
        setActiveToasts(prev => [newAlert, ...prev.slice(0, 2)]);
        setAlertHistory(prev => [newAlert, ...prev]);
      }
    });
  }, [paymentIntents, riskAlertThreshold, isAlertsEnabled, isSoundEnabled]);

  // Handle False Positive ML review actions
  const handleVerifyFalsePositive = (item: FalsePositiveItem, newStatus: FalsePositiveItem['status']) => {
    setFalsePositiveItems(prev => prev.map(fp => fp.id === item.id ? { ...fp, status: newStatus } : fp));
    const msg = newStatus === 'verified_legitimate'
      ? `Transação ${item.paymentIntentId} aprovada como Legítima! Gradiente retroalimentado ao modelo XGBoost v2.4 (-0.02% FPR).`
      : newStatus === 'whitelisted'
      ? `Cardholder ${item.customerName} e dispositivo incluídos na Whitelist Instantânea.`
      : `Step-up biométrico 3D-Secure 2.2 solicitado ao portador.`;
    setMlActionFeedback(msg);
    setTimeout(() => setMlActionFeedback(null), 5000);
  };

  // Simulate a high-risk transaction for immediate demo/testing
  const handleSimulateHighRiskTransaction = async () => {
    const fakeHighRiskScore = 78 + Math.floor(Math.random() * 20);
    const fakeAmount = 1490.00 + Math.floor(Math.random() * 3500);

    const intent = await processPaymentIntent({
      amount: fakeAmount,
      method: 'credit_card',
      customerName: 'Rodrigo A. (IP Proxy Suspeito)',
      customerEmail: 'rodrigo.test@tor-node.org',
      customerDocument: '987.654.321-99',
      cardNumber: '5502 0000 1111 2222',
      cardInstallments: 12
    });

    intent.riskScore = fakeHighRiskScore;
    
    alertedIntentsRef.current.add(intent.id);
    const newAlert: RiskAlertItem = {
      id: `alert_${Date.now()}`,
      paymentIntentId: intent.id,
      customerName: intent.customerName,
      amount: intent.amount,
      riskScore: fakeHighRiskScore,
      reasons: [
        'Conexão originada de nó de saída TOR / Proxy',
        'Valor elevado parcelado em 12x',
        'Device fingerprint sem histórico de reputação'
      ],
      acquirer: intent.selectedAcquirer,
      timestamp: new Date().toISOString(),
      actionTaken: 'Regra de Contingência Ativada'
    };

    playAlertSound();
    setActiveToasts(prev => [newAlert, ...prev.slice(0, 2)]);
    setAlertHistory(prev => [newAlert, ...prev]);
  };

  const handleDismissToast = (alertId: string) => {
    setActiveToasts(prev => prev.filter(a => a.id !== alertId));
  };

  // Currency multiplier & currency symbol
  const currencyRate = selectedCurrency === 'USD' ? 0.20 : selectedCurrency === 'EUR' ? 0.18 : selectedCurrency === 'ARS' ? 180.0 : selectedCurrency === 'MXN' ? 3.4 : 1.0;
  const currencySymbol = selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'ARS' ? 'ARS$' : selectedCurrency === 'MXN' ? 'MX$' : 'R$';

  // Regional risk adjustment factor
  const regionMultiplier = selectedRegion === 'latam' ? 1.08 : selectedRegion === 'global' ? 1.15 : selectedRegion === 'br_nordeste' ? 0.96 : 1.0;

  // Filter 30d data by selected time range, region & currency
  const filteredData = React.useMemo(() => {
    let base = RISK_SCORE_HISTORY_30D;
    if (timeRange === '7d') base = RISK_SCORE_HISTORY_30D.slice(-7);
    else if (timeRange === '14d') base = RISK_SCORE_HISTORY_30D.slice(-14);

    return base.map(d => ({
      ...d,
      avgRiskScore: Math.min(99, Math.round(d.avgRiskScore * regionMultiplier)),
      fraudPreventedAmount: Math.round(d.fraudPreventedAmount * currencyRate),
      processedVolume: Math.round(d.processedVolume * currencyRate)
    }));
  }, [timeRange, selectedRegion, currencyRate, regionMultiplier]);

  // Apply AI natural language parsed filters if active
  const dynamicFilteredPaymentIntents = React.useMemo(() => {
    if (!aiFilters || !aiFilters.isActive) return paymentIntents;

    return paymentIntents.filter(p => {
      // Risk score filtering
      if (aiFilters.minRiskScore !== undefined && p.riskScore < aiFilters.minRiskScore) return false;
      if (aiFilters.maxRiskScore !== undefined && p.riskScore > aiFilters.maxRiskScore) return false;

      // Method filtering
      if (aiFilters.method && aiFilters.method !== 'all' && p.method !== aiFilters.method) return false;

      // Status filtering
      if (aiFilters.status && aiFilters.status !== 'all') {
        if (aiFilters.status === 'succeeded' && p.status !== 'approved') return false;
        if (aiFilters.status === 'declined' && p.status !== 'declined') return false;
        if (aiFilters.status === 'requires_action' && p.status !== 'requires_action') return false;
        if (aiFilters.status === 'refunded' && p.status !== 'refunded') return false;
      }

      // Amount filtering
      if (aiFilters.minAmount !== undefined && p.amount < aiFilters.minAmount) return false;
      if (aiFilters.maxAmount !== undefined && p.amount > aiFilters.maxAmount) return false;

      // Acquirer filtering
      if (aiFilters.acquirer && p.selectedAcquirer && !p.selectedAcquirer.toLowerCase().includes(aiFilters.acquirer.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [paymentIntents, aiFilters]);

  // Calculations based on dynamic filtered payment intents
  const totalVolume = dynamicFilteredPaymentIntents
    .filter(p => p.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0) * currencyRate;

  const approvedCount = dynamicFilteredPaymentIntents.filter(p => p.status === 'approved').length;
  const totalCount = dynamicFilteredPaymentIntents.length;
  const approvalRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '98.2';

  const averageLatency = Math.round(
    acquirers.reduce((acc, curr) => acc + curr.latencyMs, 0) / acquirers.length
  );

  const totalFraudPrevented30d = filteredData.reduce((acc, curr) => acc + curr.fraudPreventedAmount, 0);
  const avg30dRiskScore = (filteredData.reduce((acc, curr) => acc + curr.avgRiskScore, 0) / filteredData.length).toFixed(1);

  return (
    <div id="dashboard-overview-container" className="relative space-y-6">
      <AlertManager />
      <WidgetSuspense><BaaSQuotaWidget /></WidgetSuspense>
      <SLOAlertingPanel />
      <WebhookAlertMonitor />
      <AnomalyDetectorService />
      {/* FLOATING FILTER PANEL (REGION & CURRENCY DYNAMIC CONTROLS) */}
      <div className="sticky top-20 z-20 flex justify-end">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 p-2 shadow-xl backdrop-blur-md transition-all dark:border-slate-800/90 dark:bg-slate-900/95">
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Filtro Global:</span>
          </div>

          {/* Region Selector Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800">
            <Globe className="ml-1 h-3.5 w-3.5 text-slate-400" />
            <select
              id="dashboard-region-filter"
              aria-label="Filtrar por Região de Pagamento"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="cursor-pointer bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Brasil (Todas Regiões)</option>
              <option value="br_sudeste" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">BR - Sudeste (SP/RJ/MG)</option>
              <option value="br_sul" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">BR - Sul (PR/SC/RS)</option>
              <option value="br_nordeste" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">BR - Nordeste (BA/PE/CE)</option>
              <option value="latam" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">LatAm (AR, MX, CL, CO)</option>
              <option value="global" className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">Global (US / EMEA)</option>
            </select>
          </div>

          {/* Currency Selector Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800">
            <Coins className="ml-1 h-3.5 w-3.5 text-amber-500" />
            {(['BRL', 'USD', 'EUR', 'ARS', 'MXN'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`rounded-lg px-2 py-0.5 text-xs font-bold transition-all ${
                  selectedCurrency === curr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Active Filter Badges */}
          <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 lg:flex dark:bg-emerald-950/60 dark:text-emerald-300">
            <span>Slice Ativo:</span>
            <span className="font-mono">{selectedRegion.toUpperCase()} • {selectedCurrency}</span>
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar (CSV / PDF)</span>
          </button>
        </div>
      </div>
      {/* Top Banner: Nercash Architecture Context */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl border border-emerald-900/40">
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block">
              <NercashLogo variant="icon" size="lg" />
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/40">
                  <Sparkles className="h-3 w-3" /> Nercash Decision Engine v3.2
                </span>
                <span className="inline-flex items-center rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                  Failover Multi-Adquirente
                </span>
                <span className="inline-flex items-center rounded-md bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
                  PCI-DSS Level 1 Certified
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Nercash Gateway & Orchestration Hub
              </h2>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Roteamento transacional de altíssima conversão com inteligência de machine learning preditiva, prevenção de chargeback e orquestração de 6 adquirentes em tempo real.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Dashboard Snapshot (html2canvas PDF) Trigger */}
            <button
              id="dashboard-open-snapshot-modal-btn"
              type="button"
              onClick={() => setIsSnapshotModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-teal-400/40 bg-teal-500/20 px-3.5 py-2.5 text-xs font-bold text-teal-200 backdrop-blur-sm transition-all hover:bg-teal-500/30 hover:text-white cursor-pointer"
              title="Exportar Snapshot de Layout e Métricas em PDF com html2canvas"
            >
              <Camera className="h-4 w-4 text-teal-300" />
              <span>Snapshot (PDF)</span>
            </button>

            {/* Export Wizard Trigger */}
            <button
              id="dashboard-open-export-wizard-btn"
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-3.5 py-2.5 text-xs font-bold text-indigo-200 backdrop-blur-sm transition-all hover:bg-indigo-500/30 hover:text-white cursor-pointer"
              title="Baixar PDF de Métricas de Saúde"
            >
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Report Wizard</span>
            </button>

            {/* Global Export Data Trigger */}
            <button
              id="dashboard-open-export-modal-btn"
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-export-modal'))}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-2.5 text-xs font-bold text-emerald-200 backdrop-blur-sm transition-all hover:bg-emerald-500/30 hover:text-white"
              title="Exportar dados filtrados em CSV ou PDF (Ctrl+E)"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Exportar Dados (Ctrl+E)</span>
            </button>

            <button
              id="dashboard-goto-orchestration"
              onClick={() => setActiveTab('orchestration')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-500 shadow-md shadow-emerald-950/40"
            >
              <Zap className="h-4 w-4" />
              <span>Simulador de Roteamento</span>
            </button>
            <button
              id="dashboard-goto-checkout"
              onClick={() => setActiveTab('checkout')}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 border border-white/15"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Super Checkout Adaptativo</span>
            </button>
          </div>
        </div>

        {/* Decorative Neon Accents */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="lg:col-span-1 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
        </div>
      ) : (
        <>
      {/* AI-POWERED NATURAL LANGUAGE QUERY BAR */}
      <AiNaturalLanguageQueryBar
        onFiltersChange={(parsed) => setAiFilters(parsed)}
        totalFilteredCount={aiFilters && aiFilters.isActive ? dynamicFilteredPaymentIntents.length : undefined}
        totalFilteredVolume={aiFilters && aiFilters.isActive ? totalVolume : undefined}
      />

      {/* REAL-TIME RISK ALERT SYSTEM CONTROL BAR */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm dark:border-rose-950 dark:bg-rose-950/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sistema de Alerta em Tempo Real (ML Risk Shield)
                </h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isAlertsEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {isAlertsEnabled ? 'ATIVO' : 'PAUSADO'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dispara notificações instantâneas com áudio e métricas heurísticas quando o score superar <strong>{riskAlertThreshold}/100</strong>.
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Threshold Selector Buttons */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
              <span className="px-2 text-[10px] font-bold uppercase text-slate-400">Limiar:</span>
              {[60, 70, 75, 80, 85].map(val => (
                <button
                  key={val}
                  onClick={() => setRiskAlertThreshold(val)}
                  className={`rounded-lg px-2 py-1 text-xs font-bold transition-all ${
                    riskAlertThreshold === val
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  &gt;{val}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              title={isSoundEnabled ? 'Som ativado' : 'Som desativado'}
              className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                isSoundEnabled
                  ? 'border-rose-200 bg-white text-rose-600 shadow-sm dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400'
                  : 'border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800'
              }`}
            >
              {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Bulk CSV Upload for ML Risk Engine */}
            <button
              id="dashboard-bulk-csv-upload-btn"
              onClick={() => setShowBulkCsvModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-all active:scale-95"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload CSV (Treino ML)</span>
            </button>

            {/* Simulate High Risk Transaction */}
            <button
              onClick={handleSimulateHighRiskTransaction}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all active:scale-95"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Testar Alerta (Score 80+)</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setShowAlertConfigDrawer(true)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Sliders className="h-3.5 w-3.5 text-slate-500" />
              <span>Histórico ({alertHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* PLATFORM-WIDE CASHBACK PERFORMANCE & ADOPTION WIDGET */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <CashbackPerformanceWidget />
        <PaymentVolumeTrendVisualizer />
      </div>

      {/* GATEWAY HEALTH DASHBOARD WIDGET */}
      <WidgetSuspense><GatewayHealthWidget /></WidgetSuspense>

      {/* GATEWAY PERFORMANCE COMPARISON WIDGET (BAR CHART) */}
      <GatewayPerformanceComparisonWidget />

      {/* GATEWAY PERFORMANCE TREND ANALYZER (HISTORICAL LATENCY VS LOAD) */}
      <GatewayPerformanceTrendAnalyzer />

      {/* INTELLIGENT ALERT TUNING & NOISE SUPPRESSION */}
      <IntelligentAlertTuning />

      {/* RESOURCE CONSUMPTION DASHBOARD (MEMORY, CPU, CACHE & DIAGNOSTIC SNAPSHOT) */}
      <ResourceConsumptionDashboard />

      {/* BROWSER PERFORMANCE WIDGET (FPS & PERFORMANCE API) */}
      <BrowserPerformanceWidget />

      {/* BATCH TRANSACTION VALIDATOR */}
      <BatchTransactionValidator />

      {/* AI BATCH SUGGESTION TOOL */}
      <AiBatchSuggestionWidget />

      {/* API HEALTH MONITOR WIDGET */}
      <ApiHealthMonitorWidget />

      {/* LATENCY HEATMAP WIDGET */}
      <LatencyHeatmapWidget />

      {/* API RATE USAGE WIDGET */}
      <ApiRateUsageWidget />

      {/* GLOBAL INDUSTRY BENCHMARK */}
      <GlobalIndustryBenchmarkWidget />

      {/* WEB MONETIZATION WALLET STREAM WIDGET */}
      <WalletStreamWidget />

      {/* SMART INSIGHTS LLM PANEL */}
      <SmartInsightsPanel />

      {/* API USAGE ANALYTICS WIDGET */}
      <ApiUsageAnalyticsWidget />

      {/* GATEWAY HEALTH MATRIX WIDGET */}
      <GatewayHealthMatrix />

      {/* GATEWAY PERFORMANCE HEATMAP (D3) */}
      <GatewayPerformanceHeatmap />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: TPV */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Volume Transacionado (TPV)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {approvedCount} transações liquidadas hoje
          </p>
        </div>

        {/* Card 2: Taxa de Aprovação */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Taxa Geral de Aprovação
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {approvalRate}%
            </span>
            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              +7.2% via Failover
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Resgatadas 4 transações por contingência
          </p>
        </div>

        {/* Card 3: Fraude Evitada 30d */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Fraude Bloqueada pelo ML (30d)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <BrainCircuit className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              R$ {totalFraudPrevented30d.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Score Médio: {avg30dRiskScore}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Taxa de falso positivo &lt; 0.04%
          </p>
        </div>

        {/* Card 4: Chargeback */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Índice de Chargeback Global
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              0.14%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Excelente (&lt; 0.6% Visa/Master)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Auditoria PCI-DSS Level 1 Ativa
          </p>
        </div>
      </div>

      {/* RECHARTS SECTION: ML Risk Score & Transaction Intelligence (30 Days) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Scores de Risco Transacional ML (Histórico de 30 Dias)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualização temporal do modelo de Machine Learning (Score de Risco 0-100, Taxa de Anomalias Heurísticas e Volume Prevenido)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ML Model Version Badge */}
            <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Modelo: <strong className="font-mono">{mlModelVersion}</strong></span>
            </div>

            {/* Bulk CSV Upload Button */}
            <button
              id="btn-open-bulk-csv-upload"
              type="button"
              onClick={() => setShowBulkCsvModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload CSV (Treinar ML)</span>
            </button>

            {/* Metric Selector Pills */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setChartMetric('all')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  chartMetric === 'all'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Todas as Métricas
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('risk_score')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  chartMetric === 'risk_score'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Score de Risco
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('anomaly_rate')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  chartMetric === 'anomaly_rate'
                    ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-700 dark:text-amber-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Taxa de Anomalias (%)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('fraud_amount')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  chartMetric === 'fraud_amount'
                    ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Fraude Bloqueada (R$)
              </button>
            </div>

            {/* Time range selector */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              {(['7d', '14d', '30d'] as const).map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition-all ${
                    timeRange === range
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The Recharts Line Graph */}
        <div className="mt-6 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} 
                vertical={false} 
              />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
              />
              {chartMetric === 'fraud_amount' && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981" 
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xl text-xs font-sans text-white">
                        <p className="font-bold text-emerald-400 mb-1.5 flex items-center justify-between gap-4">
                          <span>Data: {data.fullDate}</span>
                          <span className="text-[10px] text-slate-400">30d Analytics</span>
                        </p>
                        <div className="space-y-1 text-slate-200">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Score de Risco ML:</span>
                            <span className="font-bold text-indigo-400">{data.avgRiskScore} / 100</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Taxa de Anomalias:</span>
                            <span className="font-bold text-amber-400">{data.anomalyDetectionRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Taxa de Aprovação:</span>
                            <span className="font-bold text-emerald-400">{data.approvalRate}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Fraude Bloqueada:</span>
                            <span className="font-bold text-rose-400">R$ {data.fraudPreventedAmount.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-1 text-[10px] text-slate-400">
                            <span>Volume Analisado:</span>
                            <span className="font-bold text-white">R$ {data.processedVolume.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} 
              />
              
              {/* Safe risk baseline reference */}
              <ReferenceLine 
                yAxisId="left" 
                y={25} 
                label={{ value: 'Limite Seguro ML (Score ≤ 25)', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
              />

              {/* Alert threshold line reference */}
              <ReferenceLine 
                yAxisId="left" 
                y={riskAlertThreshold} 
                label={{ value: `Alerta em Tempo Real (Score ≥ ${riskAlertThreshold})`, fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeWidth={1.5}
              />

              {/* Lines according to active filter */}
              {(chartMetric === 'all' || chartMetric === 'risk_score') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgRiskScore"
                  name="Score Médio de Risco ML"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {(chartMetric === 'all' || chartMetric === 'anomaly_rate') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="anomalyDetectionRate"
                  name="Taxa de Anomalia Heurística (%)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#f59e0b' }}
                />
              )}

              {chartMetric === 'all' && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="approvalRate"
                  name="Taxa de Aprovação (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}

              {(chartMetric === 'fraud_amount') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fraudPreventedAmount"
                  name="Fraude Bloqueada (R$)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#ef4444' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graph Bottom Insights */}
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Classificação Muito Baixo Risco</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">93.8% das requisições</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Modelo Treinado</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">XGBoost v2.4 (99.82% AUC)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Percent className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Economia com Antifraude</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{currencySymbol} {(41200 * currencyRate).toLocaleString('pt-BR')} / mês</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY ANOMALIES FEED (ML Categorized Sessions & API Usage Patterns) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Feed de Anomalias de Segurança & API (ML Risk Engine)
                </h3>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  IA Ativa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Categorização de sessões de usuário por nível de risco e bandeiras de padrões atípicos de requisição de API não cobertos por geofencing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              4 Sessões Monitoradas
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <tr>
                <th className="p-3">Sessão / Usuário</th>
                <th className="p-3">Nível de Risco</th>
                <th className="p-3">Anomalia Identificada (ML API Flag)</th>
                <th className="p-3">Origem / IP</th>
                <th className="p-3">Horário</th>
                <th className="p-3 text-right">Ação Corretiva</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SecurityHardeningEngine.getSessionAnomalies().map((anomaly, idx) => (
                <tr key={anomaly.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{anomaly.user}</div>
                    <div className="font-mono text-[10px] text-slate-500">{anomaly.sessionId}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      anomaly.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm' :
                      anomaly.riskLevel === 'HIGH' ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30 dark:text-rose-400' :
                      anomaly.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 dark:text-amber-400' :
                      'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400'
                    }`}>
                      {anomaly.riskLevel} ({anomaly.riskScore}/100)
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                    {anomaly.anomalyType}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    <div>{anomaly.ipAddress}</div>
                    <div className="text-[10px] text-slate-400">{anomaly.location}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{anomaly.timestamp}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Ação corretiva executada para a sessão ${anomaly.sessionId}: Sessão revogada e IP banido temporariamente do gateway.`)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                    >
                      Revogar / Banir IP
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ML-POWERED RISK SCORE RADAR CHART BREAKDOWN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Breakdown do Risk Score por Inteligência Artificial (Radar Model)</h3>
              <p className="text-xs text-slate-500">Análise multidimensional baseada em Velocity, Geography, Device Fingerprint e Transaction Pattern</p>
            </div>
          </div>
          <span className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            XGBoost ML v4.2
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
              { subject: 'Velocidade', A: 85, fullMark: 100 },
              { subject: 'Geografia', A: 72, fullMark: 100 },
              { subject: 'Device Fingerprint', A: 90, fullMark: 100 },
              { subject: 'Transaction Pattern', A: 68, fullMark: 100 },
              { subject: 'Payload Integrity', A: 95, fullMark: 100 },
              { subject: 'FIDO2 Biometrics', A: 88, fullMark: 100 }
            ]}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Risk Factor Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* API CALLS PER GATEWAY OVER LAST 24 HOURS (RECHARTS) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Volume de Chamadas de API por Gateway (Últimas 24h)</h3>
              <p className="text-xs text-slate-500">Monitoramento de picos de tráfego e gargalos de latência por adquirente e provedor</p>
            </div>
          </div>
          <span className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600 dark:text-violet-400">
            Tempo Real (24h)
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { time: '00h', Cielo: 1200, Stone: 950, Redecard: 800, Stripe: 1400 },
              { time: '03h', Cielo: 600, Stone: 400, Redecard: 350, Stripe: 700 },
              { time: '06h', Cielo: 900, Stone: 850, Redecard: 600, Stripe: 1100 },
              { time: '09h', Cielo: 3400, Stone: 2900, Redecard: 2400, Stripe: 4100 },
              { time: '12h', Cielo: 4800, Stone: 4200, Redecard: 3600, Stripe: 5500 },
              { time: '15h', Cielo: 4100, Stone: 3800, Redecard: 3100, Stripe: 4900 },
              { time: '18h', Cielo: 3200, Stone: 2800, Redecard: 2200, Stripe: 3800 },
              { time: '21h', Cielo: 2100, Stone: 1800, Redecard: 1400, Stripe: 2500 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Cielo" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Stone" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Redecard" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Stripe" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GEOGRAPHICAL HEAT MAP VISUALIZATION (D3.js) */}
      <GeographicalHeatMap
        selectedRegionFilter={selectedRegion}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
        theme={theme}
      />

      {/* TEAM ACTIVITY & API USAGE HEATMAP WIDGET */}
      <TeamActivityHeatmap />

      {/* ML-DRIVEN ANOMALY INSIGHT & FALSE POSITIVES REVIEW SECTION */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 shadow-md dark:border-indigo-900/60 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 pb-4 dark:border-indigo-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ML Anomaly Insight • Auditoria de Falsos Positivos
                </h3>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  SHAP Explainability Active
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Transações de alto valor identificadas pelo modelo XGBoost como <strong>Potenciais Falsos Positivos</strong> devido a divergências pontuais de geolocalização ou pico de velocidade em clientes com alto LTV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:border-indigo-900/60 dark:bg-slate-800 dark:text-slate-200">
              <span className="text-slate-400">Taxa de Falso Positivo (FPR):</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">0.04%</strong>{' '}
              <span className="text-[10px] text-slate-400">(Meta: &lt; 0.10%)</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {mlActionFeedback && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{mlActionFeedback}</span>
            </div>
            <button onClick={() => setMlActionFeedback(null)} className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* False Positives Review Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {falsePositiveItems.map(item => {
            const isVerified = item.status === 'verified_legitimate';
            const isWhitelisted = item.status === 'whitelisted';

            return (
              <div 
                key={item.id}
                className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all ${
                  isVerified
                    ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                    : isWhitelisted
                    ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/20'
                    : 'border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-700'
                }`}
              >
                <div>
                  {/* Top Item Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {item.paymentIntentId}
                        </span>
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          {item.customerTier}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {item.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.customerEmail} • {item.cardBrand}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {currencySymbol} {(item.amount * currencyRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Score: <span className="font-bold text-rose-600">{item.initialRiskScore}</span> → Confiança ML: <span className="font-bold text-emerald-600">{item.mlTrustScore}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Anomaly & Residual Insight */}
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-900/60">
                    <p className="font-semibold text-rose-700 dark:text-rose-400">
                      Gatilho Inicial: <span className="font-normal text-slate-700 dark:text-slate-300">{item.triggerReason}</span>
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      <strong>Análise Residual:</strong> {item.residualExplanation}
                    </p>
                  </div>

                  {/* SHAP Feature Contribution Bars */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Contribuição de Features (SHAP Values)
                    </p>
                    {item.featureWeights.map((fw, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{fw.feature}</span>
                        <span className={`font-mono font-bold ${fw.isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {fw.isNegative ? `+${fw.impact}` : `${fw.impact}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operator Actions */}
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                  {item.status === 'pending_review' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVerifyFalsePositive(item, 'verified_legitimate')}
                        className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Validar & Treinar ML</span>
                      </button>

                      <button
                        onClick={() => handleVerifyFalsePositive(item, 'whitelisted')}
                        className="flex items-center justify-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Whitelist</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        {item.status === 'verified_legitimate' ? 'Auditado & Modelo Treinado' : 'Adicionado à Whitelist'}
                      </span>
                      <button
                        onClick={() => handleVerifyFalsePositive(item, 'pending_review')}
                        className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                      >
                        Reverter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ML-BASED 48-HOUR FORECASTING & SURGE PREDICTION WIDGET */}
      <WidgetSuspense><MlForecastingWidget /></WidgetSuspense>

      {/* GEOGRAPHICAL & SECTOR RISK CONCENTRATION HEATMAP */}
      <WidgetSuspense><GeographicalHeatMap /></WidgetSuspense>

      {/* TRANSACTION TABLE WITH BULK TAGGING & DISPLAY DENSITY SUPPORT */}
      <TransactionTableWithBulkTagging />

      {/* Grid: Adquirers Health Monitor & Event Bus Stream */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Acquirer Health & Circuit Breakers (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monitor de Adquirentes & Circuit Breakers
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Taxa de erro em janela de 1 min, latência e acionamento de contingência em tempo real
                </p>
              </div>
              <button
                onClick={() => setActiveTab('orchestration')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                <span>Configurar Regras</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {acquirers.map(acq => {
                const isDegraded = acq.healthStatus === 'degraded';
                const isDown = acq.healthStatus === 'down' || acq.circuitBreakerTripped;

                return (
                  <div
                    key={acq.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${
                        isDown 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isDegraded
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {acq.provider.toUpperCase().slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {acq.name}
                          </h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isDown
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : isDegraded
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {isDown ? 'Circuit Open (Down)' : isDegraded ? 'Degraded' : 'Healthy (Up)'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>Latência: <strong>{acq.latencyMs}ms</strong></span>
                          <span>•</span>
                          <span>Erro 1m: <strong className={acq.errorRate1m > 5 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>{acq.errorRate1m}%</strong></span>
                          <span>•</span>
                          <span>Taxa: <strong>{acq.feePercentage}%</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Circuit breaker toggle & simulator buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        title="Alternar Circuit Breaker"
                        onClick={() => toggleCircuitBreaker(acq.id)}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          acq.circuitBreakerTripped
                            ? 'bg-rose-600 text-white hover:bg-rose-500'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {acq.circuitBreakerTripped ? 'Desarmar Circuito' : 'Simular Queda'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Flow Insight */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Inteligência Nercash de Roteamento em Execução
                </h4>
                <p className="mt-0.5 text-xs text-emerald-800 dark:text-emerald-200">
                  Caso a adquirente primária atinja latência &gt; 1000ms ou retorne erro técnico HTTP 5xx, o motor redireciona a requisição instantaneamente para o próximo nó da <strong>Fallback Chain</strong> sem fricção para o comprador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Event Stream (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Event Bus Stream
                </h3>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Kafka / SQS Replay
              </span>
            </div>

            {/* Event list */}
            <div className="mt-4 max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum evento registrado ainda.
                </div>
              ) : (
                events.map(evt => {
                  const isApproved = evt.type === 'payment.approved';
                  const isDeclined = evt.type === 'payment.declined';
                  const isRisk = evt.type === 'risk.evaluated';
                  const isRoute = evt.type === 'route.selected';

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-emerald-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold ${
                          isApproved 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isDeclined
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isRisk
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : isRoute
                                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(evt.timestamp).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 line-clamp-1 font-mono">
                        {JSON.stringify(evt.payload)}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        <span>ID: {evt.id}</span>
                        <span className="flex items-center gap-1 font-semibold">
                          Inspecionar Payload <Eye className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING REAL-TIME TOAST NOTIFICATIONS (TOP-RIGHT/BOTTOM-RIGHT) */}
      {activeToasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-auto animate-in slide-in-from-bottom-5">
          {activeToasts.map(toast => (
            <div
              key={toast.id}
              className="relative overflow-hidden rounded-2xl border-2 border-rose-500 bg-slate-950 p-4 text-white shadow-2xl ring-4 ring-rose-500/20 backdrop-blur-xl"
            >
              {/* Pulsing indicator */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white animate-bounce">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-rose-400 uppercase tracking-wider">
                        ⚠️ Alerta Crítico de Risco ML
                      </span>
                      <span className="rounded bg-rose-900/80 px-2 py-0.5 text-[11px] font-mono font-black text-rose-200">
                        Score {toast.riskScore}/100
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white mt-0.5">
                      {toast.customerName} • R$ {toast.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissToast(toast.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Reasons */}
              <div className="mt-3 space-y-1 rounded-xl bg-slate-900/90 p-2.5 text-[11px] border border-slate-800">
                {toast.reasons.map((r, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <span className="text-rose-500">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Adquirente: {toast.acquirer}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setInspectedAlert(toast);
                      handleDismissToast(toast.id);
                    }}
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                  >
                    Inspecionar
                  </button>
                  <button
                    onClick={() => {
                      handleDismissToast(toast.id);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    Bloquear & Dispensar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: Alert History & Config */}
      {showAlertConfigDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico de Alertas de Risco Transacional
                </h3>
              </div>
              <button
                onClick={() => setShowAlertConfigDrawer(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Threshold slider */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Sensibilidade do Limiar de Alerta: <strong>{riskAlertThreshold}/100</strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Scores iguais ou superiores disparam o toast
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={riskAlertThreshold}
                onChange={(e) => setRiskAlertThreshold(Number(e.target.value))}
                className="mt-2 w-full accent-rose-600"
              />
            </div>

            {/* List of alerts */}
            <div className="mt-4 max-h-80 space-y-2.5 overflow-y-auto">
              {alertHistory.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Nenhum alerta de risco registrado.
                </p>
              ) : (
                alertHistory.map(al => (
                  <div
                    key={al.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {al.customerName}
                        </span>
                        <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-black text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Score {al.riskScore}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          R$ {al.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {(al.reasons || []).join(' • ')}
                      </p>
                      <span className="mt-1 block text-[10px] text-slate-400 font-mono">
                        {new Date(al.timestamp).toLocaleString('pt-BR')} • {al.actionTaken}
                      </span>
                    </div>

                    <button
                      onClick={() => setInspectedAlert(al)}
                      className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200"
                    >
                      Detalhes
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowAlertConfigDrawer(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer for Inspected Alert */}
      {inspectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Diagnóstico da Anomalia Transacional
                </h3>
              </div>
              <button onClick={() => setInspectedAlert(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ID da Transação:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{inspectedAlert.paymentIntentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cardholder:</span>
                <span className="font-bold text-slate-900 dark:text-white">{inspectedAlert.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Valor da Operação:</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {inspectedAlert.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Score de Risco ML:</span>
                <span className="font-bold text-rose-600">{inspectedAlert.riskScore} / 100</span>
              </div>

              <div className="mt-3 rounded-xl bg-slate-950 p-3 text-slate-300 font-mono text-[11px]">
                <p className="font-bold text-rose-400 mb-1">Motivos Heurísticos:</p>
                {inspectedAlert.reasons.map((r, i) => (
                  <p key={i}>- {r}</p>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setInspectedAlert(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer for Event Payload Inspection */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payload do Evento [{selectedEvent.type}]
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Event ID: <strong className="font-mono">{selectedEvent.id}</strong></span>
                <span>{new Date(selectedEvent.timestamp).toLocaleString('pt-BR')}</span>
              </div>
              {selectedEvent.paymentIntentId && (
                <div className="text-xs text-slate-500">
                  PaymentIntent ID: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{selectedEvent.paymentIntentId}</strong>
                </div>
              )}

              <div className="rounded-xl bg-slate-950 p-4 text-xs font-mono text-emerald-400 overflow-x-auto">
                <pre>{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      </>
      )}

      {/* Bulk CSV Upload Modal for ML Risk Engine */}
      <BulkCsvUploadModal
        isOpen={showBulkCsvModal}
        onClose={() => setShowBulkCsvModal(false)}
        onModelRetrained={(newVersion) => setMlModelVersion(newVersion)}
      />

      {/* Global Export Data Modal (CSV & Executive PDF) */}
      <GlobalExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Overview Export Wizard */}
      <OverviewExportWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Dashboard Snapshot (html2canvas + jsPDF) Modal */}
      <DashboardSnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        targetContainerId="dashboard-overview-container"
        totalVolume={totalVolume}
        totalTransactions={paymentIntents.length}
        approvalRate={Number(approvalRate) || 98.2}
        activeAcquirersCount={acquirers.filter(a => a.status === 'active').length || acquirers.length}
        selectedRegion={selectedRegion}
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};
