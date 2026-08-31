import React, { useState, useEffect } from 'react';
import { Search, Compass, Shield, Zap, Terminal, BarChart3, Users, CreditCard, ArrowRight, X } from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, transactions, acquirers } = usePayment();
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchingTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(query.toLowerCase()) || 
    t.customerName?.toLowerCase().includes(query.toLowerCase()) ||
    t.gateway?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const navigationItems = [
    { title: 'Visão Geral & Dashboard', tab: 'overview', icon: BarChart3, desc: 'Métricas de TPV, Heatmaps e Monitoramento' },
    { title: 'Orchestration Hub (Roteamento & IA)', tab: 'orchestration', icon: Compass, desc: 'Fluxos visuais, Circuit Breakers e IA' },
    { title: 'Super Checkout Hub', tab: 'checkout', icon: CreditCard, desc: 'Simulador de checkout inteligente Pix/Cartão' },
    { title: 'CRM & Automações de Cobrança', tab: 'crm', icon: Users, desc: 'Recuperação de carrinhos, WhatsApp e leads' },
    { title: 'Sandbox & Webhooks API', tab: 'api', icon: Terminal, desc: 'Documentação OpenAPI e Debugger ao vivo' },
    { title: 'White-Label & Billing', tab: 'whitelabel', icon: Zap, desc: 'Personalização de marca e planos SaaS' },
    { title: 'Compliance, Segurança & Auditoria', tab: 'compliance', icon: Shield, desc: 'LGPD/GDPR, HSM, Logs e Trilha Forense' },
  ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 p-4 pt-20 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Search Bar Header */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar transações, clientes, adquirentes ou comandos..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Navigation Results */}
          {navigationItems.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Navegação Rápida entre Módulos</div>
              {navigationItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Transaction Search Results */}
          {matchingTransactions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Transações Encontradas</div>
              {matchingTransactions.map(tx => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setActiveTab('overview');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-[11px]">
                      R$
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">{tx.id} — {tx.customerName || 'Cliente'}</div>
                      <div className="text-[11px] text-slate-500">Gateway: <span className="font-semibold text-rose-600">{tx.gateway}</span> | Valor: R$ {tx.amount.toFixed(2)}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">{tx.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-400 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <span>Pressione <kbd className="rounded bg-slate-200 px-1 py-0.5 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Esc</kbd> para fechar</span>
          <span className="font-bold text-rose-600">Nercash Enterprise OS</span>
        </div>
      </div>
    </div>
  );
};
