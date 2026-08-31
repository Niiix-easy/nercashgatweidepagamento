import React, { useState } from 'react';
import { Play, History, CheckCircle2, AlertCircle, RefreshCw, GitCompare, Code2, ArrowRightLeft, Sparkles, Layers } from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';
import { usePayment } from '../../context/PaymentContext';

interface HistoricalPayload {
  id: string;
  event: string;
  provider: string;
  date: string;
  originalStatus: number;
  originalPayload: string;
  originalResponse: string;
}

export const ExtendedWebhookDebugger: React.FC = () => {
  const { addToast } = usePayment();
  const [selectedPayloadId, setSelectedPayloadId] = useState<string>('evt_1001');
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<'success' | 'error' | null>('success');
  const [replayResponse, setReplayResponse] = useState<string>(`{\n  "status": "ok",\n  "processed_at": "2026-08-30T11:00:00Z",\n  "signature_verified": true,\n  "handler": "v2_async_worker",\n  "latency_ms": 42\n}`);

  const historicalPayloads: HistoricalPayload[] = [
    {
      id: 'evt_1001',
      event: 'payment.approved',
      provider: 'Asaas SPI',
      date: '2026-08-28 14:22:10',
      originalStatus: 200,
      originalPayload: JSON.stringify({
        id: 'pay_99881122',
        event: 'PAYMENT_RECEIVED',
        dateCreated: '2026-08-28 14:20:00',
        customer: 'cus_887711',
        payment: {
          value: 450.00,
          netValue: 442.50,
          billingType: 'PIX',
          status: 'RECEIVED',
          pixTransaction: {
            endToEndIdentifier: 'E00038166202608281420x992',
            qrCodeId: 'qr_28741'
          }
        }
      }, null, 2),
      originalResponse: JSON.stringify({
        status: 'ok',
        processed_at: '2026-08-28T14:22:10Z',
        signature_verified: true,
        handler: 'legacy_sync_worker',
        latency_ms: 184
      }, null, 2)
    },
    {
      id: 'evt_1002',
      event: 'payment.declined',
      provider: 'Iugu Banking Core',
      date: '2026-08-28 15:01:45',
      originalStatus: 500,
      originalPayload: JSON.stringify({
        id: 'inv_1029384',
        event: 'invoice.status_changed',
        data: {
          status: 'canceled',
          reason: 'insufficient_funds_or_timeout',
          account_id: 'acc_nercash_001',
          items: [{ description: 'Licença Enterprise SaaS', quantity: 1, price_cents: 29900 }]
        }
      }, null, 2),
      originalResponse: JSON.stringify({
        error: 'Internal Server Error',
        code: 'ERR_DB_CONNECTION_TIMEOUT',
        timestamp: '2026-08-28T15:01:45Z',
        retry_scheduled: true
      }, null, 2)
    },
    {
      id: 'evt_1003',
      event: 'chargeback.created',
      provider: 'Stone Direct Vault',
      date: '2026-08-29 09:12:30',
      originalStatus: 404,
      originalPayload: JSON.stringify({
        id: 'cb_776611',
        event: 'dispute.opened',
        charge: 'ch_443322',
        dispute: {
          amount: 125000,
          reason: 'fraudulent',
          status: 'needs_response',
          evidence_due_by: '2026-09-05T23:59:59Z'
        }
      }, null, 2),
      originalResponse: JSON.stringify({
        error: 'Route not found',
        path: '/api/v1/webhooks/stone/dispute',
        status: 404
      }, null, 2)
    }
  ];

  const selectedPayload = historicalPayloads.find(p => p.id === selectedPayloadId) || historicalPayloads[0];

  const handleReplay = (mode?: 'fixed' | 'mutated') => {
    setIsReplaying(true);
    setReplayResult(null);

    setTimeout(() => {
      setIsReplaying(false);
      setReplayResult('success');
      
      const nowIso = new Date().toISOString();
      const newResponse = JSON.stringify({
        status: 'ok',
        processed_at: nowIso,
        signature_verified: true,
        replay_session_id: `rpl_${Math.random().toString(36).substring(2, 9)}`,
        handler: 'v2_async_worker',
        latency_ms: Math.floor(Math.random() * 25) + 20,
        diff_context: {
          original_event: selectedPayload.event,
          schema_version: '2.4.0',
          replayed_by: 'Nercash OpenApi Docs Sandbox'
        }
      }, null, 2);

      setReplayResponse(newResponse);
      addToast('Webhook Replay', `Payload ${selectedPayload.id} replayed com sucesso via Monaco Diff.`, 'success');
    }, 900);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monaco Editor Visual Diff-Viewer (Webhook Debugger)</h3>
              <p className="text-xs text-slate-500">Comparação visual lado a lado entre payload de resposta histórico vs. execução simulada de replay</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleReplay('fixed')}
              disabled={isReplaying}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isReplaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Replay Payload Atual
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historical Payloads List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-violet-500" />
                Histórico de Webhooks Disparados
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">{historicalPayloads.length} registros</span>
            </div>

            <div className="space-y-2">
              {historicalPayloads.map(payload => {
                const isSelected = selectedPayloadId === payload.id;
                return (
                  <div 
                    key={payload.id} 
                    onClick={() => {
                      setSelectedPayloadId(payload.id);
                      setReplayResult(null);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-violet-500 bg-violet-50/60 dark:bg-violet-950/30 ring-1 ring-violet-500 shadow-sm' 
                        : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{payload.event}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        payload.originalStatus === 200 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                      }`}>
                        HTTP {payload.originalStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Provedor: <strong className="text-slate-700 dark:text-slate-300">{payload.provider}</strong></span>
                      <span className="font-mono">{payload.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick payload summary */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Payload de Entrada Original:</span>
              <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-32">
                {selectedPayload.originalPayload}
              </pre>
            </div>
          </div>

          {/* Monaco Diff Viewer Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-violet-500" />
                  Comparador Visual Diff: <span className="font-mono text-violet-600 dark:text-violet-400">{selectedPayload.event} ({selectedPayload.id})</span>
                </h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-rose-500 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Original (Esquerda)
                  </span>
                  <ArrowRightLeft className="h-3 w-3 text-slate-400" />
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Replay Simulado (Direita)
                  </span>
                </div>
              </div>

              <div className="h-80 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-950">
                {replayResult === 'success' ? (
                  <DiffEditor
                    height="100%"
                    language="json"
                    original={selectedPayload.originalResponse}
                    modified={replayResponse}
                    theme="vs-dark"
                    options={{
                      renderSideBySide: true,
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      wordWrap: 'on'
                    }}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <GitCompare className="h-10 w-10 text-slate-600 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-slate-300">Pronto para Replay Comparativo</p>
                      <p className="text-[11px] text-slate-500 mt-1">Clique no botão "Replay Payload Atual" para disparar a requisição e visualizar o diff com o Monaco Editor.</p>
                    </div>
                    <button 
                      onClick={() => handleReplay('fixed')}
                      disabled={isReplaying}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-all cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Disparar Replay Agora
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="font-mono">Engine: Monaco Editor v4.7.0 (Side-by-Side Unified AST Diff)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Idempotência e Assinatura HMAC-SHA256 Ativas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

