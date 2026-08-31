export interface ProviderLatencyMetric {
  providerId: string;
  name: string;
  p99: number;
  p95: number;
  p50: number;
  timestamp: string;
  status: 'healthy' | 'warning' | 'breached';
}

export interface SLOConfig {
  providerId: string;
  p99Threshold: number;
  p95Threshold: number;
  p50Threshold: number;
  enabled: boolean;
  channel: 'slack' | 'webhook' | 'pagerduty';
}

type BreachListener = (providerId: string, metric: ProviderLatencyMetric, config: SLOConfig) => void;

class PerformanceMonitorService {
  private listeners: Set<BreachListener> = new Set();
  private configs: Map<string, SLOConfig> = new Map();
  private lastBreachNotification: Map<string, number> = new Map();

  constructor() {
    // Default configs for BaaS providers
    this.configs.set('asaas', {
      providerId: 'asaas',
      p99Threshold: 300,
      p95Threshold: 220,
      p50Threshold: 90,
      enabled: true,
      channel: 'slack'
    });
    this.configs.set('iugu', {
      providerId: 'iugu',
      p99Threshold: 400,
      p95Threshold: 310,
      p50Threshold: 140,
      enabled: true,
      channel: 'pagerduty'
    });
    this.configs.set('juno', {
      providerId: 'juno',
      p99Threshold: 350,
      p95Threshold: 240,
      p50Threshold: 95,
      enabled: true,
      channel: 'webhook'
    });
    this.configs.set('stone', {
      providerId: 'stone',
      p99Threshold: 250,
      p95Threshold: 180,
      p50Threshold: 65,
      enabled: true,
      channel: 'slack'
    });
  }

  public updateConfig(config: SLOConfig) {
    this.configs.set(config.providerId, config);
  }

  public getConfig(providerId: string): SLOConfig | undefined {
    return this.configs.get(providerId);
  }

  public onBreach(listener: BreachListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public recordMetric(metric: ProviderLatencyMetric) {
    const config = this.configs.get(metric.providerId);
    if (!config || !config.enabled) return;

    if (metric.p99 > config.p99Threshold) {
      const now = Date.now();
      const last = this.lastBreachNotification.get(metric.providerId) || 0;
      // Throttled notification every 10 seconds per provider
      if (now - last > 10000) {
        this.lastBreachNotification.set(metric.providerId, now);
        this.listeners.forEach(fn => fn(metric.providerId, metric, config));
      }
    }
  }
}

export const PerformanceMonitor = new PerformanceMonitorService();
