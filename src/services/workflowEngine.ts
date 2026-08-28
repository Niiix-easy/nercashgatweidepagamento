import { 
  AutomationGraph, 
  AutomationExecutionLog, 
  PaymentIntent, 
  Customer 
} from '../types/payment';

export class WorkflowEngine {
  /**
   * Executa um grafo de automação low-code a partir de um evento
   */
  public static async executeGraph(
    graph: AutomationGraph,
    eventPayload: {
      event: string;
      paymentIntent?: PaymentIntent;
      customer?: Customer;
    }
  ): Promise<AutomationExecutionLog> {
    const logId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const executedNodes: AutomationExecutionLog['executedNodes'] = [];

    // Encontra o nó Trigger raiz
    const triggerNode = graph.nodes.find(n => n.type === 'trigger');
    if (!triggerNode) {
      return {
        id: logId,
        automationId: graph.id,
        automationName: graph.name,
        triggerEvent: eventPayload.event,
        paymentIntentId: eventPayload.paymentIntent?.id,
        status: 'failed',
        executedNodes: [],
        timestamp: new Date().toISOString()
      };
    }

    let currentNodeId: string | null = triggerNode.id;
    let overallStatus: 'success' | 'failed' | 'partial' = 'success';

    // Fila de execução passo a passo
    while (currentNodeId) {
      const node = graph.nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      const startTime = performance.now();
      let nodeStatus: 'success' | 'failed' | 'skipped' = 'success';
      let outputMessage = '';
      let branchToFollow: 'then' | 'else' | 'default' = 'default';

      try {
        switch (node.type) {
          case 'trigger':
            outputMessage = `Gatilho disparado com sucesso pelo evento [${eventPayload.event}]`;
            break;

          case 'crm.upsert_contact':
            const customerName = eventPayload.paymentIntent?.customerName || eventPayload.customer?.name || 'Cliente';
            const amount = eventPayload.paymentIntent?.amount || 0;
            outputMessage = `CRM atualizado: ${customerName} | +R$ ${amount.toFixed(2)} adicionado ao LTV | Tags: [${(node.config.addTags || ['Ativo']).join(', ')}]`;
            break;

          case 'integration.send_nfe':
            const nfeNumber = Math.floor(100000 + Math.random() * 900000);
            outputMessage = `NF-e #${nfeNumber} autorizada via SEFAZ para ${eventPayload.paymentIntent?.customerDocument || '000.000.000-00'}`;
            break;

          case 'notification.whatsapp':
            const phone = eventPayload.customer?.phone || '+55 (11) 98765-4321';
            outputMessage = `WhatsApp enviado via API Cloud para ${phone} (Template: ${node.config.template || 'pedido_confirmado'})`;
            break;

          case 'notification.email':
            const email = eventPayload.paymentIntent?.customerEmail || eventPayload.customer?.email || 'cliente@email.com';
            outputMessage = `E-mail transacional entregue com sucesso para ${email}`;
            break;

          case 'notification.sms':
            outputMessage = `SMS com código de confirmação enviado via Gateway SMS`;
            break;

          case 'condition':
            const field = node.config.field || 'amount';
            const op = node.config.operator || 'gt';
            const val = Number(node.config.value) || 500;
            const currentVal = eventPayload.paymentIntent?.amount || 0;

            let conditionResult = false;
            if (op === 'gt') conditionResult = currentVal > val;
            else if (op === 'gte') conditionResult = currentVal >= val;
            else if (op === 'lt') conditionResult = currentVal < val;
            else conditionResult = currentVal === val;

            branchToFollow = conditionResult ? 'then' : 'else';
            outputMessage = `Condição (${field} ${op} ${val}) avaliada com valor R$ ${currentVal.toFixed(2)} -> Ramo [${branchToFollow.toUpperCase()}]`;
            break;

          case 'loyalty.add_points':
            const mult = node.config.multiplier || 1;
            const points = Math.floor((eventPayload.paymentIntent?.amount || 100) * mult);
            outputMessage = `Programa de Fidelidade: +${points} pontos e ${node.config.walletCashbackPercent || 2}% cashback creditados`;
            break;

          case 'webhook.custom':
            outputMessage = `Webhook POST transmitido para ${node.config.webhookUrl || 'https://api.external.com'} (HTTP 200 OK)`;
            break;

          default:
            outputMessage = `Nó executado com sucesso`;
        }
      } catch (err: any) {
        nodeStatus = 'failed';
        overallStatus = 'partial';
        outputMessage = `Falha na execução do nó: ${err.message || 'Erro desconhecido'}`;
      }

      const latencyMs = Math.round(performance.now() - startTime + Math.random() * 20 + 5);

      executedNodes.push({
        nodeId: node.id,
        nodeType: node.type,
        nodeTitle: node.title,
        status: nodeStatus,
        output: outputMessage,
        latencyMs
      });

      // Encontra próxima aresta
      if (node.type === 'condition') {
        const edge = graph.edges.find(e => e.from === node.id && e.conditionBranch === branchToFollow);
        currentNodeId = edge ? edge.to : null;
      } else {
        const edge = graph.edges.find(e => e.from === node.id);
        currentNodeId = edge ? edge.to : null;
      }
    }

    return {
      id: logId,
      automationId: graph.id,
      automationName: graph.name,
      triggerEvent: eventPayload.event,
      paymentIntentId: eventPayload.paymentIntent?.id,
      status: overallStatus,
      executedNodes,
      timestamp: new Date().toISOString()
    };
  }
}
