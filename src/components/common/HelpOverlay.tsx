import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayment } from '../../context/PaymentContext';
import { 
  Keyboard, 
  Search, 
  X, 
  Sliders, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Lock, 
  Mic, 
  EyeOff, 
  RefreshCcw, 
  FileSpreadsheet, 
  Globe, 
  Cpu, 
  ArrowRight,
  Terminal,
  Sparkles,
  Command,
  Gift
} from 'lucide-react';

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navegação' | 'Ações Rápidas' | 'Segurança & Compliance' | 'Orquestração & Reconciliação';
  action?: () => void;
  badge?: string;
}

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, toggleTheme, togglePrivacyMode, addToast } = usePayment();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const shortcuts: ShortcutItem[] = useMemo(() => [
    // 1. Navegação
    {
      keys: ['⌘', 'H'],
      description: 'Ir para a Visão Geral do Dashboard (Overview)',
      category: 'Navegação',
      action: () => { setActiveTab('overview'); onClose(); }
    },
    {
      keys: ['⌘', '1'],
      description: 'Ir para a Visão Geral (Overview Dashboard)',
      category: 'Navegação',
      action: () => { setActiveTab('overview'); onClose(); }
    },
    {
      keys: ['⌘', '2'],
      description: 'Ir para a Matriz de Orquestração & Roteamento',
      category: 'Navegação',
      action: () => { setActiveTab('orchestration'); onClose(); }
    },
    {
      keys: ['⌘', '3'],
      description: 'Ir para o Super Checkout Pro & Link de Pagamento',
      category: 'Navegação',
      action: () => { setActiveTab('checkout'); onClose(); }
    },
    {
      keys: ['⌘', '4'],
      description: 'Ir para Gateways & Provedores Adquirentes',
      category: 'Navegação',
      action: () => { setActiveTab('gateway'); onClose(); }
    },
    {
      keys: ['⌘', '5'],
      description: 'Ir para CRM & Automação de Cobranças',
      category: 'Navegação',
      action: () => { setActiveTab('crm'); onClose(); }
    },
    {
      keys: ['⌘', '6'],
      description: 'Ir para Compliance, Auditoria & Segurança',
      category: 'Navegação',
      action: () => { setActiveTab('compliance'); onClose(); }
    },
    {
      keys: ['⌘', '7'],
      description: 'Ir para Módulo de Cashback & Metas de Volume (Admin)',
      category: 'Navegação',
      action: () => { setActiveTab('cashback'); onClose(); },
      badge: 'Novo'
    },
    {
      keys: ['⌘', ','],
      description: 'Abrir Configurações de Compliance & Segurança',
      category: 'Navegação',
      action: () => { setActiveTab('compliance'); onClose(); }
    },
    {
      keys: ['⌘', 'G'],
      description: 'Navegar para Gateways de Pagamento',
      category: 'Navegação',
      action: () => { setActiveTab('gateway'); onClose(); }
    },

    // 2. Ações Rápidas
    {
      keys: ['⌘', 'K'],
      description: 'Abrir Command Palette Central & Busca Global',
      category: 'Ações Rápidas',
      action: () => { 
        onClose(); 
        window.dispatchEvent(new CustomEvent('nercash:open-search-modal'));
      },
      badge: 'Essencial'
    },
    {
      keys: ['⌘', 'E'],
      description: 'Exportar Dados do Sistema (JSON / CSV)',
      category: 'Ações Rápidas',
      action: () => { 
        onClose(); 
        window.dispatchEvent(new CustomEvent('nercash:open-export-modal'));
      }
    },
    {
      keys: ['⌘', 'R'],
      description: 'Recarregar Métricas do Dashboard em Tempo Real',
      category: 'Ações Rápidas',
      action: () => {
        window.dispatchEvent(new CustomEvent('dashboard:force-refresh'));
        addToast('Dashboard Refresh', 'Atualizando métricas em tempo real...', 'success');
        onClose();
      }
    },
    {
      keys: ['Alt', 'P'],
      description: 'Alternar Modo de Privacidade (Ocular Valores Sensíveis)',
      category: 'Ações Rápidas',
      action: () => { togglePrivacyMode(); onClose(); }
    },
    {
      keys: ['⌘', 'Shift', 'L'],
      description: 'Alternar Tema Claro / Escuro (Dark Mode)',
      category: 'Ações Rápidas',
      action: () => { toggleTheme(); onClose(); }
    },
    {
      keys: ['⌘', 'Shift', 'V'],
      description: 'Ativar Assistente de Comando de Voz',
      category: 'Ações Rápidas',
      action: () => {
        onClose();
        window.dispatchEvent(new CustomEvent('nercash:trigger-voice-command'));
      }
    },
    {
      keys: ['?'],
      description: 'Abrir esta Central de Atalhos e Ajuda (Help Overlay)',
      category: 'Ações Rápidas',
      badge: 'Ajuda'
    },

    // 3. Segurança & Compliance
    {
      keys: ['Ctrl', 'Alt', 'S'],
      description: 'Executar Verificação de Integridade Merkle Root (Audit Log)',
      category: 'Segurança & Compliance',
      action: () => {
        setActiveTab('compliance');
        onClose();
        addToast('Merkle Tree Scan', 'Iniciando verificação de integridade criptográfica da cadeia SHA-256.', 'info');
      }
    },
    {
      keys: ['Ctrl', 'Alt', 'L'],
      description: 'Bloquear Sessão Imediatamente (Lock Screen)',
      category: 'Segurança & Compliance',
      action: () => {
        window.dispatchEvent(new CustomEvent('nercash:lock-session'));
        onClose();
      }
    },
    {
      keys: ['Ctrl', 'Alt', 'P'],
      description: 'Disparar Protocolo de Emergência (Panic Button)',
      category: 'Segurança & Compliance',
      action: () => {
        window.dispatchEvent(new CustomEvent('nercash:trigger-panic-modal'));
        onClose();
      }
    },

    // 4. Orquestração & Reconciliação
    {
      keys: ['⌘', 'Shift', 'O'],
      description: 'Abrir Central de Orquestração & Regras Inteligentes',
      category: 'Orquestração & Reconciliação',
      action: () => { setActiveTab('orchestration'); onClose(); }
    },
    {
      keys: ['⌘', 'Shift', 'B'],
      description: 'Abrir Reconciliação de Lote CSV & Conflict Visualizer',
      category: 'Orquestração & Reconciliação',
      action: () => {
        setActiveTab('orchestration');
        onClose();
        addToast('Reconciliação CSV', 'Carregando Smart Batch Reconciliation...', 'info');
      }
    },
    {
      keys: ['⌘', 'Shift', 'C'],
      description: 'Abrir Terminal Super Checkout',
      category: 'Orquestração & Reconciliação',
      action: () => { setActiveTab('checkout'); onClose(); }
    },
    {
      keys: ['⌘', 'Shift', 'A'],
      description: 'Abrir OpenAPI Docs & Sandbox',
      category: 'Orquestração & Reconciliação',
      action: () => { setActiveTab('api'); onClose(); }
    }
  ], [setActiveTab, togglePrivacyMode, toggleTheme, addToast, onClose]);

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesSearch = 
        s.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.keys.some(k => k.toLowerCase().includes(searchFilter.toLowerCase())) ||
        s.category.toLowerCase().includes(searchFilter.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [shortcuts, selectedCategory, searchFilter]);

  // Group filtered shortcuts by category
  const categories = useMemo(() => {
    const grouped: Record<string, ShortcutItem[]> = {};
    filteredShortcuts.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filteredShortcuts]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md" 
          id="help-overlay-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.93, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Central de Atalhos de Teclado & Comandos (Help Overlay)
                    </h2>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Pressione '?'
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Navegação ultra-rápida e execução direta de rotinas para operadores financeiros Nercash
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                title="Fechar (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input and Category Filter Bar */}
            <div className="border-b border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar comando, atalho ou tela (ex: 'Cashback', 'Orquestração', 'Cmd+K', 'Privacidade')..."
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'Todos os Atalhos' },
                  { id: 'Navegação', label: 'Navegação' },
                  { id: 'Ações Rápidas', label: 'Ações Rápidas' },
                  { id: 'Segurança & Compliance', label: 'Segurança' },
                  { id: 'Orquestração & Reconciliação', label: 'Orquestração' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shortcuts List Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {Object.keys(categories).length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold text-slate-500">
                    Nenhum atalho encontrado para "{searchFilter}".
                  </p>
                </div>
              ) : (
                (Object.entries(categories) as [string, ShortcutItem[]][]).map(([catTitle, items]) => (
                  <div key={catTitle} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {catTitle}
                      </h3>
                      <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {items.length} atalhos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => item.action && item.action()}
                          className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs transition-all dark:border-slate-800/70 dark:bg-slate-950/40 ${
                            item.action ? 'hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/30 cursor-pointer group' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                              {item.description}
                            </span>
                            {item.badge && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.keys.map((key, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="inline-flex min-w-[24px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              >
                                {key}
                              </kbd>
                            ))}
                            {item.action && (
                              <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-indigo-600 transition-all dark:text-slate-600 dark:group-hover:text-indigo-400 ml-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dica: Pressione <kbd className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 dark:bg-slate-800 dark:border-slate-700">?</kbd> em qualquer tela para abrir este painel.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
