import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  CreditCard, 
  Palette, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  QrCode, 
  Lock, 
  DollarSign,
  Zap,
  Sliders,
  Store
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: 'Emerald Fintech', color: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Indigo Digital', color: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Sky Enterprise', color: '#0284c7', bgClass: 'bg-sky-600' },
  { name: 'Rose Luxury', color: '#e11d48', bgClass: 'bg-rose-600' },
  { name: 'Amber Gold', color: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Slate Modern', color: '#1e293b', bgClass: 'bg-slate-800' }
];

const GATEWAY_PRESETS = [
  { id: 'stone', name: 'Stone Gateway', desc: 'Taxas reduzidas para cartão de crédito e liquidação D+1', badge: 'Recomendado' },
  { id: 'mercadopago', name: 'Mercado Pago', desc: 'Alta conversão Pix e parcelamento flexível com Mercado Crédito', badge: 'Alta Conversão' },
  { id: 'cielo', name: 'Cielo 3.0', desc: 'Processamento corporativo com Cybersource e 3DS 2.0 nativo', badge: 'Enterprise' },
  { id: 'asaas', name: 'Asaas Finanças', desc: 'Ideal para Pix e boletos bancários com baixa automática', badge: 'Boleto & Pix' },
  { id: 'pix_spi', name: 'BACEN SPI Direto', desc: 'Liquidação instantânea direta no Sistema de Pagamentos Instantâneos', badge: '0% Spread' }
];

export const CheckoutOnboardingWizard: React.FC<CheckoutOnboardingWizardProps> = ({
  isOpen,
  onClose
}) => {
  const { currentTenant, updateTenantBranding } = usePayment();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Merchant Profile
  const [storeName, setStoreName] = useState<string>(currentTenant.name || 'Minha Loja Digital');
  const [logoText, setLogoText] = useState<string>(currentTenant.branding.logoText || 'Nercash Pay');
  const [badgeText, setBadgeText] = useState<string>(currentTenant.branding.badgeText || 'Checkout Seguro 256-bit SSL');
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');

  // Step 2: Processor Configuration
  const [selectedGateway, setSelectedGateway] = useState<string>('stone');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [apiKeyInput, setApiKeyInput] = useState<string>('sk_test_nercash_live_992817482');

  // Step 3: Payment Methods
  const [enablePix, setEnablePix] = useState<boolean>(true);
  const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(currentTenant.checkoutTheme.defaultDiscountPix || 5);
  const [enableCards, setEnableCards] = useState<boolean>(true);
  const [maxInstallments, setMaxInstallments] = useState<number>(12);
  const [enableBoleto, setEnableBoleto] = useState<boolean>(true);

  // Step 4: Branding & Colors
  const [primaryColor, setPrimaryColor] = useState<string>(currentTenant.branding.primaryColor || '#059669');
  const [accentColor, setAccentColor] = useState<string>(currentTenant.branding.accentColor || '#10b981');
  const [borderRadius, setBorderRadius] = useState<'rounded-2xl' | 'rounded-lg' | 'rounded-none'>('rounded-2xl');

  if (!isOpen) return null;

  const handleFinishWizard = () => {
    // Apply changes to tenant branding & checkout theme
    updateTenantBranding(
      {
        ...currentTenant.branding,
        logoText,
        badgeText,
        primaryColor,
        accentColor
      },
      {
        ...currentTenant.checkoutTheme,
        primaryColor,
        defaultDiscountPix: pixDiscountPercent,
        borderRadius
      }
    );

    // Trigger Celebration Confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Guia de Configuração Rápida • Super Checkout
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure seu gateway de pagamento principal, taxas e identidade visual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Progress */}
        <div className="border-b border-slate-100 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-2 font-bold ${currentStep >= 1 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                currentStep >= 1 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>1</span>
              <span>Perfil</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 2 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${currentStep >= 2 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                currentStep >= 2 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>2</span>
              <span>Adquirente</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 3 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${currentStep >= 3 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                currentStep >= 3 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>3</span>
              <span>Métodos</span>
            </div>

            <div className={`h-0.5 flex-1 mx-2 ${currentStep >= 4 ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

            <div className={`flex items-center gap-2 font-bold ${currentStep >= 4 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                currentStep >= 4 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              }`}>4</span>
              <span>Branding</span>
            </div>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Merchant Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-violet-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Passo 1: Identificação do Estabelecimento & Moeda Base
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Nome da Empresa / Tenant
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Título no Cabeçalho do Checkout
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Selo de Confiança / Badge de Segurança
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Moeda Padrão de Cobrança
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['BRL', 'USD', 'EUR'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrency(curr)}
                        className={`rounded-xl border p-2.5 text-center font-bold transition-all ${
                          currency === curr
                            ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {curr === 'BRL' && 'Real (R$ BRL)'}
                        {curr === 'USD' && 'Dólar ($ USD)'}
                        {curr === 'EUR' && 'Euro (€ EUR)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Processor Configuration */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-violet-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Passo 2: Selecione o Gateway / Adquirente Principal
                </h4>
              </div>

              <div className="space-y-2">
                {GATEWAY_PRESETS.map((gw) => {
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <div
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50/50 dark:border-violet-500 dark:bg-violet-950/40 ring-1 ring-violet-500'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {gw.name}
                            </span>
                            <span className="rounded bg-black/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                              {gw.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {gw.desc}
                          </p>
                        </div>
                      </div>

                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Ambiente Operacional</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                  >
                    <option value="sandbox">Sandbox (Homologação & Testes)</option>
                    <option value="production">Produção Live (Transações Reais)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Chave Secreta de API</label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Methods */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-violet-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Passo 3: Ativação de Métodos & Desconto Pix
                </h4>
              </div>

              <div className="space-y-3">
                {/* Pix Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Pix Instantâneo (BACEN SPI)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enablePix}
                      onChange={(e) => setEnablePix(e.target.checked)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                    />
                  </div>
                  {enablePix && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Desconto de Incentivo ao Pix:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={pixDiscountPercent}
                          onChange={(e) => setPixDiscountPercent(Number(e.target.value))}
                          min={0}
                          max={20}
                          className="w-16 rounded-lg border border-slate-300 bg-white p-1 text-center font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">% OFF</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cards Config */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-sky-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Cartão de Crédito (Visa, Master, Elo, Amex)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableCards}
                      onChange={(e) => setEnableCards(e.target.checked)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                    />
                  </div>
                  {enableCards && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-700/60 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Parcelamento Máximo Sem Juros:</span>
                      <select
                        value={maxInstallments}
                        onChange={(e) => setMaxInstallments(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 bg-white p-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value={1}>1x (À vista)</option>
                        <option value={3}>Até 3x sem juros</option>
                        <option value={6}>Até 6x sem juros</option>
                        <option value={12}>Até 12x sem juros</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Boleto Config */}
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Boleto Bancário com Registro Automático
                  </span>
                  <input
                    type="checkbox"
                    checked={enableBoleto}
                    onChange={(e) => setEnableBoleto(e.target.checked)}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Branding & Colors */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-violet-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Passo 4: Identidade Visual & Cores do Checkout
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Selecione a Cor Primária da Marca:
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {COLOR_PRESETS.map((cp) => {
                    const isSelected = primaryColor === cp.color;
                    return (
                      <button
                        key={cp.color}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(cp.color);
                          setAccentColor(cp.color);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800 ring-2 ring-violet-500'
                            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-850'
                        }`}
                      >
                        <div
                          className="h-6 w-6 rounded-full shadow-sm"
                          style={{ backgroundColor: cp.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {cp.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Pré-visualização do Topo do Checkout:
                </span>
                <div
                  className="mt-2 flex items-center justify-between rounded-xl px-4 py-3 text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 fill-white" />
                    <div>
                      <span className="text-xs font-bold">{logoText}</span>
                      <p className="text-[10px] text-white/80">{badgeText}</p>
                    </div>
                  </div>
                  <div className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
                    SSL 256-bit
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full rounded-xl py-2 text-xs font-bold text-white shadow-md"
                  >
                    Pagar Agora • Desconto Pix {pixDiscountPercent}%
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-850">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(s => s - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(s => s + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-500"
            >
              <span>Avançar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Salvar & Aplicar ao Checkout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
