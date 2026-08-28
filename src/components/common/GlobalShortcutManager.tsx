import React, { useState, useEffect } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { GlobalSearchModal } from '../layout/GlobalSearchModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { GlobalExportDataModal } from '../dashboard/GlobalExportDataModal';

interface GlobalShortcutManagerProps {
  children?: React.ReactNode;
}

export const GlobalShortcutManager: React.FC<GlobalShortcutManagerProps> = ({ children }) => {
  const { setActiveTab, toggleTheme } = usePayment();
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

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

      // 5. Toggle Theme: Cmd+Shift+L or Ctrl+Shift+L
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 6. Navigate to Orchestration: Cmd+Shift+O or Ctrl+Shift+O
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setActiveTab('orchestration');
        return;
      }

      // 7. Navigate to Super Checkout: Cmd+Shift+C or Ctrl+Shift+C
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setActiveTab('checkout');
        return;
      }

      // 8. Navigate to API Sandbox: Cmd+Shift+A or Ctrl+Shift+A
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('api');
        return;
      }

      // 9. Shortcuts Help: '?' (when not inside an active input field)
      if (!isCmdOrCtrl && !isInput && (e.key === '?' || (e.shiftKey && e.key === '/'))) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, toggleTheme]);

  // Expose global trigger custom events for components to trigger modals
  useEffect(() => {
    const handleOpenExport = () => setShowExportModal(true);
    const handleOpenSearch = () => setShowSearchModal(true);
    const handleOpenShortcuts = () => setShowShortcutsModal(true);

    window.addEventListener('nercash:open-export-modal', handleOpenExport);
    window.addEventListener('nercash:open-search-modal', handleOpenSearch);
    window.addEventListener('nercash:open-shortcuts-modal', handleOpenShortcuts);

    return () => {
      window.removeEventListener('nercash:open-export-modal', handleOpenExport);
      window.removeEventListener('nercash:open-search-modal', handleOpenSearch);
      window.removeEventListener('nercash:open-shortcuts-modal', handleOpenShortcuts);
    };
  }, []);

  return (
    <>
      {children}

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal 
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
