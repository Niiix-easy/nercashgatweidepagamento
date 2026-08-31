import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';
import { 
  Zap, 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Server
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

export const GatewayThroughputMonitor: React.FC = () => {
  const { acquirers } = usePayment();

  const throughputData = useMemo(() => {
    return acquirers.map(acq => {
      // Mock throughput data based on acquirer health and provider
      const quota = acq.provider === 'cielo' || acq.provider === 'mercadopago' ? 10000 : 5000;
      const current = Math.floor(quota * (0.4 + Math.random() * 0.5));
      const usagePercent = (current / quota) * 100;
      
      return {
        name: acq.name,
        provider: acq.provider,
        current,
        quota,
        usagePercent,
        status: usagePercent > 85 ? 'critical' : usagePercent > 65 ? 'warning' : 'healthy'
      };
    });
  }, [acquirers]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gateway Throughput & Quota Monitor</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Monitoramento em tempo real de chamadas de API contra as quotas dos provedores BaaS (Rate Limits).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Live Sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Metric Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total API Calls (1h)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">1.24M</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <TrendingUp className="h-3 w-3" />
            <span>+12.4% vs last hour</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Latency (P95)</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">184ms</div>
          <div className="text-[10px] text-slate-400">Tempo de resposta médio BaaS</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quota Risk Level</span>
          <div className="text-2xl font-black text-emerald-500">LOW</div>
          <div className="text-[10px] text-slate-400">Nenhuma quota acima de 90%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auto-Scaling Events</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">02</div>
          <div className="text-[10px] text-slate-400">Switching dinâmico executado</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Throughput Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Throughput por Adquirente (Req/min)</h3>
              <p className="text-[10px] text-slate-500">Volume atual comparado ao limite contratual</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <span>Quota</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={throughputData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={120}
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: 'none', 
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(value: number) => [`${value} req/min`, '']}
                />
                <Bar dataKey="quota" fill="#e2e8f0" radius={[0, 8, 8, 0]} />
                <Bar dataKey="current" radius={[0, 8, 8, 0]}>
                  {throughputData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 'critical' ? '#ef4444' : entry.status === 'warning' ? '#f59e0b' : '#6366f1'} 
                    />
                  ))}
                  <LabelList 
                    dataKey="usagePercent" 
                    position="right" 
                    formatter={(val: number) => `${val.toFixed(1)}%`}
                    style={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                  />
                </Bar>
                <ReferenceLine x={4000} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Threshold 80%', fill: '#ef4444', fontSize: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resource Exhaustion Risk</h3>
          
          <div className="space-y-4">
            {throughputData.map(item => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      item.status === 'critical' ? 'bg-rose-500' : 
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{item.current} / {item.quota}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      item.status === 'critical' ? 'bg-rose-500' : 
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${item.usagePercent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-amber-50 p-1.5 dark:bg-amber-900/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-slate-900 dark:text-white">Recomendação Proativa</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  O provedor <strong>Cielo</strong> atingiu 78% da quota contratual. Considere desviar 15% do tráfego para <strong>Stone</strong> via Smart-Routing.
                </p>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Executar Balanceamento Automático
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
