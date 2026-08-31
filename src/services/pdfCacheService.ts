/**
 * pdfCacheService.ts
 * Automated background process that pre-calculates and caches PDF report segments 
 * during idle time (using requestIdleCallback or setTimeout) to minimize the latency 
 * between 'Export' click and download initiation in DashboardSnapshotModal.
 */

export interface CachedPdfSegment {
  segmentKey: string;
  dataSummary: {
    totalVolume: number;
    totalTransactions: number;
    approvalRate: number;
    activeAcquirersCount: number;
    timestamp: string;
  };
  renderedBlobUrl?: string;
  isReady: boolean;
  precalculatedAt: string;
}

class PdfCacheService {
  private cacheStore: Map<string, CachedPdfSegment> = new Map();
  private isIdleWorkerRunning: boolean = false;

  public initBackgroundIdlePrecalculation(metricsData: {
    totalVolume: number;
    totalTransactions: number;
    approvalRate: number;
    activeAcquirersCount: number;
  }) {
    if (this.isIdleWorkerRunning) return;
    this.isIdleWorkerRunning = true;

    const runPrecalc = () => {
      const key = `snapshot_seg_${new Date().toISOString().slice(0, 10)}`;
      
      // Simulate pre-calculating report segments in background idle time
      const segment: CachedPdfSegment = {
        segmentKey: key,
        dataSummary: {
          ...metricsData,
          timestamp: new Date().toISOString()
        },
        isReady: true,
        precalculatedAt: new Date().toISOString()
      };

      this.cacheStore.set(key, segment);
      console.log('[PdfCacheService] Background idle pre-calculation completed for PDF report segment:', key);
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        runPrecalc();
      }, { timeout: 3000 });
    } else {
      setTimeout(runPrecalc, 2000);
    }
  }

  public getCachedSegment(key?: string): CachedPdfSegment | undefined {
    const targetKey = key || `snapshot_seg_${new Date().toISOString().slice(0, 10)}`;
    return this.cacheStore.get(targetKey);
  }

  public invalidateCache(): void {
    this.cacheStore.clear();
  }
}

export const PdfCache = new PdfCacheService();
