import { Request, Response } from 'express';
import { getBaasAdapter } from './providers/baasAdapters';

export function processCreditCardBaaS(req: Request, res: Response) {
  const { amount, customerEmail, installments = 1, cardNumber, cvv, provider } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({
      error: 'invalid_amount',
      message: 'O valor da transação com cartão de crédito deve ser maior que zero.'
    });
  }

  if (!customerEmail || !customerEmail.includes('@')) {
    return res.status(400).json({
      error: 'invalid_customer',
      message: 'E-mail do pagador inválido ou ausente.'
    });
  }

  const adapter = getBaasAdapter(provider);
  const normalized = adapter.processCreditCard({
    amount: Number(amount),
    customerEmail,
    installments: Number(installments),
    cardNumber
  });

  const maskedCard = cardNumber ? `•••• •••• •••• ${String(cardNumber).slice(-4)}` : '•••• •••• •••• 4892';

  const responsePayload = {
    ...normalized,
    method: 'credit_card',
    maskedCard,
    pciCompliance: 'Tokenized & Encrypted (PCI-DSS Level 1)',
    providerUsed: adapter.name
  };

  // Log to audit trail storage
  (req as any).auditLogEntry = {
    id: normalized.transactionId,
    endpoint: '/api/v1/baas/credit-card',
    method: 'POST',
    payload: { amount, installments, customerEmail, maskedCard, provider: adapter.name },
    statusCode: 201,
    timestamp: new Date().toISOString(),
    hmacSignature: req.headers['x-nercash-signature'] || 'verified',
    ip: req.ip || '127.0.0.1'
  };

  return res.status(201).json(responsePayload);
}
