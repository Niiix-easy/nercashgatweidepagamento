import React, { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  X, 
  Check, 
  Archive, 
  Download, 
  Play, 
  RotateCcw, 
  Trash2,
  ShieldCheck,
  Zap,
  Sparkles,
  Info,
  AlertTriangle
} from 'lucide-react';

export interface QuickActionOption {
  id: string;
  label: string;
  shortcut: string; // e.g. "A", "X", "E"
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
  impactDescription?: string; // Context-aware tooltip explaining the impact before execution
  warningNote?: string; // Irreversible or critical warning
  onClick: () => void;
}

interface FloatingQuickActionsBarProps {
  selectedCount: number;
  totalCount?: number;
  entityLabel?: string;
  onClearSelection: () => void;
  actions: QuickActionOption[];
}

export const FloatingQuickActionsBar: React.FC<FloatingQuickActionsBarProps> = ({
  selectedCount,
  totalCount,
  entityLabel = 'itens',
  onClearSelection,
  actions
}) => {
  const [hoveredAction, setHoveredAction] = useState<QuickActionOption | null>(null);

  // Global keyboard shortcuts listener for quick actions
  useEffect(() => {
    if (selectedCount === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClearSelection();
        return;
      }

      const key = e.key.toUpperCase();
      const matchedAction = actions.find(a => a.shortcut.toUpperCase() === key);
      if (matchedAction) {
        e.preventDefault();
        matchedAction.onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCount, actions, onClearSelection]);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in flex flex-col items-center">
      {/* Context-aware Hover Tooltip Box */}
      {hoveredAction && hoveredAction.impactDescription && (
        <div className="mb-2 w-max max-w-sm rounded-xl border border-slate-700 bg-slate-950/95 px-3.5 py-2.5 text-xs text-slate-200 shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <Info className="h-3.5 w-3.5 text-emerald-400" />
            <span>Impacto da Ação: {hoveredAction.label} ({selectedCount} {entityLabel})</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {hoveredAction.impactDescription}
          </p>
          {hoveredAction.warningNote && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-amber-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{hoveredAction.warningNote}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/95">
        {/* Selected count pill */}
        <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
            {selectedCount}
          </div>
          <span className="text-xs font-semibold whitespace-nowrap text-slate-200">
            {selectedCount === 1 ? `1 ${entityLabel.replace(/s$/, '')} selecionado` : `${selectedCount} ${entityLabel} selecionados`}
          </span>
        </div>

        {/* Action buttons with tooltips */}
        <div className="flex items-center gap-2">
          {actions.map(action => {
            let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700';
            if (action.variant === 'primary') {
              btnClass = 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500';
            } else if (action.variant === 'success') {
              btnClass = 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500';
            } else if (action.variant === 'danger') {
              btnClass = 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500';
            } else if (action.variant === 'warning') {
              btnClass = 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500';
            }

            return (
              <div 
                key={action.id} 
                className="relative group"
                onMouseEnter={() => setHoveredAction(action)}
                onMouseLeave={() => setHoveredAction(null)}
              >
                <button
                  type="button"
                  onClick={action.onClick}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${btnClass}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                  <kbd className="ml-1 rounded bg-black/30 px-1.5 py-0.5 font-mono text-[9px] text-slate-300">
                    {action.shortcut}
                  </kbd>
                </button>
              </div>
            );
          })}
        </div>

        {/* Clear selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all ml-1"
          title="Desmarcar todos (Esc)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
