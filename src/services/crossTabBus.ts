// Broadcast Channel API for Cross-Tab Event Synchronization in Nercash Enterprise

const CHANNEL_NAME = 'nercash_crosstab_sync_v1';

class CrossTabBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const { type, payload } = event.data;
          const callbacks = this.listeners.get(type);
          if (callbacks) {
            callbacks.forEach(cb => cb(payload));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or blocked:', e);
      }
    }
  }

  public publish(type: string, payload: any): void {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (e) {
        console.warn('Failed to post cross-tab message:', e);
      }
    }
    // Also trigger local listeners
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
  }

  public subscribe(type: string, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(type);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  public disconnect(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const crossTabBus = new CrossTabBus();
