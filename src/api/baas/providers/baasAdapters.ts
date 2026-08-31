export interface BaasRequestPayload {
  amount: number;
  customerEmail: string;
  installments?: number;
  cardNumber?: string;
  dueDate?: string;
}

export interface BaasNormalizedResponse {
  success: boolean;
  transactionId: string;
  provider: string;
  status: string;
  amount: number;
  installments?: number;
  installmentValue?: number;
  customerEmail: string;
  gatewayReference: string;
  hmacVerified: boolean;
  processedAt: string;
}

export interface BaasProviderAdapter {
  name: string;
  processCreditCard(payload: BaasRequestPayload): BaasNormalizedResponse;
  processBoleto(payload: BaasRequestPayload): BaasNormalizedResponse;
  processPixParcelado(payload: BaasRequestPayload): BaasNormalizedResponse;
}

export const asaasAdapter: BaasProviderAdapter = {
  name: 'Asaas BaaS SPI v3',
  processCreditCard(payload) {
    const id = `asaas_cc_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Asaas',
      status: 'authorized',
      amount: payload.amount,
      installments: payload.installments || 1,
      installmentValue: Number((payload.amount / (payload.installments || 1)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `ASAAS-TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processBoleto(payload) {
    const id = `asaas_bol_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Asaas',
      status: 'registered',
      amount: payload.amount,
      customerEmail: payload.customerEmail,
      gatewayReference: `ASAAS-BOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processPixParcelado(payload) {
    const id = `asaas_pix_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Asaas',
      status: 'guaranteed_by_spi',
      amount: payload.amount,
      installments: payload.installments || 12,
      installmentValue: Number((payload.amount / (payload.installments || 12)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `ASAAS-SPI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  }
};

export const iuguAdapter: BaasProviderAdapter = {
  name: 'Iugu Banking Core',
  processCreditCard(payload) {
    const id = `iugu_cc_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Iugu',
      status: 'captured',
      amount: payload.amount,
      installments: payload.installments || 1,
      installmentValue: Number((payload.amount / (payload.installments || 1)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `IUGU-PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processBoleto(payload) {
    const id = `iugu_bol_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Iugu',
      status: 'bank_slip_pending',
      amount: payload.amount,
      customerEmail: payload.customerEmail,
      gatewayReference: `IUGU-SLIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processPixParcelado(payload) {
    const id = `iugu_pix_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Iugu',
      status: 'pix_guaranteed',
      amount: payload.amount,
      installments: payload.installments || 12,
      installmentValue: Number((payload.amount / (payload.installments || 12)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `IUGU-PIX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  }
};

export const junoAdapter: BaasProviderAdapter = {
  name: 'Juno / Billing Engine',
  processCreditCard(payload) {
    const id = `juno_cc_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Juno',
      status: 'settled',
      amount: payload.amount,
      installments: payload.installments || 1,
      installmentValue: Number((payload.amount / (payload.installments || 1)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `JUNO-CC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processBoleto(payload) {
    const id = `juno_bol_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Juno',
      status: 'registered_juno',
      amount: payload.amount,
      customerEmail: payload.customerEmail,
      gatewayReference: `JUNO-BOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  },
  processPixParcelado(payload) {
    const id = `juno_pix_${Date.now()}`;
    return {
      success: true,
      transactionId: id,
      provider: 'Juno',
      status: 'pix_credit_juno',
      amount: payload.amount,
      installments: payload.installments || 12,
      installmentValue: Number((payload.amount / (payload.installments || 12)).toFixed(2)),
      customerEmail: payload.customerEmail,
      gatewayReference: `JUNO-SPI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      hmacVerified: true,
      processedAt: new Date().toISOString()
    };
  }
};

export function getBaasAdapter(providerName?: string): BaasProviderAdapter {
  if (!providerName) return asaasAdapter;
  const lower = providerName.toLowerCase();
  if (lower.includes('iugu')) return iuguAdapter;
  if (lower.includes('juno')) return junoAdapter;
  return asaasAdapter;
}
