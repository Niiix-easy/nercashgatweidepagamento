import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  CreditCard, 
  QrCode, 
  Barcode, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  Smartphone, 
  Monitor, 
  Lock, 
  Zap, 
  ArrowRight, 
  PackageCheck, 
  Share2, 
  ExternalLink, 
  ChevronDown,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethodType } from '../../types/payment';
import { CheckoutOnboardingWizard } from './CheckoutOnboardingWizard';

export const SuperCheckoutView: React.FC = () => {
  const { currentTenant, processPaymentIntent, paymentIntents } = usePayment();

  // Mode: Desktop preview or Mobile frame preview
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showOnboardingWizard, setShowOnboardingWizard] = useState<boolean>(false);
  
  // Checkout Dynamic States
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('pix');
  const [productAmount, setProductAmount] = useState<number>(499.00);
  const [productTitle, setProductTitle] = useState<string>('Curso Master em Fintechs & Orquestração de Pagamentos');

  // Customer Form
  const [customerName, setCustomerName] = useState<string>('Mariana Duarte Souza');
  const [customerEmail, setCustomerEmail] = useState<string>('mari.duarte@startup.io');
  const [customerDoc, setCustomerDoc] = useState<string>('402.190.871-02');
  
  // Card Form
  const [cardNumber, setCardNumber] = useState<string>('5100 4091 8821 0019');
  const [cardHolder, setCardHolder] = useState<string>('MARIANA D SOUZA');
  const [cardExpiry, setCardExpiry] = useState<string>('11/29');
  const [cardCvv, setCardCvv] = useState<string>('481');
  const [cardInstallments, setCardInstallments] = useState<number>(1);
  const [cardBrandDetected, setCardBrandDetected] = useState<string>('Mastercard');

  // Bump Offers Engine
  const [selectedOffers, setSelectedOffers] = useState<string[]>(['Garantia Estendida +1 Ano (+R$ 49,90)']);

  const bumpOffers = [
    { id: 'offer_garantia', title: 'Garantia Estendida de 1 Ano', price: 49.90, desc: 'Cobertura total contra defeitos e suporte prioritário 24/7' },
    { id: 'offer_seguro', title: 'Seguro Antifraude & Proteção de Compra', price: 19.90, desc: 'Reembolso 100% garantido sem burocracia' },
    { id: 'offer_express', title: 'Acesso VIP Imediato & Certificado Físico', price: 29.90, desc: 'Material impresso entregue em 48 horas úteis' }
  ];

  // Calculated Totals
  const offersTotal = selectedOffers.reduce((acc, offerTitle) => {
    const found = bumpOffers.find(o => `${o.title} (+R$ ${o.price.toFixed(2).replace('.', ',')})` === offerTitle || offerTitle.includes(o.title));
    return acc + (found ? found.price : 0);
  }, 0);

  const pixDiscount = selectedMethod === 'pix' ? (productAmount * (currentTenant.checkoutTheme.defaultDiscountPix / 100)) : 0;
  const finalTotal = Math.max(0, productAmount + offersTotal - pixDiscount);

  // States for interactive processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completedIntentId, setCompletedIntentId] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [pixTimeLeft, setPixTimeLeft] = useState<number>(900); // 15 mins

  // Card Brand Detection
  useEffect(() => {
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.startsWith('4')) setCardBrandDetected('Visa');
    else if (clean.startsWith('5')) setCardBrandDetected('Mastercard');
    else if (clean.startsWith('6')) setCardBrandDetected('Elo');
    else if (clean.startsWith('3')) setCardBrandDetected('Amex');
    else setCardBrandDetected('Cartão de Crédito');
  }, [cardNumber]);

  // PIX Countdown Timer
  useEffect(() => {
    if (selectedMethod === 'pix' && pixTimeLeft > 0) {
      const timer = setInterval(() => setPixTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [selectedMethod, pixTimeLeft]);

  const handleToggleOffer = (offer: typeof bumpOffers[0]) => {
    const offerString = `${offer.title} (+R$ ${offer.price.toFixed(2).replace('.', ',')})`;
    if (selectedOffers.includes(offerString)) {
      setSelectedOffers(selectedOffers.filter(o => o !== offerString));
    } else {
      setSelectedOffers([...selectedOffers, offerString]);
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);

    try {
      const intent = await processPaymentIntent({
        amount: finalTotal,
        method: selectedMethod,
        customerName,
        customerEmail,
        customerDocument: customerDoc,
        cardNumber: selectedMethod === 'credit_card' ? cardNumber : undefined,
        cardBrand: cardBrandDetected,
        cardInstallments: selectedMethod === 'credit_card' ? cardInstallments : 1,
        offersAccepted: selectedOffers,
        simulateError: 'none'
      });

      setCompletedIntentId(intent.id);
      setIsCompleted(true);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(`00020126580014br.gov.bcb.pix0136spi_instant_${Date.now()}520400005303986540${finalTotal.toFixed(2)}5802BR5915OmniPay6009SaoPaulo62070503***6304`);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              Super Checkout SDK
            </span>
            <span className="text-xs text-slate-400">GET /v1/checkout-config</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Super Checkout Adaptativo & Motor de Ofertas
          </h2>
        </div>

        {/* Viewport switch & Onboarding Wizard */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnboardingWizard(true)}
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-900 transition-all shadow-sm"
          >
            <Wand2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            <span>Guia de Configuração (Get Started)</span>
          </button>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                viewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Checkout Container */}
      <div className={`mx-auto transition-all ${
        viewMode === 'mobile' ? 'max-w-md rounded-[36px] border-[8px] border-slate-800 bg-slate-900 p-3 shadow-2xl' : 'max-w-4xl'
      }`}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* Checkout Header with Tenant Branding */}
          <div 
            className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white"
            style={{ backgroundColor: currentTenant.branding.primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 font-bold backdrop-blur-sm">
                <Zap className="h-5 w-5 fill-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  {currentTenant.branding.logoText}
                </h3>
                <p className="text-[11px] text-white/80">
                  {currentTenant.branding.badgeText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5" />
              <span>Ambiente 100% Seguro</span>
            </div>
          </div>

          {/* Checkout Body */}
          {isCompleted ? (
            /* Success State */
            <div className="p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                Pagamento Confirmado com Sucesso!
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Transação processada via <strong>{currentTenant.name}</strong> • ID: <span className="font-mono text-indigo-600">{completedIntentId}</span>
              </p>

              <div className="mx-auto mt-6 max-w-sm rounded-xl bg-slate-50 p-4 text-left text-xs dark:bg-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">Valor Total Pago:</span>
                  <span className="font-bold text-slate-900 dark:text-white">R$ {finalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                  <span className="text-slate-500">Forma de Pagamento:</span>
                  <span className="font-semibold uppercase text-slate-900 dark:text-white">{selectedMethod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Comprador:</span>
                  <span className="text-slate-700 dark:text-slate-300">{customerName}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setIsCompleted(false)}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  Realizar Novo Teste no Checkout
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Column: Payment Methods & Details (7 cols) */}
              <div className="p-6 md:col-span-7 md:border-r md:border-slate-100 dark:md:border-slate-800">
                {/* 1. Method Selector Tabs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Selecione a Forma de Pagamento
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {/* PIX */}
                    <button
                      onClick={() => setSelectedMethod('pix')}
                      className={`relative flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        selectedMethod === 'pix'
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="absolute -top-2 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-extrabold text-white">
                        {currentTenant.checkoutTheme.defaultDiscountPix}% OFF
                      </span>
                      <QrCode className="h-5 w-5 text-emerald-600" />
                      <span className="mt-1 text-xs font-bold">PIX</span>
                    </button>

                    {/* Cartão */}
                    <button
                      onClick={() => setSelectedMethod('credit_card')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        selectedMethod === 'credit_card'
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      <span className="mt-1 text-xs font-bold">Cartão</span>
                    </button>

                    {/* Carteira */}
                    <button
                      onClick={() => setSelectedMethod('wallet')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        selectedMethod === 'wallet'
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Wallet className="h-5 w-5 text-indigo-600" />
                      <span className="mt-1 text-xs font-bold">Carteira</span>
                    </button>

                    {/* Boleto */}
                    <button
                      onClick={() => setSelectedMethod('boleto')}
                      className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        selectedMethod === 'boleto'
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Barcode className="h-5 w-5 text-slate-600" />
                      <span className="mt-1 text-xs font-bold">Boleto</span>
                    </button>
                  </div>
                </div>

                {/* 2. Dynamic Method Panel */}
                <div className="mt-5">
                  {/* PIX Panel */}
                  {selectedMethod === 'pix' && (
                    <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                          PIX Instantâneo com Liquidação Imediata
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <Clock className="h-3 w-3" />
                          <span>Expira em: {Math.floor(pixTimeLeft / 60)}:{(pixTimeLeft % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {/* Dynamic QR Code Canvas/Image */}
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=00020126580014br.gov.bcb.pix0136spi_instant_${Date.now()}520400005303986540${finalTotal.toFixed(2)}5802BR5915OmniPay6009SaoPaulo62070503***6304`}
                            alt="PIX QR Code"
                            className="h-28 w-28"
                          />
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Abra o app do seu banco, escolha <strong>Pagar com PIX</strong> e aponte a câmera para o código ao lado.
                          </p>
                          <button
                            onClick={handleCopyPix}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                          >
                            {copiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Código PIX'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credit Card Panel */}
                  {selectedMethod === 'credit_card' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            Número do Cartão
                          </label>
                          <span className="rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {cardBrandDetected}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Nome Impresso no Cartão
                        </label>
                        <input
                          type="text"
                          placeholder="NOME COMO NO CARTÃO"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            Validade
                          </label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Parcelas
                        </label>
                        <select
                          value={cardInstallments}
                          onChange={(e) => setCardInstallments(Number(e.target.value))}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value={1}>1x de R$ {finalTotal.toFixed(2)} (sem juros)</option>
                          <option value={2}>2x de R$ {(finalTotal / 2).toFixed(2)} (sem juros)</option>
                          <option value={3}>3x de R$ {(finalTotal / 3).toFixed(2)} (sem juros)</option>
                          <option value={6}>6x de R$ {(finalTotal / 6).toFixed(2)} (sem juros)</option>
                          <option value={12}>12x de R$ {((finalTotal * 1.08) / 12).toFixed(2)} (com juros reduzidos)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Wallet Panel */}
                  {selectedMethod === 'wallet' && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs dark:border-indigo-950 dark:bg-indigo-950/20">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300">Saldo na Carteira Digital:</span>
                        <span className="text-sm font-bold text-emerald-600">R$ 650,00</span>
                      </div>
                      <p className="mt-2 text-slate-600 dark:text-slate-300">
                        O valor de R$ {finalTotal.toFixed(2)} será debitado instantaneamente do seu saldo com <strong>+5% de cashback</strong> creditado de volta.
                      </p>
                    </div>
                  )}

                  {/* Boleto Panel */}
                  {selectedMethod === 'boleto' && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                        <Barcode className="h-4 w-4" />
                        <span>Boleto Bancário Registrado</span>
                      </div>
                      <p className="text-slate-500">
                        Vencimento em 3 dias úteis. A compensação bancária ocorre em até 24 horas após o pagamento.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Customer Information Section */}
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Dados do Comprador
                  </label>
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      placeholder="Nome Completo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Seu E-mail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="CPF / CNPJ"
                        value={customerDoc}
                        onChange={(e) => setCustomerDoc(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Offer Bump Engine (5 cols) */}
              <div className="bg-slate-50/70 p-6 md:col-span-5 dark:bg-slate-800/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Resumo do Pedido
                </h4>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {productTitle}
                  </span>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Valor Base:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">R$ {productAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Offer Engine (Bump Offers) */}
                {currentTenant.checkoutTheme.enableBumpOffers && (
                  <div className="mt-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ofertas Especiais de 1 Clique:</span>
                    </div>

                    {bumpOffers.map(offer => {
                      const isSelected = selectedOffers.some(o => o.includes(offer.title));

                      return (
                        <div
                          key={offer.id}
                          onClick={() => handleToggleOffer(offer)}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${
                            isSelected
                              ? 'border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400 dark:bg-indigo-950/40'
                              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="mt-0.5 rounded text-indigo-600"
                            />
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {offer.title}
                                </span>
                                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                  +R$ {offer.price.toFixed(2)}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                {offer.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pricing Calculation Summary */}
                <div className="mt-5 space-y-1.5 border-t border-slate-200 pt-3 text-xs dark:border-slate-700">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>R$ {(productAmount + offersTotal).toFixed(2)}</span>
                  </div>

                  {selectedMethod === 'pix' && pixDiscount > 0 && (
                    <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Desconto PIX ({currentTenant.checkoutTheme.defaultDiscountPix}%):</span>
                      <span>- R$ {pixDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                    <span>Total a Pagar:</span>
                    <span className="text-base text-indigo-600 dark:text-indigo-400">
                      R$ {finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Final CTA Button */}
                <button
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processando e Roteando...</span>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pagar Agora R$ {finalTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>

                {currentTenant.checkoutTheme.showTrustBadges && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Criptografia de Ponta a Ponta • Protegido por OmniPay</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <CheckoutOnboardingWizard 
        isOpen={showOnboardingWizard} 
        onClose={() => setShowOnboardingWizard(false)} 
      />
    </div>
  );
};
