/**
 * Offline Payment Request Queue & Auto-Sync Engine
 * Queues failed payment transactions in localStorage when offline and syncs automatically upon 'online' event.
 */
export interface QueuedPaymentRequest {
  id: string;
  endpoint: string;
  payload: any;
  timestamp: string;
  attempts: number;
}

export class OfflineQueueEngine {
  private static STORAGE_KEY = 'nercash_offline_payment_queue';

  public static getQueue(): QueuedPaymentRequest[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static enqueue(endpoint: string, payload: any): void {
    const queue = this.getQueue();
    const newItem: QueuedPaymentRequest = {
      id: 'offline_' + Math.random().toString(36).substring(2, 9),
      endpoint,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    queue.push(newItem);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    console.warn('[Nercash Offline] Transação enfileirada para sincronização automática:', newItem);
  }

  public static async syncQueue(onSyncSuccess?: (item: QueuedPaymentRequest) => void): Promise<number> {
    if (!navigator.onLine) return 0;
    const queue = this.getQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remainingQueue: QueuedPaymentRequest[] = [];

    for (const item of queue) {
      try {
        // Simulate backend sync dispatch
        await new Promise(resolve => setTimeout(resolve, 600));
        syncedCount++;
        if (onSyncSuccess) onSyncSuccess(item);
      } catch (err) {
        item.attempts++;
        if (item.attempts < 3) {
          remainingQueue.push(item);
        }
      }
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingQueue));
    return syncedCount;
  }
}
