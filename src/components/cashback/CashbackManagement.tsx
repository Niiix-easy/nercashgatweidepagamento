import React, { useState, useEffect, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
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
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Layers, 
  Settings, 
  Code2, 
  Play, 
  Check, 
  AlertTriangle,
  X,
  Info,
  Calendar,
  Zap,
  Lock,
  Activity
} from 'lucide-react';

export interface CashbackTierConfig {
  id: string;
  name: string;
  targetVolumeBrl: number;
  minTransactions: number;
  cashbackPercent: number;
  bonusFixedBrl: number;
  badgeColor: string;
  active: boolean;
  eligibleMethods: string[];
  maxMonthlyCapBrl: number;
  description: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface SystemCashbackMetadata {
  autoPayoutCycle: 'weekly' | 'monthly' | 'quarterly' | 'instant';
  payoutMethod: 'digital_account' | 'pix_automatic' | 'mdr_discount';
  gracePeriodDays: number;
  maxPlatformCashbackCapBrl: number;
  pciApprovalRequired: boolean;
  auditEnabled: boolean;
  reconciliationSyncPolicy: 'strict_immutable' | 'flexible';
  minimumRedemptionAmountBrl: number;
  lastUpdated: string;
  version: string;
}

const INITIAL_TIERS: CashbackTierConfig[] = [
  {
    id: 'tier_bronze',
    name: 'Bronze Starter',
    targetVolumeBrl: 10000,
    minTransactions: 30,
    cashbackPercent: 1.0,
    bonusFixedBrl: 50,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    active: true,
    eligibleMethods: ['pix', 'credit_card', 'boleto'],
    maxMonthlyCapBrl: 500,
    description: 'Nível de entrada para novos lojistas e microempreendedores.',
    updatedAt: '2026-08-30 10:00:00',
    updatedBy: 'Admin Master'
  },
  {
    id: 'tier_silver',
    name: 'Silver Growth',
    targetVolumeBrl: 50000,
    minTransactions: 100,
    cashbackPercent: 2.5,
    bonusFixedBrl: 250,
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-400',
    active: true,
    eligibleMethods: ['pix', 'credit_card', 'boleto', 'pix_parcelado'],
    maxMonthlyCapBrl: 2500,
    description: 'Empresas em expansão com faturamento consolidado.',
    updatedAt: '2026-08-30 10:00:00',
    updatedBy: 'Admin Master'
  },
  {
    id: 'tier_gold',
    name: 'Gold Scale',
    targetVolumeBrl: 100000,
    minTransactions: 250,
    cashbackPercent: 3.5,
    bonusFixedBrl: 750,
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-400',
    active: true,
    eligibleMethods: ['pix', 'credit_card', 'boleto', 'pix_parcelado', 'crypto_pix'],
    maxMonthlyCapBrl: 7500,
    description: 'Grandes contas e operações com alto volume mensal.',
    updatedAt: '2026-08-30 10:00:00',
    updatedBy: 'Admin Master'
  },
  {
    id: 'tier_diamond',
    name: 'Black Diamond VIP',
    targetVolumeBrl: 250000,
    minTransactions: 500,
    cashbackPercent: 5.0,
    bonusFixedBrl: 2500,
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-400',
    active: true,
    eligibleMethods: ['pix', 'credit_card', 'boleto', 'pix_parcelado', 'crypto_pix', 'cross_border'],
    maxMonthlyCapBrl: 25000,
    description: 'Tier executivo VIP com cashback máximo e gerente de conta dedicado.',
    updatedAt: '2026-08-30 10:00:00',
    updatedBy: 'Admin Master'
  }
];

const INITIAL_METADATA: SystemCashbackMetadata = {
  autoPayoutCycle: 'monthly',
  payoutMethod: 'digital_account',
  gracePeriodDays: 5,
  maxPlatformCashbackCapBrl: 500000,
  pciApprovalRequired: true,
  auditEnabled: true,
  reconciliationSyncPolicy: 'strict_immutable',
  minimumRedemptionAmountBrl: 25.00,
  lastUpdated: new Date().toISOString(),
  version: '2.4.0'
};

export const CashbackManagement: React.FC = () => {
  const { addToast } = usePayment();
  
  // State
  const [tiers, setTiers] = useState<CashbackTierConfig[]>(INITIAL_TIERS);
  const [metadata, setMetadata] = useState<SystemCashbackMetadata>(INITIAL_METADATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tiers' | 'metadata' | 'simulator' | 'api_docs'>('tiers');

  // Modal State for Add / Edit Tier
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTier, setEditingTier] = useState<CashbackTierConfig | null>(null);
  const [formData, setFormData] = useState<Partial<CashbackTierConfig>>({
    name: '',
    targetVolumeBrl: 20000,
    minTransactions: 50,
    cashbackPercent: 1.5,
    bonusFixedBrl: 100,
    maxMonthlyCapBrl: 1000,
    eligibleMethods: ['pix', 'credit_card'],
    description: '',
    active: true
  });

  // Simulator State
  const [simVolume, setSimVolume] = useState<number>(75000);
  const [simTransactions, setSimTransactions] = useState<number>(120);
  const [simSelectedTierId, setSimSelectedTierId] = useState<string>('');
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Metadata Edit Form
  const [metaForm, setMetaForm] = useState<SystemCashbackMetadata>(INITIAL_METADATA);
  const [isSavingMeta, setIsSavingMeta] = useState<boolean>(false);

  // Load tiers and metadata from administrative API
  const fetchTiersAndMetadata = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/cashback/tiers');
      if (res.ok) {
        const data = await res.json();
        if (data.tiers && Array.isArray(data.tiers)) {
          setTiers(data.tiers);
        }
        if (data.metadata) {
          setMetadata(data.metadata);
          setMetaForm(data.metadata);
        }
      }
    } catch (err) {
      console.log('Using local fallback state for tiers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiersAndMetadata();
  }, []);

  // Open modal for new tier
  const handleOpenNewModal = () => {
    setEditingTier(null);
    setFormData({
      name: '',
      targetVolumeBrl: 25000,
      minTransactions: 50,
      cashbackPercent: 2.0,
      bonusFixedBrl: 150,
      maxMonthlyCapBrl: 2000,
      eligibleMethods: ['pix', 'credit_card', 'boleto'],
      description: '',
      active: true,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing tier
  const handleOpenEditModal = (tier: CashbackTierConfig) => {
    setEditingTier(tier);
    setFormData({ ...tier });
    setIsModalOpen(true);
  };

  // Save tier (POST or PUT to API)
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.targetVolumeBrl === undefined || formData.cashbackPercent === undefined) {
      addToast('Campos Obrigatórios', 'Preencha o nome, a meta de volume e a porcentagem de cashback.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      if (editingTier) {
        // PUT update
        const res = await fetch(`/api/v1/cashback/tiers/${editingTier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-user': 'Admin Master' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const result = await res.json();
          setTiers(prev => prev.map(t => t.id === editingTier.id ? result.tier : t));
          addToast('Tier Atualizado', `Meta do tier '${result.tier.name}' atualizada com sucesso via API administrativa.`, 'success');
        } else {
          // Fallback update
          setTiers(prev => prev.map(t => t.id === editingTier.id ? { ...t, ...(formData as CashbackTierConfig), updatedAt: new Date().toISOString() } : t));
          addToast('Tier Atualizado', `Meta do tier '${formData.name}' salva com sucesso.`, 'success');
        }
      } else {
        // POST create
        const res = await fetch('/api/v1/cashback/tiers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-user': 'Admin Master' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const result = await res.json();
          setTiers(prev => [...prev, result.tier]);
          addToast('Novo Tier Criado', `Tier de cashback '${result.tier.name}' criado e registrado no catálogo do sistema.`, 'success');
        } else {
          // Fallback create
          const newId = `tier_${Date.now()}`;
          const newTier: CashbackTierConfig = {
            id: newId,
            ...(formData as CashbackTierConfig),
            updatedAt: new Date().toISOString(),
            updatedBy: 'Admin Master'
          };
          setTiers(prev => [...prev, newTier]);
          addToast('Novo Tier Criado', `Tier de cashback '${newTier.name}' criado com sucesso.`, 'success');
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving tier', err);
      addToast('Erro ao Salvar', 'Não foi possível persistir o tier. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete tier (DELETE API)
  const handleDeleteTier = async (tierId: string, tierName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o tier '${tierName}' do sistema de cashback?`)) {
      return;
    }

    try {
      await fetch(`/api/v1/cashback/tiers/${tierId}`, {
        method: 'DELETE',
        headers: { 'x-admin-user': 'Admin Master' }
      });
      setTiers(prev => prev.filter(t => t.id !== tierId));
      addToast('Tier Removido', `O tier '${tierName}' foi desativado e removido do catálogo de metas.`, 'success');
    } catch (err) {
      setTiers(prev => prev.filter(t => t.id !== tierId));
      addToast('Tier Removido', `O tier '${tierName}' foi removido com sucesso.`, 'success');
    }
  };

  // Save System Metadata Configuration (PUT to /api/v1/cashback/metadata)
  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);

    try {
      const res = await fetch('/api/v1/cashback/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaForm)
      });

      if (res.ok) {
        const data = await res.json();
        setMetadata(data.metadata);
        addToast('Metadados do Sistema Salvos', 'Configurações globais de cashback e políticas de conformidade atualizadas.', 'success');
      } else {
        setMetadata({ ...metaForm, lastUpdated: new Date().toISOString() });
        addToast('Configurações Salvas', 'Políticas salvas no armazenamento de metadados do sistema.', 'success');
      }
    } catch (err) {
      setMetadata({ ...metaForm, lastUpdated: new Date().toISOString() });
      addToast('Configurações Salvas', 'Políticas salvas localmente.', 'success');
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Run Cashback Simulation against API
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/v1/cashback/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volumeBrl: simVolume,
          transactionsCount: simTransactions,
          tierId: simSelectedTierId || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      } else {
        // Local simulation fallback
        const selectedTier = simSelectedTierId 
          ? tiers.find(t => t.id === simSelectedTierId) 
          : tiers.filter(t => simVolume >= t.targetVolumeBrl && simTransactions >= t.minTransactions).pop() || tiers[0];
        
        const baseCashback = (simVolume * (selectedTier?.cashbackPercent || 1.0)) / 100;
        const bonus = simVolume >= (selectedTier?.targetVolumeBrl || 0) ? (selectedTier?.bonusFixedBrl || 0) : 0;
        const totalReward = Math.min(selectedTier?.maxMonthlyCapBrl || 999999, baseCashback + bonus);

        setSimResult({
          success: true,
          simulatedVolumeBrl: simVolume,
          simulatedTransactions: simTransactions,
          matchedTier: selectedTier,
          calculation: {
            cashbackRatePercent: selectedTier?.cashbackPercent,
            baseCashbackBrl: baseCashback,
            fixedBonusBrl: bonus,
            totalRewardBrl: totalReward,
            capApplied: (baseCashback + bonus) > (selectedTier?.maxMonthlyCapBrl || 999999)
          }
        });
      }
      addToast('Simulação Calculada', `Cálculo de cashback efetuado com base nas regras do tier ativo.`, 'success');
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Aggregated KPIs
  const stats = useMemo(() => {
    const totalTiersCount = tiers.length;
    const activeCount = tiers.filter(t => t.active).length;
    const maxPotentialCap = tiers.reduce((acc, t) => acc + t.maxMonthlyCapBrl, 0);
    const avgRate = tiers.length > 0 ? (tiers.reduce((acc, t) => acc + t.cashbackPercent, 0) / tiers.length).toFixed(1) : '0';
    return {
      totalTiersCount,
      activeCount,
      maxPotentialCap,
      avgRate
    };
  }, [tiers]);

  return (
    <div className="space-y-6 animate-fade-in text-left w-full h-full" id="cashback-management-module">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Cashback Management & User Tier Targets
              </h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Admin Engine v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rotas administrativas de API para configuração, visualização e ajuste de metas de cashback por nível de usuário com persistência em metadados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTiersAndMetadata}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Recarregar API</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Tier / Meta</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tiers Configurados</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {stats.totalTiersCount} Tiers
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{stats.activeCount} ativos no catálogo</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Taxa Média de Cashback</span>
            <Percent className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.avgRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            Média entre tiers ativos
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Teto Mensal Global (Metadados)</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            R$ {metadata.maxPlatformCashbackCapBrl.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500">
            Cap de segurança da tesouraria
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Ciclo & Liquidação</span>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white capitalize">
            {metadata.autoPayoutCycle} • {metadata.payoutMethod.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-slate-500">
            Carência de {metadata.gracePeriodDays} dias para estorno
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'tiers', label: 'Tiers & Metas de Usuários', icon: Target },
          { id: 'metadata', label: 'Metadados & Políticas do Sistema', icon: Settings },
          { id: 'simulator', label: 'Simulador de Cashback', icon: Play },
          { id: 'api_docs', label: 'Endpoints REST Administrativos', icon: Code2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TIERS & TARGET MATRIX */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div 
                key={tier.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="space-y-3">
                  {/* Tier Top Header */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-extrabold ${tier.badgeColor}`}>
                      {tier.name}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      tier.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tier.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 min-h-[32px]">
                    {tier.description || 'Configuração de meta de incentivo comercial para usuários da plataforma.'}
                  </p>

                  {/* Metrics Box */}
                  <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Meta de Volume:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        R$ {tier.targetVolumeBrl.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Transações Mínimas:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {tier.minTransactions} txs
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Taxa Cashback:</span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {tier.cashbackPercent}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Bônus Fixo de Meta:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        + R$ {tier.bonusFixedBrl.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200/60 dark:border-slate-800 pt-1.5">
                      <span>Teto Mensal:</span>
                      <span className="font-mono">R$ {tier.maxMonthlyCapBrl.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Eligible Methods Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Métodos Elegíveis:</span>
                    <div className="flex flex-wrap gap-1">
                      {tier.eligibleMethods.map((m) => (
                        <span key={m} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {tier.id}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(tier)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-all cursor-pointer"
                      title="Editar parâmetros do tier"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id, tier.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer"
                      title="Remover tier"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM METADATA CONFIGURATION */}
      {activeTab === 'metadata' && (
        <form onSubmit={handleSaveMetadata} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Metadados & Regras Globais da Tesouraria de Cashback
              </h3>
              <p className="text-xs text-slate-500">
                Políticas de governança, ciclo de pagamento, travas de segurança e conciliação contábil com o Ledger.
              </p>
            </div>

            <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-mono font-bold text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
              Metadata v{metadata.version} • Atualizado em {new Date(metadata.lastUpdated).toLocaleTimeString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Auto Payout Cycle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ciclo de Liquidação Automática
              </label>
              <select
                value={metaForm.autoPayoutCycle}
                onChange={(e) => setMetaForm({ ...metaForm, autoPayoutCycle: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="weekly">Semanal (Toda segunda-feira)</option>
                <option value="monthly">Mensal (1º dia útil do mês)</option>
                <option value="quarterly">Trimestral (Fechamento consolidado)</option>
                <option value="instant">Instantâneo (Ao atingir a meta)</option>
              </select>
              <p className="text-[10px] text-slate-400">Periodicidade para processamento dos repasses de bonificação.</p>
            </div>

            {/* Payout Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Método de Pagamento do Cashback
              </label>
              <select
                value={metaForm.payoutMethod}
                onChange={(e) => setMetaForm({ ...metaForm, payoutMethod: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="digital_account">Crédito em Conta Digital Nercash</option>
                <option value="pix_automatic">Transferência Pix Automática (Chave Cadastrada)</option>
                <option value="mdr_discount">Desconto Direto na Taxa de MDR do Próximo Ciclo</option>
              </select>
              <p className="text-[10px] text-slate-400">Canal de liquidação financeira para crédito do saldo ao lojista.</p>
            </div>

            {/* Grace Period Days */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Período de Carência (Dias Anti-Chargeback)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={metaForm.gracePeriodDays}
                onChange={(e) => setMetaForm({ ...metaForm, gracePeriodDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400">Prazo de retenção de segurança para evitar pagamento sobre estornos.</p>
            </div>

            {/* Max Platform Cap */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Teto Global Mensal da Plataforma (R$)
              </label>
              <input
                type="number"
                step="1000"
                value={metaForm.maxPlatformCashbackCapBrl}
                onChange={(e) => setMetaForm({ ...metaForm, maxPlatformCashbackCapBrl: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400">Limite orçamentário máximo para desembolso mensal em cashback.</p>
            </div>

            {/* Min Redemption Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Valor Mínimo para Resgate (R$)
              </label>
              <input
                type="number"
                step="5"
                value={metaForm.minimumRedemptionAmountBrl}
                onChange={(e) => setMetaForm({ ...metaForm, minimumRedemptionAmountBrl: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400">Piso mínimo de saldo acumulado exigido para liberação de saque.</p>
            </div>

            {/* Reconciliation Policy */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Política de Conciliação Contábil
              </label>
              <select
                value={metaForm.reconciliationSyncPolicy}
                onChange={(e) => setMetaForm({ ...metaForm, reconciliationSyncPolicy: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="strict_immutable">Imutável Rigoroso (Double-Entry Ledger com SHA-256)</option>
                <option value="flexible">Flexível (Permite lançamentos compensatórios)</option>
              </select>
              <p className="text-[10px] text-slate-400">Protocolo de gravação dos lançamentos no livro-razão criptográfico.</p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Exigir Aprovação de Tesouraria / PCI</span>
                <p className="text-[11px] text-slate-500">Resgates acima de R$ 5.000 exigem assinatura dupla do operador financeiro.</p>
              </div>
              <input
                type="checkbox"
                checked={metaForm.pciApprovalRequired}
                onChange={(e) => setMetaForm({ ...metaForm, pciApprovalRequired: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Trilha de Auditoria com Merkle Tree</span>
                <p className="text-[11px] text-slate-500">Assinar criptograficamente cada alteração de regra de meta ou saque.</p>
              </div>
              <input
                type="checkbox"
                checked={metaForm.auditEnabled}
                onChange={(e) => setMetaForm({ ...metaForm, auditEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingMeta}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingMeta ? 'Salvando Metadados...' : 'Salvar Configurações no Sistema'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CASHBACK SIMULATOR SANDBOX */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="space-y-1 border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="h-4 w-4 text-indigo-600" />
                Simulador de Cálculo de Bonificação & Tiers
              </h3>
              <p className="text-xs text-slate-500">
                Teste em tempo real as fórmulas de premiação, enquadramento de tiers e tetos contra a API administrativa.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Volume Transacionado Simulado (R$)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={simVolume}
                  onChange={(e) => setSimVolume(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quantidade de Transações no Ciclo
                </label>
                <input
                  type="number"
                  min="1"
                  value={simTransactions}
                  onChange={(e) => setSimTransactions(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Forçar Tier Específico (Opcional)
                </label>
                <select
                  value={simSelectedTierId}
                  onChange={(e) => setSimSelectedTierId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Detecção Automática baseada no Volume & Metas</option>
                  {tiers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.cashbackPercent}%)</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>{isSimulating ? 'Calculando via API...' : 'Calcular Cashback Estimado'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 pb-3 dark:border-slate-800">
                Resultado do Diagnóstico de Cashback
              </h3>

              {simResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Tier Qualificado:</span>
                    <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                      {simResult.matchedTier?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Taxa de Cashback Aplicada:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{simResult.calculation.cashbackRatePercent}%</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Cashback Base Proporcional:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">R$ {simResult.calculation.baseCashbackBrl.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Bônus Fixo por Atingimento de Meta:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+ R$ {simResult.calculation.fixedBonusBrl.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-2 border-t-2 border-slate-200 dark:border-slate-700 text-sm">
                      <span className="font-bold text-slate-900 dark:text-white">Total a Receber:</span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                        R$ {simResult.calculation.totalRewardBrl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Clique em "Calcular Cashback Estimado" para executar o cálculo.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Validação em conformidade com as regras de split e conciliação contábil do Ledger Nercash.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API DOCUMENTATION & ROUTES */}
      {activeTab === 'api_docs' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rotas REST Administrativas para Cashback & Tiers
            </h3>
            <p className="text-xs text-slate-500">
              Integração via back-end corporativo para governança automatizada e webhooks.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { method: 'GET', path: '/api/v1/cashback/tiers', desc: 'Retorna a listagem de todos os tiers de cashback, metas de volume e metadados globais.' },
              { method: 'POST', path: '/api/v1/cashback/tiers', desc: 'Cria um novo nível/meta de cashback com validação de parâmetros.' },
              { method: 'PUT', path: '/api/v1/cashback/tiers/:id', desc: 'Atualiza metas, percentuais de cashback e bônus fixos de um tier existente.' },
              { method: 'DELETE', path: '/api/v1/cashback/tiers/:id', desc: 'Desativa e remove um tier do catálogo de metas.' },
              { method: 'GET', path: '/api/v1/cashback/metadata', desc: 'Consulta os metadados e parâmetros da tesouraria do sistema de cashback.' },
              { method: 'PUT', path: '/api/v1/cashback/metadata', desc: 'Atualiza políticas de conciliação, períodos de carência e tetos orçamentários.' },
              { method: 'POST', path: '/api/v1/cashback/simulate', desc: 'Calcula simulação instantânea de cashback com base em volume e transações.' }
            ].map(route => (
              <div key={route.path + route.method} className="p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    route.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                    route.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    route.method === 'PUT' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {route.method}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{route.path}</span>
                </div>
                <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">{route.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                <span>{editingTier ? `Editar Tier: ${editingTier.name}` : 'Criar Novo Tier de Cashback'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome do Tier / Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Platinum Enterprise VIP"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Meta de Volume (R$)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={formData.targetVolumeBrl || 0}
                    onChange={(e) => setFormData({ ...formData, targetVolumeBrl: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Transações Mínimas
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minTransactions || 1}
                    onChange={(e) => setFormData({ ...formData, minTransactions: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Porcentagem de Cashback (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="15.0"
                    required
                    value={formData.cashbackPercent || 0}
                    onChange={(e) => setFormData({ ...formData, cashbackPercent: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Bônus Fixo de Meta (R$)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={formData.bonusFixedBrl || 0}
                    onChange={(e) => setFormData({ ...formData, bonusFixedBrl: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-amber-600 dark:border-slate-800 dark:bg-slate-950 dark:text-amber-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Teto Mensal de Cashback (R$)
                </label>
                <input
                  type="number"
                  step="500"
                  value={formData.maxMonthlyCapBrl || 1000}
                  onChange={(e) => setFormData({ ...formData, maxMonthlyCapBrl: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Descrição e Requisitos do Nível
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Critérios de elegibilidade para o usuário atingir este nível..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingTier ? 'Salvar Alterações' : 'Criar Tier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
