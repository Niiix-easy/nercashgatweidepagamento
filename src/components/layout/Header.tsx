import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { NercashLogo } from '../common/NercashLogo';
import { ProviderHealthDetailsModal } from './ProviderHealthDetailsModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SecurityAuditModal } from '../compliance/SecurityAuditModal';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { ApiLatencyMonitor } from './ApiLatencyMonitor';
import { 
  ShieldCheck, 
  Activity, 
  Building2, 
  AlertTriangle,
  Sun,
  Moon,
  Zap,
  Server,
  Radio,
  Cpu,
  Globe2,
  ChevronDown,
  Lock,
  Calendar,
  ArrowRight,
  Search,
  Command,
  Shield,
  Keyboard,
  SlidersHorizontal,
  Rows,
  Maximize2,
  Minimize2,
  Mic
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentTenant, 
    tenants, 
    setCurrentTenant, 
    acquirers, 
    events, 
    theme, 
    toggleTheme,
    displayDensity,
    setDisplayDensity,
    language,
    setLanguage,
    currency,
    setCurrency
  } = usePayment();
  const [showStatusPopover, setShowStatusPopover] = useState<boolean>(false);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [uptimeStat] = useState<number>(99.994);
  const [currentLatency, setCurrentLatency] = useState<number>(18);
  const [activeTps, setActiveTps] = useState<number>(1420);

  // Global shortcut for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Slight jitter to simulate live gateway ping
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLatency(16 + Math.floor(Math.random() * 6));
      setActiveTps(1380 + Math.floor(Math.random() * 80));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const degradedAcquirers = acquirers.filter(a => a.healthStatus !== 'up' || a.circuitBreakerTripped);
  const isHealthy = degradedAcquirers.length === 0;

  const isNercashDefault = currentTenant.id === 'tenant_nercash' || currentTenant.branding.logoText.toLowerCase().includes('nercash');

  return (
    <header id="main-app-header" className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      {/* Brand & Tenant Selector */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          {isNercashDefault ? (
            <NercashLogo variant="horizontal" size="md" />
          ) : (
            <div className="flex items-center gap-3">
              <div 
                className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-sm transition-all"
                style={{ backgroundColor: currentTenant.branding.primaryColor }}
              >
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentTenant.branding.logoText}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentTenant.customDomain}
                </p>
              </div>
            </div>
          )}

          <span className="hidden items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 sm:inline-flex dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Live Gateway
          </span>
        </div>

        {/* Global Search Bar Trigger */}
        <button
          id="global-search-trigger"
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="hidden md:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all w-64 lg:w-72"
        >
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="flex-1 text-left truncate">Buscar transações, configs...</span>
          <kbd className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Tenant Switcher Pill */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 xl:flex dark:border-slate-700 dark:bg-slate-800">
          <Building2 className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Tenant:</span>
          <select 
            id="header-tenant-select"
            aria-label="Selecionar Tenant White Label"
            value={currentTenant.id}
            onChange={(e) => {
              const selected = tenants.find(t => t.id === e.target.value);
              if (selected) setCurrentTenant(selected);
            }}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-800 outline-none dark:text-slate-200"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id} className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time System Status Bar & Controls */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Buscar no sistema (⌘K)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* NERCASH API GATEWAY STATUS & REAL-TIME LATENCY MONITOR WIDGET */}
        <ApiLatencyMonitor onOpenProvidersModal={() => setShowProviderModal(true)} />

        {/* Status Adquirentes - Clickable to open detailed health history & maintenance windows */}
        <button
          type="button"
          onClick={() => setShowProviderModal(true)}
          title="Clique para ver histórico de saúde, SLA e janelas de manutenção dos provedores"
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${
            isHealthy 
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:border-emerald-400 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-amber-200 bg-amber-50/80 text-amber-800 hover:border-amber-400 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          {isHealthy ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">{acquirers.length} Provedores Online</span>
              <span className="sm:hidden">Online</span>
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-0.5 opacity-80" />
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>{degradedAcquirers.length} em Alerta</span>
            </>
          )}
        </button>

        {/* Live Event Indicator */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 md:flex dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          <Activity className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white">{events.length}</span>
          <span className="text-slate-500">eventos</span>
        </div>

        {/* Heavy Security & PCI-DSS Level 1 clickable audit trigger */}
        <button
          type="button"
          onClick={() => setShowSecurityModal(true)}
          title="Clique para auditar a segurança pesada e certificação PCI-DSS Level 1"
          className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs hover:bg-emerald-100 sm:flex dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950 transition-all cursor-pointer"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>PCI Level 1 (Grade A+)</span>
        </button>

        {/* Display Density Switcher (Comfortable vs Compact) */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/80">
          <button
            id="density-comfortable-btn"
            type="button"
            onClick={() => setDisplayDensity('comfortable')}
            title="Densidade Confortável (Visual mais espaçado)"
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
              displayDensity === 'comfortable'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Confortável</span>
          </button>
          <button
            id="density-compact-btn"
            type="button"
            onClick={() => setDisplayDensity('compact')}
            title="Densidade Compacta (Visual denso para alta produtividade em tabelas)"
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
              displayDensity === 'compact'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Compacto</span>
          </button>
        </div>

        {/* Voice-Activated Assistant Button */}
        <button
          id="header-voice-assistant-btn"
          type="button"
          onClick={() => setShowVoiceModal(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 cursor-pointer"
          title="Assistente de Voz Nercash AI (ex: 'mostrar transações', 'relatório de risco')"
        >
          <Mic className="h-4 w-4 animate-pulse text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* Global Keyboard Shortcuts Help Button */}
        <button
          id="header-keyboard-shortcuts-btn"
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-shortcuts-modal'))}
          className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          title="Atalhos Globais do Teclado (Pressione ?)"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Multi-Language Selector */}
        <div className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
          <Globe2 className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none dark:text-slate-200"
            aria-label="Selecionar Idioma"
          >
            <option value="pt-BR" className="bg-white dark:bg-slate-800">PT (BR)</option>
            <option value="en-US" className="bg-white dark:bg-slate-800">EN (US)</option>
            <option value="es" className="bg-white dark:bg-slate-800">ES (LATAM)</option>
          </select>
        </div>

        {/* Multi-Currency Selector */}
        <div className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
            {currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
          </span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 outline-none dark:text-slate-200"
            aria-label="Selecionar Moeda"
          >
            <option value="BRL" className="bg-white dark:bg-slate-800">BRL (R$)</option>
            <option value="USD" className="bg-white dark:bg-slate-800">USD ($)</option>
            <option value="EUR" className="bg-white dark:bg-slate-800">EUR (€)</option>
            <option value="GBP" className="bg-white dark:bg-slate-800">GBP (£)</option>
          </select>
        </div>

        {/* PWA Install Button */}
        <PwaInstallButton />

        {/* Global Theme Toggle */}
        <button
          id="global-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>
      </div>

      {/* Provider Health & Maintenance Windows Detailed Modal */}
      <ProviderHealthDetailsModal
        isOpen={showProviderModal}
        onClose={() => setShowProviderModal(false)}
      />

      {/* Global Search & Command Palette Modal */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Security Hardening & PCI-DSS Audit Modal */}
      <SecurityAuditModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />
    </header>
  );
};


