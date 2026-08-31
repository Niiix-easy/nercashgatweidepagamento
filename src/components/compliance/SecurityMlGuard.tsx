import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Cpu, Activity, RefreshCw, Terminal, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

export const SecurityMlGuard: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [workerStatus, setWorkerStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [anomalyScore, setAnomalyScore] = useState<number>(12); // out of 100
  const [flaggedEventsCount, setFlaggedEventsCount] = useState<number>(0);
  const [behaviorLogs, setBehaviorLogs] = useState<Array<{ id: string; timestamp: string; ip: string; anomaly: boolean; reason: string; score: number }>>([
    { id: 'log_1', timestamp: '2026-08-29 11:14:02', ip: '187.14.22.91 (São Paulo - BR)', anomaly: false, reason: 'Login normal - Dispositivo conhecido', score: 4 },
    { id: 'log_2', timestamp: '2026-08-29 10:42:15', ip: '201.88.9.12 (Rio de Janeiro - BR)', anomaly: false, reason: 'Velocidade IP normal', score: 12 },
    { id: 'log_3', timestamp: '2026-08-29 09:12:44', ip: '45.132.221.9 (Tor Exit Node / VPN)', anomaly: true, reason: 'IP de alta velocidade / Proxy suspeito detectado', score: 89 },
    { id: 'log_4', timestamp: '2026-08-29 08:01:30', ip: '177.182.90.4 (Curitiba - BR)', anomaly: false, reason: 'Sessão autenticada via WebAuthn Biometria', score: 2 }
  ]);

  // Simulate running local WebWorker for ML anomaly detection
  const runWorkerMlAnalysis = () => {
    setIsAnalyzing(true);
    setWorkerStatus('running');

    // Create inline worker via Blob to avoid build/import path issues with worker files
    const workerCode = `
      self.onmessage = function(e) {
        const logins = e.data.logins || [];
        // Heavy ML inference simulation
        let suspicious = 0;
        logins.forEach(item => {
          if (item.ip.includes('Tor') || item.ip.includes('VPN') || item.score > 70) {
            suspicious++;
          }
        });
        const score = Math.round(10 + Math.random() * 25);
        self.postMessage({ status: 'success', anomalyScore: score, flaggedCount: suspicious });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (event) => {
      const { anomalyScore, flaggedCount } = event.data;
      setAnomalyScore(anomalyScore);
      setFlaggedEventsCount(flaggedCount);
      setWorkerStatus('completed');
      setIsAnalyzing(false);
      URL.revokeObjectURL(workerUrl);
      worker.terminate();
    };

    worker.postMessage({ logins: behaviorLogs });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security ML Guard (WebWorker Behavioral Analysis)</h3>
              <p className="text-xs text-slate-500">Análise local via WebWorker de padrões de comportamento de login, velocidade de IP e prevenção de account takeover</p>
            </div>
          </div>

          <button
            type="button"
            onClick={runWorkerMlAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-500 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Processando WebWorker...' : 'Executar Varredura ML Guard'}</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Índice Geral de Anomalia</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold font-mono ${anomalyScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {anomalyScore} / 100
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${anomalyScore > 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {anomalyScore > 50 ? 'Risco Elevado' : 'Seguro'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessões Suspeitas Flagged</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{flaggedEventsCount}</span>
              <span className="text-[11px] text-slate-500">Bloqueadas pelo Guard</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado do WebWorker</span>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                {workerStatus === 'running' ? 'Executando em background thread...' : 'Pronto (Inativo)'}
              </span>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Behavior Log Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Histórico de Comportamento & IP Velocity</h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Endereço IP & Geolocalização</th>
                  <th className="p-3">Análise ML / Motivo</th>
                  <th className="p-3">Score de Risco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {behaviorLogs.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{item.timestamp}</td>
                    <td className="p-3 font-mono font-medium text-slate-900 dark:text-white">{item.ip}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      {item.anomaly ? (
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                      <span>{item.reason}</span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.score > 70 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {item.score} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
