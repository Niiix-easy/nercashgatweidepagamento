import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Sparkles, 
  HelpCircle, 
  Search, 
  Zap, 
  ShieldCheck, 
  Compass, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Volume2, 
  Activity, 
  Lightbulb, 
  CornerDownLeft, 
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';

export interface AssistanceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    tab: string;
  };
  suggestedPrompts?: string[];
}

export const KNOWLEDGE_BASE = [
  {
    keywords: ['pix', 'qr code', 'pagar', 'chave'],
    question: 'Como funciona o Pix Dinâmico no Super Checkout?',
    answer: 'O Pix Dinâmico gera uma chave Copia e Cola e um QR Code únicos em tempo real com renovação de expiração. A liquidação é notificada instantaneamente via Webhook em milissegundos.',
    tab: 'checkout',
    actionText: 'Ir para Super Checkout'
  },
  {
    keywords: ['roteamento', 'orquestração', 'adquirente', 'fallbacks', 'regra'],
    question: 'Como configurar o roteamento dinâmico de pagamentos?',
    answer: 'Na Matriz de Orquestração você pode criar regras encadeadas por valor, bandeira de cartão ou custo de taxa. Se uma adquirente falhar, o Nercash re-roteia o pagamento para a adquirente secundária automaticamente.',
    tab: 'orchestration',
    actionText: 'Abrir Orquestração'
  },
  {
    keywords: ['estorno', 'reconciliação', 'conciliar', 'csv', 'extrato'],
    question: 'Como conciliar transações ou exportar extratos?',
    answer: 'Acesse a tabela de transações na Visão Geral ou no Batch Ledger em Compliance. Selecione múltiplos registros e use a barra de ações rápidas para Conciliar, Marcar como Fraude ou Exportar para CSV com validação de segurança.',
    tab: 'overview',
    actionText: 'Ver Transações'
  },
  {
    keywords: ['whatsapp', 'crm', 'cobrança', 'recuperação', 'régua'],
    question: 'Como ativar a recuperação de vendas no WhatsApp?',
    answer: 'No CRM & Automação, configure sua conta no conector WhatsApp Meta API. Você pode criar réguas de cobrança que enviam lembretes automáticos com o código Pix para clientes que não concluíram o pagamento.',
    tab: 'crm',
    actionText: 'Ir para CRM & Automação'
  },
  {
    keywords: ['api', 'token', 'key', 'chave', 'openapi', 'bearer'],
    question: 'Onde encontro as Chaves de API e a documentação REST?',
    answer: 'No módulo OpenAPI Docs & Sandbox você encontra o explorador de endpoints, exemplos prontos em cURL e Node.js e o gerenciador de Chaves de API Secretas e Publicáveis.',
    tab: 'api',
    actionText: 'Ver Documentação API'
  },
  {
    keywords: ['taxa', 'gateway', 'cielo', 'stone', 'mercado pago', 'asaas'],
    question: 'Como alterar credenciais e taxas das adquirentes?',
    answer: 'No módulo Gateway Settings você pode alterar os tokens de API, ativar o modo Sandbox/Produção e configurar a tabela de taxas MDR para cálculo de margem de lucro.',
    tab: 'gateway',
    actionText: 'Ir para Gateway Settings'
  },
  {
    keywords: ['cashback', 'meta', 'desconto', 'fidelidade'],
    question: 'Como funciona a barra de metas de volume e cashback?',
    answer: 'O módulo de Cashback permite configurar um programa de fidelidade para os clientes e acompanhar metas quinzenais de faturamento (TPV) para liberar desconto automático na taxa do gateway.',
    tab: 'cashback',
    actionText: 'Ver Metas & Cashback'
  },
  {
    keywords: ['lgpd', 'privacidade', 'titular', 'dados', 'esquecimento', 'portabilidade', 'consentimento', 'dpo', 'anpd'],
    question: 'Como funciona a conformidade LGPD (Lei de Proteção de Dados)?',
    answer: 'O Nercash oferece um Portal do Titular completo (LGPD Art. 18), com relatórios de portabilidade em JSON/CSV, solicitação de anonimização (Direito ao Esquecimento), gestão de consentimento e contato com o Encarregado (DPO).',
    tab: 'compliance',
    actionText: 'Abrir Portal do Titular LGPD'
  },
  {
    keywords: ['pci', 'auditoria', 'hash', 'merkle', 'segurança', 'log'],
    question: 'Como verificar os logs de auditoria e conformidade PCI-DSS?',
    answer: 'Em Compliance & Auditoria, todos os logs sensíveis possuem assinaturas criptográficas em árvore Merkle (SHA-256). Você também pode gerar relatórios PCI-DSS v4.0 e auditar acessos.',
    tab: 'compliance',
    actionText: 'Ir para Compliance'
  }
];

export const UserAssistanceCopilot: React.FC = () => {
  const { activeTab, setActiveTab, addToast } = usePayment();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'voice' | 'faq' | 'diagnostics'>('chat');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('Clique no microfone e diga um comando ou pergunta.');
  const [messages, setMessages] = useState<AssistanceMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Olá! Sou a Nercash AI, sua assistente virtual em tempo real. Como posso te ajudar a gerenciar pagamentos, orquestrar adquirentes ou tirar dúvidas sobre a plataforma?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Como funciona o Pix Dinâmico?',
        'Como configurar a orquestração?',
        'Onde gero chaves de API?',
        'Como conciliar vendas em lote?'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen && activeMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeMode]);

  // Listen for global custom trigger events
  useEffect(() => {
    const handleOpenAssistance = (e?: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e?.detail?.mode) {
        setActiveMode(e.detail.mode);
      }
    };

    window.addEventListener('nercash:open-user-assistance', handleOpenAssistance);
    window.addEventListener('nercash:open-help-overlay', handleOpenAssistance);
    return () => {
      window.removeEventListener('nercash:open-user-assistance', handleOpenAssistance);
      window.removeEventListener('nercash:open-help-overlay', handleOpenAssistance);
    };
  }, []);

  // Voice recognition logic
  const toggleVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Assistente de Voz', 'Reconhecimento de voz não suportado neste navegador. Utilize o chat por texto.', 'warning');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceTranscript('Ouvindo sua voz...');

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setVoiceTranscript(text);
        if (event.results[0].isFinal) {
          processVoiceQuery(text);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const processVoiceQuery = (query: string) => {
    const lower = query.toLowerCase();
    setIsListening(false);

    if (lower.includes('transação') || lower.includes('vendas') || lower.includes('painel') || lower.includes('dashboard')) {
      setVoiceResponse('Comando identificado: Redirecionando para a Visão Geral de Transações.');
      setActiveTab('overview');
      addToast('Assistente Nercash', 'Navegando para Visão Geral', 'info');
    } else if (lower.includes('orquestra') || lower.includes('rotear') || lower.includes('regra')) {
      setVoiceResponse('Comando identificado: Abrindo a Matriz de Orquestração & Roteamento.');
      setActiveTab('orchestration');
      addToast('Assistente Nercash', 'Navegando para Orquestração', 'info');
    } else if (lower.includes('checkout') || lower.includes('pix') || lower.includes('link')) {
      setVoiceResponse('Comando identificado: Abrindo o Super Checkout Pro & Pix Dinâmico.');
      setActiveTab('checkout');
      addToast('Assistente Nercash', 'Navegando para Super Checkout', 'info');
    } else if (lower.includes('crm') || lower.includes('whatsapp') || lower.includes('cobrança')) {
      setVoiceResponse('Comando identificado: Navegando para o CRM de Cobranças.');
      setActiveTab('crm');
      addToast('Assistente Nercash', 'Navegando para CRM', 'info');
    } else if (lower.includes('api') || lower.includes('token') || lower.includes('docs')) {
      setVoiceResponse('Comando identificado: Abrindo a Documentação OpenAPI & Sandbox.');
      setActiveTab('api');
      addToast('Assistente Nercash', 'Navegando para OpenAPI', 'info');
    } else {
      setVoiceResponse(`Sua solicitação "${query}" foi processada pela Inteligência Artificial Nercash.`);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AssistanceMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Generate intelligent AI response based on knowledge base or module context
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let matched = KNOWLEDGE_BASE.find(item => item.keywords.some(k => lowerText.includes(k)));

      let responseText = '';
      let actionBtn = undefined;

      if (matched) {
        responseText = matched.answer;
        actionBtn = {
          label: matched.actionText,
          tab: matched.tab
        };
      } else if (lowerText.includes('ajuda') || lowerText.includes('suporte') || lowerText.includes('contato')) {
        responseText = 'Você pode navegar pelos módulos através dos atalhos de teclado, consultar nossa documentação de API ou utilizar o diagnóstico do sistema.';
      } else {
        responseText = `Entendi sua pergunta sobre "${text}". Para este tópico, você pode verificar as configurações do módulo ativo (${activeTab.toUpperCase()}) ou utilizar nossa base de conhecimento.`;
        actionBtn = {
          label: `Ir para ${activeTab.toUpperCase()}`,
          tab: activeTab
        };
      }

      const assistantMsg: AssistanceMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: actionBtn,
        suggestedPrompts: [
          'Como funciona a orquestração?',
          'Onde gero chaves de API?',
          'Como conciliar transações?'
        ]
      };

      setMessages(prev => [...prev, assistantMsg]);
    }, 600);
  };

  return (
    <>
      {/* 1. FLOATING ASSISTANCE FAB BUTTON (Bottom Right) */}
      {!isOpen && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            className="group relative flex h-13 items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-4 text-white shadow-2xl hover:shadow-indigo-500/30 active:scale-95 transition-all cursor-pointer border border-indigo-400/30"
            title="Abrir Central de Assistência ao Usuário Nercash AI"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <Bot className="h-5 w-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
              </span>
            </div>
            <span className="text-xs font-bold tracking-tight pr-1 hidden sm:inline">
              Assistência AI
            </span>
          </button>
        </motion.div>
      )}

      {/* 2. USER ASSISTANCE COPILOT MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-slate-950/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              className={`w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all overflow-hidden ${
                isMinimized 
                  ? 'h-16 rounded-t-3xl sm:rounded-3xl' 
                  : 'h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl'
              }`}
              onClick={e => e.stopPropagation()}
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/80 text-white border border-indigo-400/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Nercash AI Assistant</h3>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                        Online
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Suporte inteligente e orientação para toda a aplicação
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                    title={isMinimized ? "Expandir Painel" : "Minimizar Painel"}
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Mode Navigation Tabs */}
                  <div className="flex items-center border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-1.5 gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveMode('chat')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                        activeMode === 'chat' 
                          ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Chat AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('voice')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                        activeMode === 'voice' 
                          ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Voz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('faq')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                        activeMode === 'faq' 
                          ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Dúvidas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('diagnostics')}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                        activeMode === 'diagnostics' 
                          ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>Diagnóstico</span>
                    </button>
                  </div>

                  {/* Body Content based on Active Mode */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* MODE 1: CHAT */}
                    {activeMode === 'chat' && (
                      <div className="space-y-4">
                        {messages.map(msg => (
                          <div 
                            key={msg.id}
                            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                            }`}>
                              <p>{msg.text}</p>
                              
                              {/* Direct Navigation Action Button */}
                              {msg.actionButton && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab(msg.actionButton!.tab);
                                    addToast('Navegação Assistida', `Indo para ${msg.actionButton!.tab.toUpperCase()}`, 'info');
                                  }}
                                  className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-500 cursor-pointer shadow-xs"
                                >
                                  <span>{msg.actionButton.label}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1 px-1">
                              {msg.timestamp}
                            </span>

                            {/* Suggested Quick Prompts */}
                            {msg.suggestedPrompts && (
                              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                                {msg.suggestedPrompts.map((prompt, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => handleSendMessage(prompt)}
                                    className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer transition-all"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}

                    {/* MODE 2: VOICE */}
                    {activeMode === 'voice' && (
                      <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
                        <div className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                          isListening 
                            ? 'bg-rose-100 text-rose-600 animate-pulse dark:bg-rose-950/60 dark:text-rose-400' 
                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        }`}>
                          <Mic className="h-10 w-10" />
                          {isListening && (
                            <span className="absolute -inset-3 rounded-full border-2 border-rose-500 animate-ping opacity-75" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {isListening ? 'Ouvindo comando de voz...' : 'Assistente de Voz Ativo'}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                            {isListening ? 'Fale normalmente para navegar ou executar ações' : 'Clique no botão abaixo para começar a falar'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={toggleVoiceListening}
                          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer transition-all ${
                            isListening ? 'bg-rose-600 hover:bg-rose-500' : 'bg-indigo-600 hover:bg-indigo-500'
                          }`}
                        >
                          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          <span>{isListening ? 'Parar de Ouvir' : 'Iniciar Escuta de Voz'}</span>
                        </button>

                        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-slate-950 space-y-1">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Transcrição:</p>
                          <p className="text-xs font-mono text-slate-800 dark:text-slate-200">
                            {voiceTranscript || '"Aguardando entrada de áudio..."'}
                          </p>
                        </div>

                        <div className="w-full rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 text-left dark:border-indigo-900/60 dark:bg-indigo-950/40 space-y-1">
                          <p className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>Resposta IA:</span>
                          </p>
                          <p className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                            {voiceResponse}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* MODE 3: FAQ & KNOWLEDGE BASE */}
                    {activeMode === 'faq' && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Perguntas Frequentes & Orientações
                        </div>

                        {KNOWLEDGE_BASE.map((kb, idx) => (
                          <div 
                            key={idx}
                            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2 dark:border-slate-800 dark:bg-slate-950/40"
                          >
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <HelpCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <span>{kb.question}</span>
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {kb.answer}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab(kb.tab);
                                setIsOpen(false);
                                addToast('Orientações', `Navegando para o módulo ${kb.tab.toUpperCase()}`, 'info');
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer pt-1"
                            >
                              <span>{kb.actionText}</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MODE 4: SYSTEM DIAGNOSTICS */}
                    {activeMode === 'diagnostics' && (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Activity className="h-4 w-4 text-emerald-500" />
                              Diagnóstico do Módulo Ativo
                            </span>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {activeTab.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400">Latência de Resposta</span>
                              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">12 ms (Excelente)</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400">SLA dos Conectores</span>
                              <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">99.99% Uptime</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400">Proteção WAF</span>
                              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Ativa (OWASP Top 10)</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-1">
                              <span className="text-[10px] text-slate-400">Segurança de Dados</span>
                              <p className="font-mono font-bold text-purple-600 dark:text-purple-400">PCI-DSS v4.0</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Status Geral Operacional</span>
                          </p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300">
                            Todos os microsserviços de cobrança, webhooks e barramento de pagamentos estão operando com desempenho máximo sem falhas pendentes.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Input Bar (for Chat Mode) */}
                  {activeMode === 'chat' && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Pergunte algo ou solicite orientação..."
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 cursor-pointer transition-all"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
