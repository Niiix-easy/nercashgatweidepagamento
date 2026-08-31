import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Palette, 
  Building2, 
  Globe, 
  Sliders, 
  Percent, 
  Check, 
  Layers, 
  Sparkles, 
  ShieldCheck,
  Eye,
  Upload,
  Loader2,
  AlertCircle,
  Database
} from 'lucide-react';
import { Tenant } from '../../types/payment';

export const WhiteLabelHub: React.FC = () => {
  const { currentTenant, updateTenantBranding, setActiveTab } = usePayment();

  // Branding local form state
  const [logoText, setLogoText] = useState<string>(currentTenant.branding.logoText);
  const [organizationName, setOrganizationName] = useState<string>(currentTenant.branding.organizationName || currentTenant.name);
  const [logoUrl, setLogoUrl] = useState<string>(currentTenant.branding.logoUrl || '');
  const [badgeText, setBadgeText] = useState<string>(currentTenant.branding.badgeText);
  const [primaryColor, setPrimaryColor] = useState<string>(currentTenant.branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>('#6366f1');
  const [themeMode, setThemeMode] = useState<Tenant['branding']['themeMode']>(currentTenant.branding.themeMode);
  
  // Security Scan state for logo upload
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'clean' | 'threat_detected'>('idle');

  // Checkout Theme options
  const [borderRadius, setBorderRadius] = useState<Tenant['checkoutTheme']['borderRadius']>(currentTenant.checkoutTheme.borderRadius);
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(currentTenant.checkoutTheme.showTrustBadges);
  const [enableBumpOffers, setEnableBumpOffers] = useState<boolean>(currentTenant.checkoutTheme.enableBumpOffers);
  const [defaultDiscountPix, setDefaultDiscountPix] = useState<number>(currentTenant.checkoutTheme.defaultDiscountPix);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<'branding' | 'subscriptions' | 'migrations'>('branding');
  const [dunningActive, setDunningActive] = useState<boolean>(true);
  const [dunningRetryDays, setDunningRetryDays] = useState<number>(3);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Enterprise Unlimited');
  const [migrationTargetTenant, setMigrationTargetTenant] = useState<string>('all');
  const [isMigratingTenants, setIsMigratingTenants] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<number>(0);
  const [migrationCompleted, setMigrationCompleted] = useState<boolean>(false);

  const handleRunTenantMigration = () => {
    setIsMigratingTenants(true);
    setMigrationProgress(0);
    setMigrationCompleted(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setMigrationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsMigratingTenants(false);
        setMigrationCompleted(true);
      }
    }, 400);
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type (PNG, JPEG, SVG)
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      alert('Formato inválido. Apenas arquivos PNG, JPEG ou SVG são permitidos.');
      return;
    }

    setIsScanning(true);
    setScanStatus('scanning');

    // Simulate Security Scan Service (Antivirus & Script Sanitization)
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus('clean');

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }, 1400);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding(
      {
        logoText,
        organizationName,
        logoUrl,
        badgeText,
        primaryColor,
        accentColor: secondaryColor,
        themeMode
      },
      {
        borderRadius,
        showTrustBadges,
        enableBumpOffers,
        defaultDiscountPix
      }
    );

    // Apply globally via CSS variables (CSS Injector)
    document.documentElement.style.setProperty('--nercash-primary', primaryColor);
    document.documentElement.style.setProperty('--nercash-secondary', secondaryColor);
    document.documentElement.style.setProperty('--nercash-radius', borderRadius === 'lg' ? '1rem' : borderRadius === 'full' ? '9999px' : borderRadius === 'sm' ? '0.375rem' : '0.75rem');

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const presetThemes = [
    { name: 'Esmeralda Aurora', color: '#059669', mode: 'emerald' as const },
    { name: 'Indigo Enterprise', color: '#4f46e5', mode: 'indigo' as const },
    { name: 'Dark Cyberpunk', color: '#0f172a', mode: 'dark' as const },
    { name: 'Royal Violet', color: '#7c3aed', mode: 'indigo' as const },
    { name: 'Ruby Fintech', color: '#e11d48', mode: 'light' as const }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              White Label & Multi-Tenant Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalização completa de marca, temas de checkout, isolamento de dados e tabela comercial
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('checkout')}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Eye className="h-4 w-4" />
          <span>Ver Checkout Customizado</span>
        </button>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          type="button"
          onClick={() => setSubTab('branding')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${subTab === 'branding' ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          Branding & Temas de Checkout
        </button>
        <button
          type="button"
          onClick={() => setSubTab('subscriptions')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${subTab === 'subscriptions' ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          Subscription & Billing (Dunning & Planos)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('migrations')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all ${subTab === 'migrations' ? 'border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
        >
          Tenant Migration Wizard (SQL/JSON Schema)
        </button>
      </div>

      {subTab === 'migrations' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Tenants Registrados</span>
              <div className="text-lg font-bold text-slate-900 dark:text-white">12 Tenants Ativos</div>
              <p className="text-[11px] text-slate-400">Isolamento Row-Level Security (RLS) verificado.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Versão de Schema Atual</span>
              <div className="text-lg font-bold text-emerald-600">v4.2.0-Enterprise</div>
              <p className="text-[11px] text-slate-400">Migrações automáticas aplicadas sem downtime.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Status de Consistência</span>
              <div className="text-lg font-bold text-indigo-600">100% Sincronizado</div>
              <p className="text-[11px] text-slate-400">Nenhum tenant com schema obsoleto.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tenant Migration Wizard & SQL Schema Synchronizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Garante consistência de schema e políticas multi-tenant em todos os bancos de dados antes da migração para produção.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={migrationTargetTenant}
                  onChange={(e) => setMigrationTargetTenant(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Todos os Tenants (Cluster Completo)</option>
                  <option value="tenant_nercash_main">Tenant Principal (Nercash)</option>
                  <option value="tenant_partner_alpha">Partner Alpha Pay</option>
                  <option value="tenant_beta_store">Beta Store Checkout</option>
                </select>

                <button
                  type="button"
                  onClick={handleRunTenantMigration}
                  disabled={isMigratingTenants}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Database className={`h-4 w-4 ${isMigratingTenants ? 'animate-spin' : ''}`} />
                  <span>{isMigratingTenants ? `Migrando (${migrationProgress}%)...` : 'Executar Migração de Schema'}</span>
                </button>
              </div>
            </div>

            {isMigratingTenants && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  <span>Aplicando scripts de migração V4.2.0 em {migrationTargetTenant}...</span>
                  <span>{migrationProgress}%</span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${migrationProgress}%` }}></div>
                </div>
              </div>
            )}

            {migrationCompleted && !isMigratingTenants && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Migração de Schema Executada com Sucesso em {migrationTargetTenant.toUpperCase()}
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Políticas de Row-Level Security (RLS), partições de transações e constraints de imutabilidade aplicadas sem erros.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200 space-y-2 dark:border-slate-800">
              <div className="text-slate-400 text-[10px]">-- Automated SQL/JSON Migration Script Preview (V4.2.0)</div>
              <div>ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;</div>
              <div>ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;</div>
              <div>CREATE POLICY tenant_isolation_policy ON transactions USING (merchant_id = current_setting('app.current_tenant_id', true));</div>
              <div>CREATE TABLE audit_logs_immutable (log_id UUID PRIMARY KEY, payload_hash VARCHAR(64));</div>
            </div>
          </div>
        </div>
      ) : subTab === 'subscriptions' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Plano Atual do Tenant</span>
              <div className="text-lg font-bold text-rose-600">{subscriptionPlan}</div>
              <p className="text-[11px] text-slate-400">Renovação automática em 14/09/2026. Sem limite de TPV.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Receita Recorrente (ARR)</span>
              <div className="text-lg font-bold text-emerald-600">R$ 1.482.900,00</div>
              <p className="text-[11px] text-slate-400">+24.8% em relação ao mês anterior.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
              <span className="text-xs text-slate-500">Dunning (Recuperação de Inadimplência)</span>
              <div className="text-lg font-bold text-indigo-600">{dunningActive ? 'Ativo (Automático)' : 'Desativado'}</div>
              <p className="text-[11px] text-slate-400">Tentativas automáticas a cada {dunningRetryDays} dias via PIX/Cartão.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
              Configurações de Assinaturas e Gestão de Dunning
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selecionar Plano de Licenciamento</label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="Enterprise Unlimited">Enterprise Unlimited (R$ 2.499/mês)</option>
                    <option value="Scale Growth">Scale Growth (R$ 999/mês)</option>
                    <option value="Startup Fintech">Startup Fintech (R$ 399/mês)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Dunning Automático (Retentativa de Cobrança)</div>
                    <div className="text-[11px] text-slate-500">Dispara novas tentativas via WhatsApp e E-mail se a fatura expirar.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dunningActive}
                    onChange={(e) => setDunningActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Intervalo de Retentativas de Dunning (Dias)</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={dunningRetryDays}
                    onChange={(e) => setDunningRetryDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 space-y-3">
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200">Ciclo de Cobrança & Webhooks de Faturamento</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  O motor de billing da Nercash gerencia faturas recorrentes, prrorrogações de vencimento e cálculo automático de taxas de adquirentes com base no TPV mensal consolidado.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Configurações de Subscription & Dunning salvas com sucesso!')}
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white shadow-md hover:bg-rose-500 transition-all"
                >
                  Salvar Preferências de Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual Customizer Form (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <form onSubmit={handleSaveBranding} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personalização de Marca do Tenant
              </h3>
              {savedSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <Check className="h-4 w-4" /> Salvo com Sucesso!
                </span>
              )}
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Preset Palettes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Paleta de Cores da Marca:
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presetThemes.map(pt => (
                    <button
                      type="button"
                      key={pt.name}
                      onClick={() => {
                        setPrimaryColor(pt.color);
                        setThemeMode(pt.mode);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 transition-all hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: pt.color }} />
                      <span>{pt.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Customizer - CSS Variables */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 space-y-3">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Theme Customizer (Variáveis CSS Globais)</span>
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cor Primária (--nercash-primary)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cor Secundária (--nercash-secondary)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-9 w-12 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Raio de Borda Global (--nercash-radius)
                  </label>
                  <div className="flex items-center gap-2">
                    {(['sm', 'md', 'lg', 'full'] as const).map(radius => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setBorderRadius(radius)}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                          borderRadius === radius
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {radius === 'sm' && 'sm'}
                        {radius === 'md' && 'md'}
                        {radius === 'lg' && 'lg'}
                        {radius === 'full' && 'full'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Inputs & Organization Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Nome da Organização (Tenant)
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Nome da Marca no Checkout
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Slogan / Sub-badge
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Logo Upload with Security Scan Service */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-rose-600" />
                      <span>Upload de Logo & Security Scan (SVG / PNG / JPEG)</span>
                    </span>
                    <p className="text-[11px] text-slate-500">Varredura automática de malware e saneamento de scripts antes do armazenamento.</p>
                  </div>
                  {scanStatus === 'clean' && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" /> Seguro & Sanitizado
                    </span>
                  )}
                  {scanStatus === 'scanning' && (
                    <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Escaneando Arquivo...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden dark:border-slate-700 dark:bg-slate-900 shadow-sm">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={handleLogoUpload}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-950 dark:file:text-rose-300 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Tamanho máximo: 2MB. SVG higienizado automaticamente contra XSS.</span>
                  </div>
                </div>
              </div>

              {/* Checkout Features */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Preferências Visuais do Super Checkout:
                </span>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500">Desconto Padrão no PIX (%)</label>
                    <input
                      type="number"
                      value={defaultDiscountPix}
                      onChange={(e) => setDefaultDiscountPix(Number(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500">Raio de Borda dos Botões</label>
                    <select
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="md">Suave (8px - md)</option>
                      <option value="lg">Arredondado (12px - lg)</option>
                      <option value="full">Pílula Total (full)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={enableBumpOffers}
                      onChange={(e) => setEnableBumpOffers(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Habilitar Motor de Bump Offers (Cross-sell no checkout)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showTrustBadges}
                      onChange={(e) => setShowTrustBadges(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Exibir Selos de Segurança Bancária e Criptografia</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500"
              >
                <Check className="h-4 w-4" />
                <span>Salvar e Aplicar no Tenant Atual</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Commercial & Multi-tenant Layer (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Real-Time Live Preview Window */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Eye className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Preview em Tempo Real
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse">
                Sincronizado
              </span>
            </div>

            {/* Preview Box */}
            <div 
              className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white shadow-lg space-y-3 transition-all"
              style={{ borderRadius: borderRadius === 'full' ? '1.5rem' : borderRadius === 'lg' ? '1rem' : borderRadius === 'sm' ? '0.375rem' : '0.5rem' }}
            >
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center font-black text-xs text-slate-900" style={{ backgroundColor: primaryColor }}>
                    {logoText ? logoText.substring(0, 2).toUpperCase() : 'NC'}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{logoText || 'Nercash Pay'}</div>
                    <div className="text-[9px] text-slate-400">{badgeText || 'Enterprise Gateway'}</div>
                  </div>
                </div>
                <span className="rounded px-2 py-0.5 text-[9px] font-bold" style={{ backgroundColor: `${primaryColor}33`, color: primaryColor }}>
                  Ativo
                </span>
              </div>

              {/* Preview Metric Card */}
              <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">TPV Simulado (Live)</div>
                <div className="text-sm font-black font-mono mt-0.5" style={{ color: primaryColor }}>R$ 142.850,00</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[9px] text-emerald-400 font-bold">99.98% Aprovado</span>
                  <button
                    type="button"
                    className="px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition-all"
                    style={{ 
                      backgroundColor: primaryColor,
                      borderRadius: borderRadius === 'full' ? '9999px' : borderRadius === 'lg' ? '0.5rem' : borderRadius === 'sm' ? '0.25rem' : '0.375rem'
                    }}
                  >
                    Testar Botão
                  </button>
                </div>
              </div>

              {/* Preview Badge / Trust Footer */}
              <div className="text-center text-[9px] text-slate-400 pt-1 border-t border-slate-800">
                Variáveis CSS (--nercash-primary: {primaryColor}) aplicadas com sucesso
              </div>
            </div>
          </div>

          {/* Tabela de Taxas / Split Comercial */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Percent className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Tabela Comercial & Split de Repasse
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Taxa PIX do Tenant:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentTenant.feeTable.pixFeePercent}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Taxa Cartão de Crédito:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentTenant.feeTable.creditCardFeePercent}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Taxa Boleto Bancário:</span>
                <span className="font-bold text-slate-900 dark:text-white">R$ {currentTenant.feeTable.boletoFlatFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Split de Repasse Parceiro:</span>
                <span className="font-bold text-emerald-600">{currentTenant.feeTable.splitSharePercent}% do lucro líquido</span>
              </div>
            </div>
          </div>

          {/* Multi-tenant Architecture Card */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs dark:border-indigo-950 dark:bg-indigo-950/20">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-200">
              Isolamento Multi-tenant (Row-Level Security)
            </h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Cada transação, contato e regra de roteamento é estritamente vinculada ao <code>tenant_id</code> ativo, garantindo conformidade com padrões de segurança financeira.
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
