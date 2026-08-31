import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { Activity, Clock } from 'lucide-react';

export const LatencyHeatmapWidget: React.FC = () => {
  const providers = ['Iugu', 'Juno', 'Asaas'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
  
  const data = useMemo(() => {
    const arr = [];
    providers.forEach((p, pIndex) => {
      hours.forEach((h, hIndex) => {
        let base = p === 'Iugu' ? 45 : p === 'Juno' ? 85 : 60;
        // Introduce some spikes
        if (hIndex >= 10 && hIndex <= 14) base += 50; // Midday spike
        if (p === 'Asaas' && hIndex === 18) base += 150; // Random spike
        
        const latency = Math.max(10, base + (Math.random() * 40 - 20));
        arr.push({ provider: p, hour: h, latency, x: hIndex, y: pIndex });
      });
    });
    return arr;
  }, []);

  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 200]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Latency Heatmap (24h)</h3>
            <p className="text-xs text-slate-500">Real-time response times distribution across BaaS providers</p>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="flex mb-1">
            <div className="w-16"></div>
            <div className="flex-1 flex justify-between px-1">
              {hours.map((h, i) => (
                <div key={i} className="text-[9px] font-bold text-slate-400 w-6 text-center">{h}</div>
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            {providers.map((provider, pIndex) => (
              <div key={provider} className="flex items-center">
                <div className="w-16 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {provider}
                </div>
                <div className="flex-1 flex justify-between px-1 gap-1">
                  {data.filter(d => d.provider === provider).map((d, i) => {
                    const isSpike = d.latency > 150;
                    return (
                      <div 
                        key={i} 
                        className={`w-6 h-6 rounded-sm relative group cursor-crosshair transition-transform hover:scale-110 ${isSpike ? 'ring-1 ring-rose-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: colorScale(d.latency) }}
                      >
                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none shadow-lg">
                          <span className="font-bold">{d.provider} @ {d.hour}</span><br />
                          {Math.round(d.latency)}ms
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-bold text-slate-500">
            <span>Fast (0ms)</span>
            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#ffffcc] via-[#fd8d3c] to-[#e31a1c]"></div>
            <span>Slow (200ms+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
