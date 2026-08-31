import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { AlertTriangle, ServerCrash, Clock, RefreshCw, Send, CheckCircle2, XCircle } from 'lucide-react';

export const WebhookFailureSimulator: React.FC = () => {
  const { acquirers, addToast, addAuditLog } = usePayment();
  const [selectedProvider, setSelectedProvider] = useState<string>(acquirers[0]?.id || 'cielo');
  const [failureType, setFailureType] = useState<'timeout' | 'payload_error' | '503'>('timeout');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    status: string;
    details: string;
    recoveryAction: string;
  } | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    
    // Simulate delay
    setTimeout(() => {
      let result;
      if (failureType === 'timeout') {
        result = {
          status: 'Connection Timeout',
          details: 'Webhook delivery failed after 30000ms. No response received from provider.',
          recoveryAction: 'Internal alerting system triggered. Exponential backoff retry scheduled in 5m.'
        };
      } else if (failureType === 'payload_error') {
        result = {
          status: '400 Bad Request',
          details: 'Provider rejected webhook payload due to schema mismatch or malformed JSON.',
          recoveryAction: 'Payload flagged for manual review. Dropped from immediate retry queue.'
        };
      } else {
        result = {
          status: '503 Service Unavailable',
          details: 'Provider webhook endpoint is currently down or overloaded.',
          recoveryAction: 'Circuit breaker opened for provider webhook. Failover routing active.'
        };
      }
      
      setSimulationResult(result);
      setIsSimulating(false);
      addToast('Simulação Concluída', 'Falha de webhook injetada no ambiente de testes.', 'warning');
      
      addAuditLog({
        actor: { name: 'Admin', email: 'admin@nercash.com', role: 'Admin', ipAddress: '127.0.0.1', userAgent: navigator.userAgent },
        action: 'WEBHOOK_FAILURE_SIMULATED',
        category: 'system',
        resourceType: 'WebhookSim',
        resourceId: 'sim_' + Date.now(),
        status: 'success',
        severity: 'high',
        details: { provider: selectedProvider, failureType }
      });
      
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ServerCrash className="h-5 w-5 text-rose-500" />
          Webhook Failure Simulator
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Trigger mock network timeouts or payload errors for specific providers to test how the internal webhook alerting system handles recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Injetar Falha
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Provedor Alvo
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {acquirers.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tipo de Falha Simulada
              </label>
              <div className="space-y-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  failureType === 'timeout' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="failureType"
                    value="timeout"
                    checked={failureType === 'timeout'}
                    onChange={() => setFailureType('timeout')}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-500" /> Network Timeout
                    </div>
                    <div className="text-xs text-slate-500">Simula latência extrema ou conexão perdida</div>
                  </div>
                </label>
                
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  failureType === 'payload_error' ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="failureType"
                    value="payload_error"
                    checked={failureType === 'payload_error'}
                    onChange={() => setFailureType('payload_error')}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-500" /> Payload Error (400)
                    </div>
                    <div className="text-xs text-slate-500">Simula JSON malformado ou schema inválido</div>
                  </div>
                </label>

                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  failureType === '503' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="failureType"
                    value="503"
                    checked={failureType === '503'}
                    onChange={() => setFailureType('503')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ServerCrash className="h-4 w-4 text-indigo-500" /> 503 Service Unavailable
                    </div>
                    <div className="text-xs text-slate-500">Simula queda do provedor externo</div>
                  </div>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                  failureType === '429' ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800'
                }`}>
                  <input
                    type="radio"
                    name="failureType"
                    value="429"
                    checked={failureType === '429'}
                    onChange={() => setFailureType('429')}
                    className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-violet-500" /> 429 Too Many Requests
                    </div>
                    <div className="text-xs text-slate-500">Simula Rate Limit atingido no provedor</div>
                  </div>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isSimulating ? 'Injetando Falha...' : 'Disparar Falha Simulada'}
            </button>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
            Recovery Alerting Output
          </h3>
          
          {simulationResult ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Falha Detectada: {simulationResult.status}</h4>
                    <p className="text-xs text-rose-600 dark:text-rose-500 mt-1">{simulationResult.details}</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Ação de Recuperação (Alerting System)</h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1 font-mono">{simulationResult.recoveryAction}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-[10px] text-slate-500 flex justify-between items-center">
                  <span>Log registrado no Compliance Audit Trail</span>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ID: sim_{Date.now()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <ServerCrash className="h-8 w-8 mb-2 opacity-50" />
              <span className="text-xs">Nenhuma simulação de falha ativa.</span>
              <span className="text-[10px] mt-1 text-slate-500 text-center px-8">O sistema de alerta escutará as simulações enviadas e exibirá o comportamento de retry ou failover aqui.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
