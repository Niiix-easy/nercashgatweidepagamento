import React, { useState, useEffect } from 'react';
import { PaymentProvider, SystemStateProvider, usePayment } from './context/PaymentContext';
import { BbLoginLandingPage } from './components/auth/BbLoginLandingPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { OrchestrationHub } from './components/orchestration/OrchestrationHub';
import { SuperCheckoutView } from './components/checkout/SuperCheckoutView';
import { CrmAutomationHub } from './components/crm/CrmAutomationHub';
import { OpenApiDocsSandbox } from './components/api/OpenApiDocsSandbox';
import { PaymentGatewayHub } from './components/gateway/PaymentGatewayHub';
import { WhiteLabelHub } from './components/whitelabel/WhiteLabelHub';
import { ComplianceSettings } from './components/compliance/ComplianceSettings';
import { IntelligenceHub } from './components/intelligence/IntelligenceHub';
import { CashbackMilestoneModule } from './components/cashback/CashbackMilestoneModule';
import { WebhookDebugger } from './components/api/WebhookDebugger';
import { GatewayThroughputMonitor } from './components/gateway/GatewayThroughputMonitor';
import { IdleSessionLockScreen } from './components/security/IdleSessionLockScreen';
import { GlobalShortcutManager } from './components/common/GlobalShortcutManager';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { PerformanceMonitor } from './components/common/PerformanceMonitor';
import { SecurityUtils } from './utils/SecurityUtils';
import { SystemHealthPulse } from './components/common/SystemHealthPulse';
import { ModuleTutorialSystem } from './components/common/ModuleTutorialSystem';
import { UserAssistanceCopilot } from './components/common/UserAssistanceCopilot';
import { LgpdConsentBanner } from './components/compliance/LgpdConsentBanner';
import { LgpdDataSubjectPortal } from './components/compliance/LgpdDataSubjectPortal';

const MainContent: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const { activeTab, toasts, removeToast } = usePayment();

  useEffect(() => {
    SecurityUtils.injectCspHeader();
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'orchestration':
        return <PerformanceMonitor componentName="OrchestrationHub" warnThresholdMs={150}><OrchestrationHub /></PerformanceMonitor>;
      case 'checkout':
        return <SuperCheckoutView />;
      case 'crm':
        return <CrmAutomationHub />;
      case 'api':
        return <OpenApiDocsSandbox />;
      case 'gateway':
        return <PaymentGatewayHub />;
      case 'cashback':
        return <CashbackMilestoneModule />;
      case 'whitelabel':
        return <WhiteLabelHub />;
      case 'compliance':
        return <ComplianceSettings />;
      case 'intelligence':
        return <IntelligenceHub />;
      case 'webhooks':
        return <WebhookDebugger />;
      case 'throughput':
        return <GatewayThroughputMonitor />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <AppErrorBoundary>
      <IdleSessionLockScreen>
        <GlobalShortcutManager>
          <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Header onLogout={onLogout} user={user} />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8 pb-14">
                <div className="mx-auto max-w-7xl">
                  <ModuleTutorialSystem />
                  {renderActiveView()}
                </div>
              </main>
            </div>
          </div>

          <SystemHealthPulse />
          <UserAssistanceCopilot />
          <LgpdConsentBanner />
          <LgpdDataSubjectPortal />

          {/* Real-time Toast Notifications Container */}
          <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all animate-slide-up ${
                  toast.type === 'error' || toast.type === 'warning'
                    ? 'border-rose-500/40 bg-rose-950/90 text-rose-100'
                    : toast.type === 'success'
                    ? 'border-emerald-500/40 bg-slate-900/95 text-white'
                    : 'border-indigo-500/40 bg-slate-900/95 text-white'
                }`}
              >
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  toast.type === 'error' || toast.type === 'warning' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {toast.type === 'error' || toast.type === 'warning' ? '!' : '✓'}
                </div>
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold">{toast.title}</h4>
                  <p className="text-[11px] opacity-90 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </GlobalShortcutManager>
      </IdleSessionLockScreen>
    </AppErrorBoundary>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('bb_nercash_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Return null if parsing fails
      }
    }
    // Default to null to show login page
    return null;
  });

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('bb_nercash_auth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bb_nercash_auth_user');
  };

  if (!user) {
    return <BbLoginLandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <SystemStateProvider>
      <PaymentProvider>
        <MainContent user={user} onLogout={handleLogout} />
      </PaymentProvider>
    </SystemStateProvider>
  );
}
