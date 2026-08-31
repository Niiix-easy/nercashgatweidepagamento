import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePayment } from '../../context/PaymentContext';
import { Activity, BarChart2 } from 'lucide-react';

// Mock data generator for payment volume across providers
const generateVolumeData = () => {
  const data = [];
  const providers = ['iugu', 'juno', 'asaas', 'cielo'];
  let baseVolumes = { iugu: 4000, juno: 3000, asaas: 2500, cielo: 8000 };

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });

    // Add some random noise and trends
    baseVolumes.iugu += (Math.random() - 0.45) * 500;
    baseVolumes.juno += (Math.random() - 0.48) * 300;
    baseVolumes.asaas += (Math.random() - 0.5) * 400;
    baseVolumes.cielo += (Math.random() - 0.45) * 800;

    data.push({
      date: dayStr,
      'Iugu': Math.max(0, Math.round(baseVolumes.iugu)),
      'Juno': Math.max(0, Math.round(baseVolumes.juno)),
      'Asaas': Math.max(0, Math.round(baseVolumes.asaas)),
      'Cielo': Math.max(0, Math.round(baseVolumes.cielo)),
    });
  }
  return data;
};

export const PaymentVolumeTrendVisualizer: React.FC = () => {
  const chartData = useMemo(() => generateVolumeData(), []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Volume Trend</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Performance histórica do volume transacional (TPV) roteado através de múltiplos provedores e gateways nos últimos 30 dias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            Live Data
          </span>
        </div>
      </div>

      <div className="mt-6 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIugu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorJuno" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAsaas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCielo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} iconType="circle" />
            <Area type="monotone" dataKey="Iugu" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIugu)" />
            <Area type="monotone" dataKey="Cielo" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorCielo)" />
            <Area type="monotone" dataKey="Juno" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorJuno)" />
            <Area type="monotone" dataKey="Asaas" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAsaas)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
