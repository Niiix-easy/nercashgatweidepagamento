import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Compass, 
  HelpCircle, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Zap, 
  CreditCard, 
  Send, 
  Code, 
  Server, 
  Gift, 
  Building2, 
  ShieldCheck, 
  BrainCircuit, 
  Terminal, 
  Cpu, 
  BarChart3,
  BookOpen,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export interface TutorialStep {
  title: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
  badge?: string;
  actionText?: string;
  actionTab?: string;
}

export interface ModuleTutorialConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  summary: string;
  steps: TutorialStep[];
}

export const MODULE_TUTORIALS: Record<string, ModuleTutorialConfig> = {
  overview: {
    id: 'overview',
    title: 'Visão Geral & Dashboard Financeiro',
    subtitle: 'Painel executivo de métricas consolidadas e controle operacional',
    icon: <BarChart3 className="h-5 w-5 text-indigo-500" />,
    badge: 'Módulo Principal',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    summary: 'Acompanhe o TPV diário, liquidações em tempo real, taxas de conversão e gerencie transações em lote.',
    steps: [
      {
        title: 'Métricas de Volume & Liquidação',
        description: 'Visualização instantânea de faturamento (TPV), volume acumulado por modalidade (Pix, Cartão, Boleto) e projeção de liquidação.',
        highlights: [
          'Gráficos interativos com atualização em tempo real',
          'Taxa de aprovação por adquirente e bandeira',
          'Ajuste dinâmico de período e moeda'
        ],
        icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
        badge: 'Métricas'
      },
      {
        title: 'Ações em Lote e Conciliação Bancária',
        description: 'Selecione múltiplas transações na tabela para conciliar com o extrato do BaaS, sinalizar fraude ou exportar relatórios CSV.',
        highlights: [
          'Modal de confirmação e auditoria para segurança',
          'Marcação de tag dinâmica e filtro rápido por status',
          'Exportação instantânea para sistemas ERP'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        badge: 'Operação'
      },
      {
        title: 'Monitor de Saúde das Adquirentes',
        description: 'Card de status das adquirentes conectadas com verificação automática de SLA e latência de resposta.',
        highlights: [
          'Alerta automático em caso de degradação',
          'Indicador de failover automático',
          'Atalhos para alternância manual'
        ],
        icon: <Zap className="h-6 w-6 text-amber-500" />,
        badge: 'Saúde BaaS'
      }
    ]
  },
  orchestration: {
    id: 'orchestration',
    title: 'Matriz de Orquestração & Smart Routing',
    subtitle: 'Roteamento dinâmico de pagamentos com redundância e priorização',
    icon: <Layers className="h-5 w-5 text-purple-500" />,
    badge: 'Roteamento Avançado',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    summary: 'Maximização de aprovação de vendas configurando regras por valor, bandeira, custo de taxa e fallback automático.',
    steps: [
      {
        title: 'Regras de Priorização Encadeadas',
        description: 'Crie regras inteligentes para direcionar transações para a adquirente com menor taxa ou maior taxa de aprovação.',
        highlights: [
          'Filtro por bandeira (Visa, Mastercard, Elo)',
          'Divisão por faixa de valor do pagamento',
          'Simulador de rotas em tempo real'
        ],
        icon: <Layers className="h-6 w-6 text-purple-500" />,
        badge: 'Regras'
      },
      {
        title: 'Cascateamento & Fallback de Transações',
        description: 'Quando uma tentativa falha ou sofre retentativa, o Nercash re-roteia o pagamento para a adquirente secundária em milissegundos.',
        highlights: [
          'Zero perda de vendas por instabilidade',
          'Recuperação transparente para o comprador',
          'Log detalhado de retentativas'
        ],
        icon: <Zap className="h-6 w-6 text-amber-500" />,
        badge: 'Failover'
      },
      {
        title: 'Smart Batch Reconciliation (CSV)',
        description: 'Importe extratos em formato CSV para comparar repasses bancários reais com as transações registradas.',
        highlights: [
          'Detecção automática de divergências de taxa',
          'Resolução de conflitos de repasse',
          'Relatórios de auditoria financeira'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        badge: 'Conciliação'
      }
    ]
  },
  checkout: {
    id: 'checkout',
    title: 'Super Checkout Pro & Link de Pagamento',
    subtitle: 'Terminal de conversão com suporte a Pix Dinâmico, Cartão e Split',
    icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
    badge: 'Alta Conversão',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    summary: 'Gere links de pagamento de alta conversão com Pix com QR Code dinâmico, autorização prévia e split automático.',
    steps: [
      {
        title: 'Pix Dinâmico com QR Code em Milissegundos',
        description: 'Geração instantânea de chaves Pix Copia e Cola com renovação de expiração e confirmação via Webhook em tempo real.',
        highlights: [
          'Notificação sonora e visual de pagamento confirmado',
          'Contador de tempo de expiração do QR Code',
          'Suporte a pagamentos parcelados'
        ],
        icon: <Zap className="h-6 w-6 text-emerald-500" />,
        badge: 'Pix'
      },
      {
        title: 'Checkout Personalizado Multi-Tenant',
        description: 'Ajuste a identidade visual com marca do estabelecimento, domínio próprio e campos customizados de cadastro.',
        highlights: [
          'Tema responsivo otimizado para dispositivos móveis',
          'Suporte a múltiplos idiomas e moedas (BRL, USD, EUR)',
          'Máxima conversão sem redirecionamentos externos'
        ],
        icon: <CreditCard className="h-6 w-6 text-indigo-500" />,
        badge: 'Design'
      },
      {
        title: 'Divisão de Recebíveis (Split de Pagamento)',
        description: 'Configure regras para repassar percentuais automáticos para fornecedores, parceiros ou afiliados na própria liquidação.',
        highlights: [
          'Split percentual ou valor fixo',
          'Retenção de comissão da plataforma',
          'Relatório individualizado para recebedores'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-purple-500" />,
        badge: 'Split'
      }
    ]
  },
  crm: {
    id: 'crm',
    title: 'CRM & Automação de Cobranças',
    subtitle: 'Régua de comunicação via WhatsApp Meta API e e-mail marketing',
    icon: <Send className="h-5 w-5 text-blue-500" />,
    badge: 'Engajamento',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    summary: 'Automatize avisos de cobrança, recuperação de PIX não pago e mensagens de pós-venda para maximizar o LTV.',
    steps: [
      {
        title: 'Régua Automática de Recuperação de Vendas',
        description: 'Disparo automático de mensagens no WhatsApp para clientes com PIX pendente ou boleto perto do vencimento.',
        highlights: [
          'Integração direta com a API Oficial do WhatsApp Meta',
          'Modelos de mensagens editáveis com variáveis dinâmicas',
          'Aumento comprovado na taxa de conversão do Pix'
        ],
        icon: <Send className="h-6 w-6 text-blue-500" />,
        badge: 'Régua'
      },
      {
        title: 'Perfil 360° do Cliente e Tags Dinâmicas',
        description: 'Acompanhe o LTV (Lifetime Value), número de pedidos e segmentação por tags automáticas.',
        highlights: [
          'Identificação de clientes de alto valor (VIPs)',
          'Histórico consolidado de transações por e-mail/CPF',
          'Exportação de listas para campanhas de marketing'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-indigo-500" />,
        badge: 'CRM 360'
      }
    ]
  },
  api: {
    id: 'api',
    title: 'OpenAPI Docs & Sandbox de Desenvolvedores',
    subtitle: 'Ambiente completo de testes e documentação de integração REST',
    icon: <Code className="h-5 w-5 text-sky-500" />,
    badge: 'Developers',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    summary: 'Documentação OpenAPI interativa com gerador de cURL, execução de rotas e emissão de chaves de API secretas.',
    steps: [
      {
        title: 'Explorador Interativo de Endpoints',
        description: 'Testagem direta de requisições GET, POST, PUT e DELETE diretamente pelo navegador.',
        highlights: [
          'Endpoints para /v1/payments, /v1/customers e /v1/webhooks',
          'Exemplos prontos em Node.js, Python, cURL e PHP',
          'Respostas no formato JSON padrão BaaS'
        ],
        icon: <Code className="h-6 w-6 text-sky-500" />,
        badge: 'Endpoints'
      },
      {
        title: 'Gestão de Chaves de API e Tokens',
        description: 'Crie e revogue chaves publicáveis e secretas com permissões específicas de leitura e escrita.',
        highlights: [
          'Autenticação via Bearer Token',
          'Mascaramento de chaves secretas',
          'Logs de chamadas efetuadas por chave'
        ],
        icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
        badge: 'API Keys'
      }
    ]
  },
  gateway: {
    id: 'gateway',
    title: 'Gateway Settings & Conectores de Adquirentes',
    subtitle: 'Gerenciamento de integrações BaaS e credenciais bancárias',
    icon: <Server className="h-5 w-5 text-indigo-500" />,
    badge: 'BaaS Core',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    summary: 'Cadastre credenciais das adquirentes (Cielo, Stone, Mercado Pago, Asaas, Juno, Iugu) e ajuste parâmetros operacionais.',
    steps: [
      {
        title: 'Configuração dos Provedores Adquirentes',
        description: 'Insira suas credenciais de produção ou sandbox para conectar o processamento direto aos bancos.',
        highlights: [
          'Ajuste de taxa por parcela e antecipação de recebíveis',
          'Teste de conexão e ping de latência',
          'Alternância entre modo Teste e Produção'
        ],
        icon: <Server className="h-6 w-6 text-indigo-500" />,
        badge: 'Conectores'
      },
      {
        title: 'Controle de Taxas & Descontos por Bandeira',
        description: 'Defina custos customizados por modalidade para calcular a margem líquida de cada venda em tempo real.',
        highlights: [
          'Tabela de MDR (Merchant Discount Rate)',
          'Custo fixo por transação Pix',
          'Simulação de recebimento líquido'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
        badge: 'MDR'
      }
    ]
  },
  cashback: {
    id: 'cashback',
    title: 'Cashback & Metas de Fidelidade',
    subtitle: 'Motor gamificado de recompensas e comissões progressivas',
    icon: <Gift className="h-5 w-5 text-amber-500" />,
    badge: 'Gamificação',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    summary: 'Crie programas de saldo de cashback para reter compradores e defina metas de faturamento para descontos de taxa.',
    steps: [
      {
        title: 'Regras de Retorno de Cashback',
        description: 'Defina porcentagens de saldo retornado ao cliente para uso em futuras compras na plataforma.',
        highlights: [
          'Gatilho de valor mínimo de compra',
          'Prazo de expiração de saldo',
          'Extrato transparente para o comprador'
        ],
        icon: <Gift className="h-6 w-6 text-amber-500" />,
        badge: 'Cashback'
      },
      {
        title: 'Metas de Volume de Vendas',
        description: 'Alcance metas quinzenais ou mensais de TPV para liberar redução automática nas taxas do gateway.',
        highlights: [
          'Barra de progresso de metas em tempo real',
          'Descontos progressivos na taxa do Pix',
          'Notificação ao bater o marco financeiro'
        ],
        icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
        badge: 'Metas'
      }
    ]
  },
  whitelabel: {
    id: 'whitelabel',
    title: 'Multi-Tenant White-Label & Domínios Customizados',
    subtitle: 'Gestão de sub-organizações, franquias e marca própria',
    icon: <Building2 className="h-5 w-5 text-teal-500" />,
    badge: 'Multi-Tenant',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    summary: 'Opere como um gateway próprio fornecendo painel customizado para seus clientes sob seu próprio domínio.',
    steps: [
      {
        title: 'Gerenciamento de Sub-Tenants & Clientes',
        description: 'Cadastre organizações filhas com limites operacionais, taxas próprias e isolamento de dados.',
        highlights: [
          'Painel de controle centralizado para o parceiro',
          'Isolamento total de base de clientes e saldo',
          'Relatório de faturamento por sub-tenant'
        ],
        icon: <Building2 className="h-6 w-6 text-teal-500" />,
        badge: 'Tenants'
      },
      {
        title: 'Domínio e Identidade da Plataforma',
        description: 'Associe seu domínio próprio (ex: `checkout.suaempresa.com.br`) com certificado SSL emitido automaticamente.',
        highlights: [
          'Customização de logo, favicon e cores corporativas',
          'E-mails transacionais com remetente próprio',
          'Termos de serviço e privacidade customizáveis'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-indigo-500" />,
        badge: 'White-Label'
      }
    ]
  },
  compliance: {
    id: 'compliance',
    title: 'Compliance, Auditoria & Segurança PCI-DSS',
    subtitle: 'Rastreabilidade criptográfica, regras de WAF e logs Merkle Tree',
    icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
    badge: 'Segurança Máxima',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    summary: 'Audite a integridade das operações com encadeamento de hashes SHA-256 e gere relatórios PCI-DSS v4.0.',
    steps: [
      {
        title: 'Audit Log Inviolável com Merkle Tree',
        description: 'Todas as ações críticas (exportação, estornos, alteração de regras) são registradas em uma cadeia imutável de hashes.',
        highlights: [
          'Verificação de integridade contra adulteração de logs',
          'Assinatura digital e IP do operador',
          'Exportação de relatórios para auditoria externa'
        ],
        icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
        badge: 'Merkle Tree'
      },
      {
        title: 'Relatórios de Conformidade PCI-DSS v4.0',
        description: 'Execução de testes de vulnerabilidade, verificação de criptografia de cartão e relatórios de segurança.',
        highlights: [
          'Monitoramento de proteção WAF / OWASP',
          'Mascaramento obrigatório de dados de cartão (Tokenização)',
          'Verificação diária de conformidade'
        ],
        icon: <CheckCircle2 className="h-6 w-6 text-indigo-500" />,
        badge: 'PCI-DSS'
      }
    ]
  },
  intelligence: {
    id: 'intelligence',
    title: 'Intelligence Hub & Machine Learning Fraud Risk',
    subtitle: 'Análise preditiva de chargebacks e estimativa de fluxo de caixa',
    icon: <BrainCircuit className="h-5 w-5 text-violet-500" />,
    badge: 'AI & Analytics',
    badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
    summary: 'Identificação de padrões suspeitos de fraude com motor de pontuação de risco e previsão de receita futura.',
    steps: [
      {
        title: 'Motor de Risco de Fraude (Fraud Score)',
        description: 'Análise inteligente de geolocalização, repetição de cartão e comportamento do comprador em tempo real.',
        highlights: [
          'Avisos preventivos antes de ocorrer o chargeback',
          'Criação de regras automáticas de recusa preventiva',
          'Gráfico de distribuição de score de risco'
        ],
        icon: <BrainCircuit className="h-6 w-6 text-violet-500" />,
        badge: 'Fraud ML'
      },
      {
        title: 'Previsão de Fluxo de Caixa & Retenção',
        description: 'Modelos estatísticos que estimam liquidações futuras e identificam taxa de churn em pagamentos recorrentes.',
        highlights: [
          'Projeção de receita mensal (MRR)',
          'Análise de retenção por coorte de clientes',
          'Alertas de anomalia de faturamento'
        ],
        icon: <BarChart3 className="h-6 w-6 text-indigo-500" />,
        badge: 'Previsão'
      }
    ]
  },
  webhooks: {
    id: 'webhooks',
    title: 'Webhook Debugger & Replay Engine',
    subtitle: 'Inspecção de payloads raw recebidos de provedores bancários',
    icon: <Terminal className="h-5 w-5 text-purple-500" />,
    badge: 'Debugging',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    summary: 'Depure falhas de validação de webhook visualizando os headers HTTP originais e reexecutando eventos.',
    steps: [
      {
        title: 'Inspecção do Corpo JSON e Headers HTTP',
        description: 'Visualize os dados brutos enviados por adquirentes como Cielo, Asaas, Mercado Pago e Iugu.',
        highlights: [
          'Verificação de tokens de assinatura e segurança',
          'Tempo de resposta e latência de entrega',
          'Status do processamento interno'
        ],
        icon: <Terminal className="h-6 w-6 text-purple-500" />,
        badge: 'Inspector'
      },
      {
        title: 'Replay de Webhook em 1 Clique',
        description: 'Reprocesse webhooks antigos para validar correções no seu sistema sem precisar realizar novas compras.',
        highlights: [
          'Re-execução isolada em ambiente sandbox',
          'Log do resultado do reprocessamento',
          'Filtro rápido por provider ou tipo de evento'
        ],
        icon: <RotateCcw className="h-6 w-6 text-emerald-500" />,
        badge: 'Replay'
      }
    ]
  },
  throughput: {
    id: 'throughput',
    title: 'Gateway Throughput & Quota Monitor',
    subtitle: 'Monitoramento em tempo real de limites de requisição por minuto',
    icon: <Cpu className="h-5 w-5 text-rose-500" />,
    badge: 'Rate Limits',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    summary: 'Evite erros HTTP 429 monitorando o uso do limite de chamadas de API por minuto em cada adquirente.',
    steps: [
      {
        title: 'Monitor de Quotas em Tempo Real',
        description: 'Gráfico visual demonstrando o percentual consumido da quota de requisições de cada banco.',
        highlights: [
          'Limites por adquirente (ex: 10.000 req/min)',
          'Métrica de latência P95',
          'Alertas visuais ao ultrapassar 80% do limite'
        ],
        icon: <Cpu className="h-6 w-6 text-rose-500" />,
        badge: 'Quotas'
      },
      {
        title: 'Balanceamento Automático de Tráfego',
        description: 'O Nercash desvia automaticamente parte das requisições para adquirentes secundárias ao aproximar-se do limite contratual.',
        highlights: [
          'Prevenção proativa contra bloqueio temporário de IP',
          'Distribuição inteligente por algoritmo Round-Robin',
          'Aumento da estabilidade geral do ecossistema'
        ],
        icon: <Zap className="h-6 w-6 text-amber-500" />,
        badge: 'Balanceamento'
      }
    ]
  }
};

export const ModuleTutorialSystem: React.FC = () => {
  const { activeTab, setActiveTab } = usePayment();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const tutorialConfig = MODULE_TUTORIALS[activeTab] || MODULE_TUTORIALS['overview'];

  // Listen for custom launch events (e.g. from Header or Shortcuts)
  useEffect(() => {
    const handleOpenTutorial = (e?: Event) => {
      setCurrentStepIndex(0);
      setIsModalOpen(true);
    };

    window.addEventListener('nercash:open-module-tutorial', handleOpenTutorial);
    return () => {
      window.removeEventListener('nercash:open-module-tutorial', handleOpenTutorial);
    };
  }, []);

  // Auto-check if first time for this active tab
  useEffect(() => {
    setCurrentStepIndex(0);
    const key = `nercash_tutorial_dismissed_${activeTab}`;
    const dismissed = localStorage.getItem(key);
    if (dismissed === 'true') {
      setIsBannerCollapsed(true);
    } else {
      setIsBannerCollapsed(false);
    }
  }, [activeTab]);

  const handleDismissBanner = () => {
    setIsBannerCollapsed(true);
    localStorage.setItem(`nercash_tutorial_dismissed_${activeTab}`, 'true');
  };

  const handleStartTutorial = () => {
    setCurrentStepIndex(0);
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    if (currentStepIndex < tutorialConfig.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinishTutorial();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinishTutorial = () => {
    if (dontShowAgain) {
      localStorage.setItem(`nercash_tutorial_dismissed_${activeTab}`, 'true');
      setIsBannerCollapsed(true);
    }
    setIsModalOpen(false);
  };

  const currentStep = tutorialConfig.steps[currentStepIndex];

  return (
    <>
      {/* 1. TOP MODULE ORIENTATION BANNER (Collapsible Guide Card) */}
      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shadow-lg dark:border-slate-800 transition-all">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-indigo-300">
              {tutorialConfig.icon}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">
                  {tutorialConfig.title}
                </h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${tutorialConfig.badgeColor}`}>
                  {tutorialConfig.badge}
                </span>
              </div>
              {!isBannerCollapsed && (
                <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                  {tutorialConfig.summary}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleStartTutorial}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Guia & Tutorial</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBannerCollapsed(!isBannerCollapsed)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title={isBannerCollapsed ? "Expandir resumo" : "Minimizar resumo"}
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Summary Details */}
        {!isBannerCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300"
          >
            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-300/90 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {tutorialConfig.steps.length} etapas guiadas
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Dicas de alta performance
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismissBanner}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-200 underline underline-offset-2 cursor-pointer"
            >
              Entendi, ocultar guia
            </button>
          </motion.div>
        )}
      </div>

      {/* 2. INTERACTIVE STEP-BY-STEP TUTORIAL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Guia de Orientação: {tutorialConfig.title}
                      </h3>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        Passo {currentStepIndex + 1} de {tutorialConfig.steps.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Aprenda a utilizar os recursos mais importantes deste módulo
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Indicator Bar */}
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / tutorialConfig.steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/60 dark:border-indigo-900/60 dark:text-indigo-400">
                    {currentStep.icon}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {currentStep.title}
                      </h4>
                      {currentStep.badge && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {currentStep.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentStep.description}
                    </p>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Destaques & Recursos Chave
                  </h5>
                  <div className="space-y-2">
                    {currentStep.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span>Não mostrar guia automaticamente para este módulo</span>
                </label>

                <div className="flex items-center gap-2 ml-auto">
                  {currentStepIndex > 0 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 cursor-pointer transition-all"
                  >
                    <span>
                      {currentStepIndex < tutorialConfig.steps.length - 1 ? 'Próximo Passo' : 'Concluir Guia'}
                    </span>
                    {currentStepIndex < tutorialConfig.steps.length - 1 ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
