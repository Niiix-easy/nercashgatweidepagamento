import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { GlobalSearchModal } from '../layout/GlobalSearchModal';
import { HelpOverlay } from './HelpOverlay';
import { GlobalExportDataModal } from '../dashboard/GlobalExportDataModal';

interface GlobalShortcutManagerProps {
  children?: React.ReactNode;
}

export const GlobalShortcutManager: React.FC<GlobalShortcutManagerProps> = ({ children }) => {
  const { setActiveTab, toggleTheme, togglePrivacyMode, addToast } = usePayment();
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // Voice Command Trigger function
  const triggerVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Comando de Voz', 'API de reconhecimento de voz não suportada neste navegador. Use atalhos de teclado.', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsVoiceListening(true);
      addToast('Ouvindo Comando de Voz...', 'Diga "Pânico" para Kill Switch ou "Privacidade" para alternar Modo Privado.', 'info');

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setIsVoiceListening(false);

        if (text.includes('pânico') || text.includes('panic') || text.includes('emergência')) {
          addToast('Voz Reconhecida', '🔴 PÂNICO ATIVADO POR VOZ! Invalidando tokens...', 'error');
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        } else if (text.includes('privacidade') || text.includes('privacy') || text.includes('sigilo')) {
          togglePrivacyMode();
          addToast('Voz Reconhecida', 'Modo Privacidade alternado com sucesso por comando de voz.', 'success');
        } else {
          addToast('Comando não reconhecido', `Você disse: "${text}". Comandos aceitos: "Pânico", "Privacidade".`, 'warning');
        }
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
        addToast('Erro de Voz', 'Não foi possível capturar o comando de voz.', 'error');
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsVoiceListening(false);
      console.warn('Voice command error:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) || (e.target as HTMLElement)?.isContentEditable;
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // 1. Quick Find / Global Search: Cmd+K or Ctrl+K
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
        return;
      }

      // 2. Navigate Home: Cmd+H or Ctrl+H
      if (isCmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setActiveTab('overview');
        return;
      }

      // 3. Open Settings / Compliance: Cmd+, or Ctrl+,
      if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setActiveTab('compliance');
        return;
      }

      // 4. Global Export Data Modal: Cmd+E or Ctrl+E
      if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExportModal(prev => !prev);
        return;
      }

      // 11. Dashboard Refresh: Cmd+R or Ctrl+R
      if (isCmdOrCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('dashboard:force-refresh'));
        addToast('Dashboard Refresh', 'Atualizando dados do painel em tempo real...', 'success');
        return;
      }

      // 12. Navigate to Gateways: Cmd+G or Ctrl+G
      if (isCmdOrCtrl && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setActiveTab('gateway');
        return;
      }

      // 13. Toggle Privacy Mode: Alt+P
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePrivacyMode();
        return;
      }

      // 5. Voice Command Shortcut: Cmd+Shift+V or Ctrl+Shift+V
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        triggerVoiceCommand();
        return;
      }

      // 6. Toggle Theme: Cmd+Shift+L or Ctrl+Shift+L
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 7. Navigate to Orchestration: Cmd+Shift+O or Ctrl+Shift+O
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setActiveTab('orchestration');
        return;
      }

      // 8. Navigate to Super Checkout: Cmd+Shift+C or Ctrl+Shift+C
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setActiveTab('checkout');
        return;
      }

      // 9. Navigate to API Sandbox: Cmd+Shift+A or Ctrl+Shift+A
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('api');
        return;
      }

      // 10. Shortcuts Help: '?' (when not inside an active input field)
      if (!isCmdOrCtrl && !isInput && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, toggleTheme]);

  // Expose global trigger custom events for components to trigger modals or voice
  useEffect(() => {
    const handleOpenExport = () => setShowExportModal(true);
    const handleOpenSearch = () => setShowSearchModal(true);
    const handleOpenShortcuts = () => setShowShortcutsModal(true);
    const handleTriggerVoice = () => triggerVoiceCommand();

    window.addEventListener('nercash:open-export-modal', handleOpenExport);
    window.addEventListener('nercash:open-search-modal', handleOpenSearch);
    window.addEventListener('nercash:open-shortcuts-modal', handleOpenShortcuts);
    window.addEventListener('nercash:open-help-overlay', handleOpenShortcuts);
    window.addEventListener('nercash:trigger-voice-command', handleTriggerVoice);

    return () => {
      window.removeEventListener('nercash:open-export-modal', handleOpenExport);
      window.removeEventListener('nercash:open-search-modal', handleOpenSearch);
      window.removeEventListener('nercash:open-shortcuts-modal', handleOpenShortcuts);
      window.removeEventListener('nercash:open-help-overlay', handleOpenShortcuts);
      window.removeEventListener('nercash:trigger-voice-command', handleTriggerVoice);
    };
  }, []);

  return (
    <>
      {children}

      {/* Voice Listening Floating Indicator */}
      {isVoiceListening && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-indigo-500 bg-indigo-950/90 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-bounce">
          <div className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping" />
          <div>
            <div className="text-xs font-bold text-indigo-300">Ouvindo Comando de Voz...</div>
            <div className="text-[10px] text-slate-300">Fale "Pânico" ou "Privacidade"</div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />

      {/* HelpOverlay & Keyboard Shortcuts Cheat Sheet Modal */}
      <HelpOverlay 
        isOpen={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)} 
      />

      {/* Global Export Data Modal */}
      <GlobalExportDataModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </>
  );
};
