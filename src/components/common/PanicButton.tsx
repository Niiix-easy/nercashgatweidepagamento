import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

interface PanicButtonProps {
  onPanicTriggered: () => void;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ onPanicTriggered }) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const executePanic = () => {
    // Clear all storage & tokens
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies if any
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch (e) {
      console.error('Panic clear error', e);
    }
    setShowConfirmModal(false);
    onPanicTriggered();
  };

  return (
    <>
      <button
        id="global-panic-button"
        type="button"
        onClick={() => setShowConfirmModal(true)}
        className="flex items-center gap-1.5 rounded-xl border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/80 transition-all shadow-md cursor-pointer animate-pulse"
        title="Botão de Pânico (Kill Switch): Invalida tokens e limpa sessões instantaneamente"
      >
        <AlertOctagon className="h-4 w-4 text-rose-400" />
        <span className="hidden sm:inline">Kill Switch (Pânico)</span>
      </button>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/50 bg-slate-900 p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                <ShieldAlert className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-400">ATIVAÇÃO DE EMERGÊNCIA (KILL SWITCH)</h3>
                <p className="text-xs text-slate-400">Protocolo Zero-Trust de Invalidação Imediata</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a acionar o botão de pânico global. Esta ação irá <strong className="text-rose-400 font-bold">invalidar todos os tokens criptográficos</strong>, limpar todo o armazenamento local e encerrar todas as conexões ativas com adquirentes e cofres de cartão instantaneamente.
            </p>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300">
              ⚠️ Nenhum dado transacional será perdido no HSM central, mas sua sessão atual e credenciais locais serão descartadas imediatamente.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executePanic}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-rose-500 transition-all cursor-pointer"
              >
                Confirmar Pânico & Deslogar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
