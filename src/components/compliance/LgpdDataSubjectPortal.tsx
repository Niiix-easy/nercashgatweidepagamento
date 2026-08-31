import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayment } from '../../context/PaymentContext';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Mail, 
  Building2, 
  Phone, 
  Key, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Award,
  Globe,
  Database,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  maskCpf, 
  maskEmail, 
  maskPhone, 
  maskName, 
  getLgpdConsent, 
  saveLgpdConsent, 
  LgpdConsentSettings,
  lgpdAnonymize 
} from '../../utils/lgpdUtils';

export interface LgpdDataSubjectPortalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LgpdDataSubjectPortal: React.FC<LgpdDataSubjectPortalProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}) => {
  const { addToast } = usePayment();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
  };

  const [activeSubTab, setActiveSubTab] = useState<'rights' | 'export' | 'anonymize' | 'consents' | 'dpo_contact'>('rights');
  const [isMasked, setIsMasked] = useState(true);
  const [consent, setConsent] = useState<LgpdConsentSettings>(getLgpdConsent());
  const [isExporting, setIsExporting] = useState(false);
  const [isAnonymizing, setIsAnonymizing] = useState(false);
  const [anonymizedSuccess, setAnonymizedSuccess] = useState(false);

  // Mock User Data stored in system
  const [userData, setUserData] = useState({
    name: 'Maycon Quevedo',
    cpf: '12345678901',
    email: 'maycon.quevedo@empresa.com.br',
    phone: '11987654321',
    company: 'Quevedo Pagamentos LTDA',
    cnpj: '12345678000195',
    registeredAt: '2026-01-15T10:30:00Z',
    ipAddress: '177.136.254.12',
    transactionsCount: 148,
    consentHistory: [
      { action: 'Aceite do Banner Inicial LGPD', date: '2026-01-15 10:30', ip: '177.136.254.12' },
      { action: 'Opt-in Notificações WhatsApp', date: '2026-02-01 14:12', ip: '177.136.254.12' },
      { action: 'Autorização de Compartilhamento BaaS', date: '2026-03-10 09:45', ip: '177.136.254.12' }
    ]
  });

  // Listen for global open event
  useEffect(() => {
    const handleOpenPortal = () => {
      setInternalIsOpen(true);
    };
    window.addEventListener('nercash:open-lgpd-portal', handleOpenPortal);
    return () => window.removeEventListener('nercash:open-lgpd-portal', handleOpenPortal);
  }, []);

  // Export Data Report (Portabilidade LGPD Art. 18 V)
  const handleExportDataReport = (format: 'json' | 'csv') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const timestamp = new Date().toISOString();
      const reportPayload = {
        lgpdStandard: 'Lei nº 13.709/2018 (LGPD) - Artigo 18',
        reportType: 'Portabilidade e Transparência dos Dados do Titular',
        generatedAt: timestamp,
        dpoVerificationHash: 'sha256-lgpd-98402a7b1c3d4e5f',
        dataSubject: {
          name: userData.name,
          cpf: userData.cpf,
          email: userData.email,
          phone: userData.phone,
          company: userData.company,
          cnpj: userData.cnpj,
          createdAt: userData.registeredAt,
          lastAccessIp: userData.ipAddress
        },
        consents: consent,
        consentHistory: userData.consentHistory
      };

      let blob: Blob;
      let filename = `relatorio_portabilidade_lgpd_${Date.now()}`;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: 'application/json' });
        filename += '.json';
      } else {
        const csvContent = [
          'CAMPO,VALOR',
          `Titular,${userData.name}`,
          `CPF,${userData.cpf}`,
          `E-mail,${userData.email}`,
          `Telefone,${userData.phone}`,
          `Empresa,${userData.company}`,
          `CNPJ,${userData.cnpj}`,
          `Data Cadastro,${userData.registeredAt}`,
          `IP Registrado,${userData.ipAddress}`,
          `Sessões e Conselhos,${consent.analytics ? 'SIM' : 'NÃO'}`
        ].join('\n');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename += '.csv';
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast('Portabilidade LGPD', `Relatório impresso com sucesso no formato ${format.toUpperCase()}.`, 'success');
    }, 800);
  };

  // Request Anonymization / Right to Erasure (LGPD Art. 18 IV)
  const handleRequestAnonymization = () => {
    if (!window.confirm('TEM CERTEZA? A anonimização irá mascarar permanentemente seus dados pessoais nesta conta, mantendo apenas registros obrigatórios por lei fiscal/BACEN.')) {
      return;
    }

    setIsAnonymizing(true);
    setTimeout(() => {
      setIsAnonymizing(false);
      setUserData(prev => ({
        ...prev,
        name: maskName(prev.name),
        cpf: '***.***.***-**',
        email: maskEmail(prev.email),
        phone: '(**) *****-****',
        company: 'Empresa Anonimizada LGPD'
      }));
      setAnonymizedSuccess(true);
      addToast('LGPD - Direito ao Esquecimento', 'Dados PII anonimizados com sucesso de acordo com a LGPD.', 'warning');
    }, 1200);
  };

  const handleUpdateConsents = (newConsent: LgpdConsentSettings) => {
    setConsent(newConsent);
    saveLgpdConsent(newConsent);
    addToast('Consentimento LGPD', 'Preferências de tratamento de dados atualizadas.', 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md border border-indigo-400/30">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Portal do Titular de Dados — LGPD</h3>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                      Lei nº 13.709/18
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Gerencie seus direitos de privacidade, transparência, portabilidade e revogação de dados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMasked(!isMasked)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
                  title="Alternar Máscara de Privacidade de Tela"
                >
                  {isMasked ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-amber-400" />}
                  <span>{isMasked ? 'Revelar PII' : 'Mascarar PII'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('rights')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'rights' 
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Dados do Titular (Art. 18)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('export')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'export' 
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>Portabilidade (JSON / CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('anonymize')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'anonymize' 
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                <span>Direito ao Esquecimento</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('consents')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'consents' 
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FileCheck className="h-4 w-4" />
                <span>Gestão de Consentimentos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('dpo_contact')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'dpo_contact' 
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>Encarregado DPO & ANPD</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-200">
              {/* TAB 1: DATA SUBJECT RIGHTS */}
              {activeSubTab === 'rights' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Confirmação de Existência e Acesso aos Dados
                      </h4>
                      <p className="text-xs text-slate-500">
                        Visualização transparente de todos os atributos cadastrais mantidos pela plataforma
                      </p>
                    </div>

                    <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                      ID Titular: #NERCASH-89402
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Nome do Titular</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {isMasked ? maskName(userData.name) : userData.name}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Documento CPF</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {isMasked ? maskCpf(userData.cpf) : userData.cpf}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">E-mail Cadastrado</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {isMasked ? maskEmail(userData.email) : userData.email}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Telefone / WhatsApp</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {isMasked ? maskPhone(userData.phone) : userData.phone}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Razão Social / CNPJ</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {userData.company} ({isMasked ? '**.***.***/****-**' : userData.cnpj})
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Último IP de Conexão</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {userData.ipAddress}
                      </p>
                    </div>
                  </div>

                  {/* Audit History of Consents */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Histórico de Registros e Conselhos Prestados
                    </h5>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                          <tr>
                            <th className="p-3">Ação / Consentimento</th>
                            <th className="p-3">Data & Hora</th>
                            <th className="p-3">Endereço IP</th>
                            <th className="p-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {userData.consentHistory.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-medium text-slate-900 dark:text-white">{item.action}</td>
                              <td className="p-3 text-slate-500 font-mono">{item.date}</td>
                              <td className="p-3 text-slate-500 font-mono">{item.ip}</td>
                              <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">✓ Ativo</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXPORT & PORTABILITY */}
              {activeSubTab === 'export' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Portabilidade dos Dados Pessoais (LGPD Art. 18, V)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Baixe uma cópia completa dos seus dados em formatos padronizados para transferência direta
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 space-y-3 dark:border-indigo-900 dark:bg-indigo-950/40">
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        <FileText className="h-5 w-5" />
                        <span>Exportação Estruturada JSON</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Inclui atributos do titular, histórico completo de transações, registros de consentimento e chaves vinculadas no formato nativo da API.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleExportDataReport('json')}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        <span>Baixar Arquivo JSON</span>
                      </button>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-3 dark:border-emerald-900 dark:bg-emerald-950/40">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <FileCheck className="h-5 w-5" />
                        <span>Planilha de Auditoria CSV</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Formato ideal para importação em sistemas terceiros ou conferência fiscal em planilhas Excel / Google Sheets.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleExportDataReport('csv')}
                        disabled={isExporting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                        <span>Baixar Planilha CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANONYMIZATION / RIGHT TO BE FORGOTTEN */}
              {activeSubTab === 'anonymize' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 space-y-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shrink-0">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                          Direito à Eliminação e Anonimização (LGPD Art. 18, IV & VI)
                        </h4>
                        <p className="text-xs text-rose-800 dark:text-rose-300">
                          Anonimização irreversível dos dados identificáveis do titular mantidos nesta aplicação
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      Ao solicitar a eliminação, seus dados pessoais identificáveis (CPF, Nome, E-mail, Telefone) serão substituídos por hashes anonimizados permanentes. Dados financeiros agregados e extratos de pagamentos já concluídos serão retidos em conformidade com as regras do BACEN e Receita Federal pelo prazo legal obrigatório de 5 anos.
                    </p>

                    {anonymizedSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span>Seus dados pessoais PII foram anonimizados com sucesso nesta conta!</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestAnonymization}
                        disabled={isAnonymizing}
                        className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-500 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{isAnonymizing ? 'Processando Anonimização...' : 'Solicitar Anonimização Irreversível'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CONSENT MANAGEMENT */}
              {activeSubTab === 'consents' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Revogação e Gestão de Consentimento (LGPD Art. 8º, § 5º)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Modifique ou revogue autorizações de uso de dados previamente concedidas
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50 flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">
                          Analytics e Métricas de Performance
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Permite coletar dados de tempos de carregamento para otimização da interface do checkout.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={e => handleUpdateConsents({ ...consent, analytics: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50 flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">
                          Comunicações de CRM e Disparos WhatsApp
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Autoriza o envio de réguas de cobrança automatizadas e alertas de vendas no WhatsApp.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={e => handleUpdateConsents({ ...consent, marketing: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50 flex items-center justify-between">
                      <div className="space-y-1 pr-4">
                        <span className="font-bold text-slate-900 dark:text-white text-xs block">
                          Compartilhamento de Dados com Parceiros BaaS
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Permite validar adquirentes e parceiros homologados para emissão de chaves Pix e cobrança cartão.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={consent.baasSharing}
                        onChange={e => handleUpdateConsents({ ...consent, baasSharing: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DPO CONTACT & ANPD CERTIFICATION */}
              {activeSubTab === 'dpo_contact' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-4 dark:border-indigo-900 dark:bg-indigo-950/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                          Encarregado de Proteção de Dados (DPO) — LGPD Art. 41
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Canal direto de comunicação com a equipe de governança de privacidade Nercash
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Encarregado Designado (DPO)</span>
                        <p className="font-bold text-slate-900 dark:text-white">DPO Nercash Governance Team</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">E-mail Oficial DPO</span>
                        <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">dpo@nercash.com.br</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Certificação ANPD</span>
                        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">CERT-ANPD-2026-98402</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">SLA de Atendimento ao Titular</span>
                        <p className="font-bold text-slate-900 dark:text-white">Até 24h úteis (Standard ANPD)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Proteção Criptografada AES-256 e Em conformidade com a ANPD</span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white cursor-pointer"
              >
                Concluir & Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
