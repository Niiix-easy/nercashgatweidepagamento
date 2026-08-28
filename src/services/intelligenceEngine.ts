import { 
  PaymentIntent, 
  Acquirer, 
  RoutingRule, 
  PaymentMethodType, 
  AttemptLog 
} from '../types/payment';

export interface DecisionResult {
  riskScore: number;
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'critical';
  riskFeatures: {
    velocityScore: number;
    deviceTrust: number;
    geoDiscrepancy: boolean;
    cardBinRisk: number;
    behavioralAnomalies: string[];
  };
  recommendedMethod: PaymentMethodType;
  methodPriorityOrder: PaymentMethodType[];
  selectedAcquirer: Acquirer;
  selectedAntifraud: 'clearsale' | 'konduto' | 'internal_ml' | 'none';
  appliedRule?: RoutingRule;
  fallbackChain: Acquirer[];
}

export class PaymentIntelligenceEngine {
  /**
   * 1. Extração de Features e Score de Risco (Simulação do modelo Gradient Boosting XGBoost/LightGBM)
   */
  public static evaluateRisk(params: {
    amount: number;
    customerEmail: string;
    customerDocument: string;
    cardNumber?: string;
    installments?: number;
    isVpnDetected?: boolean;
    deviceKnown?: boolean;
    recentAttemptsCount?: number;
  }) {
    let baseScore = 10;
    const anomalies: string[] = [];

    // Feature: Valor vs Limite estatístico
    if (params.amount > 2000) {
      baseScore += 25;
      anomalies.push('Ticket elevado (> R$ 2.000,00)');
    } else if (params.amount > 800) {
      baseScore += 10;
    }

    // Feature: Parcelamento
    if (params.installments && params.installments >= 10) {
      baseScore += 12;
      anomalies.push('Parcelamento alto (10x a 12x)');
    }

    // Feature: Dispositivo e VPN
    if (params.isVpnDetected) {
      baseScore += 35;
      anomalies.push('Conexão por VPN/Proxy anônimo');
    }

    if (params.deviceKnown === false) {
      baseScore += 15;
      anomalies.push('Dispositivo inédito no histórico');
    }

    // Feature: Frequência/Velocidade
    if (params.recentAttemptsCount && params.recentAttemptsCount > 2) {
      baseScore += 30;
      anomalies.push('Múltiplas tentativas em janela curta');
    }

    // Feature: BIN do cartão
    let cardBinRisk = 10;
    if (params.cardNumber) {
      const cleanCard = params.cardNumber.replace(/\D/g, '');
      if (cleanCard.startsWith('4000') || cleanCard.startsWith('5100')) {
        cardBinRisk = 5; // BIN altamente confiável
      } else if (cleanCard.startsWith('6062') || cleanCard.startsWith('5041')) {
        cardBinRisk = 25; // Cartões virtuais ou pré-pagos
        baseScore += 15;
        anomalies.push('BIN de cartão virtual/pré-pago');
      }
    }

    const finalScore = Math.min(100, Math.max(1, baseScore));

    let riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'critical' = 'very_low';
    if (finalScore >= 75) riskLevel = 'critical';
    else if (finalScore >= 55) riskLevel = 'high';
    else if (finalScore >= 35) riskLevel = 'moderate';
    else if (finalScore >= 18) riskLevel = 'low';

    return {
      riskScore: finalScore,
      riskLevel,
      riskFeatures: {
        velocityScore: Math.max(10, 100 - (params.recentAttemptsCount || 0) * 20),
        deviceTrust: params.deviceKnown ? 95 : (params.isVpnDetected ? 30 : 65),
        geoDiscrepancy: !!params.isVpnDetected,
        cardBinRisk,
        behavioralAnomalies: anomalies
      }
    };
  }

  /**
   * 2. Seletor de Métodos Inteligente (Method Selector)
   */
  public static selectMethodOrder(riskScore: number, amount: number): {
    recommended: PaymentMethodType;
    order: PaymentMethodType[];
  } {
    if (riskScore > 65) {
      // Alto risco: prioriza PIX com liquidação garantida e zero chargeback
      return {
        recommended: 'pix',
        order: ['pix', 'boleto', 'wallet', 'credit_card']
      };
    }

    if (amount <= 150) {
      // Micro-transações: PIX com 1 clique tem maior conversão
      return {
        recommended: 'pix',
        order: ['pix', 'credit_card', 'wallet', 'boleto']
      };
    }

    // Padrão: Cartão de Crédito e PIX destacados
    return {
      recommended: 'credit_card',
      order: ['credit_card', 'pix', 'wallet', 'boleto']
    };
  }

  /**
   * 3. Motor de Decisão Completo (Decision Pipeline)
   */
  public static decide(params: {
    amount: number;
    method: PaymentMethodType;
    customerEmail: string;
    customerDocument: string;
    cardNumber?: string;
    installments?: number;
    rules: RoutingRule[];
    acquirers: Acquirer[];
    isVpnDetected?: boolean;
    deviceKnown?: boolean;
  }): DecisionResult {
    // 1. Avalia Risco
    const risk = this.evaluateRisk(params);

    // 2. Ordena métodos
    const methodChoice = this.selectMethodOrder(risk.riskScore, params.amount);

    // 3. Extrai BIN e Banco Emissor
    let binBank: string | undefined;
    let cardBrand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | undefined;
    if (params.cardNumber) {
      const clean = params.cardNumber.replace(/\D/g, '');
      if (clean.startsWith('4')) cardBrand = 'visa';
      else if (clean.startsWith('5')) cardBrand = 'mastercard';
      else if (clean.startsWith('6')) cardBrand = 'elo';
      else if (clean.startsWith('3')) cardBrand = 'amex';

      // Simulação de banco por BIN
      if (clean.startsWith('4000') || clean.startsWith('341')) binBank = '341'; // Itaú
      else if (clean.startsWith('5100') || clean.startsWith('237')) binBank = '237'; // Bradesco
      else if (clean.startsWith('5041') || clean.startsWith('260')) binBank = '260'; // Nubank
    }

    // 4. Avalia Regras de Roteamento (ordenadas por prioridade desc)
    const activeRules = [...params.rules]
      .filter(r => r.active)
      .sort((a, b) => b.priority - a.priority);

    let appliedRule: RoutingRule | undefined;

    for (const rule of activeRules) {
      const c = rule.condition;
      let matches = true;

      if (c.method && c.method !== params.method) matches = false;
      if (c.binBank && binBank && c.binBank !== binBank) matches = false;
      if (c.minAmount && params.amount < c.minAmount) matches = false;
      if (c.maxAmount && params.amount > c.maxAmount) matches = false;
      if (c.cardBrand && cardBrand && c.cardBrand !== cardBrand) matches = false;
      if (c.installmentsGt && (!params.installments || params.installments <= c.installmentsGt)) matches = false;

      if (matches) {
        appliedRule = rule;
        break;
      }
    }

    // 5. Seleciona adquirente primário e fallback chain
    let selectedAcquirerId = appliedRule?.action.primaryAcquirerId;
    let fallbackIds = appliedRule?.action.fallbackChain || [];
    let selectedAntifraud = appliedRule?.action.antifraudProvider || (risk.riskScore > 35 ? 'clearsale' : 'internal_ml');

    // Se nenhuma regra customizada casou, usa melhor adquirente por método e saúde
    if (!selectedAcquirerId) {
      const availableAcquirers = params.acquirers
        .filter(a => a.supportedMethods.includes(params.method) && a.healthStatus !== 'down')
        .sort((a, b) => {
          // Ordena por saúde, menor taxa e menor latência
          if (a.healthStatus === 'up' && b.healthStatus !== 'up') return -1;
          if (b.healthStatus === 'up' && a.healthStatus !== 'up') return 1;
          return (a.feePercentage + a.latencyMs / 1000) - (b.feePercentage + b.latencyMs / 1000);
        });

      if (availableAcquirers.length > 0) {
        selectedAcquirerId = availableAcquirers[0].id;
        fallbackIds = availableAcquirers.slice(1).map(a => a.id);
      } else {
        selectedAcquirerId = params.acquirers[0]?.id || 'acq_stone';
      }
    }

    const primaryAcquirer = params.acquirers.find(a => a.id === selectedAcquirerId) || params.acquirers[0];
    const fallbackChain = fallbackIds
      .map(id => params.acquirers.find(a => a.id === id))
      .filter((a): a is Acquirer => !!a);

    return {
      riskScore: risk.riskScore,
      riskLevel: risk.riskLevel,
      riskFeatures: risk.riskFeatures,
      recommendedMethod: methodChoice.recommended,
      methodPriorityOrder: methodChoice.order,
      selectedAcquirer: primaryAcquirer,
      selectedAntifraud,
      appliedRule,
      fallbackChain
    };
  }

  /**
   * 4. Simulação de Execução com Orquestração & Circuit Breaker Failover
   */
  public static async executeTransactionWithOrchestration(
    decision: DecisionResult,
    simulateErrorType?: 'none' | 'technical_timeout' | 'bank_declined'
  ): Promise<{
    status: 'approved' | 'declined' | 'failed';
    attempts: AttemptLog[];
    finalAcquirer: Acquirer;
  }> {
    const attempts: AttemptLog[] = [];
    const chainToTry = [decision.selectedAcquirer, ...decision.fallbackChain];

    for (let i = 0; i < chainToTry.length; i++) {
      const currentAcquirer = chainToTry[i];
      const attemptNumber = i + 1;

      // Se circuit breaker disparado ou status down, pula automaticamente
      if (currentAcquirer.healthStatus === 'down' || currentAcquirer.circuitBreakerTripped) {
        attempts.push({
          attemptNumber,
          acquirerId: currentAcquirer.id,
          acquirerName: currentAcquirer.name,
          timestamp: new Date().toISOString(),
          status: 'technical_error',
          latencyMs: 50,
          errorCode: 'CIRCUIT_BREAKER_OPEN',
          errorMessage: 'Circuit breaker ativo - tráfego desviado preventivamente'
        });
        continue;
      }

      // Se simular erro na 1ª tentativa
      if (i === 0 && simulateErrorType === 'technical_timeout') {
        attempts.push({
          attemptNumber,
          acquirerId: currentAcquirer.id,
          acquirerName: currentAcquirer.name,
          timestamp: new Date().toISOString(),
          status: 'technical_error',
          latencyMs: 1100,
          errorCode: 'ERR_UPSTREAM_TIMEOUT',
          errorMessage: `Timeout de resposta em ${currentAcquirer.name} (> 1000ms). Iniciando Failover automático.`
        });
        continue; // Passa para o próximo da fallback chain
      }

      if (simulateErrorType === 'bank_declined') {
        // Recusa de banco: NÃO faz failover para evitar spam/fraude
        attempts.push({
          attemptNumber,
          acquirerId: currentAcquirer.id,
          acquirerName: currentAcquirer.name,
          timestamp: new Date().toISOString(),
          status: 'declined',
          latencyMs: currentAcquirer.latencyMs,
          errorCode: 'BANK_DECLINED_FUNDS_OR_RISK',
          errorMessage: 'Recusa definitiva do banco emissor. Failover bloqueado.'
        });
        return {
          status: 'declined',
          attempts,
          finalAcquirer: currentAcquirer
        };
      }

      // Sucesso
      attempts.push({
        attemptNumber,
        acquirerId: currentAcquirer.id,
        acquirerName: currentAcquirer.name,
        timestamp: new Date().toISOString(),
        status: 'approved',
        latencyMs: currentAcquirer.latencyMs + Math.floor(Math.random() * 40 - 20)
      });

      return {
        status: 'approved',
        attempts,
        finalAcquirer: currentAcquirer
      };
    }

    // Se esgotou a cadeia sem sucesso
    return {
      status: 'failed',
      attempts,
      finalAcquirer: decision.selectedAcquirer
    };
  }
}
