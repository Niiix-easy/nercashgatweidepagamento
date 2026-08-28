import { AutomationGraph, AutomationNode, AutomationEdge } from '../types/payment';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'trigger' | 'connectivity' | 'cycle' | 'condition' | 'config';
  title: string;
  description: string;
  nodeIds?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  canSave: boolean;
  score: number; // 0 to 100
  totalNodes: number;
  totalEdges: number;
  criticalErrorsCount: number;
  warningsCount: number;
  issues: ValidationIssue[];
  validatedAt: string;
}

export class GraphValidationEngine {
  /**
   * Performs comprehensive static and dynamic graph analysis on a Workflow Graph
   */
  public static validate(graph: AutomationGraph): ValidationResult {
    const issues: ValidationIssue[] = [];
    const nodes = graph.nodes || [];
    const edges = graph.edges || [];

    // 1. Check for Trigger Nodes
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      issues.push({
        id: 'err_no_trigger',
        type: 'error',
        category: 'trigger',
        title: 'Ausência de Nó de Gatilho (Trigger)',
        description: 'O fluxo precisa de pelo menos 1 nó de gatilho para ser disparado por eventos de pagamento ou risco.',
        nodeIds: []
      });
    } else if (triggerNodes.length > 1) {
      issues.push({
        id: 'warn_multi_trigger',
        type: 'warning',
        category: 'trigger',
        title: 'Múltiplos Gatilhos no Mesmo Fluxo',
        description: `Foram encontrados ${triggerNodes.length} nós de gatilho. Certifique-se de que não haja conflito de disparo.`,
        nodeIds: triggerNodes.map(n => n.id)
      });
    }

    // 2. Connectivity & Orphan Node Detection
    const incomingEdgeCount: Record<string, number> = {};
    const outgoingEdgeCount: Record<string, number> = {};

    nodes.forEach(n => {
      incomingEdgeCount[n.id] = 0;
      outgoingEdgeCount[n.id] = 0;
    });

    edges.forEach(e => {
      if (outgoingEdgeCount[e.from] !== undefined) outgoingEdgeCount[e.from]++;
      if (incomingEdgeCount[e.to] !== undefined) incomingEdgeCount[e.to]++;
    });

    const orphanNodes: AutomationNode[] = [];
    const deadEndNonActionNodes: AutomationNode[] = [];

    nodes.forEach(node => {
      const inc = incomingEdgeCount[node.id] || 0;
      const out = outgoingEdgeCount[node.id] || 0;

      // Completely unlinked node (no incoming AND no outgoing)
      if (inc === 0 && out === 0) {
        orphanNodes.push(node);
      }

      // Non-trigger node with no incoming connections (unreachable)
      if (node.type !== 'trigger' && inc === 0 && out > 0) {
        issues.push({
          id: `warn_unreachable_${node.id}`,
          type: 'warning',
          category: 'connectivity',
          title: `Nó Inalcançável: "${node.title}"`,
          description: 'Este nó tem conexões de saída mas nenhuma conexão de entrada. Ele nunca será acionado.',
          nodeIds: [node.id]
        });
      }

      // Condition node with no outgoing branches
      if (node.type === 'condition' && out === 0) {
        deadEndNonActionNodes.push(node);
      }
    });

    if (orphanNodes.length > 0) {
      issues.push({
        id: 'err_orphan_nodes',
        type: 'error',
        category: 'connectivity',
        title: `${orphanNodes.length} Nó(s) Órfão(s) Desconectado(s)`,
        description: `Os nós [${orphanNodes.map(n => n.title).join(', ')}] estão completamente isolados no canvas. Conecte-os ou remova-os.`,
        nodeIds: orphanNodes.map(n => n.id)
      });
    }

    if (deadEndNonActionNodes.length > 0) {
      issues.push({
        id: 'err_dead_end_conditions',
        type: 'error',
        category: 'condition',
        title: 'Nós Condicionais sem Ramificação',
        description: `Os nós de condição [${deadEndNonActionNodes.map(n => n.title).join(', ')}] não apontam para nenhuma ação subsequente.`,
        nodeIds: deadEndNonActionNodes.map(n => n.id)
      });
    }

    // 3. Cycle Detection (Circular Dependency Detection via DFS)
    const adjacencyList: Record<string, string[]> = {};
    nodes.forEach(n => {
      adjacencyList[n.id] = [];
    });

    edges.forEach(e => {
      if (adjacencyList[e.from]) {
        adjacencyList[e.from].push(e.to);
      }
    });

    const visited: Record<string, boolean> = {};
    const recursionStack: Record<string, boolean> = {};
    const detectedCycles: string[][] = [];

    const dfsDetectCycle = (nodeId: string, currentPath: string[]) => {
      visited[nodeId] = true;
      recursionStack[nodeId] = true;
      currentPath.push(nodeId);

      const neighbors = adjacencyList[nodeId] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor]) {
          dfsDetectCycle(neighbor, [...currentPath]);
        } else if (recursionStack[neighbor]) {
          // Cycle found!
          const cyclePath = [...currentPath.slice(currentPath.indexOf(neighbor)), neighbor];
          detectedCycles.push(cyclePath);
        }
      }

      recursionStack[nodeId] = false;
    };

    nodes.forEach(n => {
      if (!visited[n.id]) {
        dfsDetectCycle(n.id, []);
      }
    });

    if (detectedCycles.length > 0) {
      const cycleNodeTitles = detectedCycles[0].map(id => {
        const found = nodes.find(n => n.id === id);
        return found ? found.title : id;
      });

      issues.push({
        id: 'err_circular_dependency',
        type: 'error',
        category: 'cycle',
        title: 'Dependência Circular Detectada (Deadlock Loop)',
        description: `O grafo contém um ciclo fechado que causaria loop infinito de execução: ${cycleNodeTitles.join(' ➔ ')}.`,
        nodeIds: detectedCycles[0]
      });
    }

    // 4. Parameter & Configuration Validation
    nodes.forEach(node => {
      if (node.type === 'webhook.custom') {
        const url = node.config?.url;
        if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
          issues.push({
            id: `warn_config_url_${node.id}`,
            type: 'warning',
            category: 'config',
            title: `URL de Webhook Inválida em "${node.title}"`,
            description: 'Configure uma URL HTTPS válida para que o webhook possa ser despachado com segurança.',
            nodeIds: [node.id]
          });
        }
      }

      if (node.type === 'notification.whatsapp') {
        const recipient = node.config?.recipient;
        if (!recipient) {
          issues.push({
            id: `info_config_wpp_${node.id}`,
            type: 'info',
            category: 'config',
            title: `Destinatário WhatsApp Padrão em "${node.title}"`,
            description: 'Nenhum número fixo especificado. O workflow utilizará o telefone do comprador no checkout.',
            nodeIds: [node.id]
          });
        }
      }
    });

    const criticalErrorsCount = issues.filter(i => i.type === 'error').length;
    const warningsCount = issues.filter(i => i.type === 'warning').length;

    let score = 100;
    score -= criticalErrorsCount * 35;
    score -= warningsCount * 12;
    score = Math.max(0, Math.min(100, score));

    return {
      isValid: criticalErrorsCount === 0,
      canSave: criticalErrorsCount === 0,
      score,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      criticalErrorsCount,
      warningsCount,
      issues,
      validatedAt: new Date().toISOString()
    };
  }
}
