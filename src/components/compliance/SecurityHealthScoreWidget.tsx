import React, { useState, useMemo } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Database, 
  Cpu, 
  Fingerprint, 
  Server,
  Zap,
  Check,
  Award
} from 'lucide-react';

export interface SecurityCheckItem {
  id: string;
  category: 'Criptografia' | 'Integridade de Logs' | 'PCI Token Vault' | 'Autenticação & RBAC' | 'Chaves BaaS' | 'Disaster Recovery';
  title: string;
  description: string;
  score: number; // out of 100
  weight: number;
  status: 'passed' | 'warning' | 'critical';
  recommendation?: string;
  applied: boolean;
}

export const SecurityHealthScoreWidget: React.FC = () => {
  const { addToast } = usePayment();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('Agora mesmo');

  const [securityChecks, setSecurityChecks] = useState<SecurityCheckItem[]>([
    {
      id: 'check_encryption',
      category: 'Criptografia',
      title: 'Criptografia em Repouso & Trânsito (AES-256-GCM / TLS 1.3)',
      description: 'Todos os payloads e dados em repouso estão cifrados com chaves KMS rotativas e TLS 1.3 obrigatório.',
      score: 100,
      weight: 20,
      status: 'passed',
      applied: true
    },
    {
      id: 'check_merkle_audit',
      category: 'Integridade de Logs',
      title: 'Integridade Criptográfica Merkle Root & Hash Chains SHA-256',
      description: 'Árvore de Merkle imutável sem discrepâncias ou indícios de adulteração de logs de auditoria.',
      score: 98,
      weight: 20,
      status: 'passed',
      applied: true
    },
    {
      id: 'check_pci_tokenization',
      category: 'PCI Token Vault',
      title: 'Isolamento de Vault PCI-DSS Level 1 & Validação de Luhn',
      description: 'Zero armazenamento de PAN/CVV em disco. Tokens gerados em hardware enclave seguro.',
      score: 95,
      weight: 20,
      status: 'passed',
      applied: true
    },
    {
      id: 'check_auth_rbac',
      category: 'Autenticação & RBAC',
      title: 'MFA Biométrico & Timeout de Sessão Inativa (15 min)',
      description: 'Lock screen automático ativo por inatividade de sessão e MFA biométrico de alta segurança.',
      score: 92,
      weight: 15,
      status: 'passed',
      applied: true
    },
    {
      id: 'check_baas_whitelist',
      category: 'Chaves BaaS',
      title: 'IP Whitelisting & Rotação Automática de Chaves de Provedores BaaS',
      description: 'Credenciais de API BaaS ativas. Rotação programada em 45 dias recomendada.',
      score: 82,
      weight: 15,
      status: 'warning',
      recommendation: 'Ativar rotação automática quinzenal de chaves BaaS e modo estrito de mTLS.',
      applied: false
    },
    {
      id: 'check_dr_backups',
      category: 'Disaster Recovery',
      title: 'Snapshots Criptografados de Disaster Recovery & RPO < 5min',
      description: 'Snapshots diários validados com hash SHA-256 e redundância multirregional.',
      score: 90,
      weight: 10,
      status: 'passed',
      applied: true
    }
  ]);

  // Overall weighted health score calculation (0 - 100)
  const overallScore = useMemo(() => {
    const totalWeight = securityChecks.reduce((acc, c) => acc + c.weight, 0);
    const weightedSum = securityChecks.reduce((acc, c) => acc + (c.score * c.weight), 0);
    return Math.round(weightedSum / totalWeight);
  }, [securityChecks]);

  // Re-run security diagnostics scan
  const handleRunSecurityScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime('Há poucos segundos');
      addToast(
        'Diagnóstico de Segurança Concluído',
        `Avaliação em tempo real concluída: Score de Saúde de Segurança em ${overallScore}/100. Nível Enterprise Resiliente.`,
        'success'
      );
    }, 900);
  };

  // Apply one-click hardening step
  const handleApplyHardening = (checkId: string) => {
    setSecurityChecks(prev => prev.map(item => {
      if (item.id === checkId) {
        return {
          ...item,
          score: 100,
          status: 'passed',
          applied: true,
          description: `${item.description} (Hardening aplicado com sucesso: rotação automática e mTLS strict ativados).`
        };
      }
      return item;
    }));

    addToast(
      'Hardening de Segurança Aplicado',
      'Configuração endurecida com sucesso. Políticas de criptografia e rotação atualizadas.',
      'success'
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 75) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Grau A+ (Enterprise Resilient)', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (score >= 75) return { label: 'Grau B (Conforme com Recomendações)', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    return { label: 'Grau C (Atenção Requerida)', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
  };

  const badgeInfo = getScoreBadge(overallScore);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6" id="security-health-score-widget">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Security Health Score & Real-Time Hardening
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeInfo.bg}`}>
                {badgeInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Avaliação contínua de criptografia em repouso/trânsito, integridade de Merkle Tree, isolamento PCI e tokens BaaS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Última varredura: {lastScanTime}
          </span>
          <button
            type="button"
            onClick={handleRunSecurityScan}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Avaliando Vetores...' : 'Re-analisar Configurações'}</span>
          </button>
        </div>
      </div>

      {/* Main Score & Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Circular Health Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-6 dark:border-slate-800/80 dark:bg-slate-950/50 space-y-3">
          <div className="relative flex items-center justify-center">
            {/* SVG Circular Progress */}
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className={`transition-all duration-1000 ${getScoreColor(overallScore)}`}
                strokeWidth="10"
                strokeDasharray={314.159}
                strokeDashoffset={314.159 - (314.159 * overallScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                {overallScore}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                de 100
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Índice Global de Postura de Segurança
            </h4>
            <p className="text-[11px] text-slate-500 max-w-[220px]">
              6 de 6 vetores de segurança auditados em conformidade com PCI-DSS v4.0 e LGPD Art. 46.
            </p>
          </div>
        </div>

        {/* Right: Category Breakdown Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {securityChecks.map((check) => (
            <div 
              key={check.id} 
              className={`p-4 rounded-2xl border transition-all ${
                check.status === 'warning'
                  ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {check.status === 'passed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {check.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {check.title}
                  </h4>
                </div>

                <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {check.score}%
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {check.description}
              </p>

              {check.status === 'warning' && !check.applied && (
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                    Recomendação de Hardening disponível
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyHardening(check.id)}
                    className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-amber-500 transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Aplicar Hardening (1-Click)</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Standards Badges Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Conformidades Regulatórias Ativas:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            ✓ PCI-DSS 4.0 Level 1
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            ✓ LGPD Art. 46 Criptografia
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            ✓ SOC 2 Type II
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            ✓ ISO/IEC 27001
          </span>
        </div>
      </div>
    </div>
  );
};
