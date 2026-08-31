import React, { useState } from 'react';
import { ShieldCheck, TrendingDown, AlertTriangle, Fingerprint, Activity, Clock } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';

export const ThreeDSAuthDashboard: React.FC = () => {
  const [data] = useState([
    { date: '08/24', success: 92, failed: 8, friction_loss: 4.2 },
    { date: '08/25', success: 94, failed: 6, friction_loss: 3.8 },
    { date: '08/26', success: 91, failed: 9, friction_loss: 4.5 },
    { date: '08/27', success: 89, failed: 11, friction_loss: 5.1 },
    { date: '08/28', success: 95, failed: 5, friction_loss: 3.2 },
    { date: '08/29', success: 96, failed: 4, friction_loss: 2.9 },
    { date: '08/30', success: 97, failed: 3, friction_loss: 2.4 },
  ]);

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3D Secure 2.0 (3DS) Authentication</h2>
            <p className="text-sm text-slate-500">Monitor challenge success rates, friction loss, and liability shift status.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Success Rate (Auth)</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-emerald-600">97.4%</span>
            <span className="text-xs text-emerald-500 mb-1 flex items-center"><Activity className="h-3 w-3 mr-1" /> +1.2%</span>
          </div>
        </div>
        <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Conversion Loss (Friction)</span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-rose-600">2.4%</span>
            <span className="text-xs text-emerald-500 mb-1 flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> -0.8%</span>
          </div>
        </div>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Liability Shift (Proteção Chargeback)</span>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full dark:bg-indigo-900/50 dark:text-indigo-400">Ativo Globalmente</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full dark:bg-slate-800">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }}></div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1">92% das transações recentes estão sob proteção Liability Shift.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">3DS Challenge Success Rate</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 5', 'dataMax + 2']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Conversion Friction Loss</h3>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold dark:bg-rose-900/30 dark:text-rose-400">Cartão Abandonado</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="friction_loss" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg bg-indigo-50 p-4 flex items-start gap-3 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/30">
        <Fingerprint className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-1">3DS 2.0 Frictionless Flow</h4>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
            O protocolo 3D Secure 2.0 está utilizando Risk-Based Authentication (RBA). Aproximadamente 85% das transações estão sendo aprovadas no fluxo Frictionless (sem desafio visível ao portador), mantendo a conversão alta e garantindo a troca de responsabilidade (Liability Shift) para o emissor em caso de fraude.
          </p>
        </div>
      </div>
    </div>
  );
};
