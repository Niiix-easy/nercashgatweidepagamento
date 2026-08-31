// IndexedDB Offline Queue for OrchestrationHub low-code changes

const DB_NAME = 'NercashOfflineDB';
const STORE_NAME = 'orchestrationQueue';
const DB_VERSION = 1;

export interface QueuedFlowChange {
  id: string;
  actionType: 'UPDATE_RULE' | 'ADD_NODE' | 'DELETE_NODE' | 'TOGGLE_GATEWAY';
  payload: any;
  timestamp: string;
  synced: boolean;
}

export const OfflineQueueService = {
  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  async enqueueChange(actionType: QueuedFlowChange['actionType'], payload: any): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const item: QueuedFlowChange = {
        id: `offline_change_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        actionType,
        payload,
        timestamp: new Date().toISOString(),
        synced: false
      };
      store.put(item);
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.warn('Failed to enqueue offline change in IndexedDB:', e);
    }
  },

  async getPendingChanges(): Promise<QueuedFlowChange[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Failed to get pending changes:', e);
      return [];
    }
  },

  async clearQueue(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.warn('Failed to clear offline queue:', e);
    }
  }
};
