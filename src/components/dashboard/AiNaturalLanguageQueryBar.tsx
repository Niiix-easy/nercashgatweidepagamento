import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  X, 
  ArrowRight, 
  SlidersHorizontal, 
  BrainCircuit, 
  Check, 
  RotateCcw,
  Zap,
  Filter,
  ShieldAlert,
  Calendar,
  DollarSign
} from 'lucide-react';
import { PaymentIntent } from '../../types/payment';

export interface AiParsedFilters {
  rawQuery: string;
  minRiskScore?: number;
  maxRiskScore?: number;
  method?: 'pix' | 'credit_card' | 'boleto' | 'all';
  status?: 'succeeded' | 'declined' | 'requires_action' | 'refunded' | 'all';
  timeRange?: 'today' | '7d' | '30d' | 'all';
  minAmount?: number;
  maxAmount?: number;
  acquirer?: string;
  explanation: string;
  isActive: boolean;
}

interface AiNaturalLanguageQueryBarProps {
  onFiltersChange: (filters: AiParsedFilters | null) => void;
  totalFilteredCount?: number;
  totalFilteredVolume?: number;
}

export const AiNaturalLanguageQueryBar: React.FC<AiNaturalLanguageQueryBarProps> = ({
  onFiltersChange,
  totalFilteredCount,
  totalFilteredVolume
}) => {
  const [query, setQuery] = useState<string>('');
  const [activeParsedFilters, setActiveParsedFilters] = useState<AiParsedFilters | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Quick Prompt Chips
  const samplePrompts = [
    { label: '🔥 Transações de maior risco da semana', query: 'Mostrar transações de maior risco da semana passada' },
    { label: '⚡ PIX acima de R$ 1.000 aprovados', query: 'PIX acima de R$ 1.000 aprovados' },
    { label: '🛡️ Cartão recusado ou com suspeita', query: 'Cartão de crédito recusado ou com alto risco' },
    { label: '💳 Vendas na Stone nos últimos 7 dias', query: 'Transações aprovadas na Stone nos últimos 7 dias' },
    { label: '⚠️ Estornos e chargebacks', query: 'Transações estornadas com chargeback' }
  ];

  // Natural Language Parser
  const parseNaturalLanguageQuery = (text: string): AiParsedFilters => {
    const lower = text.toLowerCase();
    const explanationParts: string[] = [];
    
    let minRiskScore: number | undefined;
    let maxRiskScore: number | undefined;
    let method: 'pix' | 'credit_card' | 'boleto' | undefined;
    let status: 'succeeded' | 'declined' | 'requires_action' | 'refunded' | undefined;
    let timeRange: 'today' | '7d' | '30d' | undefined;
    let minAmount: number | undefined;
    let maxAmount: number | undefined;
    let acquirer: string | undefined;

    // 1. Risk Score parsing
    if (
      lower.includes('highest risk') || 
      lower.includes('maior risco') || 
      lower.includes('alto risco') || 
      lower.includes('high risk') || 
      lower.includes('fraude') || 
      lower.includes('suspeita') ||
      lower.includes('anomalia')
    ) {
      minRiskScore = 70;
      explanationParts.push('Score de Risco ≥ 70 (Alto Risco / Anomalia ML)');
    } else if (lower.includes('baixo risco') || lower.includes('low risk') || lower.includes('seguras')) {
      maxRiskScore = 30;
      explanationParts.push('Score de Risco ≤ 30 (Seguras / Baixo Risco)');
    }

    // Explicit risk number ex: "risco > 80" or "score > 50"
    const riskMatch = lower.match(/(?:risco|score)\s*(?:>|>=|acima de|maior que)\s*(\d+)/);
    if (riskMatch) {
      minRiskScore = parseInt(riskMatch[1], 10);
      explanationParts.push(`Score de Risco ≥ ${minRiskScore}`);
    }

    // 2. Payment Method parsing
    if (lower.includes('pix')) {
      method = 'pix';
      explanationParts.push('Método: PIX Instantâneo');
    } else if (lower.includes('cartão') || lower.includes('cartao') || lower.includes('credit card') || lower.includes('crédito') || lower.includes('credito')) {
      method = 'credit_card';
      explanationParts.push('Método: Cartão de Crédito');
    } else if (lower.includes('boleto')) {
      method = 'boleto';
      explanationParts.push('Método: Boleto Bancário');
    }

    // 3. Status parsing
    if (lower.includes('aprovad') || lower.includes('succeeded') || lower.includes('sucesso') || lower.includes('concluíd') || lower.includes('vendas aprovadas')) {
      status = 'succeeded';
      explanationParts.push('Status: Aprovadas (Succeeded)');
    } else if (lower.includes('recusad') || lower.includes('declined') || lower.includes('falha') || lower.includes('negada') || lower.includes('rejeitad')) {
      status = 'declined';
      explanationParts.push('Status: Recusadas / Falhas');
    } else if (lower.includes('estorn') || lower.includes('refund') || lower.includes('chargeback') || lower.includes('devolvid')) {
      status = 'refunded';
      explanationParts.push('Status: Estornadas / Chargeback');
    } else if (lower.includes('análise') || lower.includes('analise') || lower.includes('3ds') || lower.includes('pendente') || lower.includes('revisão')) {
      status = 'requires_action';
      explanationParts.push('Status: Em Análise / 3D-Secure');
    }

    // 4. Time Range parsing
    if (
      lower.includes('last week') || 
      lower.includes('semana passada') || 
      lower.includes('últimos 7 dias') || 
      lower.includes('ultimos 7 dias') || 
      lower.includes('7 dias') || 
      lower.includes('7d') ||
      lower.includes('semana')
    ) {
      timeRange = '7d';
      explanationParts.push('Período: Últimos 7 dias');
    } else if (lower.includes('hoje') || lower.includes('today') || lower.includes('24h') || lower.includes('24 horas') || lower.includes('últimas 24')) {
      timeRange = 'today';
      explanationParts.push('Período: Hoje (Últimas 24 horas)');
    } else if (lower.includes('mês') || lower.includes('mes') || lower.includes('30 dias') || lower.includes('30d') || lower.includes('último mês')) {
      timeRange = '30d';
      explanationParts.push('Período: Últimos 30 dias');
    }

    // 5. Amount parsing: "acima de R$ 500" or "> 1000" or "maior que 2000"
    const minAmountMatch = lower.match(/(?:acima de|maior que|>|mais de|superior a)\s*(?:r\$)?\s*(\d+(?:[\.,]\d+)?)/);
    if (minAmountMatch) {
      minAmount = parseFloat(minAmountMatch[1].replace(',', '.'));
      explanationParts.push(`Valor > R$ ${minAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }

    const maxAmountMatch = lower.match(/(?:abaixo de|menor que|<|menos de|até)\s*(?:r\$)?\s*(\d+(?:[\.,]\d+)?)/);
    if (maxAmountMatch) {
      maxAmount = parseFloat(maxAmountMatch[1].replace(',', '.'));
      explanationParts.push(`Valor < R$ ${maxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }

    // 6. Acquirer parsing
    const acquirersList = ['stone', 'cielo', 'rede', 'adyen', 'pagseguro', 'mercado pago'];
    for (const acq of acquirersList) {
      if (lower.includes(acq)) {
        acquirer = acq;
        explanationParts.push(`Adquirente: ${acq.toUpperCase()}`);
        break;
      }
    }

    const explanation = explanationParts.length > 0
      ? `Filtros identificados: ${explanationParts.join(' • ')}`
      : `Buscando por termos livres contendo "${text}"`;

    return {
      rawQuery: text,
      minRiskScore,
      maxRiskScore,
      method,
      status,
      timeRange,
      minAmount,
      maxAmount,
      acquirer,
      explanation,
      isActive: true
    };
  };

  const handleExecuteQuery = (textToRun?: string) => {
    const q = textToRun !== undefined ? textToRun : query;
    if (!q.trim()) {
      handleClear();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseNaturalLanguageQuery(q);
      setActiveParsedFilters(parsed);
      onFiltersChange(parsed);
      setIsProcessing(false);
    }, 200);
  };

  const handleClear = () => {
    setQuery('');
    setActiveParsedFilters(null);
    onFiltersChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 p-4 shadow-sm transition-all dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Top Header Label */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Assistente de Consulta em Linguagem Natural</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.2 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Gemini AI
            </span>
          </span>
        </div>
        
        {activeParsedFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Input Search Box */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center text-indigo-500">
          <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
        </div>
        
        <input
          id="ai-natural-language-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: 'Show me the highest risk transactions from last week' ou 'PIX acima de R$ 500 aprovados'..."
          className="w-full rounded-xl border border-indigo-200 bg-white/95 pl-10 pr-24 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-800/80 dark:bg-slate-800/90 dark:text-white dark:placeholder:text-slate-500"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleExecuteQuery()}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <span>Consultar</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
        <span className="text-slate-400 text-[10px] font-medium shrink-0">Sugestões:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(p.query);
              handleExecuteQuery(p.query);
            }}
            className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-all shrink-0 cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* AI Parsed Results Summary Card */}
      {activeParsedFilters && (
        <div className="mt-3 rounded-xl border border-indigo-300/80 bg-indigo-50/90 p-3 text-xs dark:border-indigo-800 dark:bg-indigo-950/70 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white shrink-0">
                <Check className="h-3 w-3" />
              </div>
              <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                {activeParsedFilters.explanation}
              </p>
            </div>

            {(totalFilteredCount !== undefined && totalFilteredVolume !== undefined) && (
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {totalFilteredCount} {totalFilteredCount === 1 ? 'resultado' : 'resultados'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  R$ {totalFilteredVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
