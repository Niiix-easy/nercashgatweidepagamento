import React, { useState } from 'react';
import { 
  BrainCircuit, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  RotateCcw, 
  SplitSquareHorizontal, 
  CalendarDays, 
  Zap, 
  CheckCircle2, 
  Landmark, 
  BookOpen, 
  BarChart3,
  Activity,
  Cpu
} from 'lucide-react';

import { FraudAnalyticsView } from './FraudAnalyticsView';
import { PixAutomaticoPanel } from './PixAutomaticoPanel';
import { SettlementLedgerModule } from './SettlementLedgerModule';
import { ThreeDSAuthDashboard } from './ThreeDSAuthDashboard';
import { ChargebackManagement } from './ChargebackManagement';
import { UptimeAlertingPanel } from './UptimeAlertingPanel';
import { PixIntelligenceDashboard } from './PixIntelligenceDashboard';
import { FraudRuleEngine } from './FraudRuleEngine';
import { AnomalyDetectorService } from '../dashboard/AnomalyDetectorService';

export const IntelligenceHub: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('smart_routing');

  const intelligenceModules = [
    { id: 'smart_routing', name: 'Smart Routing', icon: BrainCircuit, status: 'active', desc: 'Roteamento dinâmico entre adquirentes baseado em latência e taxa de aprovação.' },
    { id: 'retry', name: 'Retry', icon: RefreshCw, status: 'active', desc: 'Tentativas automáticas em diferentes gateways em caso de falha transitória.' },
    { id: 'failover', name: 'Failover', icon: ShieldAlert, status: 'active', desc: 'Alternância imediata para provedores de backup caso o principal caia.' },
    { id: 'fraud_score', name: 'Fraud Score', icon: ShieldCheck, status: 'active', desc: 'Motor XGBoost de análise de risco e prevenção à fraude em tempo real.' },
    { id: 'fraud_rules', name: 'Fraud Rules', icon: ShieldAlert, status: 'active', desc: 'Motor de regras low-code para critérios de bloqueio e revisão.' },
    { id: '3ds', name: '3DS', icon: CreditCard, status: 'configuring', desc: 'Autenticação 3D Secure 2.0 nativa e transparente para conversão máxima.' },
    { id: 'token_vault', name: 'Token Vault', icon: Lock, status: 'active', desc: 'Cofre PCI-DSS Level 1 para armazenamento seguro de cartões.' },
    { id: 'chargeback', name: 'Chargeback', icon: RotateCcw, status: 'active', desc: 'Defesa e gestão automatizada de disputas e chargebacks.' },
    { id: 'split', name: 'Split', icon: SplitSquareHorizontal, status: 'active', desc: 'Divisão de recebíveis complexa (marketplace, comissões) na fonte.' },
    { id: 'subscription', name: 'Subscription', icon: CalendarDays, status: 'active', desc: 'Motor de recorrência, dunning e gestão de planos.' },
    { id: 'pix_auto', name: 'Pix Automático', icon: Zap, status: 'beta', desc: 'Débito automático via PIX com autorização prévia (SPI).' },
    { id: 'pix_intelligence', name: 'Pix Intelligence', icon: Zap, status: 'active', desc: 'Monitoramento preditivo e estatísticas de latência de pagamentos PIX.' },
    { id: 'reconciliation', name: 'Reconciliation', icon: CheckCircle2, status: 'active', desc: 'Conciliação bancária e de cartões automatizada (TEF/EDI).' },
    { id: 'settlement', name: 'Settlement', icon: Landmark, status: 'active', desc: 'Gestão de liquidações, antecipação de recebíveis e repasses.' },
    { id: 'ledger', name: 'Ledger', icon: BookOpen, status: 'active', desc: 'Livro-razão imutável em tempo real para controle contábil.' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, status: 'active', desc: 'BI em tempo real com forecast preditivo de caixa.' },
    { id: 'uptime_alerting', name: 'Uptime Alerting', icon: Activity, status: 'active', desc: 'Alertas de SLA e monitoramento de uptime.' },
  ];

  const selectedMod = intelligenceModules.find(m => m.id === activeModule) || intelligenceModules[0];
  const ModIcon = selectedMod.icon;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <AnomalyDetectorService />
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg">
          <Cpu className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">NerCash Intelligence</h2>
          <p className="text-sm text-slate-500">Suite de módulos avançados para orquestração, conversão e backoffice financeiro</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 border-r border-slate-200 pr-4 dark:border-slate-800 space-y-1 h-[600px] overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Módulos</p>
          {intelligenceModules.map(mod => {
            const Icon = mod.icon;
            const isSelected = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  {mod.name}
                </div>
                {mod.status === 'beta' && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm">BETA</span>}
                {mod.status === 'configuring' && <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-sm">SETUP</span>}
              </button>
            )
          })}
        </div>

        <div className="md:col-span-3 h-[600px] overflow-y-auto">
          {activeModule === 'fraud_score' ? (
            <FraudAnalyticsView />
          ) : activeModule === 'fraud_rules' ? (
            <FraudRuleEngine />
          ) : activeModule === '3ds' ? (
            <ThreeDSAuthDashboard />
          ) : activeModule === 'chargeback' ? (
            <ChargebackManagement />
          ) : activeModule === 'pix_auto' ? (
            <PixAutomaticoPanel />
          ) : activeModule === 'pix_intelligence' ? (
            <PixIntelligenceDashboard />
          ) : activeModule === 'settlement' || activeModule === 'ledger' ? (
            <SettlementLedgerModule />
          ) : activeModule === 'uptime_alerting' ? (
            <UptimeAlertingPanel />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 h-full shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] z-0 opacity-50"></div>
              
              <div className="z-10 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl max-w-lg w-full flex flex-col items-center">
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                  <ModIcon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedMod.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-4 leading-relaxed">{selectedMod.desc}</p>
                
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Status do Módulo</span>
                    {selectedMod.status === 'active' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><Activity className="h-3 w-3" /> Operacional</span>}
                    {selectedMod.status === 'beta' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><Activity className="h-3 w-3" /> Early Access</span>}
                    {selectedMod.status === 'configuring' && <span className="flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-full"><Activity className="h-3 w-3" /> Configuração Pendente</span>}
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      selectedMod.status === 'active' ? 'w-full bg-emerald-500' : 
                      selectedMod.status === 'beta' ? 'w-2/3 bg-amber-500 animate-pulse' : 
                      'w-1/3 bg-sky-500 animate-pulse'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
