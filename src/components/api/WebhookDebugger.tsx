import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  RefreshCw, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Copy,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface WebhookPayload {
  id: string;
  provider: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  payload: any;
  headers: Record<string, string>;
  latencyMs: number;
}

const MOCK_WEBHOOKS: WebhookPayload[] = [
  {
    id: 'wh_01h8q7v2j9p3',
    provider: 'iugu',
    event: 'payment.status_changed',
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    latencyMs: 142,
    headers: {
      'Content-Type': 'application/json',
      'X-Iugu-Signature': 'sha256=4f2e9d...',
      'User-Agent': 'Iugu-Webhook-Dispatcher/1.0'
    },
    payload: {
      event: 'payment.status_changed',
      data: {
        id: 'PAY-827391-IX',
        status: 'approved',
        amount: 45000,
        currency: 'BRL',
        payment_method: 'credit_card'
      }
    }
  },
  {
    id: 'wh_01h8q7v2j9p4',
    provider: 'juno',
    event: 'charge.status_changed',
    status: 'failed',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    latencyMs: 210,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer juno_sig_...',
      'X-Juno-Event-Id': 'ev_123'
    },
    payload: {
      type: 'PAYMENT_NOTIFICATION',
      digital_account: 'DA_9921',
      data: [
        {
          id: 'CH_882',
          status: 'DECLINED',
          reason: 'Insufficient funds'
        }
      ]
    }
  },
  {
    id: 'wh_01h8q7v2j9p5',
    provider: 'asaas',
    event: 'PAYMENT_RECEIVED',
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    latencyMs: 89,
    headers: {
      'Content-Type': 'application/json',
      'asaas-access-token': '***',
      'User-Agent': 'Asaas-Webhook-Manager'
    },
    payload: {
      event: 'PAYMENT_RECEIVED',
      payment: {
        id: 'pay_992837123',
        customer: 'cus_001',
        value: 120.50,
        netValue: 118.20,
        status: 'RECEIVED'
      }
    }
  }
];

export const WebhookDebugger: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookPayload[]>(MOCK_WEBHOOKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReplaying, setIsReplaying] = useState<string | null>(null);
  const [replayResult, setReplayResult] = useState<any>(null);

  const filtered = webhooks.filter(wh => 
    wh.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedWebhook = webhooks.find(wh => wh.id === selectedId);

  const handleReplay = (id: string) => {
    setIsReplaying(id);
    setReplayResult(null);
    
    // Simulate replay logic
    setTimeout(() => {
      setIsReplaying(null);
      setReplayResult({
        status: 200,
        message: 'Webhook reprocessed successfully',
        processed_at: new Date().toISOString(),
        execution_id: `exec_${Math.random().toString(36).substring(7)}`
      });
    }, 1500);
  };

  const handleClear = () => {
    setWebhooks([]);
    setSelectedId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Webhook Debugger & Replay Engine</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Capture, inspecione e reexecute webhooks raw recebidos de provedores BaaS para depurar falhas de validação e processamento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar Logs
          </button>
          <button
            onClick={() => setWebhooks([...MOCK_WEBHOOKS, ...webhooks])}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar Feed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Webhook List */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por provider ou evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
            {filtered.map(wh => (
              <div
                key={wh.id}
                onClick={() => setSelectedId(wh.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedId === wh.id 
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider">{wh.provider}</span>
                  <span className="text-[10px] text-slate-400">{new Date(wh.timestamp).toLocaleTimeString()}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{wh.event}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    wh.status === 'success' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {wh.status === 'success' ? <CheckCircle2 className="h-2 w-2" /> : <XCircle className="h-2 w-2" />}
                    {wh.status.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">{wh.latencyMs}ms</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">Nenhum webhook encontrado.</div>
            )}
          </div>
        </div>

        {/* Webhook Detail & Replay */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden h-[600px] flex flex-col">
          {selectedWebhook ? (
            <>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                    <Activity className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detalhes do Evento Raw</h3>
                    <p className="text-[10px] font-mono text-slate-500">{selectedWebhook.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleReplay(selectedWebhook.id)}
                  disabled={isReplaying === selectedWebhook.id}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition-all"
                >
                  {isReplaying === selectedWebhook.id ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  {isReplaying === selectedWebhook.id ? 'Reexecutando...' : 'Replay Webhook'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Status Banner */}
                {replayResult && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Replay Executado com Sucesso</h4>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          Payload reprocessado via internal pipeline em {new Date(replayResult.processed_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Headers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <h4>HTTP Headers</h4>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedWebhook.headers).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{key}</span>
                          <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <Code className="h-4 w-4 text-indigo-500" />
                      <h4>JSON Payload Body</h4>
                    </div>
                    <button className="text-[10px] flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      <Copy className="h-3 w-3" />
                      Copy Raw JSON
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-900 p-4 dark:border-slate-800">
                    <pre className="text-[11px] font-mono text-slate-200 overflow-x-auto">
                      {JSON.stringify(selectedWebhook.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-800">
                <Terminal className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Selecione um Webhook</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                Escolha um evento na lista lateral para inspecionar os headers de segurança e o corpo do payload.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
