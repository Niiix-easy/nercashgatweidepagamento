import React, { useEffect, useRef } from 'react';
import { usePayment } from '../../context/PaymentContext';

export const WebhookAlertMonitor: React.FC = () => {
  const { addToast } = usePayment();
  const alertTriggered = useRef(false);

  useEffect(() => {
    // Check if browser notifications are supported
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Simulate monitoring webhooks
    const timeout = setTimeout(() => {
      if (!alertTriggered.current) {
        alertTriggered.current = true;
        const msg = "Critical Webhook Failure: Asaas provider failed to process 'payment.updated' 3 times consecutively.";
        
        // Show in-app toast
        addToast('Webhook Alert Service', msg, 'error');
        
        // Show browser notification if allowed
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nercash Gateway Alert', {
            body: msg,
            icon: '/icon.png',
            tag: 'webhook-alert'
          });
        }
      }
    }, 15000); // Trigger after 15 seconds of dashboard being open

    return () => clearTimeout(timeout);
  }, [addToast]);

  return null; // Silent service
};
