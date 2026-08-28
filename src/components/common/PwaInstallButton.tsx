import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, Shield } from 'lucide-react';

export const PwaInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px]">
          NC
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span>Nercash PWA Instalado</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="Instalar aplicativo Nercash no celular ou computador (PWA)"
        className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/20 hover:border-emerald-500 hover:bg-slate-800 transition-all cursor-pointer group"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] group-hover:scale-105 transition-transform">
          NC
        </div>
        <Smartphone className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
        <span>Instalar Nercash</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-base shadow-lg shadow-emerald-950/50 border border-emerald-500">
                  NC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Instalar Aplicativo Nercash
                  </h3>
                  <p className="text-xs text-slate-400">
                    Orquestração de Pagamentos em Tempo Real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Instalação Segura PWA</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                  <li><strong>Android (Chrome / Edge):</strong> Abra o menu do navegador (três pontos no canto superior) e clique em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                  <li><strong>iOS (Safari):</strong> Toque no ícone de Compartilhar na barra inferior e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
                  <li><strong>Desktop (Chrome / Edge):</strong> Clique no ícone de instalação na barra de endereços URL.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Entendido & Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

