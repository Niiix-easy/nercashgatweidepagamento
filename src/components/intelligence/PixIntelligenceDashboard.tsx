import React, { useState } from 'react';
import { Zap, Clock, TrendingUp, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { usePayment } from '../../context/PaymentContext';

export const PixIntelligenceDashboard: React.FC = () => {
  const { addToast } = usePayment();

  const latencyData = [
    { time: '08:00', Iugu: 800, Juno: 750, Asaas: 900 },
    { time: '09:00', Iugu: 780, Juno: 760, Asaas: 890 },
    { time: '10:00', Iugu: 810, Juno: 740, Asaas: 880 },
    { time: '11:00', Iugu: 750, Juno: 780, Asaas: 870 },
    { time: '12:00', Iugu: 720, Juno: 800, Asaas: 860 },
    { time: '13:00', Iugu: 740, Juno: 770, Asaas: 850 },
    { time: '14:00', Iugu: 760, Juno: 750, Asaas: 870 }
  ];

  const topBanksData = [
    { bank: 'Nubank', successRate: 99.8, volume: 450 },
    { bank: 'Itaú', successRate: 99.5, volume: 380 },
    { bank: 'Bradesco', successRate: 98.9, volume: 310 },
    { bank: 'Inter', successRate: 99.7, volume: 290 },
    { bank: 'BB', successRate: 98.5, volume: 250 },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-6 w-6 text-emerald-500" />
            Pix Intelligence & Analytics
          </h2>
          <p className="text-sm text-slate-500">Monitoramento em tempo real da performance do Pix (SPI) entre adquirentes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pix Instant Confirmation Latency (ms)</h3>
              <p className="text-xs text-slate-500">Tempo de confirmação de pagamento por PSP</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIugu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJuno" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAsaas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[500, 1000]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Iugu" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorIugu)" />
                <Area type="monotone" dataKey="Juno" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorJuno)" />
                <Area type="monotone" dataKey="Asaas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAsaas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Banks (Pix)</h3>
              <p className="text-xs text-slate-500">Volume de transações e taxa de sucesso por banco pagador</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBanksData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="bank" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="volume" name="Volume (k BRL)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="successRate" name="Success Rate (%)" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
