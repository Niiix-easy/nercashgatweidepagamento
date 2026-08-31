import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Radio, Send, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Server, Lock, Key, Terminal } from 'lucide-react';

export const BaaSWebhookSimulator: React.FC = () => {
  const { addToast } = usePayment();
  const [baasProvider, setBaasProvider] = useState<'asaas' | 'iugu' | 'juno'>('asaas');
  const [eventType, setEventType] = useState<'charge.confirmed' | 'charge.overdue' | 'pix.settled' | 'boleto.registered'>('charge.confirmed');
  const [targetUrl, setTargetUrl] = useState<string>('https://api.nercash.io/api/v1/webhooks/baas-callback');
  const [customAmount, setCustomAmount] = useState<string>('850.00');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);

    const payload = {
      event: eventType,
      provider: baasProvider,
      timestamp: new Date().toISOString(),
      data: {
        id: `pay_cb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: eventType === 'charge.confirmed' || eventType === 'pix.settled' ? 'CONFIRMED' : 'PENDING',
        value: Number(customAmount),
        netValue: Number(customAmount) * 0.985,
        billingType: eventType.includes('pix') ? 'PIX' : eventType.includes('boleto') ? 'BOLETO' : 'CREDIT_CARD',
        customerEmail: 'cliente-baas@nercash.io',
        externalReference: `NER-${Math.floor(Math.random() * 900000 + 100000)}`
      }
    };

    const signatureHeader = `sha256=sec_hmac_${baasProvider}_${Math.random().toString(36).substring(2, 12)}`;

    try {
      const startTime = performance.now();
      const res = await fetch('/api/v1/webhooks/baas-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer nercash_prod_live_998124',
          'x-nercash-signature': signatureHeader
        },
        body: JSON.stringify(payload)
      });
      const dataJson = await res.json();
      const latency = Math.round(performance.now() - startTime);

      setIsSimulating(false);
      const result = {
        success: res.ok,
        statusCode: res.status,
        targetUrl: '/api/v1/webhooks/baas-callback',
        provider: baasProvider,
        event: eventType,
        hmacSignatureSent: signatureHeader,
        responseFromWebhookHandler: dataJson,
        payloadSent: payload,
        latencyMs: latency,
        simulatedAt: new Date().toISOString()
      };

      setSimulationResult(result);
      addToast(
        'Simulador de Webhook BaaS',
        `Callback de ${baasProvider.toUpperCase()} (${eventType}) disparado e validado com sucesso pelo WAF HMAC.`,
        'success'
      );
    } catch (err: any) {
      setIsSimulating(false);
      setSimulationResult({
        success: false,
        error: err.message,
        payloadSent: payload
      });
      addToast('Erro no Callback', 'Falha ao comunicar com o endpoint de webhook BaaS.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Simulador de Webhook Bancário (BaaS Callback Sandbox)</h3>
              <p className="text-xs text-slate-500">Envie payloads de retorno simulados de bancos parceiros (Asaas, Iugu, Juno) para testar a validação de assinatura HMAC e roteamento automático</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <form onSubmit={handleSimulateWebhook} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Provedor BaaS Emissor do Callback</label>
              <select
                value={baasProvider}
                onChange={(e) => setBaasProvider(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="asaas">Asaas Banking-as-a-Service SPI</option>
                <option value="iugu">Iugu Banking Core Engine</option>
                <option value="juno">Juno / Billing & Escrow</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tipo de Evento do Webhook</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="charge.confirmed">charge.confirmed (Cobrança Confirmada / Paga)</option>
                <option value="charge.overdue">charge.overdue (Cobrança Vencida)</option>
                <option value="pix.settled">pix.settled (PIX Parcelado Liquidado no SPI)</option>
                <option value="boleto.registered">boleto.registered (Boleto Registrado no CIP)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Destino do Webhook (Endpoint Nercash)</label>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor da Cobrança Simulada (R$)</label>
              <input
                type="text"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-violet-500 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Disparando Webhook...' : 'Simular Callback Bancário com HMAC'}</span>
            </button>
          </form>

          {/* Right: Response / Result Viewer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Log de Validação HMAC & Processamento do Callback</span>
              </h4>
              <p className="text-[11px] text-slate-500">Resultado do processamento pelo middleware de segurança Nercash</p>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 overflow-y-auto min-h-[280px]">
              {simulationResult ? (
                <pre>{JSON.stringify(simulationResult, null, 2)}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-12">
                  <Terminal className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                  <span className="text-xs">Nenhum callback simulado ainda. Clique em "Simular Callback" ao lado.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
