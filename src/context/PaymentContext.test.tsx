import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PaymentProvider, usePayment } from './PaymentContext';

const TestConsumer: React.FC = () => {
  const { activeTab, setActiveTab, auditLogs, addAuditLog, theme, toggleTheme } = usePayment();
  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="theme">{theme}</span>
      <span data-testid="audit-count">{auditLogs.length}</span>
      <button onClick={() => setActiveTab('orchestration')} data-testid="btn-tab">Change Tab</button>
      <button onClick={toggleTheme} data-testid="btn-theme">Toggle Theme</button>
      <button 
        onClick={() => addAuditLog({
          action: 'Test Action',
          category: 'security',
          resourceType: 'ApiKey',
          resourceId: 'key_123',
          status: 'success',
          details: 'Unit test audit log'
        })} 
        data-testid="btn-audit"
      >
        Add Audit
      </button>
    </div>
  );
};

describe('PaymentContext State & Transactions', () => {
  it('provides initial state and allows updating tab and theme', () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('overview');
    expect(screen.getByTestId('theme')).toBeDefined();

    act(() => {
      fireEvent.click(screen.getByTestId('btn-tab'));
    });
    expect(screen.getByTestId('active-tab')).toHaveTextContent('orchestration');

    const initialTheme = screen.getByTestId('theme').textContent;
    act(() => {
      fireEvent.click(screen.getByTestId('btn-theme'));
    });
    expect(screen.getByTestId('theme')).not.toHaveTextContent(initialTheme || '');
  });

  it('allows adding audit logs correctly', () => {
    render(
      <PaymentProvider>
        <TestConsumer />
      </PaymentProvider>
    );

    const initialCount = parseInt(screen.getByTestId('audit-count').textContent || '0', 10);

    act(() => {
      fireEvent.click(screen.getByTestId('btn-audit'));
    });

    const newCount = parseInt(screen.getByTestId('audit-count').textContent || '0', 10);
    expect(newCount).toBe(initialCount + 1);
  });
});
