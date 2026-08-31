import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePayment } from '../../context/PaymentContext';
import { NercashLogo } from '../common/NercashLogo';
import { ProviderHealthDetailsModal } from './ProviderHealthDetailsModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { SecurityAuditModal } from '../compliance/SecurityAuditModal';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
import { PwaInstallButton } from '../common/PwaInstallButton';
import { ApiLatencyMonitor } from './ApiLatencyMonitor';
import { SynchronizationHealthHeader } from '../header/SynchronizationHealthHeader';
import { PanicButton } from '../common/PanicButton';
import { DiagnosticSnapshotModal } from '../common/DiagnosticSnapshotModal';
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
  AlignJustify,
  FileText,
  Mic,
  Compass,
  HelpCircle,
  Bot,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  onLogout?: () => void;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
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
    setCurrency,
    privacyMode,
    togglePrivacyMode
  } = usePayment();
  const [showStatusPopover, setShowStatusPopover] = useState<boolean>(false);
  const [showProviderModal, setShowProviderModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
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

        {/* SYNCHRONIZATION HEALTH (BROADCAST CHANNEL & SHARED WORKER STATE) */}
        <SynchronizationHealthHeader />

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

        {/* Display Density Switcher (Comfortable vs Compact vs Dense) */}
        <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 dark:border-slate-700 dark:bg-slate-800/90 relative">
          {(['comfortable', 'compact', 'dense'] as const).map((mode) => {
            const isActive = displayDensity === mode || (mode === 'dense' && displayDensity === 'data-dense');
            const label = mode === 'comfortable' ? 'Confortável' : mode === 'compact' ? 'Compacto' : 'Denso';
            const tooltip = 
              mode === 'comfortable' 
                ? 'Densidade Confortável (Visual espaçado e arejado)' 
                : mode === 'compact' 
                ? 'Densidade Compacta (Equilíbrio de produtividade)' 
                : 'Densidade Densa (Alta densidade para planilhas e análise financeira)';
            const Icon = mode === 'comfortable' ? Maximize2 : mode === 'compact' ? Minimize2 : AlignJustify;

            return (
              <button
                key={mode}
                id={`density-${mode}-btn`}
                type="button"
                onClick={() => setDisplayDensity(mode)}
                title={tooltip}
                className={`relative z-10 flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="header-density-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 z-[-1] rounded-lg bg-white shadow-xs dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600/60"
                  />
                )}
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
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

        {/* Diagnostic Snapshot Button */}
        <button
          id="header-diagnostic-snapshot-btn"
          type="button"
          onClick={() => setShowDiagnosticModal(true)}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          title="Gerar Snapshot de Diagnóstico e Suporte (JSON)"
        >
          <FileText className="h-3.5 w-3.5 text-violet-500" />
          <span>Diagnóstico</span>
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

        {/* Global Panic Button */}
        <PanicButton onPanicTriggered={() => {
          if (onLogout) onLogout();
          else window.location.reload();
        }} />

        {/* Global Privacy Mode Masking Toggle Button */}
        <button
          id="global-privacy-mode-toggle-btn"
          type="button"
          onClick={togglePrivacyMode}
          aria-label={privacyMode ? 'Desativar modo privacidade' : 'Ativar modo privacidade'}
          className={`flex h-9 items-center gap-1.5 px-3 rounded-xl border text-xs font-bold shadow-sm transition-all cursor-pointer ${
            privacyMode
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
          title={privacyMode ? 'Modo Privacidade Ativado (Dados Mascarados)' : 'Ativar Modo Privacidade (Mascarar PII e Cartões)'}
        >
          {privacyMode ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4" />}
          <span className="hidden lg:inline">{privacyMode ? 'Privacidade ON' : 'Privacidade'}</span>
        </button>

        {/* Display Density Setting */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
          <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
          <select
            id="display-density-select"
            value={displayDensity}
            onChange={(e) => setDisplayDensity(e.target.value as any)}
            className="cursor-pointer appearance-none bg-transparent text-xs font-semibold text-slate-600 outline-none dark:text-slate-300"
            title="Densidade de Exibição"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
            <option value="data-dense">Data-Dense</option>
          </select>
        </div>

        {/* User Assistance Copilot Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-user-assistance'))}
          className="flex h-9 items-center gap-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-all cursor-pointer"
          title="Assistência Inteligente ao Usuário (Nercash AI Copilot)"
        >
          <Bot className="h-4 w-4 text-white animate-pulse" />
          <span className="hidden sm:inline">Assistência AI</span>
        </button>

        {/* LGPD Data Subject Portal Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-lgpd-portal'))}
          className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50/80 text-xs font-bold text-emerald-800 shadow-sm transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 cursor-pointer"
          title="Portal do Titular LGPD & Privacidade (Lei nº 13.709/18)"
        >
          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">LGPD</span>
        </button>

        {/* Module Tutorial & Orientation Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-module-tutorial'))}
          className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 cursor-pointer"
          title="Guia & Tutorial do Módulo Atual"
        >
          <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
          <span className="hidden sm:inline">Guia do Módulo</span>
        </button>

        {/* Help & Shortcuts Button (?) */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nercash:open-help-overlay'))}
          className="flex h-9 items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          title="Central de Ajuda e Atalhos de Teclado (Pressione '?')"
        >
          <Keyboard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">?</kbd>
        </button>

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

        {/* Admin User Profile & Logout */}
        {onLogout && (
          <div className="hidden lg:flex relative group items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="flex flex-col text-right cursor-pointer">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">
                {user?.name || 'Maycon Quevedo'}
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono flex items-center justify-end gap-1">
                {user?.email || 'neersoftwarebr@gmail.com'}
                <ChevronDown className="h-3 w-3" />
              </span>
            </div>

            {/* Profile Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="mb-2 px-2 pb-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Ajustes de Workspace
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setDisplayDensity('comfortable')}
                  className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded-lg transition-colors ${displayDensity === 'comfortable' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  Comfortable
                  {displayDensity === 'comfortable' && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setDisplayDensity('compact')}
                  className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded-lg transition-colors ${displayDensity === 'compact' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  Compact
                  {displayDensity === 'compact' && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setDisplayDensity('data-dense')}
                  className={`w-full flex justify-between items-center px-3 py-2 text-xs rounded-lg transition-colors ${displayDensity === 'data-dense' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  Data-Dense
                  {displayDensity === 'data-dense' && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )}
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

      {/* Diagnostic Snapshot Modal */}
      <DiagnosticSnapshotModal
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
      />
    </header>
  );
};


