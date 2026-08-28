import React, { useState, useEffect } from 'react';
import { Wallet, Zap, ArrowUpRight, CheckCircle2, RefreshCw, Radio, Shield, Globe } from 'lucide-react';

export const WalletStreamWidget: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamedAmount, setStreamedAmount] = useState<number>(1482.50);
  const [tpsRate, setTpsRate] = useState<number>(0.0024); // BRL per second
  const [walletPointer, setWalletPointer] = useState<string>('$ilp.uphold.com/nercash_bb_enterprise');
  const [isEditingPointer, setIsEditingPointer] = useState<boolean>(false);
  const [tempPointer, setTempPointer] = useState<string>(walletPointer);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setStreamedAmount(prev => Number((prev + tpsRate).toFixed(4)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStreaming, tpsRate]);

  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-6 shadow-sm dark:border-emerald-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-100 dark:border-emerald-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <Wallet className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Web Monetization & Real-Time Wallet Stream</span>
              <span className={`flex h-2 w-2 relative ${isStreaming ? 'block' : 'hidden'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Streaming contínuo de micro-pagamentos via Interledger Protocol (ILP)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            isStreaming 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Radio className={`h-3.5 w-3.5 ${isStreaming ? 'animate-pulse text-emerald-600' : ''}`} />
          <span>{isStreaming ? 'Stream Ativo' : 'Stream Pausado'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Acumulado (Stream)</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              R$ {streamedAmount.toFixed(4)}
            </span>
            <span className="text-[11px] text-slate-500">BRL</span>
          </div>
          <span className="mt-2 block text-[10px] text-slate-500 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" /> Taxa: +R$ {(tpsRate * 60).toFixed(4)} / min
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Carteira Conectada (ILP)</span>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
              {walletPointer}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingPointer(!isEditingPointer)}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              {isEditingPointer ? 'Salvar' : 'Editar'}
            </button>
          </div>
          {isEditingPointer && (
            <div className="mt-2 flex gap-1">
              <input
                type="text"
                value={tempPointer}
                onChange={e => setTempPointer(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  setWalletPointer(tempPointer);
                  setIsEditingPointer(false);
                }}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white"
              >
                OK
              </button>
            </div>
          )}
          <span className="mt-2 block text-[10px] text-slate-500 flex items-center gap-1">
            <Shield className="h-3 w-3 text-emerald-500" /> Assinatura Criptográfica Válida
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status de Conectividade</span>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-white">Interledger Node Online</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">
            Latência: 12ms • Padrão W3C Web Monetization
          </div>
        </div>
      </div>
    </div>
  );
};
