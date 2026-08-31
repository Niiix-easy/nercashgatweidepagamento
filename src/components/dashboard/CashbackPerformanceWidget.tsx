import React, { useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Gift, 
  TrendingUp, 
  Target, 
  Award, 
  Percent, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Layers,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';

export interface CashbackTierMetrics {
  id: string;
  name: string;
  cashbackPercent: number;
  adoptionRate: number; // e.g. 42%
  merchantsCount: number;
  volumeProcessedBrl: number;
  rebatesIssuedBrl: number;
  badgeColor: string;
  barColor: string;
}

export const CashbackPerformanceWidget: React.FC = () => {
  const { setActiveTab, addToast } = usePayment();

  // Tier performance metrics
  const tierMetrics: CashbackTierMetrics[] = useMemo(() => [
    {
      id: 'tier_bronze',
      name: 'Bronze Starter',
      cashbackPercent: 1.0,
      adoptionRate: 35,
      merchantsCount: 142,
      volumeProcessedBrl: 1420000.00,
      rebatesIssuedBrl: 14200.00 + (142 * 50),
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      barColor: 'bg-amber-500'
    },
    {
      id: 'tier_silver',
      name: 'Silver Growth',
      cashbackPercent: 2.5,
      adoptionRate: 42,
      merchantsCount: 186,
      volumeProcessedBrl: 9300000.00,
      rebatesIssuedBrl: 232500.00 + (186 * 250),
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-400',
      barColor: 'bg-indigo-500'
    },
    {
      id: 'tier_gold',
      name: 'Gold Scale',
      cashbackPercent: 3.5,
      adoptionRate: 16,
      merchantsCount: 64,
      volumeProcessedBrl: 6400000.00,
      rebatesIssuedBrl: 224000.00 + (64 * 750),
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-400',
      barColor: 'bg-yellow-500'
    },
    {
      id: 'tier_diamond',
      name: 'Black Diamond VIP',
      cashbackPercent: 5.0,
      adoptionRate: 7,
      merchantsCount: 28,
      volumeProcessedBrl: 7000000.00,
      rebatesIssuedBrl: 350000.00 + (28 * 2500),
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-400',
      barColor: 'bg-purple-500'
    }
  ], []);

  // Aggregated platform-wide metrics
  const totalRebatesIssued = useMemo(() => {
    return tierMetrics.reduce((acc, t) => acc + t.rebatesIssuedBrl, 0);
  }, [tierMetrics]);

  const totalIncentivizedVolume = useMemo(() => {
    return tierMetrics.reduce((acc, t) => acc + t.volumeProcessedBrl, 0);
  }, [tierMetrics]);

  const totalMerchantsEnrolled = useMemo(() => {
    return tierMetrics.reduce((acc, t) => acc + t.merchantsCount, 0);
  }, [tierMetrics]);

  const averageRebatePercentage = 2.45;

  // Handler for PDF export of Cashback Performance
  const handleExportCashbackPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Relatório de Performance de Cashback & ROI - Nercash', 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Total Rebates: R$ ${totalRebatesIssued.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, 28);

    const tableData = tierMetrics.map(t => [
      t.name,
      `${t.cashbackPercent}%`,
      `${t.adoptionRate}% (${t.merchantsCount} lojistas)`,
      `R$ ${t.volumeProcessedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `R$ ${t.rebatesIssuedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: 34,
      head: [['Tier / Nível', 'Cashback', 'Adoção (Lojistas)', 'Volume Processado (TPV)', 'Rebates Emitidos']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [245, 158, 11] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(11);
    doc.text(`Volume Total Incentivado: R$ ${totalIncentivizedVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 14, finalY + 12);
    doc.text(`Taxa Média Efetiva de Rebate: ${averageRebatePercentage}%`, 14, finalY + 18);

    doc.save(`nercash_cashback_performance_report_${Date.now()}.pdf`);
    addToast('Relatório de Cashback Exportado', 'Relatório PDF de performance de cashback e ROI gerado com sucesso.', 'success');
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6" id="overview-cashback-performance-widget">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Performance Global do Programa de Cashback & Metas
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                +24.8% Retenção Lojista
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Métricas consolidadas de rebates emitidos, taxa de adoção por faixas e incentivos de volume transacional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCashbackPdf}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4 text-amber-500" />
            <span>Exportar PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cashback')}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 transition-all cursor-pointer"
          >
            <span>Gerenciar Metas</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Top 3 KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Rebates Issued */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total de Rebates Emitidos
            </span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              R$ {totalRebatesIssued.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Recompensas pagas e creditadas no ciclo atual
          </p>
        </div>

        {/* Card 2: Volume Incentivado */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Volume Transacionado Sob Metas
            </span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              R$ {(totalIncentivizedVolume / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              (94.2% TPV Total)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {totalMerchantsEnrolled} lojistas engajados nas metas
          </p>
        </div>

        {/* Card 3: Rebate Médio / ROI */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Taxa Média Efetiva de Cashback
            </span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {averageRebatePercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              (Margem Líquida +1.8%)
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Retorno sobre investimento e aceleração de GMV
          </p>
        </div>
      </div>

      {/* Tier Adoption Distribution Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Taxa de Adoção & Distribuição de Lojistas por Nível de Meta</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Total de {totalMerchantsEnrolled} participantes ativos
          </span>
        </div>

        {/* Stacked Visual Bar */}
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          {tierMetrics.map(t => (
            <div
              key={t.id}
              className={`${t.barColor} transition-all`}
              style={{ width: `${t.adoptionRate}%` }}
              title={`${t.name}: ${t.adoptionRate}% (${t.merchantsCount} lojistas)`}
            />
          ))}
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {tierMetrics.map(tier => (
            <div 
              key={tier.id} 
              className="rounded-2xl border border-slate-100 p-3.5 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold border ${tier.badgeColor}`}>
                  {tier.name}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {tier.adoptionRate}% Adoção
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Lojistas Qualificados:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{tier.merchantsCount}</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Cashback do Nível:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{tier.cashbackPercent}%</strong>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Rebates Gerados:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">
                    R$ {(tier.rebatesIssuedBrl / 1000).toFixed(1)}k
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
