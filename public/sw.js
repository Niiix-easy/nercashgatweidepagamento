// Nercash Enterprise PWA & Offline Service Worker v2.5
// Robust Pre-caching on Install + Stale-While-Revalidate (SWR) + Persistent IndexedDB Background Sync Queue with Reconnection Retry

const CACHE_VERSION = 'nercash-enterprise-v2.5';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const DB_NAME = 'nercash_sync_db';
const DB_VERSION = 1;
const STORE_NAME = 'sync_tasks';

// 1. Static assets pre-cached during installation
const PRECACHE_STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/nercash-logo.svg',
  '/favicon.ico'
];

// Helper: Open persistent IndexedDB in Service Worker
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
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

// Helper: Retrieve all pending tasks from IndexedDB
async function getPendingTasksFromDB() {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const tasks = request.result || [];
        resolve(tasks.filter(t => !t.synced));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[SW-IndexedDB] Failed to get pending tasks:', err);
    return [];
  }
}

// Helper: Put / Update task in IndexedDB
async function putTaskInDB(task) {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(task);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[SW-IndexedDB] Failed to put task:', err);
    return false;
  }
}

// Helper: Update task as synced in IndexedDB
async function markTaskSuccessInDB(taskId) {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(taskId);
      getReq.onsuccess = () => {
        const record = getReq.result;
        if (record) {
          record.synced = true;
          record.syncedAt = new Date().toISOString();
          store.put(record);
        }
        resolve(true);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[SW-IndexedDB] Failed to mark task success:', err);
  }
}

// Helper: Increment retry counter with exponential backoff metadata
async function recordTaskRetryInDB(taskId, errorMsg) {
  try {
    const db = await openSyncDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(taskId);
      getReq.onsuccess = () => {
        const record = getReq.result;
        if (record) {
          record.retries = (record.retries || 0) + 1;
          record.lastError = errorMsg;
          record.lastRetryAt = new Date().toISOString();
          store.put(record);
        }
        resolve(true);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('[SW-IndexedDB] Failed to record task retry:', err);
  }
}

// ---------------------------------------------------------------------
// 1. Service Worker Installation - Precache Critical Static Assets
// ---------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets during install event');
      return Promise.allSettled(
        PRECACHE_STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.log(`[SW] Warning: asset ${asset} not pre-cached immediately (${err.message})`);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ---------------------------------------------------------------------
// 2. Service Worker Activation & Cache Housekeeping
// ---------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('nercash-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ---------------------------------------------------------------------
// 3. Stale-While-Revalidate (SWR) & Resilient Fetch Strategy
// ---------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET or cross-origin extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy A: Stale-While-Revalidate for Static Assets, JS, CSS, Fonts, Images
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // Strategy B: Navigation fallback to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(async () => {
          const cachedNavigate = await caches.match(request);
          if (cachedNavigate) return cachedNavigate;
          const fallback = (await caches.match('/index.html')) || (await caches.match('/'));
          return fallback;
        })
    );
    return;
  }

  // Strategy C: Network-first for other requests with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// ---------------------------------------------------------------------
// 4. Persistent IndexedDB Background Sync Queue & Reconnection Retries
// ---------------------------------------------------------------------
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync event triggered with tag:', event.tag);

  if (
    event.tag === 'sync-pending-reconciliations' || 
    event.tag === 'sync-offline-tasks' ||
    event.tag === 'reconciliation-sync'
  ) {
    event.waitUntil(processPersistentSyncQueue(event.tag));
  }
});

// Helper: Process persistent IndexedDB queue and retry pending tasks
async function processPersistentSyncQueue(tag = 'sync-pending-reconciliations') {
  try {
    const pendingTasks = await getPendingTasksFromDB();
    console.log(`[SW-BackgroundSync] Processing ${pendingTasks.length} pending tasks from IndexedDB...`);

    if (pendingTasks.length === 0) return;

    let successfulCount = 0;
    const syncedTasks = [];

    for (const task of pendingTasks) {
      try {
        // Attempt synchronization with backend API
        const payload = {
          taskId: task.id,
          type: task.type,
          data: task.payload,
          timestamp: task.timestamp,
          retryCount: task.retries || 0
        };

        const response = await fetch('/api/v1/baas/audit-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-nercash-signature': 'sha256=sw_persistent_sync',
            'x-sync-source': 'service_worker_indexeddb'
          },
          body: JSON.stringify(payload)
        }).catch(() => null);

        if (response && response.status < 400) {
          await markTaskSuccessInDB(task.id);
          successfulCount++;
          syncedTasks.push(task);
        } else {
          // If server is not ready or network failed, record retry
          await recordTaskRetryInDB(task.id, 'Network error or server unavailable');
        }
      } catch (itemErr) {
        await recordTaskRetryInDB(task.id, itemErr.message || 'Execution error');
      }
    }

    // Broadcast sync results to all client windows
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clients.forEach((client) => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETED',
        tag: tag,
        successfulCount,
        syncedTasks,
        timestamp: new Date().toISOString(),
        message: `${successfulCount} tarefas sincronizadas com o Ledger via fila persistente IndexedDB!`
      });
    });
  } catch (error) {
    console.error('[SW-BackgroundSync] Error executing persistent queue:', error);
  }
}

// ---------------------------------------------------------------------
// 5. Message API Handler (Client <-> Service Worker Bi-directional)
// ---------------------------------------------------------------------
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'TRIGGER_SYNC_NOW') {
    await processPersistentSyncQueue('manual-trigger');
    event.source?.postMessage({
      type: 'SYNC_NOW_ACKNOWLEDGED',
      status: 'success'
    });
  }

  if (event.data.type === 'ENQUEUE_TASK_INDEXEDDB') {
    const task = event.data.payload;
    if (task) {
      await putTaskInDB({
        ...task,
        synced: false,
        retries: 0,
        queuedAt: new Date().toISOString()
      });
      console.log('[SW] Enqueued task to persistent IndexedDB:', task.id);
      event.source?.postMessage({
        type: 'ITEM_QUEUED_SUCCESS',
        id: task.id
      });
    }
  }

  if (event.data.type === 'GET_QUEUE_STATUS') {
    const pending = await getPendingTasksFromDB();
    event.source?.postMessage({
      type: 'QUEUE_STATUS_RESPONSE',
      pendingCount: pending.length,
      tasks: pending
    });
  }
});
