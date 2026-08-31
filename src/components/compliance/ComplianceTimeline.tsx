import React, { useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { Clock, ShieldCheck, User, Settings, Database, Server, Activity, AlertTriangle, Key } from 'lucide-react';

export const ComplianceTimeline: React.FC = () => {
  const { auditLogs } = usePayment();

  // Sort logs by timestamp descending
  const sortedLogs = useMemo(() => {
    return [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs]);

  const getIconForAction = (action: string) => {
    if (action.includes('CONFIG') || action.includes('RULE')) return <Settings className="h-4 w-4" />;
    if (action.includes('USER') || action.includes('ACTOR')) return <User className="h-4 w-4" />;
    if (action.includes('KEY') || action.includes('AUTH')) return <Key className="h-4 w-4" />;
    if (action.includes('DELETE') || action.includes('REMOVE')) return <AlertTriangle className="h-4 w-4" />;
    if (action.includes('WEBHOOK')) return <Server className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getColorForSeverity = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500 border-rose-500 text-rose-500';
      case 'high': return 'bg-amber-500 border-amber-500 text-amber-500';
      case 'medium': return 'bg-indigo-500 border-indigo-500 text-indigo-500';
      default: return 'bg-emerald-500 border-emerald-500 text-emerald-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-500" />
          Compliance Timeline
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Visualização vertical de eventos e alterações de configuração plataforma-wide com rastreabilidade de usuário.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {sortedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <ShieldCheck className="h-8 w-8 mb-2 opacity-50 text-indigo-500" />
            <span>Nenhum evento registrado no momento.</span>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-700 ml-4 space-y-8 pb-4">
            {sortedLogs.map((log, index) => {
              const colorClass = getColorForSeverity(log.severity);
              const [bg, border, text] = colorClass.split(' ');
              
              return (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 ${border}`}>
                    <div className={`h-2 w-2 rounded-full ${bg}`} />
                  </div>
                  
                  {/* Content Card */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-800/20 dark:hover:bg-slate-800/40">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase bg-opacity-10 dark:bg-opacity-20 ${text} ${bg.replace('bg-', 'bg-').replace('500', '100')}`}>
                            {getIconForAction(log.action)}
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {log.id}</span>
                        </div>
                        
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                          {log.resourceType} <span className="font-semibold text-slate-900 dark:text-white">({log.resourceId})</span> foi {log.status === 'success' ? 'processado com sucesso' : 'rejeitado'}.
                        </p>
                        
                        {log.details && (
                          <div className="mt-3 rounded-lg bg-white p-3 font-mono text-[10px] text-slate-600 dark:bg-slate-950 dark:text-slate-400 overflow-x-auto border border-slate-100 dark:border-slate-800">
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end gap-2 min-w-[200px]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            {log.actor.name.charAt(0)}
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{log.actor.email}</div>
                            <div className="text-[9px] text-slate-400">{log.actor.ipAddress}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
