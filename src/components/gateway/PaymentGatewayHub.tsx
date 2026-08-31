import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { RouteAuditMonitor } from './RouteAuditMonitor';
import { PciTokenVault } from './PciTokenVault';
import { BatchTokenIngestionModal } from './BatchTokenIngestionModal';
import { ActionAuditTrail } from './ActionAuditTrail';
import { ShieldCheck, Lock, CreditCard, FileText, QrCode, Server, Send, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export const PaymentGatewayHub: React.FC = () => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const { addToast } = usePayment();
  const [activeSubTab, setActiveSubTab] = useState<'endpoints' | 'audit' | 'hmac' | 'tokenization' | 'action_audit'>('endpoints');

  // Interactive tester states
  const [baasMethod, setBaasMethod] = useState<'credit_card' | 'boleto' | 'pix_parcelado'>('credit_card');
  const [amount, setAmount] = useState<string>('750.00');
  const [customerEmail, setCustomerEmail] = useState<string>('cliente@nercash.io');
  const [installments, setInstallments] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleTestBaasEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setApiResponse(null);

    try {
      const endpointMap = {
        credit_card: '/api/v1/baas/credit-card',
        boleto: '/api/v1/baas/boleto',
        pix_parcelado: '/api/v1/baas/pix-parcelado'
      };

      const endpoint = endpointMap[baasMethod];
      const payload = {
        amount: Number(amount),
        customerEmail,
        installments: baasMethod !== 'boleto' ? installments : 1,
        provider: 'Asaas BaaS SPI v3'
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer nercash_prod_live_998124',
          'X-Nercash-Signature': 'sha256=a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setApiResponse(data);
      addToast(
        'Gateway BaaS',
        `Requisição para ${endpoint} processada com sucesso (Status ${res.status}).`,
        'success'
      );
    } catch (err: any) {
      setApiResponse({ error: true, message: err.message || 'Erro de conexão com o gateway' });
      addToast('Erro Gateway', 'Falha ao executar teste de API BaaS', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Módulo Gateway de Pagamento & BaaS</h2>
              <p className="text-xs text-slate-500">Integração nativa com bancos BaaS (Asaas / SPI Bacen) para Boletos, Cartão de Crédito e PIX Parcelado com HMAC & PCI-DSS</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('endpoints')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSubTab === 'endpoints' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              API Endpoints & BaaS
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('audit')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSubTab === 'audit' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Auditoria de Rota (Imutável)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('hmac')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSubTab === 'hmac' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Validação HMAC & WAF
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('tokenization')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSubTab === 'tokenization' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              PCI Token Vault
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('action_audit')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeSubTab === 'action_audit' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Trilha de Ações (Bulk)
            </button>
            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-all cursor-pointer"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Ingestão em Lote (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Endpoints & Interactive Tester */}
      {activeSubTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Interactive API Tester */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-500" />
                <span>Simulador de Endpoints BaaS (Boletos, Cartão & PIX Parcelado)</span>
              </h3>
              <p className="text-xs text-slate-500">Envie requisições validadas pelo middleware HMAC de segurança</p>
            </div>

            <form onSubmit={handleTestBaasEndpoint} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Método BaaS / Rota de Pagamento</label>
                <select
                  value={baasMethod}
                  onChange={(e) => setBaasMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="credit_card">💳 Cartão de Crédito BaaS (/api/v1/baas/credit-card)</option>
                  <option value="boleto">📄 Emissão de Boleto Bancário (/api/v1/baas/boleto)</option>
                  <option value="pix_parcelado">⚡ PIX Parcelado Garantido (/api/v1/baas/pix-parcelado)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor da Transação (R$)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Parcelas (Installments)</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    disabled={baasMethod === 'boleto'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono font-bold text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">E-mail do Pagador</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Processando Rota BaaS...' : 'Executar Requisição com HMAC'}</span>
              </button>
            </form>
          </div>

          {/* Right: API Response Viewer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Resposta da API & Payload HMAC Verificado</span>
              </h3>
              <p className="text-xs text-slate-500">Inspeção em tempo real do retorno do banco BaaS</p>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 overflow-y-auto min-h-[260px]">
              {apiResponse ? (
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 py-12">
                  <Key className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                  <span className="text-xs">Nenhuma requisição realizada ainda. Utilize o simulador ao lado.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Audit Logs */}
      {activeSubTab === 'audit' && <RouteAuditMonitor />}

      {/* Sub-tab 3: HMAC & PCI-DSS Info */}
      {activeSubTab === 'hmac' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-500" />
              <span>Arquitetura de Segurança HMAC-SHA256 & Conformidade PCI-DSS</span>
            </h3>
            <p className="text-xs text-slate-500">Validação obrigatória de assinatura em todas as rotas de API de pagamento</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <span className="rounded-md bg-violet-100 px-2 py-1 font-mono text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                1. Header de Assinatura
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">X-Nercash-Signature</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toda requisição POST/PUT para o gateway deve incluir o header HMAC gerado com a chave secreta do tenant.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <span className="rounded-md bg-emerald-100 px-2 py-1 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                2. WAF & Sanitização
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Firewall de Aplicação</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspeção automática de payloads para bloquear SQL Injection, Cross-Site Scripting e requisições maliciosas.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-2">
              <span className="rounded-md bg-sky-100 px-2 py-1 font-mono text-[10px] font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                3. Padrão PCI-DSS 4.0
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tokenização & Vault</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dados sensíveis de cartões e contas BaaS são mascarados e armazenados em infraestrutura isolada e criptografada.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'tokenization' && (
        <PciTokenVault />
      )}
      
      {/* Sub-tab 5: Action Audit Trail */}
      {activeSubTab === 'action_audit' && (
        <ActionAuditTrail />
      )}

      {/* Batch Token Ingestion Modal */}
      <BatchTokenIngestionModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
      />
    </div>
  );
};
