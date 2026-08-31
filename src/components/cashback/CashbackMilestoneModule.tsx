import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { CashbackManagement } from './CashbackManagement';
import { 
  Gift, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Sliders, 
  DollarSign, 
  Percent, 
  Users, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Save, 
  Download, 
  Zap, 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  Play, 
  Check, 
  AlertCircle,
  Settings,
  History
} from 'lucide-react';

export interface MilestoneTier {
  id: string;
  name: string;
  targetVolumeBrl: number;
  minTransactions: number;
  cashbackPercent: number;
  bonusFixedBrl: number;
  feeDiscountPercent: number;
  prizeTitle: string;
  badgeColor: string;
  active: boolean;
}

export interface RewardHistoryRecord {
  rewardId: string;
  transactionId: string;
  merchantName: string;
  tierName: string;
  discountPercent: number;
  discountAmountBrl: number;
  timestamp: string;
  auditHash: string;
}

export interface UserMilestoneProgress {
  id: string;
  userName: string;
  userEmail: string;
  userDocument: string;
  currentVolumeBrl: number;
  currentTransactions: number;
  currentTierId: string;
  status: 'EM_PROGRESSO' | 'META_ATINGIDA' | 'PAGO' | 'EXPIRADO';
  lastTransactionAt: string;
  cashbackEarnedBrl: number;
  prizeWon?: string;
  feeDiscountApplied?: number;
  payoutDate?: string;
}

export const CashbackMilestoneModule: React.FC = () => {
  const { addToast } = usePayment();
  const [moduleView, setModuleView] = useState<'tiers_management' | 'merchant_progress' | 'reward_history'>('tiers_management');

  // Admin Master Configuration States
  const [targetVolumeGoal, setTargetVolumeGoal] = useState<number>(50000);
  const [minTransactionsGoal, setMinTransactionsGoal] = useState<number>(100);
  const [cashbackRatePercent, setCashbackRatePercent] = useState<number>(2.5);
  const [bonusFixedReward, setBonusFixedReward] = useState<number>(250);
  const [feeDiscountGoal, setFeeDiscountGoal] = useState<number>(0.35);
  const [payoutMethod, setPayoutMethod] = useState<'digital_account' | 'pix_automatic' | 'mdr_discount'>('digital_account');
  const [cyclePeriod, setCyclePeriod] = useState<'monthly' | 'quarterly' | 'continuous'>('monthly');
  const [isAutoCreditEnabled, setIsAutoCreditEnabled] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Reward History state for auditability linking reward ID to transaction ID
  const [rewardHistoryList, setRewardHistoryList] = useState<RewardHistoryRecord[]>([
    {
      rewardId: 'rew_901a_k9',
      transactionId: 'pi_tx_8810429',
      merchantName: 'Maycon Quevedo (Neer Store Matriz)',
      tierName: 'Silver Growth',
      discountPercent: 0.35,
      discountAmountBrl: 52.50,
      timestamp: '2026-08-30 14:22:10',
      auditHash: '0x9f8e7d6c5b4a3f2e1...'
    },
    {
      rewardId: 'rew_902b_m4',
      transactionId: 'pi_tx_8810488',
      merchantName: 'Nexus Digital Hub Eireli',
      tierName: 'Gold Scale',
      discountPercent: 0.65,
      discountAmountBrl: 195.00,
      timestamp: '2026-08-30 13:10:45',
      auditHash: '0x3a2b1c0d9e8f7a6b5...'
    },
    {
      rewardId: 'rew_903c_x2',
      transactionId: 'pi_tx_8810512',
      merchantName: 'Solaris Marketplace Tech',
      tierName: 'Black Diamond VIP',
      discountPercent: 1.00,
      discountAmountBrl: 340.00,
      timestamp: '2026-08-30 11:05:00',
      auditHash: '0x11223344556677889...'
    }
  ]);
  const [rewardSearchTerm, setRewardSearchTerm] = useState<string>('');

  // Multi-tier levels managed by admin
  const [tiers, setTiers] = useState<MilestoneTier[]>([
    {
      id: 'tier_bronze',
      name: 'Bronze Starter',
      targetVolumeBrl: 10000,
      minTransactions: 30,
      cashbackPercent: 1.0,
      bonusFixedBrl: 50,
      feeDiscountPercent: 0.15,
      prizeTitle: 'Certificado de Início + R$ 50 Bônus',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
      active: true
    },
    {
      id: 'tier_silver',
      name: 'Silver Growth',
      targetVolumeBrl: 50000,
      minTransactions: 100,
      cashbackPercent: 2.5,
      bonusFixedBrl: 250,
      feeDiscountPercent: 0.35,
      prizeTitle: 'Troféu Destaque Silver + R$ 250 Bônus + 0.35% OFF MDR',
      badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-400',
      active: true
    },
    {
      id: 'tier_gold',
      name: 'Gold Scale',
      targetVolumeBrl: 100000,
      minTransactions: 250,
      cashbackPercent: 3.5,
      bonusFixedBrl: 750,
      feeDiscountPercent: 0.65,
      prizeTitle: 'Placa Ouro + R$ 750 Bônus + 0.65% Desconto em Vendas',
      badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-400',
      active: true
    },
    {
      id: 'tier_diamond',
      name: 'Black Diamond VIP',
      targetVolumeBrl: 250000,
      minTransactions: 500,
      cashbackPercent: 5.0,
      bonusFixedBrl: 2500,
      feeDiscountPercent: 1.00,
      prizeTitle: 'Kit VIP POS Android Smart + R$ 2.500 + 1.00% Desconto Transacional',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-400',
      active: true
    }
  ]);

  // Merchant & User Progress Tracking
  const [userProgressList, setUserProgressList] = useState<UserMilestoneProgress[]>([
    {
      id: 'usr_m01',
      userName: 'Maycon Quevedo (Neer Store Matriz)',
      userEmail: 'neersoftwarebr@gmail.com',
      userDocument: '44.920.182/0001-90',
      currentVolumeBrl: 64250.00,
      currentTransactions: 142,
      currentTierId: 'tier_silver',
      status: 'META_ATINGIDA',
      lastTransactionAt: 'Há 12 minutos',
      cashbackEarnedBrl: 1606.25 + 250,
      prizeWon: 'Troféu Destaque Silver + R$ 250 Bônus',
      feeDiscountApplied: 0.35
    },
    {
      id: 'usr_m02',
      userName: 'Nexus Digital Hub Eireli',
      userEmail: 'financeiro@nexusdigital.com.br',
      userDocument: '29.811.402/0001-33',
      currentVolumeBrl: 118400.00,
      currentTransactions: 289,
      currentTierId: 'tier_gold',
      status: 'PAGO',
      lastTransactionAt: 'Há 45 minutos',
      cashbackEarnedBrl: 4144.00 + 750,
      prizeWon: 'Placa Ouro + R$ 750 Bônus',
      feeDiscountApplied: 0.65,
      payoutDate: '2026-08-28T14:30:00Z'
    },
    {
      id: 'usr_m03',
      userName: 'Vanguard Varejo Brasil Ltda',
      userEmail: 'operacoes@vanguardvarejo.com.br',
      userDocument: '18.441.902/0001-11',
      currentVolumeBrl: 38900.00,
      currentTransactions: 78,
      currentTierId: 'tier_bronze',
      status: 'EM_PROGRESSO',
      lastTransactionAt: 'Há 2 horas',
      cashbackEarnedBrl: 389.00 + 50,
      prizeWon: 'Certificado de Início + R$ 50 Bônus',
      feeDiscountApplied: 0.15
    },
    {
      id: 'usr_m04',
      userName: 'Solaris Marketplace Tech',
      userEmail: 'admin@solaristech.io',
      userDocument: '35.109.812/0001-44',
      currentVolumeBrl: 268000.00,
      currentTransactions: 580,
      currentTierId: 'tier_diamond',
      status: 'META_ATINGIDA',
      lastTransactionAt: 'Há 10 minutos',
      cashbackEarnedBrl: 13400.00 + 2500,
      prizeWon: 'Kit VIP POS Android Smart + R$ 2.500',
      feeDiscountApplied: 1.00
    },
    {
      id: 'usr_m05',
      userName: 'TechFlow Soluções Web',
      userEmail: 'contato@techflow.net',
      userDocument: '50.118.239/0001-08',
      currentVolumeBrl: 8900.00,
      currentTransactions: 22,
      currentTierId: 'tier_bronze',
      status: 'EM_PROGRESSO',
      lastTransactionAt: 'Há 5 horas',
      cashbackEarnedBrl: 89.00,
      feeDiscountApplied: 0.10
    }
  ]);

  // Simulation controls
  const [simulationUserIndex, setSimulationUserIndex] = useState<number>(2);
  const [simulationAmountBrl, setSimulationAmountBrl] = useState<number>(15000);

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Statistics calculation
  const stats = useMemo(() => {
    const totalVolume = userProgressList.reduce((acc, u) => acc + u.currentVolumeBrl, 0);
    const totalCashback = userProgressList.reduce((acc, u) => acc + u.cashbackEarnedBrl, 0);
    const qualifiedCount = userProgressList.filter(u => u.status === 'META_ATINGIDA' || u.status === 'PAGO').length;
    const pendingPayout = userProgressList.filter(u => u.status === 'META_ATINGIDA').reduce((acc, u) => acc + u.cashbackEarnedBrl, 0);
    return { totalVolume, totalCashback, qualifiedCount, pendingPayout };
  }, [userProgressList]);

  // Save Admin Configuration
  const handleSaveMilestoneConfig = () => {
    setIsSavingConfig(true);
    setTimeout(() => {
      setIsSavingConfig(false);
      // Update Silver Tier with the main goal
      setTiers(prev => prev.map(t => t.id === 'tier_silver' ? {
        ...t,
        targetVolumeBrl: targetVolumeGoal,
        minTransactions: minTransactionsGoal,
        cashbackPercent: cashbackRatePercent,
        bonusFixedBrl: bonusFixedReward
      } : t));

      addToast(
        'Meta de Cashback Atualizada',
        `Nova meta de R$ ${targetVolumeGoal.toLocaleString('pt-BR')} com ${cashbackRatePercent}% de cashback salva com sucesso.`,
        'success'
      );
    }, 600);
  };

  // Credit Cashback 1-Click Action
  const handleCreditCashback = (userId: string) => {
    setUserProgressList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'PAGO',
          payoutDate: new Date().toISOString()
        };
      }
      return u;
    }));

    const targetUser = userProgressList.find(u => u.id === userId);
    addToast(
      'Cashback Creditado com Sucesso',
      `R$ ${(targetUser?.cashbackEarnedBrl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} creditados na conta de ${targetUser?.userName}.`,
      'success'
    );
  };

  // Run Simulation of Volume
  const handleRunSimulation = () => {
    setUserProgressList(prev => {
      const updated = [...prev];
      const target = { ...updated[simulationUserIndex] };
      target.currentVolumeBrl += simulationAmountBrl;
      target.currentTransactions += 1;
      target.lastTransactionAt = 'Agora mesmo (Simulação)';

      // Calculate Tier
      if (target.currentVolumeBrl >= 250000) {
        target.currentTierId = 'tier_diamond';
        target.cashbackEarnedBrl = (target.currentVolumeBrl * 0.05) + 2500;
        target.status = 'META_ATINGIDA';
      } else if (target.currentVolumeBrl >= targetVolumeGoal) {
        target.currentTierId = 'tier_silver';
        target.cashbackEarnedBrl = (target.currentVolumeBrl * (cashbackRatePercent / 100)) + bonusFixedReward;
        target.status = 'META_ATINGIDA';
      } else if (target.currentVolumeBrl >= 10000) {
        target.currentTierId = 'tier_bronze';
        target.cashbackEarnedBrl = (target.currentVolumeBrl * 0.01) + 50;
      }

      updated[simulationUserIndex] = target;
      return updated;
    });

    addToast(
      'Simulação de Transação Concluída',
      `Adicionado volume de R$ ${simulationAmountBrl.toLocaleString('pt-BR')} para ${userProgressList[simulationUserIndex].userName}. Status reavaliado.`,
      'info'
    );
  };

  // Export CSV Report
  const handleExportCashbackReport = () => {
    let csv = 'ID_Usuario,Nome_Estabelecimento,Email,CNPJ_CPF,Volume_Processado_BRL,Transacoes,Nivel_Tier,Status,Cashback_Total_BRL,Data_Liquidacao\n';
    userProgressList.forEach(u => {
      csv += `"${u.id}","${u.userName}","${u.userEmail}","${u.userDocument}",${u.currentVolumeBrl},${u.currentTransactions},"${u.currentTierId}","${u.status}",${u.cashbackEarnedBrl},"${u.payoutDate || 'Pendente'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nercash_cashback_milestone_report_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast('Relatório de Cashback Exportado', 'Planilha CSV gerada com sucesso.', 'success');
  };

  const filteredUsers = useMemo(() => {
    return userProgressList.filter(u => {
      const matchSearch = 
        u.userName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.userEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
        u.userDocument.includes(searchFilter);
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [userProgressList, searchFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in" id="cashback-milestone-module">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <Gift className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Módulo de Cashback & Metas de Volume (Admin Engine)
              </h1>
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Gamificação & Recompensas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure metas de faturamento, porcentagens de cashback progressivo e credite recompensas automáticas aos lojistas que baterem as metas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setModuleView('tiers_management')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                moduleView === 'tiers_management'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Gestão de Tiers & Metas</span>
            </button>
            <button
              type="button"
              onClick={() => setModuleView('merchant_progress')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                moduleView === 'merchant_progress'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Acompanhamento dos Lojistas</span>
            </button>
            <button
              type="button"
              onClick={() => setModuleView('reward_history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                moduleView === 'reward_history'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Histórico de Premiações</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCashbackReport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* RENDER CASHBACK MANAGEMENT MODULE */}
      {moduleView === 'tiers_management' && (
        <CashbackManagement />
      )}

      {/* RENDER MERCHANT PROGRESS & GAMIFICATION VIEW */}
      {moduleView === 'merchant_progress' && (
        <>
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Meta Padrão Ativa</span>
            <Target className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              R$ {targetVolumeGoal.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Taxa de retorno: <strong className="text-emerald-600 dark:text-emerald-400">{cashbackRatePercent}%</strong> + Bônus R$ {bonusFixedReward}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Volume Total dos Lojistas</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              R$ {stats.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Acumulado no ciclo atual ({cyclePeriod})</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cashback Total Gerado</span>
            <Gift className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              R$ {stats.totalCashback.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{stats.qualifiedCount} lojistas qualificados para prêmio</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pendente de Liquidação</span>
            <Zap className="h-4 w-4 text-violet-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400 font-mono">
              R$ {stats.pendingPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Pronto para liberação 1-clique</p>
        </div>
      </div>

      {/* Main Content Layout: Configuration (Left) + Merchant Progress (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Milestone Settings Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Parâmetros da Meta de Cashback (Admin)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                Rota Pronta
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Target Volume Goal Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Valor da Meta de Volume Faturado (R$)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">
                    R$ {targetVolumeGoal.toLocaleString('pt-BR')}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    value={targetVolumeGoal}
                    onChange={(e) => setTargetVolumeGoal(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 font-mono font-bold text-slate-900 focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Lojistas que atingirem esse faturamento receberão o cashback automaticamente.</p>
              </div>

              {/* Cashback Rate Percentage */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Percentual de Cashback da Meta (%)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">
                    {cashbackRatePercent}%
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="20"
                    value={cashbackRatePercent}
                    onChange={(e) => setCashbackRatePercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 font-mono font-bold text-slate-900 focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Bonus Fixed Reward */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Bônus Fixo Extra (R$)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={bonusFixedReward}
                    onChange={(e) => setBonusFixedReward(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold text-slate-900 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Mín. de Transações
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={minTransactionsGoal}
                    onChange={(e) => setMinTransactionsGoal(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold text-slate-900 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* Payout & Cycle Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Destino do Crédito
                  </label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="digital_account">Saldo Conta Digital</option>
                    <option value="pix_automatic">Transferência Pix</option>
                    <option value="mdr_discount">Desconto em Taxas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Ciclo da Meta
                  </label>
                  <select
                    value={cyclePeriod}
                    onChange={(e) => setCyclePeriod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="monthly">Mensal (30 dias)</option>
                    <option value="quarterly">Trimestral (90 dias)</option>
                    <option value="continuous">Contínuo (Acumulativo)</option>
                  </select>
                </div>
              </div>

              {/* Auto credit toggle */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white">Auto-Liquidação de Cashback</span>
                  <p className="text-[11px] text-slate-500">Creditar saldo imediatamente ao bater o volume sem exigir aprovação manual.</p>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoCreditEnabled}
                  onChange={(e) => setIsAutoCreditEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveMilestoneConfig}
                disabled={isSavingConfig}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                {isSavingConfig ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSavingConfig ? 'Gravando Parâmetros...' : 'Salvar & Ativar Nova Meta'}</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Sandbox */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Play className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Simulador de Atingimento de Meta
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Selecionar Lojista:</label>
                <select
                  value={simulationUserIndex}
                  onChange={(e) => setSimulationUserIndex(Number(e.target.value))}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 p-2 font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  {userProgressList.map((u, i) => (
                    <option key={u.id} value={i}>
                      {u.userName} (Atual: R$ {u.currentVolumeBrl.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 dark:text-slate-400">Valor da Nova Venda Simulada (R$):</label>
                <input
                  type="number"
                  step="1000"
                  value={simulationAmountBrl}
                  onChange={(e) => setSimulationAmountBrl(Number(e.target.value))}
                  className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 p-2 font-mono font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Processar Simulação & Testar Gatilho</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tier Cards & Merchant Progression Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Multi-Tier Gamification Badges */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Níveis de Metas & Escala de Recompensas
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Escalonamento Automático</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tiers.map(tier => (
                <div key={tier.id} className="rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold border ${tier.badgeColor}`}>
                      {tier.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {tier.cashbackPercent}% Cashback
                    </span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Meta de Volume:</span>
                      <strong className="font-mono text-slate-900 dark:text-white">R$ {tier.targetVolumeBrl.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Premiação / Bônus Fixo:</span>
                      <strong className="font-mono text-amber-600 dark:text-amber-400">R$ {tier.bonusFixedBrl.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Desconto no MDR das Transações:</span>
                      <strong className="font-mono text-indigo-600 dark:text-indigo-400">-{tier.feeDiscountPercent.toFixed(2)}% OFF</strong>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-2 text-[10px] text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium truncate">{tier.prizeTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merchants Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Acompanhamento de Metas dos Lojistas
                </h3>
                <p className="text-xs text-slate-500">Progresso individual em tempo real e liberação de saldo</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filtrar lojista..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="all">Todos os Status</option>
                  <option value="META_ATINGIDA">Meta Atingida</option>
                  <option value="EM_PROGRESSO">Em Progresso</option>
                  <option value="PAGO">Pago / Creditado</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map(user => {
                const percentReached = Math.min(100, Math.round((user.currentVolumeBrl / targetVolumeGoal) * 100));
                const isTargetAchieved = user.currentVolumeBrl >= targetVolumeGoal;

                return (
                  <div key={user.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {user.userName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {user.userDocument}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{user.userEmail} • {user.currentTransactions} transações</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          user.status === 'PAGO'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.status === 'META_ATINGIDA'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {user.status === 'PAGO' ? '✓ Recompensado' : user.status === 'META_ATINGIDA' ? '★ Meta Atingida!' : 'Em Progresso'}
                        </span>

                        {user.status === 'META_ATINGIDA' && (
                          <button
                            type="button"
                            onClick={() => handleCreditCashback(user.id)}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition-all cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            <span>Creditar (1-Click)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          Volume Atual: <strong className="text-slate-900 dark:text-white font-mono">R$ {user.currentVolumeBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {percentReached}% da Meta (R$ {targetVolumeGoal.toLocaleString('pt-BR')})
                        </span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTargetAchieved ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percentReached}%` }}
                        />
                      </div>
                    </div>

                    {/* Prize & Transaction Discount Achievement Badges */}
                    {(user.status === 'META_ATINGIDA' || user.status === 'PAGO') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-emerald-50/70 p-2.5 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                          <Gift className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>Premiação: <strong className="font-bold">{user.prizeWon || 'Bônus de Meta'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                          <Percent className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span>Desconto em Vendas: <strong className="font-bold">-{((user.feeDiscountApplied || 0.35)).toFixed(2)}% no MDR</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Cashback amount earned footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px]">
                      <span className="text-slate-500">
                        Última transação: {user.lastTransactionAt}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 dark:text-slate-400 font-semibold">Cashback Calculado:</span>
                        <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs">
                          R$ {user.cashbackEarnedBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* RENDER REWARD HISTORY AUDIT TAB */}
      {moduleView === 'reward_history' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Histórico de Premiações & Auditoria Financeira
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rastreamento completo de todos os descontos aplicados e prêmios emitidos, vinculando cada Reward ID diretamente ao ID da transação original.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por Reward ID ou Tx ID..."
                value={rewardSearchTerm}
                onChange={e => setRewardSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-4 py-3">Reward ID</th>
                  <th className="px-4 py-3">Transação Vinculada (Tx ID)</th>
                  <th className="px-4 py-3">Lojista / Estabelecimento</th>
                  <th className="px-4 py-3">Tier Atribuído</th>
                  <th className="px-4 py-3">Taxa / Desconto</th>
                  <th className="px-4 py-3">Valor Aplicado</th>
                  <th className="px-4 py-3">Data & Hora</th>
                  <th className="px-4 py-3">Audit Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rewardHistoryList
                  .filter(r => 
                    r.rewardId.toLowerCase().includes(rewardSearchTerm.toLowerCase()) ||
                    r.transactionId.toLowerCase().includes(rewardSearchTerm.toLowerCase()) ||
                    r.merchantName.toLowerCase().includes(rewardSearchTerm.toLowerCase())
                  )
                  .map(row => (
                    <tr key={row.rewardId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {row.rewardId}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] dark:bg-slate-800 dark:text-slate-300">
                          {row.transactionId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {row.merchantName}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {row.tierName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">
                        -{row.discountPercent}% MDR
                      </td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        R$ {row.discountAmountBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {row.timestamp}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                        {row.auditHash}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
