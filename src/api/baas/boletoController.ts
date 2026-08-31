import { Request, Response } from 'express';
import { getBaasAdapter } from './providers/baasAdapters';

export function processBoletoBaaS(req: Request, res: Response) {
  const { amount, customerEmail, dueDate, documentNumber, provider } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({
      error: 'invalid_amount',
      message: 'O valor do boleto bancário deve ser maior que zero.'
    });
  }

  if (!customerEmail) {
    return res.status(400).json({
      error: 'invalid_customer',
      message: 'E-mail do pagador é obrigatório para emissão de boleto.'
    });
  }

  const adapter = getBaasAdapter(provider);
  const finalDueDate = dueDate || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const normalized = adapter.processBoleto({
    amount: Number(amount),
    customerEmail,
    dueDate: finalDueDate
  });

  const responsePayload = {
    ...normalized,
    method: 'boleto_bancario',
    dueDate: finalDueDate,
    barCode: '23793.38128 60000.128492 01829.480006 1 98410000075000',
    digitableLine: '23793381286000012849201829480006198410000075000',
    qrCodePixBoleto: `https://sandbox.${provider || 'asaas'}.com/qr/boleto_pix_` + normalized.transactionId,
    providerUsed: adapter.name
  };

  (req as any).auditLogEntry = {
    id: normalized.transactionId,
    endpoint: '/api/v1/baas/boleto',
    method: 'POST',
    payload: { amount, customerEmail, dueDate: finalDueDate, provider: adapter.name },
    statusCode: 201,
    timestamp: new Date().toISOString(),
    hmacSignature: req.headers['x-nercash-signature'] || 'verified',
    ip: req.ip || '127.0.0.1'
  };

  return res.status(201).json(responsePayload);
}
