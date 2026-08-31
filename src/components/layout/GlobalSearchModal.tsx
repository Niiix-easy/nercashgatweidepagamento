import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Search, 
  X, 
  CreditCard, 
  Users, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  FileText, 
  Lock, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Terminal,
  Layers,
  Sparkles,
  Command,
  Server
} from 'lucide-react';
import { PaymentIntent, Customer, RoutingRule, Acquirer } from '../../types/payment';

interface SearchResultItem {
  id: string;
  category: 'transaction' | 'customer' | 'setting' | 'acquirer' | 'rule' | 'endpoint' | 'tenant';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { 
    paymentIntents, 
    customers, 
    routingRules, 
    acquirers, 
    tenants,
    setActiveTab,
    toggleTheme,
    currentTenant
  } = usePayment();

  const [query, setQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'transaction' | 'customer' | 'setting' | 'acquirer'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Build searchable items
  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: SearchResultItem[] = [];

    // 1. Static Navigation & Settings
    const systemSettings: SearchResultItem[] = [
      {
        id: 'nav_overview',
        category: 'setting',
        title: 'Painel Geral & Telemetria (Overview Dashboard)',
        subtitle: 'Métricas de TPV, taxas de aprovação, mapa geográfico e alertas ML',
        badge: 'Dashboard',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        icon: <Activity className="h-4 w-4 text-indigo-500" />,
        action: () => { setActiveTab('overview'); onClose(); }
      },
      {
        id: 'nav_orchestration',
        category: 'setting',
        title: 'Orquestração de Pagamentos & Roteamento Inteligente',
        subtitle: 'Regras de split, cascata inteligente, contingência e A/B testing',
        badge: 'Roteamento',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        icon: <Sliders className="h-4 w-4 text-emerald-500" />,
        action: () => { setActiveTab('orchestration'); onClose(); }
      },
      {
        id: 'nav_checkout',
        category: 'setting',
        title: 'Super Checkout & Gateway de Pagamentos',
        subtitle: 'Ambiente de checkout de alta conversão, 1-click Pix e Cartão de Crédito',
        badge: 'Checkout',
        badgeColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
        icon: <CreditCard className="h-4 w-4 text-sky-500" />,
        action: () => { setActiveTab('checkout'); onClose(); }
      },
      {
        id: 'nav_crm',
        category: 'setting',
        title: 'CRM & Hub de Automações Low-Code',
        subtitle: 'Canvas visual React Flow para fluxos de recuperação Pix e fidelidade',
        badge: 'Automações',
        badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        icon: <Zap className="h-4 w-4 text-amber-500" />,
        action: () => { setActiveTab('crm'); onClose(); }
      },
      {
        id: 'nav_api_sandbox',
        category: 'setting',
        title: 'API Reference, OpenAPI Sandbox & Rate Limits',
        subtitle: 'Documentação interativa, endpoints REST, chaves de API e simulação de 429',
        badge: 'Desenvolvedores',
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        icon: <Terminal className="h-4 w-4 text-purple-500" />,
        action: () => { setActiveTab('api'); onClose(); }
      },
      {
        id: 'nav_compliance',
        category: 'setting',
        title: 'Compliance, PCI-DSS Level 1 & Logs de Auditoria',
        subtitle: 'Trilha de auditoria SHA-256, segurança pesada e relatórios regulatórios',
        badge: 'Segurança',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        icon: <ShieldCheck className="h-4 w-4 text-rose-500" />,
        action: () => { setActiveTab('compliance'); onClose(); }
      },
      {
        id: 'nav_whitelabel',
        category: 'setting',
        title: 'White Label & Customização de Marca',
        subtitle: 'Cores, domínio próprio, logos e temas para múltiplos parceiros',
        badge: 'Multi-Tenant',
        badgeColor: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        icon: <Building2 className="h-4 w-4 text-teal-500" />,
        action: () => { setActiveTab('whitelabel'); onClose(); }
      },
      {
        id: 'nav_intelligence',
        category: 'setting',
        title: 'NerCash Intelligence & Analytics',
        subtitle: 'Insights de IA, análises preditivas e performance de roteamento',
        badge: 'Intelligence',
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
        action: () => { setActiveTab('intelligence'); onClose(); }
      },
      {
        id: 'nav_gateway',
        category: 'setting',
        title: 'Gateway de Pagamento',
        subtitle: 'BaaS endpoints, tokens PCI e monitoramento de chargeback',
        badge: 'Gateway',
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        icon: <Server className="h-4 w-4 text-emerald-500" />,
        action: () => { setActiveTab('gateway'); onClose(); }
      },
      {
        id: 'action_refresh_data',
        category: 'setting',
        title: 'Refresh Data',
        subtitle: 'Atualizar dados de telemetria e recarregar painéis',
        badge: 'Comando',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: <Command className="h-4 w-4 text-slate-500" />,
        action: () => { window.location.reload(); }
      },
      {
        id: 'action_clear_cache',
        category: 'setting',
        title: 'Clear Cache',
        subtitle: 'Limpar cache de aplicação e recarregar contexto local',
        badge: 'Comando',
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        icon: <Command className="h-4 w-4 text-rose-500" />,
        action: () => { localStorage.clear(); window.location.reload(); }
      },
      {
        id: 'action_theme_toggle',
        category: 'setting',
        title: 'Alternar Tema Claro / Escuro (Dark Mode)',
        subtitle: 'Mudar a paleta visual do ambiente Nercash Gateway',
        badge: 'Aparência',
        badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: <Sparkles className="h-4 w-4 text-amber-400" />,
        action: () => { toggleTheme(); onClose(); }
      }
    ];

    systemSettings.forEach(s => {
      if (!q || s.title.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q)) {
        list.push(s);
      }
    });

    // 2. Acquirers
    acquirers.forEach(acq => {
      if (!q || acq.name.toLowerCase().includes(q) || acq.provider.toLowerCase().includes(q)) {
        list.push({
          id: `acq_${acq.id}`,
          category: 'acquirer',
          title: `Adquirente: ${acq.name}`,
          subtitle: `Latência: ${acq.latencyMs}ms • MDR: ${acq.feePercentage}% • Status: ${acq.healthStatus.toUpperCase()}`,
          badge: acq.circuitBreakerTripped ? 'Circuit Breaker Ativo' : 'Online',
          badgeColor: acq.circuitBreakerTripped ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          icon: <Cpu className="h-4 w-4 text-indigo-500" />,
          action: () => { setActiveTab('orchestration'); onClose(); }
        });
      }
    });

    // 3. Routing Rules
    routingRules.forEach(rule => {
      if (!q || rule.name.toLowerCase().includes(q) || rule.description.toLowerCase().includes(q)) {
        list.push({
          id: `rule_${rule.id}`,
          category: 'setting',
          title: `Regra de Roteamento: ${rule.name}`,
          subtitle: `${rule.description} (Prioridade ${rule.priority})`,
          badge: rule.active ? 'Ativa' : 'Pausada',
          badgeColor: rule.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          icon: <Sliders className="h-4 w-4 text-emerald-500" />,
          action: () => { setActiveTab('orchestration'); onClose(); }
        });
      }
    });

    // 4. Customers
    customers.forEach(cust => {
      if (
        !q || 
        cust.name.toLowerCase().includes(q) || 
        cust.email.toLowerCase().includes(q) || 
        cust.document.includes(q) ||
        cust.tags.some(t => t.toLowerCase().includes(q))
      ) {
        list.push({
          id: `cust_${cust.id}`,
          category: 'customer',
          title: `Cliente: ${cust.name}`,
          subtitle: `${cust.email} • Doc: ${cust.document} • LTV: R$ ${cust.ltv.toFixed(2)}`,
          badge: cust.tags[0] || 'Cliente',
          badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
          icon: <Users className="h-4 w-4 text-indigo-500" />,
          action: () => { setActiveTab('crm'); onClose(); }
        });
      }
    });

    // 5. Payment Intents / Transactions
    paymentIntents.forEach(pi => {
      const isApproved = pi.status === 'approved';
      if (
        !q || 
        pi.id.toLowerCase().includes(q) || 
        pi.customerName.toLowerCase().includes(q) || 
        pi.customerEmail.toLowerCase().includes(q) ||
        pi.customerDocument.includes(q) ||
        pi.amount.toString().includes(q)
      ) {
        list.push({
          id: `pi_${pi.id}`,
          category: 'transaction',
          title: `Transação #${pi.id} — R$ ${pi.amount.toFixed(2)}`,
          subtitle: `${pi.customerName} • Método: ${pi.selectedMethod.toUpperCase()} • Score ML: ${pi.riskScore}`,
          badge: pi.status.toUpperCase(),
          badgeColor: isApproved 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
          icon: <CreditCard className="h-4 w-4 text-emerald-500" />,
          action: () => { setActiveTab('orchestration'); onClose(); }
        });
      }
    });

    // 6. Tenants
    const allTenants = [
      currentTenant,
      ...tenants.filter(t => t.id !== currentTenant.id)
    ];
    allTenants.forEach(tenant => {
      if (!q || tenant.name.toLowerCase().includes(q) || tenant.slug.toLowerCase().includes(q)) {
        list.push({
          id: `tenant_${tenant.id}`,
          category: 'tenant',
          title: `Tenant: ${tenant.name}`,
          subtitle: `Slug: ${tenant.slug} • Domínio: ${tenant.customDomain || 'N/A'}`,
          badge: 'Organization',
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
          icon: <Building2 className="h-4 w-4 text-teal-500" />,
          action: () => { setActiveTab('whitelabel'); onClose(); }
        });
      }
    });

    // 7. API Endpoints
    const apiEndpoints = [
      { path: '/v1/payments', method: 'POST', desc: 'Criar uma nova transação' },
      { path: '/v1/payments/:id', method: 'GET', desc: 'Recuperar detalhes da transação' },
      { path: '/v1/payments/:id/refund', method: 'POST', desc: 'Solicitar estorno de pagamento' },
      { path: '/v1/customers', method: 'GET', desc: 'Listar base de clientes' },
      { path: '/v1/webhooks', method: 'POST', desc: 'Registrar novo endpoint de webhook' },
      { path: '/v1/routing/rules', method: 'GET', desc: 'Consultar regras de orquestração' }
    ];

    apiEndpoints.forEach(ep => {
      if (!q || ep.path.toLowerCase().includes(q) || ep.desc.toLowerCase().includes(q)) {
        list.push({
          id: `ep_${ep.path}`,
          category: 'endpoint',
          title: `Endpoint: ${ep.path}`,
          subtitle: `${ep.method} • ${ep.desc}`,
          badge: 'API Endpoint',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
          icon: <Globe className="h-4 w-4 text-purple-500" />,
          action: () => { setActiveTab('api'); onClose(); }
        });
      }
    });

    // Filter by active category tab if selected
    if (activeCategory === 'all') return list;
    return list.filter(item => item.category === activeCategory);
  }, [query, activeCategory, paymentIntents, customers, routingRules, acquirers, tenants, setActiveTab, toggleTheme, currentTenant, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < results.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar transações, clientes, configurações, adquirentes ou regras..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none dark:text-white"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40">
          <button
            onClick={() => { setActiveCategory('all'); setSelectedIndex(0); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Tudo ({results.length})
          </button>
          <button
            onClick={() => { setActiveCategory('transaction'); setSelectedIndex(0); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeCategory === 'transaction'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => { setActiveCategory('customer'); setSelectedIndex(0); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeCategory === 'customer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => { setActiveCategory('setting'); setSelectedIndex(0); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeCategory === 'setting'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Módulos & Config
          </button>
          <button
            onClick={() => { setActiveCategory('acquirer'); setSelectedIndex(0); }}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
              activeCategory === 'acquirer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            Adquirentes
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhum resultado encontrado para &quot;{query}&quot;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar por ID de transação, e-mail de cliente, nome de regra ou módulo.
              </p>
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-center justify-between gap-3 rounded-xl p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className={`shrink-0 rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <span className="text-[10px] hidden sm:inline font-mono">Abrir</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & shortcut guide */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/90 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[9px] dark:border-slate-700 dark:bg-slate-800">↑↓</kbd> Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[9px] dark:border-slate-700 dark:bg-slate-800">↵</kbd> Selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[9px] dark:border-slate-700 dark:bg-slate-800">ESC</kbd> Fechar
            </span>
          </div>
          <span className="font-mono text-[10px]">
            Tenant: <strong>{currentTenant.branding.logoText}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
