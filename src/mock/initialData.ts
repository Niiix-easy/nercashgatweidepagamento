import { 
  Acquirer, 
  RoutingRule, 
  Customer, 
  PaymentIntent, 
  AutomationGraph, 
  Tenant, 
  WebhookSubscription, 
  ApiKey,
  PaymentEvent
} from '../types/payment';

export const INITIAL_ACQUIRERS: Acquirer[] = [
  {
    id: 'acq_pix_spi',
    name: 'Banco Central SPI (PIX Direto)',
    provider: 'pix_spi',
    healthStatus: 'up',
    latencyMs: 142,
    errorRate1m: 0.1,
    feePercentage: 0.79,
    fixedFee: 0.00,
    priority: 1,
    supportedMethods: ['pix'],
    circuitBreakerTripped: false
  },
  {
    id: 'acq_stone',
    name: 'Stone Pagamentos',
    provider: 'stone',
    healthStatus: 'up',
    latencyMs: 235,
    errorRate1m: 1.2,
    feePercentage: 2.39,
    fixedFee: 0.35,
    priority: 1,
    supportedMethods: ['credit_card', 'pix'],
    circuitBreakerTripped: false
  },
  {
    id: 'acq_cielo',
    name: 'Cielo E-Commerce 3.0',
    provider: 'cielo',
    healthStatus: 'up',
    latencyMs: 310,
    errorRate1m: 2.8,
    feePercentage: 2.65,
    fixedFee: 0.40,
    priority: 2,
    supportedMethods: ['credit_card', 'boleto'],
    circuitBreakerTripped: false
  },
  {
    id: 'acq_rede',
    name: 'Rede Itaú Global',
    provider: 'rede',
    healthStatus: 'up',
    latencyMs: 220,
    errorRate1m: 0.8,
    feePercentage: 2.29,
    fixedFee: 0.30,
    priority: 1,
    supportedMethods: ['credit_card', 'pix', 'boleto'],
    circuitBreakerTripped: false
  },
  {
    id: 'acq_mp',
    name: 'Mercado Pago Gateway',
    provider: 'mercadopago',
    healthStatus: 'degraded',
    latencyMs: 650,
    errorRate1m: 8.4,
    feePercentage: 2.99,
    fixedFee: 0.00,
    priority: 3,
    supportedMethods: ['credit_card', 'pix', 'boleto', 'wallet'],
    circuitBreakerTripped: false
  },
  {
    id: 'acq_adyen',
    name: 'Adyen International',
    provider: 'adyen',
    healthStatus: 'up',
    latencyMs: 195,
    errorRate1m: 0.4,
    feePercentage: 2.80,
    fixedFee: 0.50,
    priority: 1,
    supportedMethods: ['credit_card'],
    circuitBreakerTripped: false
  }
];

export const INITIAL_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'rule_itau_premium',
    merchantId: 'merchant_default',
    name: 'Rota Exclusiva Itaú (BIN 341) > R$ 500',
    description: 'Roteia cartões emitidos pelo Itaú de alto valor diretamente para a Rede com antifraude ClearSale para atingir 98% de conversão',
    priority: 10,
    active: true,
    condition: {
      binBank: '341',
      minAmount: 500,
      method: 'credit_card'
    },
    action: {
      primaryAcquirerId: 'acq_rede',
      antifraudProvider: 'clearsale',
      fallbackChain: ['acq_stone', 'acq_cielo']
    }
  },
  {
    id: 'rule_high_ticket_adyen',
    merchantId: 'merchant_default',
    name: 'High Ticket Global (> R$ 1.500)',
    description: 'Transações de ticket elevado direcionadas para Adyen com verificação 3D-Secure e antifraude híbrido',
    priority: 8,
    active: true,
    condition: {
      minAmount: 1500,
      method: 'credit_card'
    },
    action: {
      primaryAcquirerId: 'acq_adyen',
      antifraudProvider: 'konduto',
      fallbackChain: ['acq_stone', 'acq_rede']
    }
  },
  {
    id: 'rule_pix_instant',
    merchantId: 'merchant_default',
    name: 'Roteamento Direto SPI - PIX Zero Latência',
    description: 'Liquidação instantânea via protocolo SPI direto do Bacen para qualquer valor de PIX',
    priority: 12,
    active: true,
    condition: {
      method: 'pix'
    },
    action: {
      primaryAcquirerId: 'acq_pix_spi',
      antifraudProvider: 'none',
      fallbackChain: ['acq_stone', 'acq_mp']
    }
  },
  {
    id: 'rule_card_general',
    merchantId: 'merchant_default',
    name: 'Regra Geral de Cartão de Crédito',
    description: 'Distribuição inteligente padrão focada em menor taxa e menor latência',
    priority: 1,
    active: true,
    condition: {
      method: 'credit_card'
    },
    action: {
      primaryAcquirerId: 'acq_stone',
      antifraudProvider: 'internal_ml',
      fallbackChain: ['acq_rede', 'acq_cielo', 'acq_mp']
    }
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cus_8941',
    name: 'Ana Beatriz Silveira',
    email: 'ana.silveira@techcorp.com.br',
    document: '284.918.420-91',
    phone: '+55 (11) 98741-3209',
    riskProfile: 'low',
    lifecycleStage: 'active',
    tags: ['VIP', 'Recorrente', 'Ticket Alto'],
    ltv: 4890.00,
    totalOrders: 14,
    preferredMethods: ['credit_card', 'pix'],
    channels: ['whatsapp', 'email'],
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 'cus_5120',
    name: 'Carlos Eduardo Mendes',
    email: 'carlos.mendes@gmail.com',
    document: '193.402.812-44',
    phone: '+55 (21) 99123-4567',
    riskProfile: 'low',
    lifecycleStage: 'active',
    tags: ['PIX Lover', 'Cashback User'],
    ltv: 1240.50,
    totalOrders: 6,
    preferredMethods: ['pix', 'wallet'],
    channels: ['whatsapp'],
    createdAt: '2025-03-10T14:20:00Z'
  },
  {
    id: 'cus_3309',
    name: 'Mariana Duarte Souza',
    email: 'mari.duarte@startup.io',
    document: '402.190.871-02',
    phone: '+55 (31) 97654-8901',
    riskProfile: 'medium',
    lifecycleStage: 'at_risk',
    tags: ['Inativo 45d', 'Boleto'],
    ltv: 780.00,
    totalOrders: 3,
    preferredMethods: ['boleto', 'credit_card'],
    channels: ['email', 'sms'],
    createdAt: '2025-02-01T09:15:00Z'
  },
  {
    id: 'cus_7712',
    name: 'Rodrigo Fontes Lima',
    email: 'rodrigo.fontes@corp.br',
    document: '051.849.201-33',
    phone: '+55 (41) 98877-6655',
    riskProfile: 'low',
    lifecycleStage: 'lead',
    tags: ['Novo Lead', 'Super Checkout Visit'],
    ltv: 0.00,
    totalOrders: 0,
    preferredMethods: ['pix', 'credit_card'],
    channels: ['email'],
    createdAt: '2026-08-20T11:00:00Z'
  }
];

export const INITIAL_PAYMENT_INTENTS: PaymentIntent[] = [
  {
    id: 'pi_9921_live',
    merchantId: 'merchant_default',
    amount: 899.90,
    currency: 'BRL',
    customerId: 'cus_8941',
    customerName: 'Ana Beatriz Silveira',
    customerDocument: '284.918.420-91',
    customerEmail: 'ana.silveira@techcorp.com.br',
    paymentMethodCandidates: ['credit_card', 'pix'],
    selectedMethod: 'credit_card',
    selectedAcquirer: 'acq_rede',
    selectedAntifraud: 'clearsale',
    riskScore: 12,
    riskLevel: 'very_low',
    riskFeatures: {
      velocityScore: 98,
      deviceTrust: 95,
      geoDiscrepancy: false,
      cardBinRisk: 8,
      behavioralAnomalies: []
    },
    status: 'approved',
    attempts: [
      {
        attemptNumber: 1,
        acquirerId: 'acq_rede',
        acquirerName: 'Rede Itaú Global',
        timestamp: '2026-08-27T10:14:22Z',
        status: 'approved',
        latencyMs: 218
      }
    ],
    cardBrand: 'Mastercard Black',
    cardLast4: '8831',
    cardInstallments: 3,
    offersAccepted: ['Garantia Estendida +1 Ano (+R$ 49,90)'],
    metadata: { orderId: 'PED-40918', channel: 'Super Checkout Web' },
    createdAt: '2026-08-27T10:14:20Z',
    updatedAt: '2026-08-27T10:14:23Z'
  },
  {
    id: 'pi_9920_failover',
    merchantId: 'merchant_default',
    amount: 349.00,
    currency: 'BRL',
    customerId: 'cus_5120',
    customerName: 'Carlos Eduardo Mendes',
    customerDocument: '193.402.812-44',
    customerEmail: 'carlos.mendes@gmail.com',
    paymentMethodCandidates: ['credit_card', 'pix'],
    selectedMethod: 'credit_card',
    selectedAcquirer: 'acq_stone',
    selectedAntifraud: 'internal_ml',
    riskScore: 24,
    riskLevel: 'low',
    riskFeatures: {
      velocityScore: 88,
      deviceTrust: 90,
      geoDiscrepancy: false,
      cardBinRisk: 15,
      behavioralAnomalies: []
    },
    status: 'approved',
    attempts: [
      {
        attemptNumber: 1,
        acquirerId: 'acq_cielo',
        acquirerName: 'Cielo E-Commerce 3.0',
        timestamp: '2026-08-27T09:48:10Z',
        status: 'technical_error',
        latencyMs: 1200,
        errorCode: 'ERR_TIMEOUT_UPSTREAM',
        errorMessage: 'Adquirente timeout (>1000ms) - disparando Failover Automático'
      },
      {
        attemptNumber: 2,
        acquirerId: 'acq_stone',
        acquirerName: 'Stone Pagamentos',
        timestamp: '2026-08-27T09:48:12Z',
        status: 'approved',
        latencyMs: 240
      }
    ],
    cardBrand: 'Visa Infinite',
    cardLast4: '1092',
    cardInstallments: 1,
    metadata: { orderId: 'PED-40915', channel: 'Payment Link' },
    createdAt: '2026-08-27T09:48:08Z',
    updatedAt: '2026-08-27T09:48:13Z'
  },
  {
    id: 'pi_9919_pix',
    merchantId: 'merchant_default',
    amount: 189.50,
    currency: 'BRL',
    customerId: 'cus_3309',
    customerName: 'Mariana Duarte Souza',
    customerDocument: '402.190.871-02',
    customerEmail: 'mari.duarte@startup.io',
    paymentMethodCandidates: ['pix', 'credit_card', 'boleto'],
    selectedMethod: 'pix',
    selectedAcquirer: 'acq_pix_spi',
    selectedAntifraud: 'none',
    riskScore: 5,
    riskLevel: 'very_low',
    riskFeatures: {
      velocityScore: 99,
      deviceTrust: 98,
      geoDiscrepancy: false,
      cardBinRisk: 0,
      behavioralAnomalies: []
    },
    status: 'approved',
    attempts: [
      {
        attemptNumber: 1,
        acquirerId: 'acq_pix_spi',
        acquirerName: 'Banco Central SPI (PIX Direto)',
        timestamp: '2026-08-27T08:30:15Z',
        status: 'approved',
        latencyMs: 135
      }
    ],
    pixQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=00020126580014br.gov.bcb.pix0136pi_9919_spi_instant5204000053039865406189.505802BR5915OmniPayPlatform6009SaoPaulo62070503***6304ABCD',
    pixCopyPaste: '00020126580014br.gov.bcb.pix0136pi_9919_spi_instant5204000053039865406189.505802BR5915OmniPayPlatform6009SaoPaulo62070503***6304ABCD',
    metadata: { orderId: 'PED-40910', channel: 'Super Checkout Mobile' },
    createdAt: '2026-08-27T08:30:10Z',
    updatedAt: '2026-08-27T08:30:16Z'
  },
  {
    id: 'pi_9918_declined',
    merchantId: 'merchant_default',
    amount: 3200.00,
    currency: 'BRL',
    customerId: 'cus_7712',
    customerName: 'Rodrigo Fontes Lima',
    customerDocument: '051.849.201-33',
    customerEmail: 'rodrigo.fontes@corp.br',
    paymentMethodCandidates: ['credit_card'],
    selectedMethod: 'credit_card',
    selectedAcquirer: 'acq_adyen',
    selectedAntifraud: 'konduto',
    riskScore: 78,
    riskLevel: 'high',
    riskFeatures: {
      velocityScore: 35,
      deviceTrust: 40,
      geoDiscrepancy: true,
      cardBinRisk: 82,
      behavioralAnomalies: ['IP Anônimo detectado (VPN)', 'Dispositivo inédito', '3 tentativas em 2 min']
    },
    status: 'declined',
    attempts: [
      {
        attemptNumber: 1,
        acquirerId: 'acq_adyen',
        acquirerName: 'Adyen International',
        timestamp: '2026-08-27T07:15:02Z',
        status: 'declined',
        latencyMs: 310,
        errorCode: 'BANK_DECLINED_FRAUD_SUSPICION',
        errorMessage: 'Recusa pelo banco emissor (suspeita de fraude) - failover bloqueado para evitar chargeback'
      }
    ],
    cardBrand: 'Elo Nanquim',
    cardLast4: '9920',
    cardInstallments: 12,
    metadata: { orderId: 'PED-40899', channel: 'API Integration' },
    createdAt: '2026-08-27T07:15:00Z',
    updatedAt: '2026-08-27T07:15:03Z'
  }
];

export const INITIAL_AUTOMATIONS: AutomationGraph[] = [
  {
    id: 'auto_post_payment_approved',
    name: 'Fluxo Pós-Pagamento Aprovado (360°)',
    description: 'Atualiza CRM, emite NF-e automática, notifica cliente no WhatsApp, valida valor para bonificação VIP de cashback',
    triggerEvent: 'payment.approved',
    active: true,
    executionCount: 1420,
    lastExecutedAt: '2026-08-27T10:14:23Z',
    nodes: [
      {
        id: 'node_trigger',
        type: 'trigger',
        title: 'Evento: payment.approved',
        description: 'Disparado assim que a transação é confirmada pelo adquirente',
        config: { event: 'payment.approved' },
        position: { x: 50, y: 150 }
      },
      {
        id: 'node_crm',
        type: 'crm.upsert_contact',
        title: '1. Atualizar Contato & LTV',
        description: 'Sincroniza histórico, soma valor ao LTV e define status como Ativo',
        config: { lifecycleStage: 'active', addTags: ['Comprador Confirmado'] },
        position: { x: 300, y: 150 }
      },
      {
        id: 'node_nfe',
        type: 'integration.send_nfe',
        title: '2. Emitir NF-e Fiscal',
        description: 'Transmite dados fiscais para o provedor (eNotas/Focus NFe)',
        config: { autoEmit: true, sendToCustomer: true },
        position: { x: 550, y: 150 }
      },
      {
        id: 'node_whatsapp',
        type: 'notification.whatsapp',
        title: '3. Notificação WhatsApp',
        description: 'Envia template oficial com comprovante e código de rastreio',
        config: { template: 'pedido_confirmado_v2', fallbackToSms: true },
        position: { x: 800, y: 150 }
      },
      {
        id: 'node_condition',
        type: 'condition',
        title: '4. Condição: Valor > R$ 500?',
        description: 'Verifica se a transação qualifica para fidelidade VIP',
        config: { field: 'amount', operator: 'gt', value: 500 },
        position: { x: 1050, y: 150 }
      },
      {
        id: 'node_loyalty_vip',
        type: 'loyalty.add_points',
        title: '5. Pontuação VIP (2x Cashback)',
        description: 'Credita pontos em dobro na carteira digital do cliente',
        config: { multiplier: 2, walletCashbackPercent: 5 },
        position: { x: 1320, y: 80 }
      },
      {
        id: 'node_loyalty_std',
        type: 'loyalty.add_points',
        title: '6. Pontuação Padrão (1x)',
        description: 'Credita pontos base na carteira digital',
        config: { multiplier: 1, walletCashbackPercent: 2 },
        position: { x: 1320, y: 240 }
      }
    ],
    edges: [
      { id: 'e1', from: 'node_trigger', to: 'node_crm' },
      { id: 'e2', from: 'node_crm', to: 'node_nfe' },
      { id: 'e3', from: 'node_nfe', to: 'node_whatsapp' },
      { id: 'e4', from: 'node_whatsapp', to: 'node_condition' },
      { id: 'e5', from: 'node_condition', to: 'node_loyalty_vip', conditionBranch: 'then' },
      { id: 'e6', from: 'node_condition', to: 'node_loyalty_std', conditionBranch: 'else' }
    ]
  },
  {
    id: 'auto_recovery_declined',
    name: 'Recuperação Ativa de Pagamento Recusado',
    description: 'Quando o cartão é recusado pelo banco, gera link alternativo com PIX e 5% de desconto e envia instantaneamente via WhatsApp/SMS',
    triggerEvent: 'payment.declined',
    active: true,
    executionCount: 289,
    lastExecutedAt: '2026-08-27T07:15:03Z',
    nodes: [
      {
        id: 'node_trig_dec',
        type: 'trigger',
        title: 'Evento: payment.declined',
        description: 'Disparado em caso de recusa de transação',
        config: { event: 'payment.declined' },
        position: { x: 50, y: 150 }
      },
      {
        id: 'node_crm_risk',
        type: 'crm.upsert_contact',
        title: '1. Marcar Tag "Tentativa Recusada"',
        description: 'Sinaliza o cliente no CRM para equipe de suporte ou automação',
        config: { addTags: ['Recusa Cartão', 'Lead em Risco'] },
        position: { x: 320, y: 150 }
      },
      {
        id: 'node_wa_recovery',
        type: 'notification.whatsapp',
        title: '2. Enviar Oferta de PIX com Desconto',
        description: 'Mensagem com PIX Copia e Cola gerado na hora e 5% OFF',
        config: { template: 'recuperacao_pix_instantaneo', discountPercent: 5 },
        position: { x: 600, y: 150 }
      },
      {
        id: 'node_webhook_external',
        type: 'webhook.custom',
        title: '3. Webhook para CRM Externo',
        description: 'Notifica Hubspot / RD Station com dados do abandono/recusa',
        config: { webhookUrl: 'https://hooks.external-crm.com/v1/payment-alert' },
        position: { x: 880, y: 150 }
      }
    ],
    edges: [
      { id: 'e10', from: 'node_trig_dec', to: 'node_crm_risk' },
      { id: 'e11', from: 'node_crm_risk', to: 'node_wa_recovery' },
      { id: 'e12', from: 'node_wa_recovery', to: 'node_webhook_external' }
    ]
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant_nercash',
    name: 'Nercash Gateway de Pagamento',
    slug: 'nercash-pay',
    customDomain: 'api.nercash.com.br',
    branding: {
      logoText: 'NERCASH',
      primaryColor: '#10b981', // Emerald / Neon Green
      accentColor: '#22c55e',
      badgeText: 'Gateway de Pagamento Inteligente',
      themeMode: 'emerald'
    },
    checkoutTheme: {
      borderRadius: 'lg',
      showTrustBadges: true,
      enableBumpOffers: true,
      defaultDiscountPix: 5
    },
    enabledModules: {
      orchestration: true,
      riskScoreMl: true,
      adaptiveCheckout: true,
      crmAutomation: true,
      openApi: true,
      whiteLabel: true
    },
    feeTable: {
      pixFeePercent: 0.79,
      creditCardFeePercent: 2.19,
      boletoFlatFee: 1.49,
      splitSharePercent: 30
    }
  },
  {
    id: 'tenant_nexus',
    name: 'Nexus Enterprise Pay',
    slug: 'nexus-pay',
    customDomain: 'pagamentos.nexusenterprise.io',
    branding: {
      logoText: 'NEXUS PAY',
      primaryColor: '#4f46e5', // Indigo
      accentColor: '#6366f1',
      badgeText: 'Segurança Bancária Nível 1',
      themeMode: 'indigo'
    },
    checkoutTheme: {
      borderRadius: 'lg',
      showTrustBadges: true,
      enableBumpOffers: true,
      defaultDiscountPix: 3
    },
    enabledModules: {
      orchestration: true,
      riskScoreMl: true,
      adaptiveCheckout: true,
      crmAutomation: true,
      openApi: true,
      whiteLabel: true
    },
    feeTable: {
      pixFeePercent: 0.79,
      creditCardFeePercent: 2.29,
      boletoFlatFee: 1.50,
      splitSharePercent: 25
    }
  }
];

export const RISK_SCORE_HISTORY_30D = Array.from({ length: 30 }, (_, i) => {
  const day = 30 - i;
  const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  
  // Simulated realistic ML metrics over 30 days
  const baseRisk = 16 + Math.sin(i * 0.4) * 5 + (Math.random() * 4 - 2);
  const anomalyRate = 2.1 + Math.sin(i * 0.5) * 1.2 + (Math.random() * 0.8);
  const totalVolume = 180000 + Math.sin(i * 0.3) * 60000 + Math.random() * 20000;
  const fraudPrevented = Math.round((totalVolume * (anomalyRate / 100)) * 0.85);
  const approvalRate = 98.4 - (baseRisk * 0.08);

  return {
    date: formattedDate,
    fullDate: date.toISOString().split('T')[0],
    avgRiskScore: Number(baseRisk.toFixed(1)),
    anomalyDetectionRate: Number(anomalyRate.toFixed(2)),
    approvalRate: Number(approvalRate.toFixed(1)),
    fraudPreventedAmount: fraudPrevented,
    processedVolume: Math.round(totalVolume),
    lowRiskCount: Math.round(850 + Math.random() * 200),
    mediumRiskCount: Math.round(70 + Math.random() * 30),
    highRiskCount: Math.round(15 + Math.random() * 10)
  };
});

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud_9981a',
    timestamp: '2026-08-27T10:14:20Z',
    actor: {
      name: 'Maycon Quevedo',
      email: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      ipAddress: '177.136.241.98',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    action: 'ROUTING_RULE_OPTIMIZED',
    category: 'routing_rule',
    resourceType: 'RoutingRule',
    resourceId: 'rule_itau_premium',
    status: 'success',
    severity: 'medium',
    details: 'Ajustada prioridade de failover dinâmico para priorizar Rede Itaú e ClearSale com limite de R$ 500.',
    hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    metadata: { ruleId: 'rule_itau_premium', priority: 10, targetAcquirer: 'acq_rede' }
  },
  {
    id: 'aud_9980b',
    timestamp: '2026-08-27T09:42:15Z',
    actor: {
      name: 'Sistema ML Antifraude',
      email: 'engine@nercash.internal',
      role: 'Automated Worker',
      ipAddress: '10.0.4.12',
      userAgent: 'Nercash-Decision-Core/v2.4'
    },
    action: 'CIRCUIT_BREAKER_TRIPPED',
    category: 'routing_rule',
    resourceType: 'Acquirer',
    resourceId: 'acq_mp',
    status: 'warning',
    severity: 'high',
    details: 'Circuit breaker ativado para Mercado Pago Gateway devido à taxa de erro de 8.4% nos últimos 60s.',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadata: { acquirerId: 'acq_mp', errorRate1m: 8.4, threshold: 5.0 }
  },
  {
    id: 'aud_9979c',
    timestamp: '2026-08-27T08:30:10Z',
    actor: {
      name: 'Maycon Quevedo',
      email: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      ipAddress: '177.136.241.98',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    action: 'API_KEY_ROTATED',
    category: 'api_key',
    resourceType: 'ApiKey',
    resourceId: 'key_live_sec',
    status: 'success',
    severity: 'critical',
    details: 'Chave de API de Produção sk_live_... gerada com escopo estrito de cobrança e tokenização.',
    hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    metadata: { keyType: 'secret', environment: 'production' }
  },
  {
    id: 'aud_9978d',
    timestamp: '2026-08-27T07:15:00Z',
    actor: {
      name: 'Guilherme Sampaio',
      email: 'guilherme.s@parceiro.com.br',
      role: 'Tenant Admin',
      ipAddress: '189.40.112.5',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    action: 'TENANT_BRANDING_UPDATED',
    category: 'tenant_config',
    resourceType: 'Tenant',
    resourceId: 'tenant_nercash',
    status: 'success',
    severity: 'low',
    details: 'Atualizada configuração visual do checkout adaptativo (desconto PIX 5%, raios arredondados).',
    hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    metadata: { discountPix: 5, borderRadius: 'lg' }
  },
  {
    id: 'aud_9977e',
    timestamp: '2026-08-26T22:11:45Z',
    actor: {
      name: 'Security Vault Agent',
      email: 'pci-vault@nercash.internal',
      role: 'KMS Service',
      ipAddress: '10.0.12.88',
      userAgent: 'Nercash-PCI-Vault-HSM/1.0'
    },
    action: 'PCI_SECRETS_ENCRYPTION_KEY_ROTATED',
    category: 'pci_vault',
    resourceType: 'KmsKey',
    resourceId: 'kms_aes256_gcm_acquirers',
    status: 'success',
    severity: 'critical',
    details: 'Rotação periódica da chave mestre AES-256 GCM do Vault de Credenciais dos 6 adquirentes concluída com sucesso.',
    hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    metadata: { algorithm: 'AES-256-GCM', rotatedKeysCount: 6 }
  },
  {
    id: 'aud_9976f',
    timestamp: '2026-08-26T18:04:19Z',
    actor: {
      name: 'Maycon Quevedo',
      email: 'mayconquevedocompartilhar@gmail.com',
      role: 'Super Admin',
      ipAddress: '177.136.241.98',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    },
    action: 'REFUND_MANUALLY_ISSUED',
    category: 'refund',
    resourceType: 'PaymentIntent',
    resourceId: 'pi_3391_live',
    status: 'success',
    severity: 'high',
    details: 'Estorno total de R$ 1.250,00 autorizado via API Stone para o portador de cartão final 8821.',
    hashSha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    metadata: { refundAmount: 1250.00, originalAcquirer: 'acq_stone', reason: 'customer_request' }
  },
  {
    id: 'aud_9975g',
    timestamp: '2026-08-26T14:22:00Z',
    actor: {
      name: 'Sistema de Webhooks',
      email: 'dispatcher@nercash.internal',
      role: 'Event Dispatcher',
      ipAddress: '10.0.8.44',
      userAgent: 'Nercash-Webhook-Dispatcher/2.0'
    },
    action: 'WEBHOOK_ENDPOINT_VERIFIED',
    category: 'webhook',
    resourceType: 'WebhookSubscription',
    resourceId: 'wh_01',
    status: 'success',
    severity: 'low',
    details: 'Endpoint https://api.merchant-store.com/v1/webhooks/omnipay respondeu 200 OK com assinatura HMAC-SHA256.',
    hashSha256: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    metadata: { responseStatus: 200, latencyMs: 82 }
  }
];


export const INITIAL_WEBHOOKS: WebhookSubscription[] = [
  {
    id: 'wh_01',
    url: 'https://api.merchant-store.com/v1/webhooks/omnipay',
    events: ['payment.approved', 'payment.declined', 'payment.refunded'],
    secretKey: 'whsec_9938f02ba98e104ca8101',
    status: 'active',
    successRate: 99.8,
    createdAt: '2025-06-10T12:00:00Z',
    lastDispatchedAt: '2026-08-27T10:14:24Z'
  },
  {
    id: 'wh_02',
    url: 'https://nfe.erp-integrator.com.br/hooks/inbound-events',
    events: ['payment.approved', 'automation.executed'],
    secretKey: 'whsec_7719aa43df09e1100bc02',
    status: 'active',
    successRate: 100.0,
    createdAt: '2025-08-01T08:00:00Z',
    lastDispatchedAt: '2026-08-27T09:48:13Z'
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: 'key_live_pub',
    name: 'Chave Pública Super Checkout (Produção)',
    key: 'pk_live_89104fae9910c41098b21a',
    environment: 'production',
    type: 'publishable',
    createdAt: '2025-01-10T09:00:00Z',
    lastUsedAt: '2026-08-27T10:14:20Z'
  },
  {
    id: 'key_live_sec',
    name: 'Chave Secreta Backend API (Produção)',
    key: 'sk_live_9921bba87123ef0019284c',
    environment: 'production',
    type: 'secret',
    createdAt: '2025-01-10T09:00:00Z',
    lastUsedAt: '2026-08-27T10:14:20Z'
  },
  {
    id: 'key_test_pub',
    name: 'Chave Pública Sandbox',
    key: 'pk_test_44019283748291039841',
    environment: 'sandbox',
    type: 'publishable',
    createdAt: '2025-01-10T09:00:00Z',
    lastUsedAt: '2026-08-27T08:12:00Z'
  },
  {
    id: 'key_test_sec',
    name: 'Chave Secreta Sandbox',
    key: 'sk_test_55098712345678901234',
    environment: 'sandbox',
    type: 'secret',
    createdAt: '2025-01-10T09:00:00Z',
    lastUsedAt: '2026-08-27T08:12:00Z'
  }
];

export const INITIAL_EVENTS: PaymentEvent[] = [
  {
    id: 'evt_1091',
    type: 'payment.approved',
    paymentIntentId: 'pi_9921_live',
    payload: {
      amount: 899.90,
      acquirer: 'acq_rede',
      method: 'credit_card',
      customer: 'Ana Beatriz Silveira',
      riskScore: 12
    },
    timestamp: '2026-08-27T10:14:23Z'
  },
  {
    id: 'evt_1090',
    type: 'route.selected',
    paymentIntentId: 'pi_9921_live',
    payload: {
      ruleId: 'rule_itau_premium',
      chosenAcquirer: 'acq_rede',
      antifraud: 'clearsale'
    },
    timestamp: '2026-08-27T10:14:21Z'
  },
  {
    id: 'evt_1089',
    type: 'risk.evaluated',
    paymentIntentId: 'pi_9921_live',
    payload: {
      riskScore: 12,
      riskLevel: 'very_low',
      features: { velocity: 98, deviceTrust: 95 }
    },
    timestamp: '2026-08-27T10:14:20Z'
  }
];
