import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, Layers, Gauge } from 'lucide-react';

export const OrchestrationStatsPanel: React.FC = () => {
  const [fps, setFps] = useState<number>(60);
  const [memoryMb, setMemoryMb] = useState<number>(42.8);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time FPS jitter between 58 and 60
      setFps(58 + Math.floor(Math.random() * 3));
      // Simulate slight memory fluctuation
      setMemoryMb(prev => Number((42.0 + Math.random() * 2.5).toFixed(1)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-emerald-400 shadow-2xl backdrop-blur-md hover:bg-slate-900 transition-all cursor-pointer"
        title="Expandir Painel de Telemetria do Motor"
      >
        <Gauge className="h-4 w-4 animate-pulse text-indigo-400" />
        <span>FPS: {fps} | Mem: {memoryMb}MB</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 rounded-3xl border border-slate-700 bg-slate-900/95 p-4 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/50">
            <Gauge className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Orchestration Telemetry</h4>
            <p className="text-[10px] text-slate-400">Node Graph Engine v4.8</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
          title="Minimizar"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" /> Frame Rate (FPS):
          </span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {fps} FPS
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" /> Heap Memory Used:
          </span>
          <span className="font-mono font-bold text-indigo-300 text-sm">
            {memoryMb} MB
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/50">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-400" /> Active Nodes:
          </span>
          <span className="font-mono font-bold text-white">
            12 Nós / 4 Fios
          </span>
        </div>
      </div>
    </div>
  );
};
