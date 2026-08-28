export type PaymentStatus = 'created' | 'processing' | 'approved' | 'declined' | 'refunded' | 'failed';

export type PaymentMethodType = 'pix' | 'credit_card' | 'boleto' | 'wallet';

export interface Customer {
  id: string;
  name: string;
  email: string;
  document: string; // CPF or CNPJ
  phone: string;
  riskProfile: 'low' | 'medium' | 'high';
  lifecycleStage: 'lead' | 'active' | 'at_risk' | 'churn';
  tags: string[];
  ltv: number;
  totalOrders: number;
  preferredMethods: PaymentMethodType[];
  channels: ('whatsapp' | 'email' | 'sms' | 'push')[];
  createdAt: string;
}

export interface Acquirer {
  id: string;
  name: string;
  provider: 'stone' | 'cielo' | 'rede' | 'mercadopago' | 'pix_spi' | 'adyen';
  logoUrl?: string;
  healthStatus: 'up' | 'degraded' | 'down';
  latencyMs: number;
  errorRate1m: number; // percentage (e.g. 2.4%)
  feePercentage: number;
  fixedFee: number;
  priority: number;
  supportedMethods: PaymentMethodType[];
  circuitBreakerTripped: boolean;
  minAmount?: number;
  maxAmount?: number;
}

export interface RoutingCondition {
  binBank?: string; // e.g. "341" for Itaú, "237" for Bradesco, "260" for Nubank
  cardBrand?: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard';
  minAmount?: number;
  maxAmount?: number;
  method?: PaymentMethodType;
  installmentsGt?: number;
}

export interface RoutingRule {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  priority: number;
  active: boolean;
  condition: RoutingCondition;
  action: {
    primaryAcquirerId: string;
    antifraudProvider: 'clearsale' | 'konduto' | 'internal_ml' | 'none';
    fallbackChain: string[]; // List of Acquirer IDs in order
  };
}

export interface AttemptLog {
  attemptNumber: number;
  acquirerId: string;
  acquirerName: string;
  timestamp: string;
  status: 'approved' | 'declined' | 'timeout' | 'technical_error';
  latencyMs: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentIntent {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerEmail: string;
  customer?: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  paymentMethodCandidates: PaymentMethodType[];
  selectedMethod: PaymentMethodType;
  selectedAcquirer?: string;
  selectedAntifraud?: string;
  riskScore: number; // 0 to 100
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'critical';
  riskFeatures: {
    velocityScore: number;
    deviceTrust: number;
    geoDiscrepancy: boolean;
    cardBinRisk: number;
    behavioralAnomalies: string[];
  };
  status: PaymentStatus;
  attempts: AttemptLog[];
  cardBrand?: string;
  cardLast4?: string;
  cardInstallments?: number;
  pixQrCode?: string;
  pixCopyPaste?: string;
  boletoBarcode?: string;
  offersAccepted?: string[];
  tags?: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  type: 
    | 'payment.created'
    | 'risk.evaluated'
    | 'route.selected'
    | 'acquirer.attempt'
    | 'payment.approved'
    | 'payment.declined'
    | 'payment.refunded'
    | 'automation.executed'
    | 'webhook.dispatched';
  paymentIntentId?: string;
  payload: Record<string, any>;
  timestamp: string;
}

export interface AutomationNode {
  id: string;
  type: 
    | 'trigger'
    | 'crm.upsert_contact'
    | 'notification.whatsapp'
    | 'notification.email'
    | 'notification.sms'
    | 'integration.send_nfe'
    | 'condition'
    | 'loyalty.add_points'
    | 'webhook.custom';
  title: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface AutomationEdge {
  id: string;
  from: string;
  to: string;
  conditionBranch?: 'then' | 'else' | 'default';
}

export interface AutomationGraph {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  active: boolean;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  executionCount: number;
  lastExecutedAt?: string;
}

export interface AutomationExecutionLog {
  id: string;
  automationId: string;
  automationName: string;
  triggerEvent: string;
  paymentIntentId?: string;
  status: 'success' | 'failed' | 'partial';
  executedNodes: {
    nodeId: string;
    nodeType: string;
    nodeTitle: string;
    status: 'success' | 'failed' | 'skipped';
    output: string;
    latencyMs: number;
  }[];
  timestamp: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  customDomain: string;
  branding: {
    logoText: string;
    primaryColor: string;
    accentColor: string;
    badgeText: string;
    themeMode: 'light' | 'dark' | 'emerald' | 'indigo';
  };
  checkoutTheme: {
    borderRadius: 'sm' | 'md' | 'lg' | 'full';
    showTrustBadges: boolean;
    enableBumpOffers: boolean;
    defaultDiscountPix: number; // percentage, e.g. 5%
  };
  enabledModules: {
    orchestration: boolean;
    riskScoreMl: boolean;
    adaptiveCheckout: boolean;
    crmAutomation: boolean;
    openApi: boolean;
    whiteLabel: boolean;
  };
  feeTable: {
    pixFeePercent: number;
    creditCardFeePercent: number;
    boletoFlatFee: number;
    splitSharePercent: number; // For reseller / partner
  };
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secretKey: string;
  status: 'active' | 'failing' | 'paused';
  successRate: number;
  createdAt: string;
  lastDispatchedAt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'sandbox' | 'production';
  type: 'publishable' | 'secret';
  status?: 'active' | 'expiring_soon' | 'expired' | 'revoked';
  scopes?: string[];
  expirationPolicy?: '30_days' | '90_days' | '180_days' | '365_days' | 'never';
  expiresAt?: string;
  tenantId?: string;
  tenantName?: string;
  ipWhitelist?: string[];
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    role: string;
    ipAddress: string;
    userAgent: string;
  };
  action: string;
  category: 'auth' | 'api_key' | 'routing_rule' | 'refund' | 'webhook' | 'pci_vault' | 'tenant_config' | 'export' | 'payment';
  resourceType: string;
  resourceId: string;
  status: 'success' | 'warning' | 'denied' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  hashSha256: string;
  metadata?: Record<string, any>;
}

