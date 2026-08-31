import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, CheckCircle2, X, Settings, ArrowRight, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { getLgpdConsent, saveLgpdConsent, LgpdConsentSettings, DEFAULT_LGPD_CONSENT } from '../../utils/lgpdUtils';

export const LgpdConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<LgpdConsentSettings>(DEFAULT_LGPD_CONSENT);

  useEffect(() => {
    // Check if consent has already been given
    const hasConsented = localStorage.getItem('nercash_lgpd_consent_given');
    if (!hasConsented) {
      setIsVisible(true);
    }
    setConsent(getLgpdConsent());
  }, []);

  // Listen for custom trigger to open preferences
  useEffect(() => {
    const handleOpenPreferences = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };
    window.addEventListener('nercash:open-lgpd-preferences', handleOpenPreferences);
    return () => window.removeEventListener('nercash:open-lgpd-preferences', handleOpenPreferences);
  }, []);

  const handleAcceptAll = () => {
    const allConsents: LgpdConsentSettings = {
      essential: true,
      analytics: true,
      marketing: true,
      baasSharing: true,
      updatedAt: new Date().toISOString()
    };
    saveLgpdConsent(allConsents);
    localStorage.setItem('nercash_lgpd_consent_given', 'true');
    setConsent(allConsents);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRejectNonEssential = () => {
    const minimalConsents: LgpdConsentSettings = {
      essential: true,
      analytics: false,
      marketing: false,
      baasSharing: false,
      updatedAt: new Date().toISOString()
    };
    saveLgpdConsent(minimalConsents);
    localStorage.setItem('nercash_lgpd_consent_given', 'true');
    setConsent(minimalConsents);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveLgpdConsent(consent);
    localStorage.setItem('nercash_lgpd_consent_given', 'true');
    setIsVisible(false);
    setShowPreferences(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl border-t border-indigo-500/30 text-white shadow-2xl"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto flex flex-col space-y-4">
            {!showPreferences ? (
              // SIMPLE BANNER VIEW
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/80 text-white border border-indigo-400/30 shrink-0">
                    <ShieldCheck className="h-6 w-6 text-indigo-300" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Privacidade & Proteção de Dados (LGPD - Lei nº 13.709/18)</span>
                      </h4>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                        ANPD Compliant
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                      O Nercash utiliza cookies estritamente necessários para o funcionamento do ecossistema BaaS e segurança transacional PCI-DSS, além de tecnologias opcionais para métricas de performance e personalização. Você pode gerenciar seu consentimento a qualquer momento no Portal do Titular.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0 pt-2 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Personalizar Consentimentos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectNonEssential}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                  >
                    Apenas Necessários
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:opacity-90 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Aceitar Todos os Consentimentos</span>
                  </button>
                </div>
              </div>
            ) : (
              // DETAILED PREFERENCES VIEW
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">Central de Preferências e Conselhos LGPD</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreferences(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Essential */}
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">1. Estritamente Necessários</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        Sempre Ativo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Sessão bancária segura, tokens de autenticação, WAF antifraude e auditoria imutável PCI.
                    </p>
                  </div>

                  {/* Analytics */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">2. Analytics & Métricas</span>
                      <input
                        type="checkbox"
                        checked={consent.analytics}
                        onChange={e => setConsent({ ...consent, analytics: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Métricas anônimas de latência de rotas e desempenho do gateway para otimização de conversão.
                    </p>
                  </div>

                  {/* Marketing */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">3. Notificações CRM</span>
                      <input
                        type="checkbox"
                        checked={consent.marketing}
                        onChange={e => setConsent({ ...consent, marketing: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Comunicações automatizadas via WhatsApp Meta API e disparo de lembretes de cobrança.
                    </p>
                  </div>

                  {/* BaaS Sharing */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">4. Compartilhamento BaaS</span>
                      <input
                        type="checkbox"
                        checked={consent.baasSharing}
                        onChange={e => setConsent({ ...consent, baasSharing: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Consultas autorizadas junto a adquirentes e parceiros bancários para score de crédito e liquidação.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVisible(false);
                      window.dispatchEvent(new CustomEvent('nercash:open-lgpd-portal'));
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Portal do Titular de Dados (Direitos LGPD)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreferences(false)}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 cursor-pointer shadow-md"
                    >
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
