import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PaymentIntent, 
  Acquirer, 
  RoutingRule, 
  Customer, 
  AutomationGraph, 
  Tenant, 
  WebhookSubscription, 
  ApiKey, 
  PaymentEvent, 
  AutomationExecutionLog,
  PaymentMethodType,
  AuditLog
} from '../types/payment';
import { 
  INITIAL_ACQUIRERS, 
  INITIAL_ROUTING_RULES, 
  INITIAL_CUSTOMERS, 
  INITIAL_PAYMENT_INTENTS, 
  INITIAL_AUTOMATIONS, 
  INITIAL_TENANTS, 
  INITIAL_WEBHOOKS, 
  INITIAL_API_KEYS, 
  INITIAL_EVENTS,
  INITIAL_AUDIT_LOGS
} from '../mock/initialData';
import { PaymentIntelligenceEngine } from '../services/intelligenceEngine';
import { WorkflowEngine } from '../services/workflowEngine';

interface PaymentContextType {
  // Estado
  acquirers: Acquirer[];
  routingRules: RoutingRule[];
  customers: Customer[];
  paymentIntents: PaymentIntent[];
  automations: AutomationGraph[];
  tenants: Tenant[];
  currentTenant: Tenant;
  webhooks: WebhookSubscription[];
  apiKeys: ApiKey[];
  events: PaymentEvent[];
  executionLogs: AutomationExecutionLog[];
  auditLogs: AuditLog[];
  activeTab: string;
  theme: 'light' | 'dark';
  displayDensity: 'comfortable' | 'compact';
  language: 'pt-BR' | 'en-US' | 'es';
  currency: 'BRL' | 'USD' | 'EUR' | 'GBP';
  
  // Ações
  toggleTheme: () => void;
  setDisplayDensity: (density: 'comfortable' | 'compact') => void;
  setLanguage: (lang: 'pt-BR' | 'en-US' | 'es') => void;
  setCurrency: (curr: 'BRL' | 'USD' | 'EUR' | 'GBP') => void;
  setActiveTab: (tab: string) => void;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantBranding: (branding: Tenant['branding'], checkoutTheme: Tenant['checkoutTheme']) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'hashSha256'>) => void;
  
  // Orquestração & Adquirentes
  updateAcquirerHealth: (id: string, status: Acquirer['healthStatus'], errorRate?: number) => void;
  toggleCircuitBreaker: (id: string) => void;
  addRoutingRule: (rule: Omit<RoutingRule, 'id'>) => void;
  toggleRoutingRule: (id: string) => void;
  deleteRoutingRule: (id: string) => void;
  
  // Transações & Checkout
  processPaymentIntent: (params: {
    amount: number;
    method: PaymentMethodType;
    customerName: string;
    customerEmail: string;
    customerDocument: string;
    cardNumber?: string;
    cardBrand?: string;
    cardInstallments?: number;
    offersAccepted?: string[];
    simulateError?: 'none' | 'technical_timeout' | 'bank_declined';
    isVpn?: boolean;
  }) => Promise<PaymentIntent>;
  
  refundPaymentIntent: (id: string) => Promise<boolean>;
  bulkTagPaymentIntents: (intentIds: string[], tagsToAdd: string[], tagsToRemove?: string[]) => void;
  updatePaymentIntentStatus: (intentIds: string[], status: 'approved' | 'declined') => void;
  
  // Automações & CRM
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'ltv' | 'totalOrders'>) => void;
  updateCustomerTags: (id: string, tags: string[]) => void;
  saveAutomation: (automation: AutomationGraph) => void;
  toggleAutomation: (id: string) => void;
  runAutomationManually: (automationId: string, paymentIntentId?: string) => Promise<AutomationExecutionLog>;
  
  // API & Webhooks
  addWebhook: (url: string, events: string[]) => void;
  deleteWebhook: (id: string) => void;
  dispatchWebhookSimulation: (webhookId: string, eventType: string) => Promise<{ success: boolean; status: number; latencyMs: number }>;
  generateApiKey: (name: string, env: 'sandbox' | 'production', type: 'publishable' | 'secret') => void;
  createTenantApiKey: (params: {
    name: string;
    tenantId: string;
    tenantName: string;
    environment: 'sandbox' | 'production';
    type: 'publishable' | 'secret';
    scopes: string[];
    expirationPolicy: '30_days' | '90_days' | '180_days' | '365_days' | 'never';
    ipWhitelist?: string[];
  }) => ApiKey;
  revokeApiKey: (id: string, reason: string) => void;
  updateApiKeyPolicy: (id: string, policy: '30_days' | '90_days' | '180_days' | '365_days' | 'never') => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [acquirers, setAcquirers] = useState<Acquirer[]>(INITIAL_ACQUIRERS);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>(INITIAL_ROUTING_RULES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>(INITIAL_PAYMENT_INTENTS);
  const [automations, setAutomations] = useState<AutomationGraph[]>(INITIAL_AUTOMATIONS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [currentTenant, setCurrentTenantState] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>(INITIAL_WEBHOOKS);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);
  const [events, setEvents] = useState<PaymentEvent[]>(INITIAL_EVENTS);
  const [executionLogs, setExecutionLogs] = useState<AutomationExecutionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nercash_audit_logs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load audit logs from localStorage', e);
      }
    }
    return INITIAL_AUDIT_LOGS as AuditLog[];
  });
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nercash_audit_logs', JSON.stringify(auditLogs));
      } catch (e) {
        console.error('Failed to save audit logs to localStorage', e);
      }
    }
  }, [auditLogs]);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nercash_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Language state ('pt-BR' | 'en-US' | 'es')
  const [language, setLanguageState] = useState<'pt-BR' | 'en-US' | 'es'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nercash_language');
      if (saved === 'pt-BR' || saved === 'en-US' || saved === 'es') return saved;
    }
    return 'pt-BR';
  });

  const setLanguage = (lang: 'pt-BR' | 'en-US' | 'es') => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nercash_language', lang);
    }
  };

  // Currency state ('BRL' | 'USD' | 'EUR' | 'GBP')
  const [currency, setCurrencyState] = useState<'BRL' | 'USD' | 'EUR' | 'GBP'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nercash_currency');
      if (saved === 'BRL' || saved === 'USD' || saved === 'EUR' || saved === 'GBP') return saved;
    }
    return 'BRL';
  });

  const setCurrency = (curr: 'BRL' | 'USD' | 'EUR' | 'GBP') => {
    setCurrencyState(curr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nercash_currency', curr);
    }
  };
  const [displayDensity, setDisplayDensityState] = useState<'comfortable' | 'compact'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nercash_density');
      if (saved === 'comfortable' || saved === 'compact') return saved;
    }
    return 'comfortable';
  });

  const setDisplayDensity = (density: 'comfortable' | 'compact') => {
    setDisplayDensityState(density);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nercash_density', density);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nercash_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'nercash_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
          setTheme(e.newValue);
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp' | 'hashSha256'>) => {
    const timestamp = new Date().toISOString();
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const hashSha256 = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newLog: AuditLog = {
      ...logData,
      id,
      timestamp,
      hashSha256
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };


  // Adiciona evento ao Event Bus
  const publishEvent = (type: PaymentEvent['type'], payload: Record<string, any>, paymentIntentId?: string) => {
    const newEvent: PaymentEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      paymentIntentId,
      payload,
      timestamp: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Mantém últimos 50 eventos
    return newEvent;
  };

  // Orquestração: Alterar saúde de adquirente
  const updateAcquirerHealth = (id: string, status: Acquirer['healthStatus'], errorRate?: number) => {
    setAcquirers(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          healthStatus: status,
          errorRate1m: errorRate !== undefined ? errorRate : (status === 'degraded' ? 12.5 : status === 'down' ? 45.0 : 0.8),
          circuitBreakerTripped: status === 'down'
        };
      }
      return a;
    }));
  };

  const toggleCircuitBreaker = (id: string) => {
    setAcquirers(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.circuitBreakerTripped;
        return {
          ...a,
          circuitBreakerTripped: nextState,
          healthStatus: nextState ? 'down' : 'up'
        };
      }
      return a;
    }));
  };

  const addRoutingRule = (rule: Omit<RoutingRule, 'id'>) => {
    const newRule: RoutingRule = {
      ...rule,
      id: `rule_${Date.now()}`
    };
    setRoutingRules(prev => [newRule, ...prev]);
  };

  const toggleRoutingRule = (id: string) => {
    setRoutingRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRoutingRule = (id: string) => {
    setRoutingRules(prev => prev.filter(r => r.id !== id));
  };

  // Processamento com Orquestração Completa
  const processPaymentIntent = async (params: {
    amount: number;
    method: PaymentMethodType;
    customerName: string;
    customerEmail: string;
    customerDocument: string;
    cardNumber?: string;
    cardBrand?: string;
    cardInstallments?: number;
    offersAccepted?: string[];
    simulateError?: 'none' | 'technical_timeout' | 'bank_declined';
    isVpn?: boolean;
  }): Promise<PaymentIntent> => {
    const intentId = `pi_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. Evento: payment.created
    publishEvent('payment.created', {
      amount: params.amount,
      method: params.method,
      customer: params.customerName
    }, intentId);

    // 2. Executa Decision Engine (Intelligence Core)
    const decision = PaymentIntelligenceEngine.decide({
      amount: params.amount,
      method: params.method,
      customerEmail: params.customerEmail,
      customerDocument: params.customerDocument,
      cardNumber: params.cardNumber,
      installments: params.cardInstallments,
      rules: routingRules,
      acquirers: acquirers,
      isVpnDetected: params.isVpn,
      deviceKnown: true
    });

    // 3. Evento: risk.evaluated
    publishEvent('risk.evaluated', {
      riskScore: decision.riskScore,
      riskLevel: decision.riskLevel,
      features: decision.riskFeatures
    }, intentId);

    // 4. Evento: route.selected
    publishEvent('route.selected', {
      acquirer: decision.selectedAcquirer.name,
      antifraud: decision.selectedAntifraud,
      ruleApplied: decision.appliedRule?.name || 'Algoritmo de Menor Custo & Latência'
    }, intentId);

    // 5. Executa Orquestração e Failover Chain
    const execution = await PaymentIntelligenceEngine.executeTransactionWithOrchestration(
      decision,
      params.simulateError
    );

    // Gera PIX dados se for PIX
    let pixQrCode = undefined;
    let pixCopyPaste = undefined;
    if (params.method === 'pix') {
      pixQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=00020126580014br.gov.bcb.pix0136${intentId}_spi_instant520400005303986540${params.amount.toFixed(2)}5802BR5915OmniPay6009SaoPaulo62070503***6304`;
      pixCopyPaste = `00020126580014br.gov.bcb.pix0136${intentId}_spi_instant520400005303986540${params.amount.toFixed(2)}5802BR5915OmniPay6009SaoPaulo62070503***6304`;
    }

    // Gera Boleto se for Boleto
    let boletoBarcode = undefined;
    if (params.method === 'boleto') {
      boletoBarcode = `34191.79001 01043.510047 91020.150008 4 981200000${Math.floor(params.amount * 100)}`;
    }

    const newPaymentIntent: PaymentIntent = {
      id: intentId,
      merchantId: currentTenant.id,
      amount: params.amount,
      currency: 'BRL',
      customerId: `cus_${Math.floor(Math.random() * 9000 + 1000)}`,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerDocument: params.customerDocument,
      paymentMethodCandidates: [params.method],
      selectedMethod: params.method,
      selectedAcquirer: execution.finalAcquirer.id,
      selectedAntifraud: decision.selectedAntifraud,
      riskScore: decision.riskScore,
      riskLevel: decision.riskLevel,
      riskFeatures: decision.riskFeatures,
      status: execution.status,
      attempts: execution.attempts,
      cardBrand: params.cardBrand || (params.cardNumber ? 'Mastercard' : undefined),
      cardLast4: params.cardNumber ? params.cardNumber.replace(/\D/g, '').slice(-4) : undefined,
      cardInstallments: params.cardInstallments || 1,
      pixQrCode,
      pixCopyPaste,
      boletoBarcode,
      offersAccepted: params.offersAccepted,
      metadata: { tenant: currentTenant.name, channel: 'Super Checkout Adaptativo' },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setPaymentIntents(prev => [newPaymentIntent, ...prev]);

    // 6. Publica evento final
    const finalEventType = execution.status === 'approved' ? 'payment.approved' : 'payment.declined';
    publishEvent(finalEventType, {
      amount: params.amount,
      acquirer: execution.finalAcquirer.name,
      customer: params.customerName,
      attemptsCount: execution.attempts.length
    }, intentId);

    // 7. Dispara Automações correspondentes via Workflow Engine (Assíncrono)
    const matchingAutomations = automations.filter(a => a.active && a.triggerEvent === finalEventType);
    for (const auto of matchingAutomations) {
      WorkflowEngine.executeGraph(auto, {
        event: finalEventType,
        paymentIntent: newPaymentIntent
      }).then(log => {
        setExecutionLogs(prev => [log, ...prev]);
        setAutomations(prev => prev.map(a => a.id === auto.id ? { 
          ...a, 
          executionCount: a.executionCount + 1,
          lastExecutedAt: new Date().toISOString()
        } : a));
        publishEvent('automation.executed', {
          automationName: auto.name,
          nodesRun: log.executedNodes.length,
          status: log.status
        }, intentId);
      });
    }

    // 8. Atualiza ou cria contato de CRM
    if (execution.status === 'approved') {
      setCustomers(prev => {
        const existing = prev.find(c => c.email === params.customerEmail || c.document === params.customerDocument);
        if (existing) {
          return prev.map(c => c.id === existing.id ? {
            ...c,
            ltv: c.ltv + params.amount,
            totalOrders: c.totalOrders + 1,
            lifecycleStage: 'active',
            tags: Array.from(new Set([...c.tags, 'Comprador Recente']))
          } : c);
        } else {
          const newCus: Customer = {
            id: `cus_${Date.now()}`,
            name: params.customerName,
            email: params.customerEmail,
            document: params.customerDocument,
            phone: '+55 (11) 98999-1234',
            riskProfile: decision.riskLevel === 'critical' || decision.riskLevel === 'high' ? 'high' : 'low',
            lifecycleStage: 'active',
            tags: ['Novo Cliente', 'Super Checkout'],
            ltv: params.amount,
            totalOrders: 1,
            preferredMethods: [params.method],
            channels: ['whatsapp', 'email'],
            createdAt: timestamp
          };
          return [newCus, ...prev];
        }
      });
    }

    return newPaymentIntent;
  };

  const refundPaymentIntent = async (id: string): Promise<boolean> => {
    setPaymentIntents(prev => prev.map(pi => {
      if (pi.id === id && pi.status === 'approved') {
        publishEvent('payment.refunded', {
          amount: pi.amount,
          customer: pi.customerName,
          reason: 'Solicitado pelo lojista via painel'
        }, id);
        return {
          ...pi,
          status: 'refunded',
          updatedAt: new Date().toISOString()
        };
      }
      return pi;
    }));
    return true;
  };

  // CRM & Automações
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'ltv' | 'totalOrders'>) => {
    const newCus: Customer = {
      ...customer,
      id: `cus_${Date.now()}`,
      ltv: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCus, ...prev]);
  };

  const updateCustomerTags = (id: string, tags: string[]) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, tags } : c));
  };

  const bulkTagPaymentIntents = (intentIds: string[], tagsToAdd: string[], tagsToRemove?: string[]) => {
    setPaymentIntents(prev => prev.map(intent => {
      if (!intentIds.includes(intent.id)) return intent;
      const currentTags = intent.tags || [];
      let nextTags = [...currentTags];
      
      // Add new unique tags
      tagsToAdd.forEach(tag => {
        if (!nextTags.includes(tag)) {
          nextTags.push(tag);
        }
      });

      // Remove specified tags if any
      if (tagsToRemove && tagsToRemove.length > 0) {
        nextTags = nextTags.filter(t => !tagsToRemove.includes(t));
      }

      return {
        ...intent,
        tags: nextTags,
        updatedAt: new Date().toISOString()
      };
    }));

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'TRANSACTIONS_BULK_TAGGED',
      category: 'payment',
      resourceType: 'PaymentIntent',
      resourceId: `${intentIds.length}_records`,
      status: 'success',
      severity: 'low',
      details: `${intentIds.length} transações categorizadas com tags: [${tagsToAdd.join(', ')}] para sincronização CRM.`
    });
  };

  const updatePaymentIntentStatus = (intentIds: string[], status: 'approved' | 'declined') => {
    setPaymentIntents(prev => prev.map(intent => {
      if (!intentIds.includes(intent.id)) return intent;
      return {
        ...intent,
        status,
        updatedAt: new Date().toISOString()
      };
    }));

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: status === 'approved' ? 'TRANSACTIONS_BULK_APPROVED' : 'TRANSACTIONS_BULK_DECLINED',
      category: 'payment',
      resourceType: 'PaymentIntent',
      resourceId: `${intentIds.length}_records`,
      status: 'success',
      severity: 'medium',
      details: `${intentIds.length} transações tiveram o status alterado para ${status.toUpperCase()} via Atalhos Globais / Revisão Manual.`
    });
  };

  const saveAutomation = (automation: AutomationGraph) => {
    setAutomations(prev => {
      const index = prev.findIndex(a => a.id === automation.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = automation;
        return copy;
      }
      return [automation, ...prev];
    });
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const runAutomationManually = async (automationId: string, paymentIntentId?: string) => {
    const auto = automations.find(a => a.id === automationId);
    if (!auto) throw new Error('Automation not found');

    const sampleIntent = paymentIntents.find(p => p.id === paymentIntentId) || paymentIntents[0];
    const log = await WorkflowEngine.executeGraph(auto, {
      event: auto.triggerEvent,
      paymentIntent: sampleIntent,
      customer: customers[0]
    });

    setExecutionLogs(prev => [log, ...prev]);
    setAutomations(prev => prev.map(a => a.id === auto.id ? { 
      ...a, 
      executionCount: a.executionCount + 1,
      lastExecutedAt: new Date().toISOString()
    } : a));
    return log;
  };

  // API & Webhooks
  const addWebhook = (url: string, eventsList: string[]) => {
    const newWh: WebhookSubscription = {
      id: `wh_${Date.now()}`,
      url,
      events: eventsList,
      secretKey: `whsec_${Math.random().toString(36).substring(2, 18)}`,
      status: 'active',
      successRate: 100,
      createdAt: new Date().toISOString()
    };
    setWebhooks(prev => [newWh, ...prev]);
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const dispatchWebhookSimulation = async (webhookId: string, eventType: string) => {
    const wh = webhooks.find(w => w.id === webhookId);
    if (!wh) return { success: false, status: 404, latencyMs: 0 };

    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 180 + Math.random() * 120));
    const latencyMs = Math.round(performance.now() - startTime);

    setWebhooks(prev => prev.map(w => w.id === webhookId ? {
      ...w,
      lastDispatchedAt: new Date().toISOString()
    } : w));

    publishEvent('webhook.dispatched', {
      webhookId,
      url: wh.url,
      event: eventType,
      status: 200,
      latencyMs
    });

    return { success: true, status: 200, latencyMs };
  };

  const generateApiKey = (name: string, env: 'sandbox' | 'production', type: 'publishable' | 'secret') => {
    const prefix = type === 'publishable' ? (env === 'production' ? 'pk_live_' : 'pk_test_') : (env === 'production' ? 'sk_live_' : 'sk_test_');
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name,
      key: `${prefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      environment: env,
      type,
      status: 'active',
      scopes: ['charges:write', 'charges:read', 'webhooks:manage', 'tokens:create'],
      expirationPolicy: '90_days',
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      createdAt: new Date().toISOString()
    };
    setApiKeys(prev => [newKey, ...prev]);

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'API_KEY_GENERATED',
      category: 'api_key',
      resourceType: 'ApiKey',
      resourceId: newKey.id,
      status: 'success',
      severity: 'low',
      details: `Chave de API ${type.toUpperCase()} gerada para ambiente ${env.toUpperCase()} (${name}).`
    });
  };

  const createTenantApiKey = (params: {
    name: string;
    tenantId: string;
    tenantName: string;
    environment: 'sandbox' | 'production';
    type: 'publishable' | 'secret';
    scopes: string[];
    expirationPolicy: '30_days' | '90_days' | '180_days' | '365_days' | 'never';
    ipWhitelist?: string[];
  }): ApiKey => {
    const prefix = params.type === 'publishable' 
      ? (params.environment === 'production' ? 'pk_live_' : 'pk_test_') 
      : (params.environment === 'production' ? 'sk_live_' : 'sk_test_');
    
    let expiresAt: string | undefined = undefined;
    if (params.expirationPolicy === '30_days') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (params.expirationPolicy === '90_days') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (params.expirationPolicy === '180_days') {
      expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    } else if (params.expirationPolicy === '365_days') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: params.name,
      key: `${prefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`,
      environment: params.environment,
      type: params.type,
      status: 'active',
      scopes: params.scopes,
      expirationPolicy: params.expirationPolicy,
      expiresAt,
      tenantId: params.tenantId,
      tenantName: params.tenantName,
      ipWhitelist: params.ipWhitelist,
      createdAt: new Date().toISOString()
    };

    setApiKeys(prev => [newKey, ...prev]);

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'TENANT_API_KEY_CREATED',
      category: 'api_key',
      resourceType: 'ApiKey',
      resourceId: newKey.id,
      status: 'success',
      severity: 'medium',
      details: `Credencial de API criada para tenant "${params.tenantName}" (${params.environment.toUpperCase()}, Tipo: ${params.type}, Expiração: ${params.expirationPolicy}).`
    });

    return newKey;
  };

  const revokeApiKey = (id: string, reason: string) => {
    setApiKeys(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          status: 'revoked',
          revokedAt: new Date().toISOString(),
          revokedReason: reason
        };
      }
      return k;
    }));

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'API_KEY_REVOKED',
      category: 'api_key',
      resourceType: 'ApiKey',
      resourceId: id,
      status: 'warning',
      severity: 'high',
      details: `Chave de API revogada com sucesso. Motivo informado: "${reason}".`
    });
  };

  const updateApiKeyPolicy = (id: string, policy: '30_days' | '90_days' | '180_days' | '365_days' | 'never') => {
    let expiresAt: string | undefined = undefined;
    if (policy === '30_days') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (policy === '90_days') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    } else if (policy === '180_days') {
      expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    } else if (policy === '365_days') {
      expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    setApiKeys(prev => prev.map(k => {
      if (k.id === id) {
        return {
          ...k,
          expirationPolicy: policy,
          expiresAt,
          status: 'active'
        };
      }
      return k;
    }));

    addAuditLog({
      actor: {
        name: 'Maycon Quevedo',
        email: 'mayconquevedocompartilhar@gmail.com',
        role: 'Super Admin',
        ipAddress: '177.136.241.98',
        userAgent: navigator.userAgent
      },
      action: 'API_KEY_POLICY_UPDATED',
      category: 'api_key',
      resourceType: 'ApiKey',
      resourceId: id,
      status: 'success',
      severity: 'low',
      details: `Política de expiração da chave atualizada para ${policy}.`
    });
  };

  // White Label & Multi-Tenant
  const setCurrentTenant = (tenant: Tenant) => {
    setCurrentTenantState(tenant);
  };

  const updateTenantBranding = (branding: Tenant['branding'], checkoutTheme: Tenant['checkoutTheme']) => {
    const updated = {
      ...currentTenant,
      branding,
      checkoutTheme
    };
    setCurrentTenantState(updated);
    setTenants(prev => prev.map(t => t.id === currentTenant.id ? updated : t));
  };

  return (
    <PaymentContext.Provider value={{
      acquirers,
      routingRules,
      customers,
      paymentIntents,
      automations,
      tenants,
      currentTenant,
      webhooks,
      apiKeys,
      events,
      executionLogs,
      auditLogs,
      activeTab,
      theme,
      displayDensity,
      language,
      currency,
      toggleTheme,
      setDisplayDensity,
      setLanguage,
      setCurrency,
      setActiveTab,
      setCurrentTenant,
      updateTenantBranding,
      addAuditLog,
      updateAcquirerHealth,
      toggleCircuitBreaker,
      addRoutingRule,
      toggleRoutingRule,
      deleteRoutingRule,
      processPaymentIntent,
      refundPaymentIntent,
      bulkTagPaymentIntents,
      updatePaymentIntentStatus,
      addCustomer,
      updateCustomerTags,
      saveAutomation,
      toggleAutomation,
      runAutomationManually,
      addWebhook,
      deleteWebhook,
      dispatchWebhookSimulation,
      generateApiKey,
      createTenantApiKey,
      revokeApiKey,
      updateApiKeyPolicy
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within a PaymentProvider');
  return context;
};
