/**
 * RewardEngine.ts
 * Monitors transaction completion events and automatically triggers discount applications 
 * or rebate logic once a user/tenant hits predefined tier-based milestones.
 */

export interface CashbackTierConfig {
  id: string;
  name: string;
  targetVolumeBrl: number;
  minTransactions: number;
  cashbackPercent: number;
  bonusFixedBrl: number;
  feeDiscountPercent: number;
  prizeTitle: string;
  active: boolean;
}

export interface UserRewardStatus {
  userId: string;
  userName: string;
  currentVolumeBrl: number;
  currentTransactions: number;
  currentTierId: string;
  status: 'EM_PROGRESSO' | 'META_ATINGIDA' | 'PAGO' | 'EXPIRADO';
  cashbackEarnedBrl: number;
  prizeWon?: string;
  feeDiscountApplied?: number;
  lastUpdated: string;
  alertDispatched90Percent: boolean;
}

export interface RewardEventLog {
  eventId: string;
  userId: string;
  eventType: 'MILESTONE_REACHED' | 'DISCOUNT_APPLIED' | 'REBATE_CREDITED' | 'ALERT_90_PERCENT_DISPATCHED';
  tierName: string;
  amountBrl: number;
  timestamp: string;
  details: string;
}

class RewardEngineService {
  private tiers: CashbackTierConfig[] = [
    {
      id: 'tier_bronze',
      name: 'Bronze Starter',
      targetVolumeBrl: 10000,
      minTransactions: 30,
      cashbackPercent: 1.0,
      bonusFixedBrl: 50,
      feeDiscountPercent: 0.15,
      prizeTitle: 'Certificado de Início + R$ 50 Crédito',
      active: true
    },
    {
      id: 'tier_silver',
      name: 'Silver Growth',
      targetVolumeBrl: 50000,
      minTransactions: 100,
      cashbackPercent: 2.5,
      bonusFixedBrl: 250,
      feeDiscountPercent: 0.35,
      prizeTitle: 'Troféu Destaque Silver + R$ 250 Crédito + 0.35% OFF MDR',
      active: true
    },
    {
      id: 'tier_gold',
      name: 'Gold Scale',
      targetVolumeBrl: 100000,
      minTransactions: 250,
      cashbackPercent: 3.5,
      bonusFixedBrl: 750,
      feeDiscountPercent: 0.65,
      prizeTitle: 'Placa Ouro + R$ 750 Crédito + 0.65% Desconto em Vendas',
      active: true
    },
    {
      id: 'tier_diamond',
      name: 'Black Diamond VIP',
      targetVolumeBrl: 250000,
      minTransactions: 500,
      cashbackPercent: 5.0,
      bonusFixedBrl: 2500,
      feeDiscountPercent: 1.00,
      prizeTitle: 'Kit VIP POS Android Smart + R$ 2.500 + 1.00% Desconto Transacional',
      active: true
    }
  ];

  private userStore: Map<string, UserRewardStatus> = new Map([
    [
      'usr_m01',
      {
        userId: 'usr_m01',
        userName: 'Maycon Quevedo (Neer Store Matriz)',
        currentVolumeBrl: 64250.00,
        currentTransactions: 142,
        currentTierId: 'tier_silver',
        status: 'META_ATINGIDA',
        cashbackEarnedBrl: 1856.25,
        prizeWon: 'Troféu Destaque Silver + R$ 250 Crédito',
        feeDiscountApplied: 0.35,
        lastUpdated: new Date().toISOString(),
        alertDispatched90Percent: true
      }
    ]
  ]);

  private eventLogs: RewardEventLog[] = [
    {
      eventId: 'rew_evt_101',
      userId: 'usr_m01',
      eventType: 'DISCOUNT_APPLIED',
      tierName: 'Silver Growth',
      amountBrl: 225.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      details: 'Aplicado desconto automático de 0.35% no MDR da transação pi_102'
    }
  ];

  /**
   * Evaluates a completed transaction for a user and updates milestone tracking & rebates
   */
  public evaluateTransactionCompletion(userId: string, userName: string, transactionAmountBrl: number): {
    tierUpdated: boolean;
    newTierName?: string;
    discountAppliedBrl: number;
    milestoneReached: boolean;
    alert90Triggered: boolean;
  } {
    let user = this.userStore.get(userId);
    if (!user) {
      user = {
        userId,
        userName,
        currentVolumeBrl: 0,
        currentTransactions: 0,
        currentTierId: 'tier_bronze',
        status: 'EM_PROGRESSO',
        cashbackEarnedBrl: 0,
        lastUpdated: new Date().toISOString(),
        alertDispatched90Percent: false
      };
    }

    const previousVolume = user.currentVolumeBrl;
    user.currentVolumeBrl += transactionAmountBrl;
    user.currentTransactions += 1;
    user.lastUpdated = new Date().toISOString();

    // Determine current applicable tier based on volume & transactions
    let matchedTier = this.tiers[0];
    for (const t of this.tiers) {
      if (user.currentVolumeBrl >= t.targetVolumeBrl && user.currentTransactions >= t.minTransactions) {
        matchedTier = t;
      }
    }

    const tierChanged = matchedTier.id !== user.currentTierId;
    user.currentTierId = matchedTier.id;

    // Calculate cashback earned for this transaction
    const transactionCashback = +(transactionAmountBrl * (matchedTier.cashbackPercent / 100)).toFixed(2);
    user.cashbackEarnedBrl += transactionCashback;

    let milestoneReached = false;
    let discountAppliedBrl = +(transactionAmountBrl * (matchedTier.feeDiscountPercent / 100)).toFixed(2);

    if (tierChanged || (previousVolume < matchedTier.targetVolumeBrl && user.currentVolumeBrl >= matchedTier.targetVolumeBrl)) {
      user.status = 'META_ATINGIDA';
      user.prizeWon = matchedTier.prizeTitle;
      user.feeDiscountApplied = matchedTier.feeDiscountPercent;
      milestoneReached = true;

      this.eventLogs.unshift({
        eventId: `rew_evt_${Date.now()}`,
        userId,
        eventType: 'MILESTONE_REACHED',
        tierName: matchedTier.name,
        amountBrl: matchedTier.bonusFixedBrl,
        timestamp: new Date().toISOString(),
        details: `Usuário atingiu o tier ${matchedTier.name} com R$ ${user.currentVolumeBrl.toFixed(2)} de volume`
      });
    }

    // Check 90% threshold alert
    let alert90Triggered = false;
    const nextTierIndex = this.tiers.findIndex(t => t.id === matchedTier.id) + 1;
    if (nextTierIndex < this.tiers.length) {
      const nextTier = this.tiers[nextTierIndex];
      const threshold90 = nextTier.targetVolumeBrl * 0.9;
      if (user.currentVolumeBrl >= threshold90 && !user.alertDispatched90Percent) {
        user.alertDispatched90Percent = true;
        alert90Triggered = true;

        this.eventLogs.unshift({
          eventId: `rew_evt_${Date.now()}_90`,
          userId,
          eventType: 'ALERT_90_PERCENT_DISPATCHED',
          tierName: nextTier.name,
          amountBrl: nextTier.targetVolumeBrl - user.currentVolumeBrl,
          timestamp: new Date().toISOString(),
          details: `Alerta disparado: Usuário atingiu 90% da meta para o tier ${nextTier.name}`
        });
      }
    }

    // Log discount application
    this.eventLogs.unshift({
      eventId: `rew_evt_disc_${Date.now()}`,
      userId,
      eventType: 'DISCOUNT_APPLIED',
      tierName: matchedTier.name,
      amountBrl: discountAppliedBrl,
      timestamp: new Date().toISOString(),
      details: `Aplicado desconto transacional de ${matchedTier.feeDiscountPercent}% (R$ ${discountAppliedBrl}) na venda de R$ ${transactionAmountBrl.toFixed(2)}`
    });

    this.userStore.set(userId, user);

    return {
      tierUpdated: tierChanged,
      newTierName: matchedTier.name,
      discountAppliedBrl,
      milestoneReached,
      alert90Triggered
    };
  }

  public getTiers(): CashbackTierConfig[] {
    return this.tiers;
  }

  public updateTiers(newTiers: CashbackTierConfig[]): void {
    this.tiers = newTiers;
  }

  public getUserStatus(userId: string): UserRewardStatus | undefined {
    return this.userStore.get(userId);
  }

  public getAllUserStatuses(): UserRewardStatus[] {
    return Array.from(this.userStore.values());
  }

  public getEventLogs(): RewardEventLog[] {
    return this.eventLogs;
  }
}

export const RewardEngine = new RewardEngineService();
