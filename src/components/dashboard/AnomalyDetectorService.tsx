import React, { useEffect, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';
import { crossTabBus } from '../../services/crossTabBus';

export const AnomalyDetectorService: React.FC = () => {
  const { addToast } = usePayment();
  const alertTriggered = useRef(false);

  useEffect(() => {
    // Check if browser notifications are supported
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const timeout = setTimeout(() => {
      if (!alertTriggered.current) {
        alertTriggered.current = true;
        const msg = "Anomaly Detected: Transaction success rate dropped by 18% (exceeds 15% threshold vs 24h rolling average). Switching traffic to secondary acquirer.";
        
        addToast('ML Anomaly Detector', msg, 'error');
        
        // Notify Orchestration Auto-Scaler
        crossTabBus.publish('ANOMALY_SPIKE_DETECTED', {
          score: 86,
          reason: 'Surge de anomalia transacional (+18% desvio do baseline)'
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nercash Risk Alert', {
            body: msg,
            icon: '/icon.png',
            tag: 'anomaly-alert'
          });
        }
      }
    }, 25000); // Trigger after 25 seconds of being open

    return () => clearTimeout(timeout);
  }, [addToast]);

  return null;
};
