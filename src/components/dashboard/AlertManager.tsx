import React, { useEffect } from 'react';
import { useSystemState } from '../../context/PaymentContext';
import { usePayment } from '../../context/PaymentContext';

export const AlertManager: React.FC = () => {
  const { setApiStatus, getApiStatus } = useSystemState();
  const { acquirers } = usePayment();

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomAcquirer = acquirers[Math.floor(Math.random() * acquirers.length)];
        const currentAlerts = getApiStatus('providerAlerts') || {};
        const providerAlerts = currentAlerts[randomAcquirer.id] || 0;
        
        setApiStatus('providerAlerts', {
          ...currentAlerts,
          [randomAcquirer.id]: providerAlerts + 1
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [acquirers, setApiStatus, getApiStatus]);

  return null;
};
