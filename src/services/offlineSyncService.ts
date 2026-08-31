// Nercash Offline & Background Sync Service v2.5
// Manages persistent IndexedDB queue and coordinates with Service Worker for reconnection retries

export interface PendingReconciliationTask {
  id: string;
  type: 'reconciliation_conflict' | 'batch_audit' | 'ledger_resolution';
  timestamp: string;
  payload: {
    csvRowId?: string;
    action: 'accept' | 'flag' | 'reconcile';
    amount?: number;
    discrepancyType?: string;
    resolvedBy?: string;
    notes?: string;
  };
  synced: boolean;
  retries?: number;
  lastError?: string;
  lastRetryAt?: string;
}

const DB_NAME = 'nercash_sync_db';
const DB_VERSION = 1;
const STORE_NAME = 'sync_tasks';
const LOCAL_STORAGE_KEY = 'nercash_offline_reconciliation_tasks';

function openClientDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('retries', 'retries', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class OfflineSyncService {
  // Retrieve all tasks from IndexedDB (with LocalStorage fallback)
  static async getPendingTasks(): Promise<PendingReconciliationTask[]> {
    try {
      const db = await openClientDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const results: PendingReconciliationTask[] = req.result || [];
          resolve(results);
        };
        req.onerror = () => {
          resolve(this.getLocalStorageFallback());
        };
      });
    } catch {
      return this.getLocalStorageFallback();
    }
  }

  // Fallback to localStorage
  private static getLocalStorageFallback(): PendingReconciliationTask[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save to LocalStorage fallback
  private static saveLocalStorageFallback(tasks: PendingReconciliationTask[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Failed to save to localStorage fallback', err);
    }
  }

  // Enqueue a new reconciliation resolution task into persistent IndexedDB
  static async enqueueTask(task: Omit<PendingReconciliationTask, 'id' | 'timestamp' | 'synced'>): Promise<PendingReconciliationTask> {
    const newTask: PendingReconciliationTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      synced: false,
      retries: 0
    };

    // 1. Save to IndexedDB
    try {
      const db = await openClientDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(newTask);
    } catch (err) {
      console.warn('IndexedDB write failed, writing to localStorage fallback', err);
    }

    // 2. Also keep localStorage fallback updated
    const local = this.getLocalStorageFallback();
    local.push(newTask);
    this.saveLocalStorageFallback(local);

    // 3. Inform the Service Worker via postMessage
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'ENQUEUE_TASK_INDEXEDDB',
        payload: newTask
      });
    }

    // 4. Request Background Sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-expect-error SyncManager is not in standard TS lib
        await registration.sync.register('sync-pending-reconciliations');
        console.log('[OfflineSync] Registered sync-pending-reconciliations with browser SyncManager');
      } catch (syncErr) {
        console.log('[OfflineSync] Background Sync registration handled via online event listener', syncErr);
      }
    }

    return newTask;
  }

  // Mark tasks as synchronized in IndexedDB
  static async markTasksSynced(taskIds: string[]): Promise<void> {
    try {
      const db = await openClientDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      for (const id of taskIds) {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item) {
            item.synced = true;
            item.syncedAt = new Date().toISOString();
            store.put(item);
          }
        };
      }
    } catch (err) {
      console.warn('IndexedDB update failed', err);
    }

    // Update fallback
    const local = this.getLocalStorageFallback();
    const updated = local.map(t => taskIds.includes(t.id) ? { ...t, synced: true } : t);
    this.saveLocalStorageFallback(updated);
  }

  // Clear completed synced tasks from IndexedDB
  static async clearCompletedTasks(): Promise<void> {
    try {
      const db = await openClientDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const tasks: PendingReconciliationTask[] = req.result || [];
        for (const t of tasks) {
          if (t.synced) {
            store.delete(t.id);
          }
        }
      };
    } catch (err) {
      console.warn('IndexedDB clear failed', err);
    }

    const local = this.getLocalStorageFallback().filter(t => !t.synced);
    this.saveLocalStorageFallback(local);
  }

  // Trigger immediate synchronization retry upon reconnection
  static async triggerImmediateSync(): Promise<number> {
    const allTasks = await this.getPendingTasks();
    const pending = allTasks.filter(t => !t.synced);
    if (pending.length === 0) return 0;

    // Send message to Service Worker
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC_NOW' });
    }

    // Direct simulated API dispatch for active client
    await new Promise(resolve => setTimeout(resolve, 600));

    const taskIds = pending.map(t => t.id);
    await this.markTasksSynced(taskIds);

    // Dispatch global custom event for UI updates
    window.dispatchEvent(new CustomEvent('nercash:background-sync-completed', {
      detail: { count: pending.length, tasks: pending }
    }));

    return pending.length;
  }
}
