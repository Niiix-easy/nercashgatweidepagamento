import React, { useState } from 'react';
import { ShieldAlert, List, ArrowRight, Server, Search, CheckCircle2, Zap } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const RoutingDecisionLog: React.FC = () => {
  const { addToast } = usePayment();
  const [searchTerm, setSearchTerm] = useState('');

  const [logs] = useState([
    {
      id: 'tx_8F9Dk3LjN1vM',
      time: '10:45:22',
      amount: 1450.0,
      customer: 'João Silva',
      provider: 'Juno',
      reason: 'Latency > 800ms na Iugu',
      rule: 'SLA Failover',
      status: 'approved'
    },
    {
      id: 'tx_2Yp4G6sK9cR1',
      time: '10:42:15',
      amount: 45.9,
      customer: 'Maria Santos',
      provider: 'Asaas',
      reason: 'Melhor taxa para Amex',
      rule: 'Cost Optimization',
      status: 'approved'
    },
    {
      id: 'tx_7L3Hm5xW0vP8',
      time: '10:39:05',
      amount: 320.0,
      customer: 'Carlos Sousa',
      provider: 'Iugu',
      reason: 'Roteamento padrão (BIN Master)',
      rule: 'Default Route',
      status: 'approved'
    },
    {
      id: 'tx_9K1Jn4bQ8zV2',
      time: '10:35:50',
      amount: 5500.0,
      customer: 'Empresa X LTDA',
      provider: 'Juno',
      reason: 'Iugu retornou 503 Service Unavailable',
      rule: 'Hard Failover',
      status: 'approved'
    },
    {
      id: 'tx_3B8Fn2mC7xL9',
      time: '10:30:12',
      amount: 120.5,
      customer: 'Ana Paula',
      provider: 'Asaas',
      reason: 'Split Payment detectado (Multi-seller)',
      rule: 'Feature Required',
      status: 'approved'
    }
  ]);

  const filteredLogs = logs.filter(log =>
    log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.rule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
              <List className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Routing Decision Log</h3>
              <p className="text-xs text-slate-500">Histórico de roteamento e regras de failover acionadas por transação.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por ID, Cliente ou Regra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <button 
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Exportar Log
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Transação</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Regra Disparada</th>
                <th className="px-4 py-3 font-medium">Roteamento</th>
                <th className="px-4 py-3 font-medium">Justificativa / Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500">{log.time}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{log.id}</span>
                      <span className="text-[10px] text-slate-500">{log.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(log.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      log.rule.includes('Failover') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      log.rule.includes('Optimization') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {log.rule.includes('Failover') && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {log.rule.includes('Optimization') && <Zap className="w-3 h-3 mr-1" />}
                      {log.rule}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <Server className="h-3 w-3 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.provider}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
