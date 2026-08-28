import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  Info,
  AlertTriangle,
  Flame,
  Activity,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';

export interface RegionData {
  id: string;
  name: string;
  macroRegion: 'br_sudeste' | 'br_sul' | 'br_nordeste' | 'br_centro_oeste' | 'br_norte' | 'latam' | 'global';
  volume: number; // in BRL
  transactionsCount: number;
  avgRiskScore: number;
  approvalRate: number;
  fraudPrevented: number;
  svgPathCoordinates: string; // SVG path representation
  centerX: number;
  centerY: number;
}

export interface FraudRiskCluster {
  id: string;
  name: string;
  state: string;
  x: number;
  y: number;
  radius: number;
  riskScore: number; // 0 - 100
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  chargebackLikelihood: number; // percentage
  transactionsSampled: number;
  topAnomalyVectors: string[];
  recommendedAction: string;
  isSimulatedThreat?: boolean;
}

// Normalized regional geometry data for Brazil Macro-Regions & Key States
const REGIONS_DATA: RegionData[] = [
  {
    id: 'SP',
    name: 'São Paulo (SP)',
    macroRegion: 'br_sudeste',
    volume: 1845200.50,
    transactionsCount: 9420,
    avgRiskScore: 18,
    approvalRate: 98.4,
    fraudPrevented: 142300.00,
    svgPathCoordinates: 'M 220 220 L 255 210 L 265 235 L 240 255 L 210 240 Z',
    centerX: 238,
    centerY: 232
  },
  {
    id: 'RJ',
    name: 'Rio de Janeiro (RJ)',
    macroRegion: 'br_sudeste',
    volume: 892400.00,
    transactionsCount: 4610,
    avgRiskScore: 32,
    approvalRate: 95.2,
    fraudPrevented: 78500.00,
    svgPathCoordinates: 'M 265 215 L 295 205 L 300 225 L 270 235 Z',
    centerX: 282,
    centerY: 220
  },
  {
    id: 'MG',
    name: 'Minas Gerais (MG)',
    macroRegion: 'br_sudeste',
    volume: 745100.20,
    transactionsCount: 3890,
    avgRiskScore: 21,
    approvalRate: 97.8,
    fraudPrevented: 51200.00,
    svgPathCoordinates: 'M 230 170 L 275 160 L 290 205 L 245 210 Z',
    centerX: 260,
    centerY: 186
  },
  {
    id: 'ES',
    name: 'Espírito Santo (ES)',
    macroRegion: 'br_sudeste',
    volume: 240100.00,
    transactionsCount: 1320,
    avgRiskScore: 22,
    approvalRate: 97.1,
    fraudPrevented: 16400.00,
    svgPathCoordinates: 'M 290 180 L 310 175 L 315 200 L 295 205 Z',
    centerX: 302,
    centerY: 190
  },
  {
    id: 'PR',
    name: 'Paraná (PR)',
    macroRegion: 'br_sul',
    volume: 580300.00,
    transactionsCount: 3100,
    avgRiskScore: 19,
    approvalRate: 98.1,
    fraudPrevented: 38900.00,
    svgPathCoordinates: 'M 195 240 L 235 235 L 240 265 L 200 270 Z',
    centerX: 218,
    centerY: 252
  },
  {
    id: 'SC',
    name: 'Santa Catarina (SC)',
    macroRegion: 'br_sul',
    volume: 460200.00,
    transactionsCount: 2480,
    avgRiskScore: 16,
    approvalRate: 98.9,
    fraudPrevented: 29400.00,
    svgPathCoordinates: 'M 200 270 L 240 265 L 245 290 L 210 295 Z',
    centerX: 224,
    centerY: 280
  },
  {
    id: 'RS',
    name: 'Rio Grande do Sul (RS)',
    macroRegion: 'br_sul',
    volume: 620400.00,
    transactionsCount: 3340,
    avgRiskScore: 19,
    approvalRate: 97.9,
    fraudPrevented: 44100.00,
    svgPathCoordinates: 'M 190 295 L 235 290 L 230 340 L 175 330 Z',
    centerX: 206,
    centerY: 312
  },
  {
    id: 'BA',
    name: 'Bahia (BA)',
    macroRegion: 'br_nordeste',
    volume: 410500.00,
    transactionsCount: 2210,
    avgRiskScore: 42,
    approvalRate: 94.4,
    fraudPrevented: 62800.00,
    svgPathCoordinates: 'M 270 120 L 320 110 L 325 165 L 275 160 Z',
    centerX: 298,
    centerY: 138
  },
  {
    id: 'PE_CE',
    name: 'Pernambuco & Ceará (PE/CE)',
    macroRegion: 'br_nordeste',
    volume: 380200.00,
    transactionsCount: 2050,
    avgRiskScore: 38,
    approvalRate: 95.1,
    fraudPrevented: 46700.00,
    svgPathCoordinates: 'M 285 70 L 350 60 L 345 105 L 290 115 Z',
    centerX: 318,
    centerY: 88
  },
  {
    id: 'CO_DF',
    name: 'Distrito Federal & Centro-Oeste (DF/GO/MT)',
    macroRegion: 'br_centro_oeste',
    volume: 512000.00,
    transactionsCount: 2790,
    avgRiskScore: 26,
    approvalRate: 97.0,
    fraudPrevented: 39500.00,
    svgPathCoordinates: 'M 160 140 L 230 140 L 230 220 L 160 210 Z',
    centerX: 195,
    centerY: 175
  },
  {
    id: 'NORTE',
    name: 'Região Norte (AM/PA)',
    macroRegion: 'br_norte',
    volume: 290100.00,
    transactionsCount: 1540,
    avgRiskScore: 34,
    approvalRate: 95.8,
    fraudPrevented: 34600.00,
    svgPathCoordinates: 'M 80 50 L 230 50 L 230 135 L 110 135 Z',
    centerX: 155,
    centerY: 92
  }
];

// Initial High-Risk Transaction Clusters derived from historical ML analysis
const INITIAL_FRAUD_CLUSTERS: FraudRiskCluster[] = [
  {
    id: 'cluster_rj_baixada',
    name: 'Cluster Baixada / Metropolitano RJ',
    state: 'RJ',
    x: 288,
    y: 218,
    radius: 18,
    riskScore: 86,
    riskLevel: 'critical',
    chargebackLikelihood: 8.4,
    transactionsSampled: 412,
    topAnomalyVectors: ['IP Anônimo VPN / Datacenter', 'Burst de 5 pedidos em 3 min', 'BINs Estrangeiros'],
    recommendedAction: 'Forçar 3DS 2.0 com desafio biométrico e bloquear BINs de alta taxa de chargeback'
  },
  {
    id: 'cluster_ba_salvador',
    name: 'Polo Metropolitano Salvador / Litoral BA',
    state: 'BA',
    x: 305,
    y: 142,
    radius: 15,
    riskScore: 78,
    riskLevel: 'high',
    chargebackLikelihood: 6.2,
    transactionsSampled: 289,
    topAnomalyVectors: ['Divergência de Geolocalização vs CEP', 'Dispositivo inédito recorrente'],
    recommendedAction: 'Redirecionar para análise prioritária ClearSale + limite de parcelamento'
  },
  {
    id: 'cluster_pe_recife',
    name: 'Cluster Recife / Porto Digital PE',
    state: 'PE_CE',
    x: 335,
    y: 82,
    radius: 14,
    riskScore: 72,
    riskLevel: 'high',
    chargebackLikelihood: 5.1,
    transactionsSampled: 310,
    topAnomalyVectors: ['Troca rápida de cartão no checkout', 'Inconsistência de Fingerprint'],
    recommendedAction: 'Ativar motor de fallback instantâneo para PIX com incentivo de desconto'
  },
  {
    id: 'cluster_sp_capital',
    name: 'Cluster Financeiro / E-commerce SP',
    state: 'SP',
    x: 242,
    y: 236,
    radius: 22,
    riskScore: 35,
    riskLevel: 'medium',
    chargebackLikelihood: 1.2,
    transactionsSampled: 3840,
    topAnomalyVectors: ['Alto volume transacional', 'Tentativas normais de retentativa'],
    recommendedAction: 'Tráfego seguro com aprovação rápida via Rede Itaú / Cielo'
  },
  {
    id: 'cluster_df_fintech',
    name: 'Cluster Brasília Fintech Hub',
    state: 'CO_DF',
    x: 202,
    y: 170,
    radius: 13,
    riskScore: 48,
    riskLevel: 'medium',
    chargebackLikelihood: 2.1,
    transactionsSampled: 590,
    topAnomalyVectors: ['Altos valores de ticket médio (> R$ 5.000)', 'Compras B2B Corporativas'],
    recommendedAction: 'Validação de CNPJ automática na Receita e conciliação em D+0'
  },
  {
    id: 'cluster_sul_curitiba',
    name: 'Cluster Curitiba / Florianópolis',
    state: 'PR',
    x: 220,
    y: 260,
    radius: 12,
    riskScore: 22,
    riskLevel: 'low',
    chargebackLikelihood: 0.6,
    transactionsSampled: 1420,
    topAnomalyVectors: ['Perfil de comprador recorrente', 'Alta fidelidade de dispositivo'],
    recommendedAction: 'Zero atrito - 1-Click Checkout ativado'
  }
];

interface GeographicalHeatMapProps {
  selectedRegionFilter: string;
  onSelectRegion: (regionKey: any) => void;
  theme?: 'light' | 'dark';
}

export const GeographicalHeatMap: React.FC<GeographicalHeatMapProps> = ({
  selectedRegionFilter,
  onSelectRegion,
  theme = 'dark'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeMetric, setActiveMetric] = useState<'risk_heatmap' | 'volume' | 'approval'>('risk_heatmap');
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<FraudRiskCluster | null>(INITIAL_FRAUD_CLUSTERS[0]);
  const [clusterFilter, setClusterFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [clusters, setClusters] = useState<FraudRiskCluster[]>(INITIAL_FRAUD_CLUSTERS);
  const [isSimulatingAnalysis, setIsSimulatingAnalysis] = useState<boolean>(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  // Filtered clusters based on selected severity
  const filteredClusters = useMemo(() => {
    if (clusterFilter === 'all') return clusters;
    return clusters.filter(c => c.riskLevel === clusterFilter);
  }, [clusters, clusterFilter]);

  // D3 Color Scales
  const maxVolume = useMemo(() => d3.max(REGIONS_DATA, d => d.volume) || 2000000, []);
  const minVolume = useMemo(() => d3.min(REGIONS_DATA, d => d.volume) || 100000, []);

  const getColorScale = () => {
    if (activeMetric === 'volume') {
      return d3.scaleSequential()
        .domain([minVolume, maxVolume])
        .interpolator(d3.interpolateYlGnBu);
    } else if (activeMetric === 'risk_heatmap') {
      return d3.scaleSequential()
        .domain([12, 45])
        .interpolator(d3.interpolateOrRd);
    } else {
      return d3.scaleSequential()
        .domain([94, 99.5])
        .interpolator(d3.interpolateGreens);
    }
  };

  const colorScale = useMemo(() => getColorScale(), [activeMetric, minVolume, maxVolume]);

  const getRegionColor = (region: RegionData) => {
    let value = region.volume;
    if (activeMetric === 'risk_heatmap') value = region.avgRiskScore;
    if (activeMetric === 'approval') value = region.approvalRate;

    return colorScale(value);
  };

  // Run dynamic D3 Simulation of ML Clustering
  const handleRunMlClustering = () => {
    setIsSimulatingAnalysis(true);
    setSimulationStatus('Analisando 10.000+ vetores transacionais e fingerprints...');

    setTimeout(() => {
      setSimulationStatus('Calculando centróides de risco e probabilidade de chargeback...');
    }, 600);

    setTimeout(() => {
      const updatedClusters: FraudRiskCluster[] = clusters.map(c => {
        const deltaRisk = Math.floor((Math.random() * 6) - 3);
        const newScore = Math.max(10, Math.min(98, c.riskScore + deltaRisk));
        let newLevel: FraudRiskCluster['riskLevel'] = 'low';
        if (newScore >= 80) newLevel = 'critical';
        else if (newScore >= 60) newLevel = 'high';
        else if (newScore >= 35) newLevel = 'medium';

        return {
          ...c,
          riskScore: newScore,
          riskLevel: newLevel,
          chargebackLikelihood: Number((newScore * 0.09).toFixed(1)),
          transactionsSampled: c.transactionsSampled + Math.floor(Math.random() * 40)
        };
      });

      setClusters(updatedClusters);
      setIsSimulatingAnalysis(false);
      setSimulationStatus('Clusters geográficos atualizados pelo motor ML em tempo real!');
      setTimeout(() => setSimulationStatus(null), 3000);
    }, 1200);
  };

  // D3 Transition Effect on SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Animate map paths
    svg.selectAll('.region-path')
      .transition()
      .duration(450)
      .attr('fill', function() {
        const regionId = d3.select(this).attr('data-id');
        const region = REGIONS_DATA.find(r => r.id === regionId);
        return region ? getRegionColor(region) : '#334155';
      });

  }, [activeMetric, colorScale, clusters]);

  // Aggregate totals
  const totals = useMemo(() => {
    const totalVol = REGIONS_DATA.reduce((acc, r) => acc + r.volume, 0);
    const totalTx = REGIONS_DATA.reduce((acc, r) => acc + r.transactionsCount, 0);
    const totalFraud = REGIONS_DATA.reduce((acc, r) => acc + r.fraudPrevented, 0);
    const avgRisk = Math.round(REGIONS_DATA.reduce((acc, r) => acc + r.avgRiskScore, 0) / REGIONS_DATA.length);
    const highRiskClustersCount = clusters.filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high').length;

    return { totalVol, totalTx, totalFraud, avgRisk, highRiskClustersCount };
  }, [clusters]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Fraud Risk Heatmap & Clusters Geográficos (D3.js)</span>
                <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  ML Anomaly Detection
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualização interativa de polos de alto risco transacional e probabilidade de chargeback por região
              </p>
            </div>
          </div>
        </div>

        {/* Action controls & Metric selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Re-cluster ML Button */}
          <button
            id="btn-recluster-ml"
            type="button"
            onClick={handleRunMlClustering}
            disabled={isSimulatingAnalysis}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-all shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isSimulatingAnalysis ? 'animate-spin text-rose-500' : 'text-rose-600'}`} />
            <span>{isSimulatingAnalysis ? 'Calculando Clusters...' : 'Re-treinar Clusters ML'}</span>
          </button>

          {/* Metric Selector Tabs */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveMetric('risk_heatmap')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'risk_heatmap'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Risco & Fraude
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('volume')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'volume'
                  ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Volume (R$)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('approval')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'approval'
                  ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700 dark:text-sky-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Aprovação (%)
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Feedback Alert */}
      {simulationStatus && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-50/70 p-2.5 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2 animate-fade-in">
          <Activity className="h-4 w-4 animate-pulse text-rose-500" />
          <span>{simulationStatus}</span>
        </div>
      )}

      {/* Main Grid: D3 Map Stage (Left 7 cols) & Cluster Detail Panel (Right 5 cols) */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: D3 SVG Interactive Map */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 p-4 lg:col-span-7 shadow-inner">
          {/* Top Bar: Cluster Filter Pills */}
          <div className="w-full flex items-center justify-between gap-2 mb-2 z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Filtrar Risco:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setClusterFilter(tier)}
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                    clusterFilter === tier
                      ? tier === 'critical'
                        ? 'bg-rose-600 text-white'
                        : tier === 'high'
                          ? 'bg-amber-600 text-white'
                          : tier === 'medium'
                            ? 'bg-indigo-600 text-white'
                            : tier === 'low'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-900'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'Todos' : tier}
                </button>
              ))}
            </div>

            <span className="font-mono text-[10px] text-rose-400 bg-rose-950/80 border border-rose-900/50 px-2 py-0.5 rounded-lg">
              {filteredClusters.length} clusters plotados
            </span>
          </div>

          <div className="relative w-full max-w-[460px] h-[370px]">
            <svg
              ref={svgRef}
              viewBox="0 0 420 360"
              className="h-full w-full select-none"
              onMouseLeave={() => setHoveredRegion(null)}
            >
              {/* Defs for D3 Glow & Gradients */}
              <defs>
                <radialGradient id="criticalPulseGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#e11d48" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="highRiskGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Brazil Macro-Region Geo Polygons */}
              {REGIONS_DATA.map((region) => {
                const isSelected = selectedRegionFilter === region.macroRegion;
                const isHovered = hoveredRegion?.id === region.id;
                const fillColor = getRegionColor(region);

                return (
                  <g key={region.id} className="cursor-pointer">
                    <path
                      data-id={region.id}
                      d={region.svgPathCoordinates}
                      fill={fillColor}
                      stroke={isSelected || isHovered ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1.2}
                      className="region-path transition-all duration-200 hover:opacity-90"
                      onClick={() => onSelectRegion(region.macroRegion)}
                      onMouseEnter={() => setHoveredRegion(region)}
                    />
                    {/* State Center Label */}
                    <text
                      x={region.centerX}
                      y={region.centerY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none fill-slate-300 font-mono text-[9px] font-bold"
                    >
                      {region.id}
                    </text>
                  </g>
                );
              })}

              {/* High-Risk ML Cluster Overlay Points & Density Waves */}
              {filteredClusters.map((cluster) => {
                const isSelected = selectedCluster?.id === cluster.id;
                const isCritical = cluster.riskLevel === 'critical';
                const isHigh = cluster.riskLevel === 'high';
                const isMedium = cluster.riskLevel === 'medium';

                let strokeColor = '#10b981';
                let fillColor = 'rgba(16, 185, 129, 0.4)';
                if (isCritical) {
                  strokeColor = '#f43f5e';
                  fillColor = 'url(#criticalPulseGradient)';
                } else if (isHigh) {
                  strokeColor = '#f59e0b';
                  fillColor = 'url(#highRiskGradient)';
                } else if (isMedium) {
                  strokeColor = '#6366f1';
                  fillColor = 'rgba(99, 102, 241, 0.3)';
                }

                return (
                  <g
                    key={cluster.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedCluster(cluster)}
                  >
                    {/* Animated Outer Pulse for Critical/High Risk */}
                    {(isCritical || isHigh) && (
                      <circle
                        cx={cluster.x}
                        cy={cluster.y}
                        r={cluster.radius * 1.6}
                        fill={fillColor}
                        className="animate-ping opacity-60 pointer-events-none"
                      />
                    )}

                    {/* Cluster Body Circle */}
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={isSelected ? cluster.radius + 3 : cluster.radius}
                      fill={fillColor}
                      stroke={isSelected ? '#ffffff' : strokeColor}
                      strokeWidth={isSelected ? 3 : 1.8}
                      className="transition-all duration-300 group-hover:stroke-white"
                    />

                    {/* Cluster Core Risk Score Label */}
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r={4.5}
                      fill={strokeColor}
                    />

                    <text
                      x={cluster.x}
                      y={cluster.y - cluster.radius - 3}
                      textAnchor="middle"
                      className="pointer-events-none fill-white font-mono text-[8.5px] font-extrabold drop-shadow"
                    >
                      {cluster.riskScore}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer Legend */}
          <div className="mt-2 w-full flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Crítico (&gt;80%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>Alto (60-80%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Médio (35-60%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Seguro (&lt;35%)</span>
              </span>
            </div>
            <span className="font-mono text-slate-500">Clique em um cluster para inspecionar</span>
          </div>
        </div>

        {/* Right: Cluster Deep-Dive Inspection Panel */}
        <div className="flex flex-col space-y-4 lg:col-span-5">
          {selectedCluster ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-rose-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedCluster.name}
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Estado: {selectedCluster.state} • Amostra: {selectedCluster.transactionsSampled} transações
                    </span>
                  </div>

                  <span className={`rounded-xl px-2.5 py-1 text-xs font-black uppercase ${
                    selectedCluster.riskLevel === 'critical'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : selectedCluster.riskLevel === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {selectedCluster.riskLevel} Risk ({selectedCluster.riskScore})
                  </span>
                </div>

                {/* Metric Quick Stats */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Risco de Chargeback ML
                    </span>
                    <p className="mt-0.5 text-base font-black text-rose-600 dark:text-rose-400">
                      {selectedCluster.chargebackLikelihood}%
                    </p>
                    <span className="text-[9px] text-slate-400">Média nacional: 0.8%</span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Volume Amostrado
                    </span>
                    <p className="mt-0.5 text-base font-black text-slate-900 dark:text-white font-mono">
                      {selectedCluster.transactionsSampled} tx
                    </p>
                    <span className="text-[9px] text-slate-400">Últimos 30 dias</span>
                  </div>
                </div>

                {/* Top Anomaly Vectors */}
                <div className="mt-3.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span>Principais Vetores de Anomalia Detectados:</span>
                  </span>
                  <div className="space-y-1.5">
                    {selectedCluster.topAnomalyVectors.map((vector, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>{vector}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Mitigation Action */}
                <div className="mt-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                    <Zap className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Ação de Mitigação Recomendada pelo Decision Engine:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedCluster.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectRegion(selectedCluster.state)}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
                >
                  <span>Filtrar Transações Deste Polo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <Globe className="mx-auto h-8 w-8 text-slate-400 mb-2 opacity-50" />
              <p className="text-xs">Selecione qualquer cluster no mapa para inspecionar métricas detalhadas.</p>
            </div>
          )}

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total Prevenido por ML</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                R$ {(totals.totalFraud).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Clusters de Alto Risco</span>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                {totals.highRiskClustersCount} identificados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
