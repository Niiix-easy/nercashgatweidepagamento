import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Sparkles, 
  Users, 
  MessageSquare, 
  Mail, 
  FileText, 
  HelpCircle, 
  Award, 
  Globe, 
  Workflow, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Settings2,
  Zap,
  Info,
  ShieldAlert,
  RotateCcw,
  ShoppingBag,
  Star,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  X,
  Radio,
  Eye,
  Check
} from 'lucide-react';
import { AutomationGraph, AutomationNode } from '../../types/payment';

// Helper to get node latency & performance metrics
const getNodePerformanceMetrics = (type: string, id: string) => {
  let baseMs = 28;
  if (type === 'trigger') baseMs = 14;
  else if (type === 'condition') baseMs = 8;
  else if (type === 'notification.whatsapp') baseMs = 142;
  else if (type === 'notification.email') baseMs = 88;
  else if (type === 'integration.send_nfe') baseMs = 185;
  else if (type === 'webhook.custom') baseMs = 165;
  else if (type === 'crm.upsert_contact') baseMs = 45;
  else if (type === 'loyalty.add_points') baseMs = 22;
  else if (type === 'fraud.review') baseMs = 34;

  const isBottleneck = baseMs > 150;
  const isFast = baseMs < 50;

  return {
    avgTimeMs: baseMs,
    p95Ms: Math.round(baseMs * 1.38),
    p99Ms: Math.round(baseMs * 1.8),
    throughputReqSec: baseMs > 100 ? 280 : 850,
    successRate: '99.94%',
    isBottleneck,
    isFast,
    speedGrade: isFast ? 'A+ (Fast)' : isBottleneck ? 'C (Bottleneck)' : 'B (Normal)'
  };
};

// Custom Node: Trigger
const TriggerNode = ({ data, isConnectable }: any) => {
  const isError = data.executionState === 'error';
  const isStalled = data.executionState === 'stalled';
  const isExecuting = data.isExecuting || data.executionState === 'running';
  const perf = data.perfMetrics || getNodePerformanceMetrics('trigger', data.id);

  const getBorderAndBg = () => {
    if (isError) return 'border-rose-500 ring-4 ring-rose-500/30 bg-rose-950/40 shadow-rose-950/50';
    if (isStalled) return 'border-amber-500 ring-4 ring-amber-500/30 bg-amber-950/40 shadow-amber-950/50 animate-pulse';
    if (isExecuting) return 'border-amber-400 ring-4 ring-amber-500/20 bg-slate-900';
    if (data.showPerformanceOverlay) {
      if (perf.isBottleneck) return 'border-rose-500/80 ring-2 ring-rose-500/20 bg-slate-900';
      if (perf.isFast) return 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-slate-900';
      return 'border-amber-500/80 ring-2 ring-amber-500/20 bg-slate-900';
    }
    return 'border-amber-500/80 hover:border-amber-400 bg-slate-900';
  };

  return (
    <div 
      onClick={() => data.onSelectNode && data.onSelectNode(data)}
      className={`relative min-w-[230px] rounded-2xl border-2 p-3.5 shadow-xl transition-all cursor-pointer ${getBorderAndBg()}`}
    >
      {/* Performance Overlay Floating Pill */}
      {data.showPerformanceOverlay && (
        <div className={`absolute -top-3.5 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-md ${
          perf.isFast
            ? 'bg-emerald-500 text-white'
            : perf.isBottleneck
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-amber-500 text-slate-950'
        }`}>
          <Zap className="h-3 w-3 fill-current" />
          <span>{perf.avgTimeMs}ms</span>
          <span className="opacity-80 text-[9px]">({perf.speedGrade})</span>
        </div>
      )}

      {/* Visual Indicator: Error Badge */}
      {isError && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md animate-bounce">
          <AlertCircle className="h-3 w-3" />
          <span>FALHA NA EXECUÇÃO</span>
        </div>
      )}

      {/* Visual Indicator: Stalled Badge */}
      {isStalled && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
          <Clock className="h-3 w-3 animate-spin" />
          <span>NÓ TRAVADO (STALLED &gt; 45s)</span>
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Gatilho / Trigger</span>
            <h4 className="text-xs font-bold text-white leading-tight">{data.label}</h4>
          </div>
        </div>
        {data.onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }} 
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-300 leading-snug">{data.description}</p>
      
      {/* Performance Footer Bar */}
      {data.showPerformanceOverlay && (
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] font-mono text-slate-400">
          <span>p95: <strong className="text-slate-200">{perf.p95Ms}ms</strong></span>
          <span>•</span>
          <span>{perf.throughputReqSec} req/s</span>
          <span>•</span>
          <span className="text-emerald-400">{perf.successRate}</span>
        </div>
      )}

      {/* Error / Stalled description callout */}
      {isError && (
        <div className="mt-2 rounded-lg bg-rose-900/60 p-1.5 text-[10px] font-mono text-rose-200 border border-rose-800 flex items-center justify-between">
          <span>{data.errorMessage || 'Timeout de Invocação Webhook (504)'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 rounded bg-rose-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-600"
            >
              Reexecutar
            </button>
          )}
        </div>
      )}

      {isStalled && (
        <div className="mt-2 rounded-lg bg-amber-900/60 p-1.5 text-[10px] font-mono text-amber-200 border border-amber-800 flex items-center justify-between">
          <span>{data.stalledMessage || 'Aguardando handshake do listener...'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 rounded bg-amber-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-amber-600"
            >
              Desbloquear
            </button>
          )}
        </div>
      )}

      {data.status && !isError && !isStalled && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-400">
          <CheckCircle2 className="h-3 w-3" />
          <span>{data.status}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !bg-amber-400 !border-2 !border-slate-900"
      />
    </div>
  );
};

// Custom Node: Action
const ActionNode = ({ data, isConnectable }: any) => {
  const isError = data.executionState === 'error';
  const isStalled = data.executionState === 'stalled';
  const isExecuting = data.isExecuting || data.executionState === 'running';
  const perf = data.perfMetrics || getNodePerformanceMetrics(data.type, data.id);

  const getIcon = () => {
    if (data.type === 'notification.whatsapp') return <MessageSquare className="h-4 w-4 text-emerald-400" />;
    if (data.type === 'notification.email') return <Mail className="h-4 w-4 text-sky-400" />;
    if (data.type === 'crm.upsert_contact') return <Users className="h-4 w-4 text-indigo-400" />;
    if (data.type === 'integration.send_nfe') return <FileText className="h-4 w-4 text-purple-400" />;
    if (data.type === 'loyalty.add_points') return <Award className="h-4 w-4 text-yellow-400" />;
    if (data.type === 'webhook.custom') return <Globe className="h-4 w-4 text-teal-400" />;
    if (data.type === 'fraud.review') return <ShieldAlert className="h-4 w-4 text-rose-400" />;
    if (data.type === 'refund.process') return <RotateCcw className="h-4 w-4 text-cyan-400" />;
    return <Zap className="h-4 w-4 text-indigo-400" />;
  };

  const getBorderAndBg = () => {
    if (isError) return 'border-rose-500 ring-4 ring-rose-500/30 bg-rose-950/40 shadow-rose-950/50';
    if (isStalled) return 'border-amber-500 ring-4 ring-amber-500/30 bg-amber-950/40 shadow-amber-950/50 animate-pulse';
    if (isExecuting) return 'border-emerald-400 ring-4 ring-emerald-500/20 bg-slate-900';
    if (data.showPerformanceOverlay) {
      if (perf.isBottleneck) return 'border-rose-500/90 ring-2 ring-rose-500/30 bg-slate-900 shadow-rose-950/40';
      if (perf.isFast) return 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-slate-900';
      return 'border-indigo-500/80 ring-2 ring-indigo-500/20 bg-slate-900';
    }
    if (data.type === 'notification.whatsapp') return 'border-emerald-600/70 hover:border-emerald-500 bg-slate-900';
    if (data.type === 'notification.email') return 'border-sky-600/70 hover:border-sky-500 bg-slate-900';
    if (data.type === 'crm.upsert_contact') return 'border-indigo-600/70 hover:border-indigo-500 bg-slate-900';
    if (data.type === 'integration.send_nfe') return 'border-purple-600/70 hover:border-purple-500 bg-slate-900';
    if (data.type === 'fraud.review') return 'border-rose-600/70 hover:border-rose-500 bg-slate-900';
    if (data.type === 'refund.process') return 'border-cyan-600/70 hover:border-cyan-500 bg-slate-900';
    return 'border-slate-700 hover:border-slate-600 bg-slate-900';
  };

  return (
    <div 
      onClick={() => data.onSelectNode && data.onSelectNode(data)}
      className={`relative min-w-[230px] rounded-2xl border-2 p-3.5 shadow-xl transition-all cursor-pointer ${getBorderAndBg()}`}
    >
      {/* Performance Overlay Floating Pill */}
      {data.showPerformanceOverlay && (
        <div className={`absolute -top-3.5 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-md ${
          perf.isFast
            ? 'bg-emerald-500 text-white'
            : perf.isBottleneck
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-indigo-600 text-white'
        }`}>
          <Zap className="h-3 w-3 fill-current" />
          <span>{perf.avgTimeMs}ms</span>
          <span className="opacity-80 text-[9px]">({perf.speedGrade})</span>
        </div>
      )}

      {/* Visual Indicator: Error Badge */}
      {isError && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md animate-bounce">
          <AlertCircle className="h-3 w-3" />
          <span>FALHA NA EXECUÇÃO</span>
        </div>
      )}

      {/* Visual Indicator: Stalled Badge */}
      {isStalled && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
          <Clock className="h-3 w-3 animate-spin" />
          <span>NÓ TRAVADO (STALLED &gt; 45s)</span>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className={`!h-3 !w-3 !rounded-full !border-2 !border-slate-900 ${
          isError ? '!bg-rose-500' : isStalled ? '!bg-amber-500' : '!bg-emerald-400'
        }`}
      />

      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800">
            {getIcon()}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ação Automática</span>
            <h4 className="text-xs font-bold text-white leading-tight">{data.label}</h4>
          </div>
        </div>
        {data.onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }} 
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-300 leading-snug">{data.description}</p>

      {/* Performance Footer Bar */}
      {data.showPerformanceOverlay && (
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] font-mono text-slate-400">
          <span>p95: <strong className="text-slate-200">{perf.p95Ms}ms</strong></span>
          <span>•</span>
          <span>{perf.throughputReqSec} req/s</span>
          <span>•</span>
          <span className="text-emerald-400">{perf.successRate}</span>
        </div>
      )}

      {/* Error Callout */}
      {isError && (
        <div className="mt-2 rounded-lg bg-rose-900/60 p-1.5 text-[10px] font-mono text-rose-200 border border-rose-800 flex items-center justify-between">
          <span className="truncate max-w-[140px]">{data.errorMessage || 'HTTP 500: Erro no Provedor Remoto'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 shrink-0 rounded bg-rose-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-600"
            >
              Reexecutar
            </button>
          )}
        </div>
      )}

      {/* Stalled Callout */}
      {isStalled && (
        <div className="mt-2 rounded-lg bg-amber-900/60 p-1.5 text-[10px] font-mono text-amber-200 border border-amber-800 flex items-center justify-between">
          <span className="truncate max-w-[140px]">{data.stalledMessage || 'Aguardando ACK da API externa...'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 shrink-0 rounded bg-amber-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-amber-600"
            >
              Forçar ACK
            </button>
          )}
        </div>
      )}

      {data.status && !isError && !isStalled && (
        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          <span>{data.status}</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className={`!h-3 !w-3 !rounded-full !border-2 !border-slate-900 ${
          isError ? '!bg-rose-500' : isStalled ? '!bg-amber-500' : '!bg-emerald-400'
        }`}
      />
    </div>
  );
};

// Custom Node: Condition
const ConditionNode = ({ data, isConnectable }: any) => {
  const isError = data.executionState === 'error';
  const isStalled = data.executionState === 'stalled';
  const isExecuting = data.isExecuting || data.executionState === 'running';
  const perf = data.perfMetrics || getNodePerformanceMetrics('condition', data.id);

  const getBorderAndBg = () => {
    if (isError) return 'border-rose-500 ring-4 ring-rose-500/30 bg-rose-950/40 shadow-rose-950/50';
    if (isStalled) return 'border-amber-500 ring-4 ring-amber-500/30 bg-amber-950/40 shadow-amber-950/50 animate-pulse';
    if (isExecuting) return 'border-amber-400 ring-4 ring-amber-500/20 bg-slate-900';
    if (data.showPerformanceOverlay) {
      if (perf.isBottleneck) return 'border-rose-500/80 ring-2 ring-rose-500/20 bg-slate-900';
      if (perf.isFast) return 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-slate-900';
      return 'border-amber-500/80 ring-2 ring-amber-500/20 bg-slate-900';
    }
    return 'border-amber-500/70 hover:border-amber-400 bg-slate-900';
  };

  return (
    <div 
      onClick={() => data.onSelectNode && data.onSelectNode(data)}
      className={`relative min-w-[230px] rounded-2xl border-2 p-3.5 shadow-xl transition-all cursor-pointer ${getBorderAndBg()}`}
    >
      {/* Performance Overlay Floating Pill */}
      {data.showPerformanceOverlay && (
        <div className={`absolute -top-3.5 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold shadow-md ${
          perf.isFast
            ? 'bg-emerald-500 text-white'
            : perf.isBottleneck
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-amber-500 text-slate-950'
        }`}>
          <Zap className="h-3 w-3 fill-current" />
          <span>{perf.avgTimeMs}ms</span>
          <span className="opacity-80 text-[9px]">({perf.speedGrade})</span>
        </div>
      )}

      {/* Visual Indicator: Error Badge */}
      {isError && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md animate-bounce">
          <AlertCircle className="h-3 w-3" />
          <span>FALHA NA EXECUÇÃO</span>
        </div>
      )}

      {/* Visual Indicator: Stalled Badge */}
      {isStalled && (
        <div className="absolute -top-3 right-3 flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-md">
          <Clock className="h-3 w-3 animate-spin" />
          <span>NÓ TRAVADO (STALLED &gt; 45s)</span>
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !bg-amber-400 !border-2 !border-slate-900"
      />

      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Regra Condicional</span>
            <h4 className="text-xs font-bold text-white leading-tight">{data.label}</h4>
          </div>
        </div>
        {data.onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }} 
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-300 leading-snug">{data.description}</p>

      {/* Performance Footer Bar */}
      {data.showPerformanceOverlay && (
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] font-mono text-slate-400">
          <span>p95: <strong className="text-slate-200">{perf.p95Ms}ms</strong></span>
          <span>•</span>
          <span>{perf.throughputReqSec} req/s</span>
          <span>•</span>
          <span className="text-emerald-400">{perf.successRate}</span>
        </div>
      )}

      {/* Error Callout */}
      {isError && (
        <div className="mt-2 rounded-lg bg-rose-900/60 p-1.5 text-[10px] font-mono text-rose-200 border border-rose-800 flex items-center justify-between">
          <span className="truncate max-w-[140px]">{data.errorMessage || 'Variável não resolvida no contexto'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 shrink-0 rounded bg-rose-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-rose-600"
            >
              Reavaliar
            </button>
          )}
        </div>
      )}

      {isStalled && (
        <div className="mt-2 rounded-lg bg-amber-900/60 p-1.5 text-[10px] font-mono text-amber-200 border border-amber-800 flex items-center justify-between">
          <span className="truncate max-w-[140px]">{data.stalledMessage || 'Aguardando evento assíncrono...'}</span>
          {data.onRetryNode && (
            <button 
              onClick={(e) => { e.stopPropagation(); data.onRetryNode(data.id); }}
              className="ml-1 shrink-0 rounded bg-amber-700 px-1.5 py-0.5 text-[9px] font-bold text-white hover:bg-amber-600"
            >
              Forçar True
            </button>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
        <span className="text-emerald-400 font-bold">Sim / True ➔</span>
        <span className="text-rose-400 font-bold">Não / False ➔</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="true"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !bg-emerald-400 !border-2 !border-slate-900"
        style={{ top: '35%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !bg-rose-400 !border-2 !border-slate-900"
        style={{ top: '75%' }}
      />
    </div>
  );
};

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  conditionNode: ConditionNode,
};

interface WorkflowCanvasProps {
  automation: AutomationGraph;
  isExecuting?: boolean;
  executingStepIndex?: number;
  onRunTest?: () => void;
  onDropTemplateNode?: (nodeData: any) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  automation,
  isExecuting = false,
  executingStepIndex = -1,
  onRunTest
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showNodeLibrary, setShowNodeLibrary] = useState<boolean>(false);

  // Execution Error / Stalled Simulation State
  const [simulatedErrorNodeId, setSimulatedErrorNodeId] = useState<string | null>(null);
  const [simulatedStalledNodeId, setSimulatedStalledNodeId] = useState<string | null>(null);
  const [inspectedNodeData, setInspectedNodeData] = useState<any | null>(null);

  // Handler to retry a single problematic node
  const handleRetryNode = (nodeId: string) => {
    if (simulatedErrorNodeId === nodeId) setSimulatedErrorNodeId(null);
    if (simulatedStalledNodeId === nodeId) setSimulatedStalledNodeId(null);
    setInspectedNodeData(null);
  };

  // Sync initial nodes and edges from automation graph
  useEffect(() => {
    if (!automation) return;

    const initialNodes: Node[] = automation.nodes.map((node, index) => {
      const isTrigger = node.type === 'trigger';
      const isCondition = node.type === 'condition';
      const nodeTypeKey = isTrigger ? 'triggerNode' : isCondition ? 'conditionNode' : 'actionNode';

      // Determine if node is in error, stalled or normal state
      const isNodeError = simulatedErrorNodeId === node.id;
      const isNodeStalled = simulatedStalledNodeId === node.id;

      let executionState: 'idle' | 'running' | 'success' | 'error' | 'stalled' = 'idle';
      if (isNodeError) executionState = 'error';
      else if (isNodeStalled) executionState = 'stalled';
      else if (isExecuting && executingStepIndex === index) executionState = 'running';
      else if (isExecuting && executingStepIndex > index) executionState = 'success';

      return {
        id: node.id,
        type: nodeTypeKey,
        position: { x: 50 + index * 270, y: 120 + (index % 2 === 1 ? 40 : 0) },
        data: {
          id: node.id,
          label: node.title,
          description: node.description,
          type: node.type,
          isExecuting: isExecuting && executingStepIndex === index,
          executionState,
          errorMessage: isNodeError ? 'Falha: HTTP 504 Gateway Timeout na API externa' : undefined,
          stalledMessage: isNodeStalled ? 'Travado: Aguardando resposta do listener há 48s' : undefined,
          status: executionState === 'success' ? 'Concluído' : undefined,
          onDelete: (idToDelete: string) => handleDeleteNode(idToDelete),
          onRetryNode: (idToRetry: string) => handleRetryNode(idToRetry),
          onSelectNode: (nData: any) => setInspectedNodeData(nData)
        },
      };
    });

    const initialEdges: Edge[] = [];
    for (let i = 0; i < automation.nodes.length - 1; i++) {
      const sourceId = automation.nodes[i].id;
      const targetId = automation.nodes[i + 1].id;
      const isSourceError = simulatedErrorNodeId === sourceId;
      const isSourceStalled = simulatedStalledNodeId === sourceId;

      initialEdges.push({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: isExecuting || isSourceStalled,
        style: { 
          stroke: isSourceError ? '#f43f5e' : isSourceStalled ? '#f59e0b' : '#10b981', 
          strokeWidth: 2.5 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSourceError ? '#f43f5e' : isSourceStalled ? '#f59e0b' : '#10b981',
        },
      });
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [automation, isExecuting, executingStepIndex, simulatedErrorNodeId, simulatedStalledNodeId]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
          } as Edge,
          eds
        )
      ),
    [setEdges]
  );

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (simulatedErrorNodeId === nodeId) setSimulatedErrorNodeId(null);
    if (simulatedStalledNodeId === nodeId) setSimulatedStalledNodeId(null);
  };

  const handleAddCustomNode = (nodeType: AutomationNode['type'], title: string, description: string, customPosition?: { x: number; y: number }) => {
    const newId = `node_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const isTrigger = nodeType === 'trigger';
    const isCondition = nodeType === 'condition';
    const flowType = isTrigger ? 'triggerNode' : isCondition ? 'conditionNode' : 'actionNode';

    const lastNode = nodes[nodes.length - 1];
    const newPos = customPosition || (lastNode 
      ? { x: lastNode.position.x + 280, y: lastNode.position.y } 
      : { x: 100, y: 150 });

    const newNode: Node = {
      id: newId,
      type: flowType,
      position: newPos,
      data: {
        id: newId,
        label: title,
        description: description,
        type: nodeType,
        isExecuting: false,
        executionState: 'idle',
        onDelete: (idToDelete: string) => handleDeleteNode(idToDelete),
        onRetryNode: (idToRetry: string) => handleRetryNode(idToRetry),
        onSelectNode: (nData: any) => setInspectedNodeData(nData)
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (lastNode && !customPosition) {
      const newEdge: Edge = {
        id: `e-${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        sourceHandle: 'right',
        targetHandle: 'left',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    setShowNodeLibrary(false);
  };

  // Drag and drop handler from templates/sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Check if dropping an entire workflow template
      const rawTemplate = event.dataTransfer.getData('application/reactflow-template');
      if (rawTemplate) {
        try {
          const templateData = JSON.parse(rawTemplate);
          if (templateData.nodes && templateData.edges) {
            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const offsetX = event.clientX - reactFlowBounds.left - 50;
            const offsetY = event.clientY - reactFlowBounds.top - 50;

            const importedNodes: Node[] = templateData.nodes.map((n: any, idx: number) => ({
              id: `${n.id}_${Date.now()}_${idx}`,
              type: n.type === 'trigger' ? 'triggerNode' : n.type === 'condition' ? 'conditionNode' : 'actionNode',
              position: {
                x: (n.position?.x || 50) + offsetX,
                y: (n.position?.y || 100) + (offsetY > 150 ? offsetY - 150 : 0)
              },
              data: {
                id: `${n.id}_${Date.now()}_${idx}`,
                label: n.title,
                description: n.description,
                type: n.type,
                config: n.config,
                executionState: 'idle',
                onDelete: handleDeleteNode,
                onRetryNode: handleRetryNode,
                onSelectNode: (nData: any) => setInspectedNodeData(nData)
              }
            }));

            // Map old node ids to new node ids for edges
            const idMap: Record<string, string> = {};
            templateData.nodes.forEach((n: any, idx: number) => {
              idMap[n.id] = importedNodes[idx].id;
            });

            const importedEdges: Edge[] = templateData.edges.map((e: any, idx: number) => ({
              id: `edge_${Date.now()}_${idx}`,
              source: idMap[e.from] || e.from,
              target: idMap[e.to] || e.to,
              sourceHandle: e.conditionBranch ? (e.conditionBranch === 'then' ? 'true' : 'false') : 'right',
              targetHandle: 'left',
              animated: true,
              style: { stroke: '#10b981', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
            }));

            setNodes((nds) => [...nds, ...importedNodes]);
            setEdges((eds) => [...eds, ...importedEdges]);
            return;
          }
        } catch (e) {
          console.error('Failed to import template on drop', e);
        }
      }

      const rawData = event.dataTransfer.getData('application/reactflow-node');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left - 100,
          y: event.clientY - reactFlowBounds.top - 40,
        };

        handleAddCustomNode(item.type, item.title, item.description, position);
      } catch (err) {
        console.error('Failed to drop node', err);
      }
    },
    [nodes, handleDeleteNode]
  );

  // Toggle failure / stalled simulation
  const handleToggleSimulateError = () => {
    if (nodes.length === 0) return;
    if (simulatedErrorNodeId || simulatedStalledNodeId) {
      // Clear simulation
      setSimulatedErrorNodeId(null);
      setSimulatedStalledNodeId(null);
    } else {
      // Pick node 2 or 1 as error, and node 3 as stalled
      if (nodes.length >= 2) {
        setSimulatedErrorNodeId(nodes[1].id);
      }
      if (nodes.length >= 3) {
        setSimulatedStalledNodeId(nodes[2].id);
      }
    }
  };

  const hasIssues = Boolean(simulatedErrorNodeId || simulatedStalledNodeId);

  return (
    <div 
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="relative h-[540px] w-full rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden"
    >
      {/* Top Overlay Header inside canvas */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md">
          <Workflow className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-bold text-white">{automation.name}</span>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            {automation.triggerEvent}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowNodeLibrary(true)}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-emerald-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Adicionar Bloco</span>
        </button>

        {onRunTest && (
          <button
            type="button"
            onClick={onRunTest}
            disabled={isExecuting}
            className="flex items-center gap-1.5 rounded-xl border border-amber-600 bg-amber-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-amber-500 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{isExecuting ? 'Simulando Execução...' : 'Testar no Canvas'}</span>
          </button>
        )}

        {/* Visual Indicator Toggle: Simulate Execution Error & Stalled Nodes */}
        <button
          type="button"
          onClick={handleToggleSimulateError}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95 border ${
            hasIssues
              ? 'border-rose-500 bg-rose-600 text-white animate-pulse'
              : 'border-slate-700 bg-slate-900/90 text-slate-300 hover:border-slate-600 hover:text-white'
          }`}
        >
          <AlertTriangle className={`h-3.5 w-3.5 ${hasIssues ? 'text-white' : 'text-amber-400'}`} />
          <span>{hasIssues ? 'Limpar Falhas Simuladas' : 'Simular Erro / Nó Travado'}</span>
        </button>
      </div>

      {/* Visual Canvas Health Indicator (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {hasIssues ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/80 bg-rose-950/90 px-3 py-1.5 text-xs font-bold text-rose-300 shadow-xl backdrop-blur-md animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              {simulatedErrorNodeId && simulatedStalledNodeId
                ? '1 Nó com Erro • 1 Nó Travado'
                : simulatedErrorNodeId
                ? '1 Nó com Falha de Execução'
                : '1 Nó Travado (Stalled)'}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[10px] font-semibold text-slate-400 backdrop-blur-md">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Todos os nós operacionais</span>
          </div>
        )}
      </div>

      {/* Node Addition Palette Modal/Popover */}
      {showNodeLibrary && (
        <div className="absolute top-16 left-4 z-20 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white">Biblioteca de Blocos Low-Code</h4>
            <button 
              onClick={() => setShowNodeLibrary(false)} 
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            <button
              onClick={() => handleAddCustomNode('notification.whatsapp', 'Enviar WhatsApp HSM', 'Disparo de mensagem homologada com link Pix')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-emerald-500 hover:bg-slate-800"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Disparo de WhatsApp</p>
                <span className="text-[10px] text-slate-400">Meta Cloud API / Z-API</span>
              </div>
            </button>

            <button
              onClick={() => handleAddCustomNode('notification.email', 'Enviar E-mail Transacional', 'Recibo de compra e chave da nota fiscal')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-sky-500 hover:bg-slate-800"
            >
              <Mail className="h-4 w-4 text-sky-400" />
              <div>
                <p className="font-bold text-white">E-mail Transacional</p>
                <span className="text-[10px] text-slate-400">AWS SES / SendGrid</span>
              </div>
            </button>

            <button
              onClick={() => handleAddCustomNode('crm.upsert_contact', 'Atualizar Tag no CRM', 'Tag: VIP Recorrente e incrementa LTV')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-indigo-500 hover:bg-slate-800"
            >
              <Users className="h-4 w-4 text-indigo-400" />
              <div>
                <p className="font-bold text-white">Sincronizar Contato CRM</p>
                <span className="text-[10px] text-slate-400">HubSpot / Salesforce</span>
              </div>
            </button>

            <button
              onClick={() => handleAddCustomNode('integration.send_nfe', 'Emitir NF-e Automática', 'Emissão automática de Nota Fiscal de Serviços')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-purple-500 hover:bg-slate-800"
            >
              <FileText className="h-4 w-4 text-purple-400" />
              <div>
                <p className="font-bold text-white">Emissão de NF-e</p>
                <span className="text-[10px] text-slate-400">Focus NFe / PlugNotas</span>
              </div>
            </button>

            <button
              onClick={() => handleAddCustomNode('condition', 'Condição: Valor > R$ 500', 'Bifurcação de fluxo de acordo com o ticket médio')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-amber-500 hover:bg-slate-800"
            >
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <div>
                <p className="font-bold text-white">Condição Lógica</p>
                <span className="text-[10px] text-slate-400">Branching True / False</span>
              </div>
            </button>

            <button
              onClick={() => handleAddCustomNode('loyalty.add_points', 'Pontos de Fidelidade', 'Creditar 50 pontos no clube de vantagens')}
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-800/60 p-2 text-left text-xs transition-colors hover:border-yellow-500 hover:bg-slate-800"
            >
              <Award className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="font-bold text-white">Programa de Fidelidade</p>
                <span className="text-[10px] text-slate-400">Gamificação de Retenção</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Node Diagnostics Drawer / Modal */}
      {inspectedNodeData && (
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-slide-up flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              inspectedNodeData.executionState === 'error'
                ? 'bg-rose-600 text-white'
                : inspectedNodeData.executionState === 'stalled'
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {inspectedNodeData.executionState === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : inspectedNodeData.executionState === 'stalled' ? (
                <Clock className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">
                  Diagnóstico: {inspectedNodeData.label}
                </h4>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  inspectedNodeData.executionState === 'error'
                    ? 'bg-rose-500/20 text-rose-300'
                    : inspectedNodeData.executionState === 'stalled'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  Status: {inspectedNodeData.executionState || 'Normal'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {inspectedNodeData.errorMessage || inspectedNodeData.stalledMessage || inspectedNodeData.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(inspectedNodeData.executionState === 'error' || inspectedNodeData.executionState === 'stalled') && (
              <button
                onClick={() => handleRetryNode(inspectedNodeData.id)}
                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Reexecutar & Auto-Heal</span>
              </button>
            )}

            <button
              onClick={() => setInspectedNodeData(null)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls className="!bg-slate-900 !border-slate-800 !text-white !fill-white rounded-xl shadow-lg" />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor="#1e293b" 
          maskColor="rgba(15, 23, 42, 0.7)"
          className="!bg-slate-900 !border-slate-800 rounded-xl"
        />
      </ReactFlow>
    </div>
  );
};
