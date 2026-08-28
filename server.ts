import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// In-memory store for webhook events and gateway telemetry
interface InboundWebhookLog {
  id: string;
  source: string; // 'mercadolivre' | 'mercadopago' | 'stripe' | 'adyen' | 'cielo' | 'asaas' | 'pix_bacen' | 'generic';
  event: string;
  headers: Record<string, string>;
  payload: any;
  status: 'processed' | 'risk_flagged' | 'failed';
  riskScore: number;
  processedAt: string;
  signatureValid: boolean;
  ip: string;
}

const webhookLogs: InboundWebhookLog[] = [
  {
    id: 'wh_ml_initial_1',
    source: 'mercadolivre',
    event: 'payment.updated',
    headers: { 'x-signature': 'ts=1724750000,v1=9a8b7c6d5e4f3a2b1c', 'user-agent': 'MercadoLibre-Webhook/2.0' },
    payload: {
      id: 1294819028,
      live_mode: true,
      type: 'payment',
      date_created: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user_id: 48192841,
      api_version: 'v1',
      action: 'payment.updated',
      data: { id: '9481928412' }
    },
    status: 'processed',
    riskScore: 14,
    processedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    signatureValid: true,
    ip: '186.230.12.44'
  },
  {
    id: 'wh_pix_initial_2',
    source: 'pix_bacen',
    event: 'pix.received',
    headers: { 'x-bacen-spi-id': 'SPI-BACEN-BR-8819', 'x-signature-sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    payload: {
      endToEndId: 'E00038166202408271500Nercash09128',
      txid: 'nercash_tx_998124',
      valor: '350.00',
      horario: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      pagador: {
        cpf: '***.491.829-**',
        nome: 'JULIANA PEREIRA LIMA'
      }
    },
    status: 'processed',
    riskScore: 4,
    processedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    signatureValid: true,
    ip: '200.143.19.120'
  }
];

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper to simulate risk score calculation
function calculateFastRisk(payload: any, source: string): { score: number; level: string } {
  let score = 12;
  const str = JSON.stringify(payload).toLowerCase();
  
  if (str.includes('tor') || str.includes('vpn') || str.includes('fraud')) score += 55;
  if (payload.amount && Number(payload.amount) > 5000) score += 20;
  if (source === 'pix_bacen') score = Math.max(2, score - 10);
  if (source === 'mercadolivre') score = Math.min(85, score + 5);

  const finalScore = Math.min(99, Math.max(1, score));
  let level = 'very_low';
  if (finalScore > 75) level = 'critical';
  else if (finalScore > 50) level = 'high';
  else if (finalScore > 25) level = 'moderate';
  else if (finalScore > 10) level = 'low';

  return { score: finalScore, level };
}

// ----------------------------------------------------
// 1. HEALTH & API GATEWAY TELEMETRY ROUTES
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    gateway: 'Nercash Decision Engine v3.2',
    pciLevel: 1,
    microservices: {
      ingressGateway: { status: 'healthy', latencyMs: 14, region: 'sa-east-1 (São Paulo)' },
      mlRiskEngine: { status: 'healthy', latencyMs: 22, model: 'XGBoost v2.4' },
      spiBacenPix: { status: 'healthy', latencyMs: 35, protocol: 'ISO-20022' },
      webhookDispatcher: { status: 'healthy', queueLag: 0 }
    }
  });
});

app.get('/api/v1/gateway/stats', (req, res) => {
  res.json({
    uptimePercentage: 99.994,
    avgLatencyMs: 18,
    p99LatencyMs: 42,
    activeTps: 1420,
    totalWebhooksProcessed: webhookLogs.length,
    sslStatus: 'TLS 1.3 Strict / HSTS Encrypted',
    activeAcquirersCount: 6,
    healthyAcquirersCount: 6
  });
});

// ----------------------------------------------------
// 2. EXTERNAL PAYMENT WEBHOOK RECEIVER ROUTES
// ----------------------------------------------------

// 2.1 Mercado Livre / Mercado Pago Inbound Webhook
app.post('/api/v1/webhooks/mercadolivre', (req, res) => {
  const headers = req.headers as Record<string, string>;
  const payload = req.body;
  const signature = headers['x-signature'] || headers['x-meli-signature'] || 'simulated_valid_hmac';
  const isValidSignature = Boolean(signature);

  const { score, level } = calculateFastRisk(payload, 'mercadolivre');
  const logEntry: InboundWebhookLog = {
    id: `wh_ml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    source: 'mercadolivre',
    event: payload.action || payload.topic || 'payment.updated',
    headers,
    payload,
    status: score >= 75 ? 'risk_flagged' : 'processed',
    riskScore: score,
    processedAt: new Date().toISOString(),
    signatureValid: isValidSignature,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  };

  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 100) webhookLogs.pop();

  res.status(200).json({
    received: true,
    webhookId: logEntry.id,
    source: 'mercadolivre',
    event: logEntry.event,
    riskEvaluation: { score, level },
    actionTaken: score >= 75 ? 'routed_to_fraud_review' : 'payment_acknowledged',
    timestamp: logEntry.processedAt
  });
});

// 2.2 Mercado Pago Direct Webhook
app.post('/api/v1/webhooks/mercadopago', (req, res) => {
  const headers = req.headers as Record<string, string>;
  const payload = req.body;
  const { score, level } = calculateFastRisk(payload, 'mercadopago');

  const logEntry: InboundWebhookLog = {
    id: `wh_mp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    source: 'mercadopago',
    event: payload.type || payload.action || 'payment.created',
    headers,
    payload,
    status: score >= 75 ? 'risk_flagged' : 'processed',
    riskScore: score,
    processedAt: new Date().toISOString(),
    signatureValid: true,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  };

  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 100) webhookLogs.pop();

  res.status(200).json({
    received: true,
    webhookId: logEntry.id,
    source: 'mercadopago',
    riskEvaluation: { score, level },
    status: 'acknowledged'
  });
});

// 2.3 Stripe Inbound Webhook
app.post('/api/v1/webhooks/stripe', (req, res) => {
  const headers = req.headers as Record<string, string>;
  const payload = req.body;
  const { score, level } = calculateFastRisk(payload, 'stripe');

  const logEntry: InboundWebhookLog = {
    id: `wh_stripe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    source: 'stripe',
    event: payload.type || 'payment_intent.succeeded',
    headers,
    payload,
    status: score >= 75 ? 'risk_flagged' : 'processed',
    riskScore: score,
    processedAt: new Date().toISOString(),
    signatureValid: true,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1'
  };

  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 100) webhookLogs.pop();

  res.status(200).json({
    received: true,
    webhookId: logEntry.id,
    source: 'stripe',
    riskEvaluation: { score, level },
    stripeEventType: payload.type
  });
});

// 2.4 Asaas / Cielo / Adyen / Pix Bacen Webhooks
app.post('/api/v1/webhooks/asaas', (req, res) => {
  const payload = req.body;
  const { score, level } = calculateFastRisk(payload, 'asaas');
  const logEntry: InboundWebhookLog = {
    id: `wh_asaas_${Date.now()}`,
    source: 'asaas',
    event: payload.event || 'PAYMENT_RECEIVED',
    headers: req.headers as Record<string, string>,
    payload,
    status: 'processed',
    riskScore: score,
    processedAt: new Date().toISOString(),
    signatureValid: true,
    ip: req.ip || '127.0.0.1'
  };
  webhookLogs.unshift(logEntry);
  res.status(200).json({ received: true, id: logEntry.id });
});

app.post('/api/v1/webhooks/pix-bacen', (req, res) => {
  const payload = req.body;
  const logEntry: InboundWebhookLog = {
    id: `wh_pix_${Date.now()}`,
    source: 'pix_bacen',
    event: 'pix.received',
    headers: req.headers as Record<string, string>,
    payload,
    status: 'processed',
    riskScore: 3,
    processedAt: new Date().toISOString(),
    signatureValid: true,
    ip: req.ip || '127.0.0.1'
  };
  webhookLogs.unshift(logEntry);
  res.status(200).json({ received: true, spiSettled: true, endToEndId: payload.endToEndId || 'E2E-AUTO' });
});

// Generic Inbound Webhook Endpoint
app.post('/api/v1/webhooks/inbound', (req, res) => {
  const source = (req.query.source as string) || 'generic';
  const payload = req.body;
  const { score, level } = calculateFastRisk(payload, source);

  const logEntry: InboundWebhookLog = {
    id: `wh_gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    source,
    event: req.query.event as string || payload.event || payload.type || 'transaction.notification',
    headers: req.headers as Record<string, string>,
    payload,
    status: score >= 75 ? 'risk_flagged' : 'processed',
    riskScore: score,
    processedAt: new Date().toISOString(),
    signatureValid: true,
    ip: req.ip || '127.0.0.1'
  };

  webhookLogs.unshift(logEntry);
  if (webhookLogs.length > 100) webhookLogs.pop();

  res.status(200).json({
    success: true,
    message: `Webhook successfully ingested by Nercash Gateway (${source})`,
    webhookId: logEntry.id,
    riskScore: score,
    riskLevel: level
  });
});

// Retrieve Webhook Ingestion Logs
app.get('/api/v1/webhooks/logs', (req, res) => {
  res.json({
    total: webhookLogs.length,
    logs: webhookLogs
  });
});

// External Payment Processing REST API
app.post('/api/v1/payments/process', (req, res) => {
  const { amount, currency = 'BRL', method = 'credit_card', customer, orderId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount_invalid', message: 'Valor da transação obrigatório e maior que zero.' });
  }

  const riskScore = 15 + Math.floor(Math.random() * 20);
  const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  res.status(201).json({
    id: paymentIntentId,
    status: 'approved',
    amount: Number(amount),
    currency,
    method,
    orderId: orderId || `order_${Date.now()}`,
    selectedAcquirer: method === 'pix' ? 'SPI Bacen Instant' : 'Stone Pagar.me Gateway',
    riskScore,
    riskLevel: 'low',
    processedAt: new Date().toISOString(),
    receiptUrl: `https://nercash.io/receipt/${paymentIntentId}`
  });
});

// ----------------------------------------------------
// 3. VITE MIDDLEWARE & SERVER BOOTSTRAP
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nercash Full-Stack Gateway running on http://localhost:${PORT}`);
  });
}

startServer();
