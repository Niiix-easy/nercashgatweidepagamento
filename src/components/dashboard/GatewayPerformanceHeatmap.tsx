import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, Globe, Zap, Filter, HelpCircle } from 'lucide-react';

interface HeatmapCell {
  region: string;
  method: string;
  latencyMs: number;
  tps: number;
  errorRate: number;
}

const regions = ['Sudeste (SP/RJ)', 'Sul (PR/RS)', 'Nordeste (BA/PE)', 'Centro-Oeste (DF/GO)', 'Norte (AM/PA)'];
const paymentMethods = ['PIX Instantâneo', 'Cartão Crédito', 'Boleto Bancário', 'Carteira Digital', 'TED / TEF'];

// Generate rich simulated latency data
const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = [];
  regions.forEach(region => {
    paymentMethods.forEach(method => {
      // Base latency varies by region and method
      let baseLatency = 18;
      if (region.includes('Norte')) baseLatency += 45;
      if (region.includes('Nordeste')) baseLatency += 25;
      if (method.includes('Boleto')) baseLatency += 15;
      if (method.includes('TED')) baseLatency += 60;
      if (method.includes('PIX')) baseLatency -= 8;

      const randomJitter = Math.floor(Math.random() * 22) - 10;
      const latencyMs = Math.max(12, baseLatency + randomJitter);
      const tps = Math.floor(Math.random() * 1200) + 150;
      const errorRate = Number((Math.random() * 0.4).toFixed(2));

      data.push({
        region,
        method,
        latencyMs,
        tps,
        errorRate
      });
    });
  });
  return data;
};

export const GatewayPerformanceHeatmap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<HeatmapCell[]>(generateHeatmapData());
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [metricMode, setMetricMode] = useState<'latency' | 'tps' | 'errors'>('latency');

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 140 };
    const width = 680 - margin.left - margin.right;
    const height = 340 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .range([0, width])
      .domain(paymentMethods)
      .padding(0.08);

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(regions)
      .padding(0.08);

    // Color Interpolator based on mode
    let colorScale: any;
    if (metricMode === 'latency') {
      colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdYlGn)
        .domain([90, 15]); // Low latency = green, high latency = red
    } else if (metricMode === 'tps') {
      colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain([100, 1400]);
    } else {
      colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateOranges)
        .domain([0, 0.5]);
    }

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-20)')
      .style('text-anchor', 'end')
      .style('fill', '#94a3b8')
      .style('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px');

    // Tooltip div
    const tooltip = d3.select('body').selectAll('.d3-heatmap-tooltip').data([0]).join('div')
      .attr('class', 'd3-heatmap-tooltip absolute hidden rounded-xl bg-slate-900 border border-slate-700 p-3 text-white text-xs shadow-xl pointer-events-none z-50');

    // Rectangles
    g.selectAll<SVGRectElement, HeatmapCell>('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: HeatmapCell) => x(d.method) || 0)
      .attr('y', (d: HeatmapCell) => y(d.region) || 0)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d: HeatmapCell) => {
        if (metricMode === 'latency') return colorScale(d.latencyMs);
        if (metricMode === 'tps') return colorScale(d.tps);
        return colorScale(d.errorRate);
      })
      .style('stroke', '#1e293b')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: HeatmapCell) => {
        d3.select(event.currentTarget).style('stroke', '#38bdf8').style('stroke-width', '3px');
        tooltip.classed('hidden', false)
          .style('left', `${event.pageX + 12}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <div class="font-bold text-emerald-400 mb-1">${d.region} • ${d.method}</div>
            <div class="space-y-0.5 font-mono text-[11px]">
              <div>Latência Média: <span class="text-amber-300 font-bold">${d.latencyMs} ms</span></div>
              <div>Volume TPS: <span class="text-blue-300 font-bold">${d.tps} req/s</span></div>
              <div>Taxa de Erro: <span class="text-rose-400 font-bold">${d.errorRate}%</span></div>
            </div>
          `);
      })
      .on('mousemove', (event: any) => {
        tooltip.style('left', `${event.pageX + 12}px`).style('top', `${event.pageY - 28}px`);
      })
      .on('mouseleave', (event: any) => {
        d3.select(event.currentTarget).style('stroke', '#1e293b').style('stroke-width', '2px');
        tooltip.classed('hidden', true);
      })
      .on('click', (event: any, d: HeatmapCell) => {
        setSelectedCell(d);
      });

    // Value Labels inside rects
    g.selectAll<SVGTextElement, HeatmapCell>('text.cell-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'cell-label')
      .attr('x', (d: HeatmapCell) => (x(d.method) || 0) + x.bandwidth() / 2)
      .attr('y', (d: HeatmapCell) => (y(d.region) || 0) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('fill', (d: HeatmapCell) => metricMode === 'latency' && d.latencyMs > 50 ? '#ffffff' : '#0f172a')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text((d: HeatmapCell) => {
        if (metricMode === 'latency') return `${d.latencyMs}ms`;
        if (metricMode === 'tps') return `${d.tps}tps`;
        return `${d.errorRate}%`;
      });

  }, [data, metricMode]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Gateway Performance & Latency Heatmap (D3)</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Live Bottleneck Radar
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mapeamento geográfico em tempo real de latência, volume de transações e gargalos por região
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMetricMode('latency')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metricMode === 'latency' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Latência (ms)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('tps')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metricMode === 'tps' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Volume (TPS)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('errors')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                metricMode === 'errors' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Erros (%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* D3 Heatmap SVG container (8 cols) */}
        <div className="lg:col-span-8 overflow-x-auto">
          <svg ref={svgRef} viewBox="0 0 680 340" className="w-full h-auto" />
        </div>

        {/* Selected Cell Details (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Análise de Gargalo Geográfico</span>
            {selectedCell ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1.5">
                  <span>{selectedCell.region}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{selectedCell.method}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">Latência</div>
                    <div className={`text-xs font-bold ${selectedCell.latencyMs > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{selectedCell.latencyMs}ms</div>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">TPS</div>
                    <div className="text-xs font-bold text-blue-500">{selectedCell.tps}</div>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                    <div className="text-[9px] text-slate-400">Erros</div>
                    <div className="text-xs font-bold text-amber-500">{selectedCell.errorRate}%</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  {selectedCell.latencyMs > 50 ? '⚠️ Alerta: Rota com latência elevada detectada. Sugerido fallback automático.' : '✓ Rota operando dentro do SLA contratual de performance.'}
                </p>
              </div>
            ) : (
              <div className="mt-4 text-center py-6 text-xs text-slate-400">
                Clique em qualquer célula do mapa de calor para inspecionar os detalhes de latência e gargalos regionais.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 text-xs space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Smart Routing AI</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              O motor de roteamento desvia automaticamente o tráfego de regiões com latência &gt;65ms para adquirentes redundantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
