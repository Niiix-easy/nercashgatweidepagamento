import React, { useState, useMemo } from 'react';
import { 
  Keyboard, 
  X, 
  Search, 
  Home, 
  Settings, 
  Download, 
  Sun, 
  Sliders, 
  CreditCard, 
  Terminal, 
  ShieldCheck,
  Command,
  CornerDownLeft,
  Sparkles,
  Zap,
  Mic,
  RefreshCw,
  EyeOff,
  GitFork,
  Check,
  ArrowRight,
  Layers
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  actionLabel?: string;
  category: 'Navegação' | 'Ações Globais' | 'Produtividade & IA' | 'Segurança';
  onExecute?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, toggleTheme, togglePrivacyMode, addToast } = usePayment();
  const [searchFilter, setSearchFilter] = useState<string>('');

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const allShortcuts: ShortcutItem[] = useMemo(() => [
    {
      category: 'Navegação',
      keys: [modKey, 'H'],
      description: 'Ir para o Painel Geral (Overview Dashboard)',
      actionLabel: 'Início',
      onExecute: () => { setActiveTab('overview'); onClose(); }
    },
    {
      category: 'Navegação',
      keys: [modKey, 'Shift', 'O'],
      description: 'Ir para Orquestração, Failover & Roteamento',
      actionLabel: 'Orquestração',
      onExecute: () => { setActiveTab('orchestration'); onClose(); }
    },
    {
      category: 'Navegação',
      keys: [modKey, 'Shift', 'C'],
      description: 'Abrir Super Checkout Sandbox & 1-Click',
      actionLabel: 'Checkout',
      onExecute: () => { setActiveTab('checkout'); onClose(); }
    },
    {
      category: 'Navegação',
      keys: [modKey, 'Shift', 'A'],
      description: 'Abrir API Docs, Sandbox & Webhook Debugger',
      actionLabel: 'API Docs',
      onExecute: () => { setActiveTab('api'); onClose(); }
    },
    {
      category: 'Navegação',
      keys: [modKey, 'G'],
      description: 'Ir para Gateway Hub, Token Vault & Adquirentes',
      actionLabel: 'Gateways',
      onExecute: () => { setActiveTab('gateway'); onClose(); }
    },
    {
      category: 'Navegação',
      keys: [modKey, ','],
      description: 'Abrir Painel de Conformidade, Auditoria & Segurança',
      actionLabel: 'Compliance',
      onExecute: () => { setActiveTab('compliance'); onClose(); }
    },
    {
      category: 'Ações Globais',
      keys: [modKey, 'K'],
      description: 'Abrir Busca Global & Paleta de Comandos (Quick Find)',
      actionLabel: 'Buscar',
      onExecute: () => {
        onClose();
        setTimeout(() => window.dispatchEvent(new CustomEvent('nercash:open-search-modal')), 100);
      }
    },
    {
      category: 'Ações Globais',
      keys: [modKey, 'R'],
      description: 'Atualizar Métricas e Gráficos em Tempo Real (Force Refresh)',
      actionLabel: 'Recarregar',
      onExecute: () => {
        window.dispatchEvent(new CustomEvent('dashboard:force-refresh'));
        addToast('Dashboard Refresh', 'Dados atualizados em tempo real!', 'success');
        onClose();
      }
    },
    {
      category: 'Ações Globais',
      keys: [modKey, 'E'],
      description: 'Abrir Wizard Global de Exportação de Dados (CSV/PDF/JSON)',
      actionLabel: 'Exportar',
      onExecute: () => {
        onClose();
        setTimeout(() => window.dispatchEvent(new CustomEvent('nercash:open-export-modal')), 100);
      }
    },
    {
      category: 'Ações Globais',
      keys: [modKey, 'Shift', 'L'],
      description: 'Alternar Tema da Interface (Claro / Escuro)',
      actionLabel: 'Tema',
      onExecute: () => { toggleTheme(); }
    },
    {
      category: 'Ações Globais',
      keys: ['?'],
      description: 'Exibir este Guia Visual de Ajuda e Atalhos',
      actionLabel: 'Ajuda',
    },
    {
      category: 'Ações Globais',
      keys: ['Esc'],
      description: 'Fechar qualquer modal, gaveta ou sobreposição ativa',
      actionLabel: 'Fechar',
      onExecute: () => { onClose(); }
    },
    {
      category: 'Produtividade & IA',
      keys: [modKey, 'Shift', 'V'],
      description: 'Acionar Comando de Voz ("Pânico" / "Privacidade")',
      actionLabel: 'Comando de Voz',
      onExecute: () => {
        onClose();
        setTimeout(() => window.dispatchEvent(new CustomEvent('nercash:trigger-voice-command')), 100);
      }
    },
    {
      category: 'Produtividade & IA',
      keys: [modKey, '/'],
      description: 'Focar na barra de busca de Inteligência Artificial / NLQ',
      actionLabel: 'IA Search'
    },
    {
      category: 'Segurança',
      keys: ['Alt', 'P'],
      description: 'Alternar Modo Privacidade (Ocultar valores monetários e PII)',
      actionLabel: 'Privacidade',
      onExecute: () => { togglePrivacyMode(); }
    }
  ], [modKey, setActiveTab, toggleTheme, togglePrivacyMode, addToast, onClose]);

  const filteredShortcuts = useMemo(() => {
    if (!searchFilter.trim()) return allShortcuts;
    const q = searchFilter.toLowerCase();
    return allShortcuts.filter(s => 
      s.description.toLowerCase().includes(q) ||
      s.actionLabel?.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.keys.join(' ').toLowerCase().includes(q)
    );
  }, [allShortcuts, searchFilter]);

  // Group by category
  const categories = useMemo(() => {
    const map: Record<string, ShortcutItem[]> = {};
    filteredShortcuts.forEach(s => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [filteredShortcuts]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      id="keyboard-shortcuts-help-overlay"
    >
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Guia Visual de Atalhos & Comandos Globais
                </h2>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Ajuda (?)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pressione qualquer combinação ou clique em <span className="font-semibold text-indigo-600 dark:text-indigo-400">Executar</span> para acionar a ação diretamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar comando por nome, tecla ou ação (ex: 'buscar', 'exportar', 'Ctrl+R')..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900"
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[58vh] overflow-y-auto p-6 space-y-6">
          {Object.keys(categories).length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum atalho encontrado para a busca "{searchFilter}".
            </div>
          ) : (
            (Object.entries(categories) as [string, ShortcutItem[]][]).map(([catTitle, items]) => (
              <div key={catTitle} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {catTitle}
                  </h3>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 divide-y divide-slate-100 dark:border-slate-800/80 dark:bg-slate-950/40 dark:divide-slate-800/80">
                  {items.map((shortcut, idx) => (
                    <div 
                      key={idx} 
                      className="group flex items-center justify-between p-3.5 text-xs hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all"
                    >
                      <div className="flex items-center gap-3 pr-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {shortcut.description}
                        </span>
                        {shortcut.actionLabel && (
                          <span className="hidden sm:inline-block rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                            {shortcut.actionLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <kbd 
                              key={keyIdx}
                              className="flex min-w-6 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>

                        {shortcut.onExecute && (
                          <button
                            type="button"
                            onClick={shortcut.onExecute}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
                          >
                            <span>Executar</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
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
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Atalhos globais ativos em todas as abas e hubs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Pressione <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">?</kbd> para alternar</span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
