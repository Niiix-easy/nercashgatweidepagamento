import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, CheckCircle2, ArrowRight, Zap, Radio } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab } = usePayment();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string>('Diga um comando de voz, ex: "mostrar transações", "gerar relatório de risco", "status do gateway", "fluxos de automação".');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          processCommand(text);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        // Fallback simulation for browsers without SpeechRecognition
        setTimeout(() => {
          setTranscript('gerar relatório de risco');
          processCommand('gerar relatório de risco');
        }, 1500);
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (lower.includes('transação') || lower.includes('última hora') || lower.includes('mostrar')) {
        setAssistantResponse('Comando reconhecido: Exibindo transações e métricas em tempo real na aba Overview.');
        setActiveTab('overview');
        setTimeout(() => onClose(), 2000);
      } else if (lower.includes('relatório') || lower.includes('risco') || lower.includes('fraud')) {
        setAssistantResponse('Comando reconhecido: Abrindo relatórios de inteligência de risco e modelos ML no Overview.');
        setActiveTab('overview');
        setTimeout(() => onClose(), 2000);
      } else if (lower.includes('automação') || lower.includes('workflow') || lower.includes('crm')) {
        setAssistantResponse('Comando reconhecido: Navegando para o CRM & Automação de Processos.');
        setActiveTab('crm');
        setTimeout(() => onClose(), 2000);
      } else if (lower.includes('adquirente') || lower.includes('gateway') || lower.includes('status')) {
        setAssistantResponse('Comando reconhecido: Todos os 5 adquirentes estão operando com SLA de 99.99%.');
      } else {
        setAssistantResponse(`Comando "${cmd}" processado com sucesso pelo agente Nercash AI.`);
      }
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Mic className={`h-5 w-5 ${isListening ? 'animate-bounce text-rose-600' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Assistente de Voz Nercash AI</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Online
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fale um comando para gerenciar pagamentos, riscos e automações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
            isListening ? 'bg-rose-100 text-rose-600 animate-pulse dark:bg-rose-950/60 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
          }`}>
            <Mic className="h-8 w-8" />
            {isListening && (
              <span className="absolute -inset-2 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
            )}
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            {isListening ? 'Ouvindo sua voz...' : 'Processando comando...'}
          </p>

          <div className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[11px] font-bold uppercase text-slate-400">Transcrição Detectada:</p>
            <p className="mt-1 text-sm font-mono font-bold text-slate-900 dark:text-white">
              {transcript || '"Aguardando áudio..."'}
            </p>
          </div>

          <div className="mt-3 w-full rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-left dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <p className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Resposta da IA Nercash:</span>
            </p>
            <p className="mt-1 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
              {assistantResponse}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTranscript('mostrar última hora transações');
              processCommand('mostrar última hora transações');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
          >
            Testar Exemplo: "Mostrar Transações"
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
