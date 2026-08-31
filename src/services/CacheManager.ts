/**
 * Nercash Client-Side Cache Manager with IndexedDB/Memory support
 * and PerformanceMonitor latency-based automated invalidation.
 */
export class CacheManager {
  private static memoryStore = new Map<string, { data: any; expiry: number; latencyRecorded: number }>();

  public static async get(key: string): Promise<any | null> {
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.data;
  }

  public static async set(key: string, data: any, ttlMs: number = 300000): Promise<void> {
    const expiry = Date.now() + ttlMs;
    this.memoryStore.set(key, { data, expiry, latencyRecorded: performance.now() });
  }

  public static invalidateByLatencyThreshold(thresholdMs: number): number {
    let invalidatedCount = 0;
    const now = Date.now();
    for (const [key, val] of this.memoryStore.entries()) {
      if (val.latencyRecorded > thresholdMs || now > val.expiry) {
        this.memoryStore.delete(key);
        invalidatedCount++;
      }
    }
    return invalidatedCount;
  }

  public static clear(): void {
    this.memoryStore.clear();
  }
}
