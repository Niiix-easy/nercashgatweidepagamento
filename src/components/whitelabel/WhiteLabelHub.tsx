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
  Eye
} from 'lucide-react';
import { Tenant } from '../../types/payment';

export const WhiteLabelHub: React.FC = () => {
  const { currentTenant, updateTenantBranding, setActiveTab } = usePayment();

  // Branding local form state
  const [logoText, setLogoText] = useState<string>(currentTenant.branding.logoText);
  const [badgeText, setBadgeText] = useState<string>(currentTenant.branding.badgeText);
  const [primaryColor, setPrimaryColor] = useState<string>(currentTenant.branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState<string>('#6366f1');
  const [themeMode, setThemeMode] = useState<Tenant['branding']['themeMode']>(currentTenant.branding.themeMode);
  
  // Checkout Theme options
  const [borderRadius, setBorderRadius] = useState<Tenant['checkoutTheme']['borderRadius']>(currentTenant.checkoutTheme.borderRadius);
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(currentTenant.checkoutTheme.showTrustBadges);
  const [enableBumpOffers, setEnableBumpOffers] = useState<boolean>(currentTenant.checkoutTheme.enableBumpOffers);
  const [defaultDiscountPix, setDefaultDiscountPix] = useState<number>(currentTenant.checkoutTheme.defaultDiscountPix);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding(
      {
        logoText,
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

    // Apply globally via CSS variables
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

      {/* Main Configuration Grid */}
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

              {/* Text Inputs */}
              <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
};
