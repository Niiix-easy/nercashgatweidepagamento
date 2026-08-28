import React, { useState, useEffect } from 'react';
import { PaymentProvider, usePayment } from './context/PaymentContext';
import { BbLoginLandingPage } from './components/auth/BbLoginLandingPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { OrchestrationHub } from './components/orchestration/OrchestrationHub';
import { SuperCheckoutView } from './components/checkout/SuperCheckoutView';
import { CrmAutomationHub } from './components/crm/CrmAutomationHub';
import { OpenApiDocsSandbox } from './components/api/OpenApiDocsSandbox';
import { WhiteLabelHub } from './components/whitelabel/WhiteLabelHub';
import { ComplianceSettings } from './components/compliance/ComplianceSettings';
import { IdleSessionLockScreen } from './components/security/IdleSessionLockScreen';
import { GlobalShortcutManager } from './components/common/GlobalShortcutManager';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { PerformanceMonitor } from './components/common/PerformanceMonitor';
import { SecurityUtils } from './utils/SecurityUtils';

const MainContent: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const { activeTab } = usePayment();

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
      case 'whitelabel':
        return <WhiteLabelHub />;
      case 'compliance':
        return <ComplianceSettings />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <AppErrorBoundary>
      <IdleSessionLockScreen>
        <GlobalShortcutManager>
          <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Header />
            <div className="flex flex-1">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                  {renderActiveView()}
                </div>
              </main>
            </div>
          </div>
        </GlobalShortcutManager>
      </IdleSessionLockScreen>
    </AppErrorBoundary>
  );
};

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('bb_nercash_auth_user');
    return saved ? JSON.parse(saved) : null;
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
    <PaymentProvider>
      <MainContent user={user} onLogout={handleLogout} />
    </PaymentProvider>
  );
}
