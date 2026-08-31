import React, { useState } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { LiveWebhookDebugger } from './LiveWebhookDebugger';
import { RateLimitManagement } from './RateLimitManagement';
import { DataSchemaExplorer } from '../sandbox/DataSchemaExplorer';
import { ApiSchemaDiffViewer } from './ApiSchemaDiffViewer';
import { BaaSWebhookSimulator } from './BaaSWebhookSimulator';
import { BaaSErrorCatalog } from './BaaSErrorCatalog';
import { ExtendedWebhookDebugger } from './ExtendedWebhookDebugger';
import { ProviderErrorTranslator } from './ProviderErrorTranslator';
import { WebhookFailureSimulator } from './WebhookFailureSimulator';
import { 
  Code2, 
  Send, 
  Key, 
  Globe, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Terminal, 
  FileCode, 
  Play,
  Lock,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Server,
  ServerCrash,
  Eye,
  Radio,
  Sliders,
  ShieldAlert,
  Database,
  GitCompare,
  BookOpen
} from 'lucide-react';
import { WebhookSubscription } from '../../types/payment';

export const OpenApiDocsSandbox: React.FC = () => {
  const { 
    apiKeys, 
    generateApiKey, 
    webhooks, 
    addWebhook, 
    deleteWebhook, 
    dispatchWebhookSimulation,
    processPaymentIntent
  } = usePayment();

  const [activeTab, setActiveTab] = useState<'docs' | 'keys' | 'webhooks' | 'debugger' | 'ratelimits' | 'schema' | 'diff' | 'baas_webhook_sim' | 'baas_error_catalog' | 'webhook_replay' | 'error_translator' | 'webhook_failure_simulator'>('docs');
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'node' | 'python' | 'php'>('curl');

  // Selected Endpoint for interactive tester
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('POST_payment_intents');
  const [currentRpmUsage, setCurrentRpmUsage] = useState<number>(442);
  const maxRpmQuota = 600;
  const usagePercentage = Math.round((currentRpmUsage / maxRpmQuota) * 100);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`idem_${Math.random().toString(36).substring(2, 10)}`);
  const [simulateHeader, setSimulateHeader] = useState<'none' | 'declined' | 'timeout'>('none');
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    amount: 299.90,
    currency: "BRL",
    customer: {
      name: "Guilherme Sampaio",
      email: "guilherme@empresa.com.br",
      document: "123.456.789-00"
    },
    payment_method: {
      type: "credit_card",
      card_number: "4000 1234 5678 9010",
      installments: 3
    }
  }, null, 2));

  const [isExecutingRequest, setIsExecutingRequest] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // New API Key form
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [newKeyEnv, setNewKeyEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [newKeyType, setNewKeyType] = useState<'publishable' | 'secret'>('secret');

  // New Webhook form
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('');
  const [newWebhookDescription, setNewWebhookDescription] = useState<string>('');
  const [selectedEventsForNewWebhook, setSelectedEventsForNewWebhook] = useState<string[]>([
    'payment.approved',
    'payment.declined',
    'payment.refunded'
  ]);

  // Webhook Testing Console State
  const [testWebhookId, setTestWebhookId] = useState<string>(webhooks[0]?.id || 'wh_01');
  const [testEventType, setTestEventType] = useState<string>('payment.approved');
  const [testCustomUrl, setTestCustomUrl] = useState<string>('https://api.merchant-store.com/v1/webhooks/nercash');
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState<boolean>(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{
    status: number;
    latencyMs: number;
    headers: Record<string, string>;
    payload: any;
    responseBody: string;
    timestamp: string;
  } | null>(null);
  const [signatureLanguage, setSignatureLanguage] = useState<'node' | 'python' | 'php'>('node');
  const [copiedSignature, setCopiedSignature] = useState<boolean>(false);

  // Inbound Webhook Simulator (acquirer/bank sending to Nercash)
  const [inboundProvider, setInboundProvider] = useState<'pix_spi' | 'adyen' | 'stone'>('pix_spi');
  const [isInboundExecuting, setIsInboundExecuting] = useState<boolean>(false);
  const [inboundResult, setInboundResult] = useState<any>(null);

  const AVAILABLE_EVENTS = [
    { id: 'payment.approved', label: 'payment.approved', desc: 'Pagamento aprovado e capturado com sucesso' },
    { id: 'payment.declined', label: 'payment.declined', desc: 'Pagamento recusado pelo adquirente ou banco' },
    { id: 'payment.refunded', label: 'payment.refunded', desc: 'Estorno ou devolução PIX processada' },
    { id: 'payment.created', label: 'payment.created', desc: 'Nova intenção de pagamento iniciada no checkout' },
    { id: 'risk.flagged', label: 'risk.flagged', desc: 'Score de risco ML superou limiar de segurança' },
    { id: 'pix.expired', label: 'pix.expired', desc: 'QR Code PIX expirou sem confirmação do Bacen' },
    { id: 'chargeback.created', label: 'chargeback.created', desc: 'Notificação de contestação aberta pela bandeira' }
  ];

  const handleSendApiRequest = async () => {
    setIsExecutingRequest(true);
    setResponseOutput(null);
    const start = performance.now();

    try {
      if (selectedEndpoint === 'POST_payment_intents') {
        const parsed = JSON.parse(requestBody);
        const intent = await processPaymentIntent({
          amount: Number(parsed.amount) || 299.90,
          method: parsed.payment_method?.type || 'credit_card',
          customerName: parsed.customer?.name || 'Cliente API',
          customerEmail: parsed.customer?.email || 'api@email.com',
          customerDocument: parsed.customer?.document || '000.000.000-00',
          cardNumber: parsed.payment_method?.card_number,
          cardInstallments: parsed.payment_method?.installments || 1,
          simulateError: simulateHeader === 'none' ? 'none' : simulateHeader === 'timeout' ? 'technical_timeout' : 'bank_declined'
        });

        const latency = Math.round(performance.now() - start);
        setResponseLatency(latency);
        setResponseStatus(intent.status === 'approved' ? 200 : 402);
        setResponseOutput({
          object: "payment_intent",
          id: intent.id,
          status: intent.status,
          amount: intent.amount,
          currency: intent.currency,
          selected_acquirer: intent.selectedAcquirer,
          risk_score: intent.riskScore,
          attempts_count: intent.attempts.length,
          created_at: intent.createdAt
        });
      } else {
        await new Promise(r => setTimeout(r, 150));
        setResponseLatency(150);
        setResponseStatus(200);
        setResponseOutput({
          status: "success",
          message: "Endpoint simulado com sucesso na sandbox.",
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setResponseStatus(400);
      setResponseOutput({
        error: {
          type: "invalid_request_error",
          message: err.message || "Erro no JSON enviado"
        }
      });
    } finally {
      setIsExecutingRequest(false);
    }
  };

  // Dispatch interactive webhook test
  const handleTestWebhookDispatch = async () => {
    setIsDispatchingWebhook(true);
    setWebhookTestResult(null);

    const targetWebhook = webhooks.find(w => w.id === testWebhookId);
    const targetUrl = targetWebhook ? targetWebhook.url : testCustomUrl;
    const secretKey = targetWebhook ? targetWebhook.secretKey : 'whsec_demo_99a8b7c6d5e4f3a2b1';

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const payload = {
      id: eventId,
      object: 'event',
      type: testEventType,
      created_at: new Date().toISOString(),
      data: {
        object: {
          id: `pi_${Date.now()}`,
          amount: testEventType === 'payment.refunded' ? 150.00 : 349.90,
          currency: 'BRL',
          status: testEventType === 'payment.approved' ? 'approved' : testEventType === 'payment.declined' ? 'declined' : testEventType === 'payment.refunded' ? 'refunded' : 'processing',
          payment_method: {
            type: testEventType === 'pix.expired' ? 'pix' : 'credit_card',
            card_last4: '4242',
            card_brand: 'Mastercard'
          },
          customer: {
            id: 'cus_88910',
            name: 'Guilherme Sampaio',
            email: 'guilherme@empresa.com.br',
            document: '123.456.789-00'
          },
          risk_score: testEventType === 'risk.flagged' ? 88 : 14,
          acquirer: 'acq_stone',
          metadata: {
            order_id: 'PED-90812',
            platform: 'Nercash Gateway v1'
          }
        }
      }
    };

    const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const signatureHeader = `t=${timestamp},v1=${mockHash}`;

    await new Promise(r => setTimeout(r, 280 + Math.random() * 150));
    const latency = Math.round(35 + Math.random() * 45);

    setWebhookTestResult({
      status: 200,
      latencyMs: latency,
      headers: {
        'User-Agent': 'Nercash-Webhook-Dispatcher/2.0',
        'Content-Type': 'application/json',
        'X-Nercash-Signature': signatureHeader,
        'X-Nercash-Event-Id': eventId,
        'X-Nercash-Timestamp': timestamp
      },
      payload,
      responseBody: JSON.stringify({ received: true, status: 'acknowledged', processed_at: new Date().toISOString() }, null, 2),
      timestamp: new Date().toISOString()
    });

    setIsDispatchingWebhook(false);
  };

  // Inbound webhook handler simulation (connects with backend server routes)
  const handleSimulateInboundWebhook = async () => {
    setIsInboundExecuting(true);
    setInboundResult(null);

    const providerMap: Record<string, { endpoint: string; body: any; name: string }> = {
      mercadolivre: {
        endpoint: '/api/webhooks/mercadolivre',
        name: 'Mercado Livre IPN / Orders API',
        body: {
          resource: `/orders/MLB${Date.now()}`,
          user_id: 129482019,
          topic: 'payment',
          application_id: 'NERCASH_ML_APP_99182',
          attempts: 1,
          sent: new Date().toISOString(),
          received: new Date().toISOString()
        }
      },
      mercadopago: {
        endpoint: '/api/webhooks/mercadopago',
        name: 'Mercado Pago Webhooks v1',
        body: {
          action: 'payment.created',
          api_version: 'v1',
          data: { id: `mp_pay_${Date.now()}` },
          date_created: new Date().toISOString(),
          type: 'payment',
          user_id: '992817263'
        }
      },
      stripe: {
        endpoint: '/api/webhooks/stripe',
        name: 'Stripe Events Inbound',
        body: {
          id: `evt_stripe_${Date.now()}`,
          object: 'event',
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: `pi_stripe_${Date.now()}`,
              amount: 29990,
              currency: 'brl',
              status: 'succeeded'
            }
          }
        }
      },
      asaas: {
        endpoint: '/api/webhooks/asaas',
        name: 'Asaas Cobranças & Pix',
        body: {
          event: 'PAYMENT_RECEIVED',
          payment: {
            id: `pay_asaas_${Date.now()}`,
            customer: 'cus_asaas_8819',
            value: 299.90,
            netValue: 298.91,
            billingType: 'PIX',
            status: 'RECEIVED',
            confirmedDate: new Date().toISOString().split('T')[0]
          }
        }
      },
      pix_spi: {
        endpoint: '/api/webhooks/pix',
        name: 'BACEN SPI / Pix Instantâneo',
        body: {
          endToEndId: `E00038166${Date.now()}99214A00`,
          txId: `tx_spi_${Date.now()}`,
          valor: '299.90',
          horario: new Date().toISOString(),
          infoPagador: 'Pagamento de teste Nercash'
        }
      },
      adyen: {
        endpoint: '/api/webhooks/adyen',
        name: 'Adyen Notification Webhook',
        body: {
          notificationItems: [{
            NotificationRequestItem: {
              eventCode: 'AUTHORISATION',
              merchantAccount: 'NercashECOM',
              merchantReference: `pi_${Date.now()}`,
              pspReference: `8836251782910293`,
              success: 'true',
              amount: { currency: 'BRL', value: 29990 }
            }
          }]
        }
      },
      stone: {
        endpoint: '/api/webhooks/stone',
        name: 'Stone Gateway Callback',
        body: {
          id: `ch_stone_${Date.now()}`,
          status: 'paid',
          amount: 29990,
          captured_at: new Date().toISOString()
        }
      }
    };

    const target = providerMap[inboundProvider] || providerMap['mercadolivre'];

    try {
      // Attempt live POST to Express server
      const response = await fetch(target.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target.body)
      });

      if (response.ok) {
        const json = await response.json();
        setInboundResult({
          provider: target.name,
          endpoint: target.endpoint,
          httpStatus: response.status,
          response: json,
          payloadSent: target.body,
          processedLatencyMs: 38,
          status: 'PROCESSED_SUCCESSFULLY'
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch {
      // Fallback structured simulation
      await new Promise(r => setTimeout(r, 200));
      setInboundResult({
        provider: target.name,
        endpoint: target.endpoint,
        httpStatus: 200,
        response: {
          success: true,
          status: 'received',
          provider: inboundProvider,
          reconciled: true,
          timestamp: new Date().toISOString()
        },
        payloadSent: target.body,
        processedLatencyMs: 42,
        status: 'PROCESSED_SUCCESSFULLY'
      });
    } finally {
      setIsInboundExecuting(false);
    }
  };

  const getSignatureVerificationCode = () => {
    if (signatureLanguage === 'node') {
      return `// Node.js (Express) - Verificação da Assinatura de Webhook Nercash
import crypto from 'crypto';

app.post('/api/webhooks/nercash', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-nercash-signature'];
  const secret = process.env.NERCASH_WEBHOOK_SECRET; // Ex: whsec_...

  const elements = signature.split(',');
  const timestamp = elements.find(e => e.startsWith('t=')).split('=')[1];
  const hash = elements.find(e => e.startsWith('v1=')).split('=')[1];

  // Previne ataques de Replay (tolerância máxima de 5 minutos)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    return res.status(400).send('Assinatura expirada');
  }

  const payloadToSign = \`\${timestamp}.\${req.body}\`;
  const computedHash = crypto
    .createHmac('sha256', secret)
    .update(payloadToSign)
    .digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash))) {
    const event = JSON.parse(req.body);
    console.log('Evento Nercash validado:', event.type);
    
    // Processa atualização do pedido
    if (event.type === 'payment.approved') {
      // Liberar pedido do cliente...
    }
    
    res.status(200).json({ received: true });
  } else {
    res.status(400).send('Assinatura HMAC inválida');
  }
});`;
    }

    if (signatureLanguage === 'python') {
      return `# Python (FastAPI / Flask) - Verificação de Webhook Nercash
import hmac
import hashlib
import time
import json

def verify_nercash_webhook(raw_body: bytes, signature_header: str, secret: str) -> bool:
    try:
        parts = dict(item.split('=') for item in signature_header.split(','))
        timestamp = parts['t']
        expected_hash = parts['v1']
        
        # Validar tolerância de 5 minutos
        if abs(time.time() - int(timestamp)) > 300:
            return False
            
        payload = f"{timestamp}.".encode('utf-8') + raw_body
        computed = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
        
        return hmac.compare_digest(computed, expected_hash)
    except Exception:
        return False`;
    }

    return `<?php
// PHP - Verificação de Webhook Nercash
$payload = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_X_NERCASH_SIGNATURE'] ?? '';
$secret = getenv('NERCASH_WEBHOOK_SECRET');

parse_str(str_replace(',', '&', $sigHeader), $parts);
$timestamp = $parts['t'] ?? 0;
$hash = $parts['v1'] ?? '';

if (abs(time() - $timestamp) > 300) {
    http_response_code(400);
    exit('Timestamp expirado');
}

$payloadToSign = $timestamp . '.' . $payload;
$computed = hash_hmac('sha256', $payloadToSign, $secret);

if (hash_equals($computed, $hash)) {
    $event = json_decode($payload, true);
    // Processar atualização do pagamento...
    http_response_code(200);
    echo json_encode(['received' => true]);
} else {
    http_response_code(400);
    echo 'Assinatura inválida';
}`;
  };

  const getCodeSnippet = () => {
    if (selectedLanguage === 'curl') {
      return `curl -X POST https://api.nercash.com/v1/payment-intents \\
  -H "Authorization: Bearer sk_test_55098712345678901234" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: ${idempotencyKey}" \\
  -H "X-API-Version: 2026-07-01" \\
  -d '${requestBody.replace(/\n/g, '')}'`;
    }

    if (selectedLanguage === 'node') {
      return `import { NercashClient } from '@nercash/sdk-node';

const nercash = new NercashClient({
  apiKey: process.env.NERCASH_SECRET_KEY,
  environment: 'sandbox'
});

const paymentIntent = await nercash.paymentIntents.create(${requestBody}, {
  idempotencyKey: '${idempotencyKey}'
});

console.log('Payment status:', paymentIntent.status);`;
    }

    if (selectedLanguage === 'python') {
      return `import nercash

nercash.api_key = "sk_test_55098712345678901234"

intent = nercash.PaymentIntent.create(
    amount=299.90,
    currency="BRL",
    customer={"name": "Guilherme Sampaio", "email": "guilherme@empresa.com.br"},
    payment_method={"type": "credit_card", "installments": 3},
    idempotency_key="${idempotencyKey}"
)

print(intent.status)`;
    }

    return `<?php
require_once('vendor/autoload.php');

\\Nercash\\Nercash::setApiKey('sk_test_55098712345678901234');

$intent = \\Nercash\\PaymentIntent::create([
  'amount' => 299.90,
  'currency' => 'BRL',
  'customer' => ['name' => 'Guilherme Sampaio', 'email' => 'guilherme@empresa.com.br']
], [
  'idempotency_key' => '${idempotencyKey}'
]);

echo $intent->status;`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Open API & Developer Sandbox
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documentação interativa REST v1, Console Try-it-Live com idempotência e Simulador de Webhooks
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'docs' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-sky-500" />
            <span>API Docs & Console</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'keys' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-sky-500" />
            <span>Chaves de API ({apiKeys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'webhooks' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-sky-500" />
            <span>Webhooks & Testes ({webhooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('debugger')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'debugger' ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-900 dark:text-sky-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
            <span>Webhook Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('ratelimits')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'ratelimits' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-indigo-500" />
            <span>Gestão de Rate Limit</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'schema' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-indigo-500" />
            <span>Data Schema Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'diff' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5 text-indigo-500" />
            <span>API Schema Diff</span>
          </button>

          <button
            onClick={() => setActiveTab('baas_webhook_sim')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'baas_webhook_sim' ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-violet-500 animate-pulse" />
            <span>Simulador Webhook BaaS</span>
          </button>

          <button
            onClick={() => setActiveTab('baas_error_catalog')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'baas_error_catalog' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
            <span>Catálogo de Erros BaaS</span>
          </button>

          <button
            onClick={() => setActiveTab('webhook_replay')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'webhook_replay' ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5 text-violet-500" />
            <span>Webhook Replay</span>
          </button>

          <button
            onClick={() => setActiveTab('error_translator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'error_translator' ? 'bg-white text-orange-600 shadow-sm dark:bg-slate-900 dark:text-orange-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-orange-500" />
            <span>Provider Error Translator</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook_failure_simulator')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'webhook_failure_simulator' ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400 font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span>Webhook Failure Sim</span>
          </button>
        </div>
      </div>

      {/* 1. SUB-TAB: API DOCS & LIVE INTERACTIVE CONSOLE */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Rate Limit Monitor Widget with Circular Progress & Near-limit Alerts */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-sky-50/70 p-5 shadow-sm dark:border-indigo-900/60 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Circular Progress Bar */}
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-indigo-100 dark:text-indigo-950"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${usagePercentage >= 85 ? 'text-rose-500' : usagePercentage >= 70 ? 'text-amber-500' : 'text-indigo-600'} transition-all duration-500`}
                    strokeDasharray={`${usagePercentage}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                    {usagePercentage}%
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Rate Limit Monitor (Quota Ativa)</span>
                  </h4>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    usagePercentage >= 85 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    usagePercentage >= 70 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {usagePercentage >= 85 ? 'CRÍTICO (NEAR LIMIT)' : usagePercentage >= 70 ? 'ATENÇÃO' : 'ESTÁVEL'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Consumo atual: <strong className="text-slate-900 dark:text-white font-mono">{currentRpmUsage}</strong> / {maxRpmQuota} RPM (Requisições por Minuto)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {usagePercentage >= 70 && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/50 dark:border-amber-900/60 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Alerta: Próximo ao teto da cota. Evite picos simultâneos sem Burst Capacity.</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCurrentRpmUsage(Math.max(50, currentRpmUsage - 100))}
                className="rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300 transition-all"
              >
                Simular Reset / Reduzir Tráfego
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Endpoints & Request Config (6 cols) */}
          <div className="space-y-4 lg:col-span-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Selecione o Endpoint REST
              </h3>

              <div className="mt-3 space-y-1.5">
                {[
                  { id: 'POST_payment_intents', method: 'POST', path: '/v1/payment-intents', desc: 'Cria intenção de pagamento com roteamento e failover' },
                  { id: 'GET_payment_intent', method: 'GET', path: '/v1/payment-intents/{id}', desc: 'Recupera detalhes e histórico de tentativas' },
                  { id: 'POST_refunds', method: 'POST', path: '/v1/refunds', desc: 'Emite estorno total ou parcial' },
                  { id: 'GET_checkout_config', method: 'GET', path: '/v1/checkout-config', desc: 'Retorna ordenação adaptativa de métodos' },
                  { id: 'POST_webhooks_subscribe', method: 'POST', path: '/v1/webhooks/subscribe', desc: 'Registra novo endpoint para eventos' }
                ].map(ep => (
                  <div
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep.id)}
                    className={`cursor-pointer rounded-xl border p-2.5 transition-all ${
                      selectedEndpoint === ep.id
                        ? 'border-sky-500 bg-sky-50/60 ring-1 ring-sky-500 dark:bg-sky-950/40'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        ep.method === 'POST' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {ep.path}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {ep.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Headers Customization */}
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Headers Especiais de Pagamento:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">
                      Idempotency-Key (Header)
                    </label>
                    <input
                      type="text"
                      value={idempotencyKey}
                      onChange={(e) => setIdempotencyKey(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400">
                      X-Simulate-Result (Sandbox)
                    </label>
                    <select
                      value={simulateHeader}
                      onChange={(e) => setSimulateHeader(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="none">Normal (Executar Inteligência)</option>
                      <option value="declined">Simular Recusa Bancária</option>
                      <option value="timeout">Simular Timeout Técnico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Request Payload JSON Editor */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Corpo da Requisição (JSON Payload)
                  </span>
                  <button
                    onClick={() => {
                      setIdempotencyKey(`idem_${Math.random().toString(36).substring(2, 10)}`);
                    }}
                    className="text-[10px] text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Gerar Nova Idempotência
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-xs text-sky-300 outline-none dark:border-slate-800"
                />
              </div>

              <div className="mt-4">
                <button
                  onClick={handleSendApiRequest}
                  disabled={isExecutingRequest}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isExecutingRequest ? 'Disparando Requisição...' : 'Executar Chamada de API'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Code Generator & Live Response (6 cols) */}
          <div className="space-y-4 lg:col-span-6">
            {/* Code Generator */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm text-white dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-200">SDK & Código Exemplo</span>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                  {(['curl', 'node', 'python', 'php'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                        selectedLanguage === lang ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mt-3">
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-emerald-400">
                  <code>{getCodeSnippet()}</code>
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getCodeSnippet());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="absolute right-2.5 top-2.5 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Live API Response Output */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Resposta da API (Live)</span>
                </div>

                <div className="flex items-center gap-3">
                  {responseStatus && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className={`rounded px-2 py-0.5 font-bold ${
                        responseStatus >= 200 && responseStatus < 300 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        HTTP {responseStatus}
                      </span>
                      <span className="text-slate-400">{responseLatency}ms</span>
                    </div>
                  )}

                  {responseOutput && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify({ endpoint: selectedEndpoint, requestBody: JSON.parse(requestBody), response: responseOutput, status: responseStatus, latencyMs: responseLatency, timestamp: new Date().toISOString() }, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `nercash_api_session_log_${Date.now()}.json`;
                          a.click();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-sky-600/10 px-2.5 py-1 text-[11px] font-bold text-sky-600 hover:bg-sky-600/20 dark:bg-sky-950 dark:text-sky-400 cursor-pointer"
                      >
                        Exportar JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const mdContent = `# Nercash API Compliance Audit Log\n\n- **Endpoint:** ${selectedEndpoint}\n- **HTTP Status:** ${responseStatus}\n- **Latency:** ${responseLatency}ms\n- **Timestamp:** ${new Date().toISOString()}\n\n### Request Body\n\`\`\`json\n${requestBody}\n\`\`\`\n\n### Response Payload\n\`\`\`json\n${JSON.stringify(responseOutput, null, 2)}\n\`\`\``;
                          const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `nercash_compliance_audit_${Date.now()}.md`;
                          a.click();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600/10 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-400 cursor-pointer"
                      >
                        Exportar MD/PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                {responseOutput ? (
                  <pre className="max-h-72 overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-sky-400">
                    <code>{JSON.stringify(responseOutput, null, 2)}</code>
                  </pre>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 dark:border-slate-800">
                    <Send className="mb-2 h-6 w-6 text-slate-300 dark:text-slate-700" />
                    <span>Clique em "Executar Chamada de API" para testar o endpoint selecionado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. SUB-TAB: API KEYS */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chaves de API & Autenticação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chaves secretas para backend e chaves públicas para inicializar o Super Checkout
              </p>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500"
            >
              <Plus className="h-4 w-4" />
              <span>Gerar Nova Chave</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map(k => (
              <div
                key={k.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{k.name}</h4>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                      k.environment === 'production' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {k.environment}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {k.type}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {k.key}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(k.key);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: WEBHOOKS & INTERACTIVE TESTING SUITE */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          {/* Header & Register Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Endpoints de Webhook & Atualizações em Tempo Real
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre seus endpoints de recebimento de status transacional e teste disparos simulados com assinatura HMAC-SHA256
              </p>
            </div>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Cadastrar Novo Endpoint</span>
            </button>
          </div>

          {/* Webhook Endpoints List */}
          <div className="grid grid-cols-1 gap-3">
            {webhooks.map(wh => (
              <div
                key={wh.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {wh.url}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {wh.status.toUpperCase()} ({wh.successRate}% uptime)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map(e => (
                      <span key={e} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {e}
                      </span>
                    ))}
                  </div>
                  <p className="font-mono text-[11px] text-slate-400">
                    Chave Secreta HMAC: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{wh.secretKey}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      setTestWebhookId(wh.id);
                      setTestCustomUrl(wh.url);
                      document.getElementById('webhook-tester-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300"
                  >
                    <Play className="h-3.5 w-3.5 fill-sky-600" />
                    <span>Carregar no Testador</span>
                  </button>
                  <button
                    title="Excluir Webhook"
                    onClick={() => deleteWebhook(wh.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Webhook Tester Section */}
          <div id="webhook-tester-section" className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Dispatch Simulator (6 cols) */}
            <div className="space-y-4 lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-sky-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simulador de Disparos de Webhook (Outgoing)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded bg-sky-50 px-2 py-0.5 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    HMAC SHA-256
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  {/* Select Endpoint */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Destino do Disparo
                    </label>
                    <select
                      value={testWebhookId}
                      onChange={(e) => {
                        setTestWebhookId(e.target.value);
                        const sel = webhooks.find(w => w.id === e.target.value);
                        if (sel) setTestCustomUrl(sel.url);
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {webhooks.map(wh => (
                        <option key={wh.id} value={wh.id}>
                          {wh.url} ({wh.events.join(', ')})
                        </option>
                      ))}
                      <option value="custom">URL Customizada / Temporária...</option>
                    </select>
                  </div>

                  {testWebhookId === 'custom' && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        URL de Destino Personalizada
                      </label>
                      <input
                        type="url"
                        value={testCustomUrl}
                        onChange={(e) => setTestCustomUrl(e.target.value)}
                        placeholder="https://webhook.site/..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Select Event Type */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Evento a Ser Disparado
                    </label>
                    <select
                      value={testEventType}
                      onChange={(e) => setTestEventType(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {AVAILABLE_EVENTS.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.label} - {ev.desc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dispatch Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleTestWebhookDispatch}
                      disabled={isDispatchingWebhook}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 transition-all disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isDispatchingWebhook ? 'Enviando Webhook...' : 'Disparar Webhook de Teste'}</span>
                    </button>
                  </div>
                </div>

                {/* Dispatch Details / Result */}
                {webhookTestResult && (
                  <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Resultado do Disparo
                      </span>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          HTTP {webhookTestResult.status} OK
                        </span>
                        <span className="text-slate-400">{webhookTestResult.latencyMs}ms</span>
                      </div>
                    </div>

                    {/* Headers Sent */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Headers HTTP Transmitidos
                      </span>
                      <div className="mt-1 rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto space-y-1">
                        {Object.entries(webhookTestResult.headers).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-sky-400">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payload Sent */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Payload JSON Transmitido
                      </span>
                      <pre className="mt-1 max-h-48 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-emerald-400">
                        <code>{JSON.stringify(webhookTestResult.payload, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Inbound Simulator from Banks/Acquirers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Simulador de Webhook de Entrada (Inbound dos Bancos)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    BACEN SPI / Adyen
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Simule o recebimento de uma confirmação instantânea de liquidação vinda do Banco Central ou Adyen para conciliação automática em tempo real.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setInboundProvider('mercadolivre')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'mercadolivre' ? 'bg-amber-500 text-slate-900 font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Mercado Livre IPN
                  </button>
                  <button
                    onClick={() => setInboundProvider('mercadopago')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'mercadopago' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Mercado Pago
                  </button>
                  <button
                    onClick={() => setInboundProvider('stripe')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'stripe' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Stripe
                  </button>
                  <button
                    onClick={() => setInboundProvider('asaas')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'asaas' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Asaas
                  </button>
                  <button
                    onClick={() => setInboundProvider('pix_spi')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'pix_spi' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Pix SPI
                  </button>
                  <button
                    onClick={() => setInboundProvider('adyen')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'adyen' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Adyen
                  </button>
                  <button
                    onClick={() => setInboundProvider('stone')}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      inboundProvider === 'stone' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Stone
                  </button>
                </div>

                <div className="mt-3">
                  <button
                    onClick={handleSimulateInboundWebhook}
                    disabled={isInboundExecuting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4" />
                    <span>{isInboundExecuting ? 'Processando Inbound...' : 'Simular Recebimento do Banco'}</span>
                  </button>
                </div>

                {inboundResult && (
                  <div className="mt-4 rounded-xl bg-slate-950 p-3.5 font-mono text-[11px] text-emerald-400">
                    <pre>{JSON.stringify(inboundResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Signature Verification Guide (6 cols) */}
            <div className="space-y-4 lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm text-white dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white">
                      Como Validar a Assinatura HMAC no seu Servidor
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                    {(['node', 'python', 'php'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSignatureLanguage(lang)}
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                          signatureLanguage === lang ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                  Todos os webhooks enviados pela Nercash contêm o header <code>X-Nercash-Signature</code> no formato <code>t=timestamp,v1=hash_sha256</code>. Valide o payload para garantir a autenticidade e evitar ataques de repetição.
                </p>

                <div className="relative mt-3">
                  <pre className="max-h-96 overflow-x-auto rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-sky-300">
                    <code>{getSignatureVerificationCode()}</code>
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getSignatureVerificationCode());
                      setCopiedSignature(true);
                      setTimeout(() => setCopiedSignature(false), 2000);
                    }}
                    className="absolute right-2.5 top-2.5 rounded-lg bg-slate-800/80 p-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedSignature ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: LIVE WEBHOOK DEBUGGER */}
      {activeTab === 'debugger' && (
        <LiveWebhookDebugger />
      )}

      {/* 5. SUB-TAB: RATE LIMIT MANAGEMENT */}
      {activeTab === 'ratelimits' && (
        <RateLimitManagement />
      )}

      {/* 6. SUB-TAB: DATA SCHEMA EXPLORER */}
      {activeTab === 'schema' && (
        <DataSchemaExplorer />
      )}

      {/* 7. SUB-TAB: API SCHEMA DIFF */}
      {activeTab === 'diff' && (
        <ApiSchemaDiffViewer />
      )}

      {/* 8. SUB-TAB: BAAS WEBHOOK SIMULATOR */}
      {activeTab === 'baas_webhook_sim' && (
        <BaaSWebhookSimulator />
      )}

      {/* 9. SUB-TAB: BAAS ERROR CATALOG */}
      {activeTab === 'baas_error_catalog' && (
        <BaaSErrorCatalog />
      )}

      {/* 10. SUB-TAB: WEBHOOK REPLAY */}
      {activeTab === 'webhook_replay' && (
        <ExtendedWebhookDebugger />
      )}

      {/* 11. SUB-TAB: PROVIDER ERROR TRANSLATOR */}
      {activeTab === 'error_translator' && (
        <ProviderErrorTranslator />
      )}

      {activeTab === 'webhook_failure_simulator' && (
        <WebhookFailureSimulator />
      )}

      {/* Modal: New API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gerar Nova Chave de API
              </h3>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Identificação da Chave</label>
                <input
                  type="text"
                  placeholder="Ex: Integração Backend E-commerce"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Ambiente</label>
                  <select
                    value={newKeyEnv}
                    onChange={(e) => setNewKeyEnv(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="sandbox">Sandbox (Testes)</option>
                    <option value="production">Produção (Live)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">Tipo</label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="secret">Secret (sk_...)</option>
                    <option value="publishable">Publishable (pk_...)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newKeyName) {
                    generateApiKey(newKeyName, newKeyEnv, newKeyType);
                    setShowKeyModal(false);
                    setNewKeyName('');
                  }
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
              >
                Gerar Chave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cadastrar Endpoint de Webhook
                </h3>
              </div>
              <button onClick={() => setShowWebhookModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">URL de Destino (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://meusite.com/api/webhooks/nercash"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Descrição / Finalidade</label>
                <input
                  type="text"
                  placeholder="Ex: ERP Conciliação e Baixa Automática"
                  value={newWebhookDescription}
                  onChange={(e) => setNewWebhookDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Eventos a Escutar
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                  {AVAILABLE_EVENTS.map(ev => {
                    const isChecked = selectedEventsForNewWebhook.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className="flex items-start gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEventsForNewWebhook(prev => [...prev, ev.id]);
                            } else {
                              setSelectedEventsForNewWebhook(prev => prev.filter(x => x !== ev.id));
                            }
                          }}
                          className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <div>
                          <p className="font-mono font-bold text-[11px] text-slate-900 dark:text-white">{ev.label}</p>
                          <span className="text-[10px] text-slate-400">{ev.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowWebhookModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newWebhookUrl) {
                    addWebhook(newWebhookUrl, selectedEventsForNewWebhook.length > 0 ? selectedEventsForNewWebhook : ['payment.approved']);
                    setShowWebhookModal(false);
                    setNewWebhookUrl('');
                    setNewWebhookDescription('');
                  }
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
              >
                Salvar Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
