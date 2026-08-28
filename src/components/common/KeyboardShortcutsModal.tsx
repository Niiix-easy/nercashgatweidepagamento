import React from 'react';
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
  CornerDownLeft
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
    actionLabel?: string;
  }[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcutCategories: ShortcutCategory[] = [
    {
      title: 'Navegação Rápida',
      shortcuts: [
        { keys: [modKey, 'H'], description: 'Ir para o Painel Geral (Overview Dashboard)', actionLabel: 'Início' },
        { keys: [modKey, 'Shift', 'O'], description: 'Ir para Orquestração & Roteamento', actionLabel: 'Orquestração' },
        { keys: [modKey, 'Shift', 'C'], description: 'Abrir Super Checkout Sandbox', actionLabel: 'Checkout' },
        { keys: [modKey, 'Shift', 'A'], description: 'Abrir API Docs & Sandbox Interativo', actionLabel: 'API Docs' },
        { keys: [modKey, ','], description: 'Abrir Configurações de Conformidade & Segurança', actionLabel: 'Configurações' },
      ]
    },
    {
      title: 'Ações Globais & Modais',
      shortcuts: [
        { keys: [modKey, 'K'], description: 'Abrir Busca Global & Paleta de Comandos', actionLabel: 'Quick Find' },
        { keys: [modKey, 'E'], description: 'Abrir Modal de Exportação Global de Dados (CSV/PDF)', actionLabel: 'Exportar' },
        { keys: [modKey, 'Shift', 'L'], description: 'Alternar Tema Claro / Escuro', actionLabel: 'Tema' },
        { keys: ['?'], description: 'Exibir este guia de atalhos de teclado', actionLabel: 'Ajuda' },
        { keys: ['Esc'], description: 'Fechar qualquer modal aberto ou cancelar ação', actionLabel: 'Fechar' },
      ]
    },
    {
      title: 'Consultas & Produtividade',
      shortcuts: [
        { keys: [modKey, '/'], description: 'Focar na barra de busca de Inteligência Artificial', actionLabel: 'IA Search' },
        { keys: ['Enter'], description: 'Executar consulta ou confirmar item selecionado', actionLabel: 'Confirmar' },
        { keys: ['↑', '↓'], description: 'Navegar pelos resultados em listas ou paleta', actionLabel: 'Navegar' }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Atalhos Globais do Teclado
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acelere suas operações e auditorias na plataforma Nercash
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="max-h-[65vh] overflow-y-auto p-6 space-y-6">
          {shortcutCategories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {category.title}
              </h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 divide-y divide-slate-100 dark:border-slate-800/80 dark:bg-slate-800/30 dark:divide-slate-800/80">
                {category.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {shortcut.description}
                      </span>
                      {shortcut.actionLabel && (
                        <span className="hidden sm:inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                          {shortcut.actionLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd 
                          key={keyIdx}
                          className="flex min-w-6 items-center justify-center rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] font-bold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Command className="h-3.5 w-3.5 text-indigo-500" />
            <span>Pressione <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] dark:border-slate-700 dark:bg-slate-900">?</kbd> a qualquer momento para abrir esta ajuda</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
