/**
 * Client-side Request Throttler to prevent UI-driven spam of external gateway calls.
 * Limits calls to max N per time window and provides visual feedback status.
 */
export class RequestThrottler {
  private static timestamps: number[] = [];
  private static readonly MAX_REQUESTS = 6; // Max 6 requests
  private static readonly TIME_WINDOW_MS = 3000; // per 3 seconds

  public static checkAndRecord(): { allowed: boolean; retryAfterMs: number; message?: string } {
    const now = Date.now();
    // Filter timestamps within window
    this.timestamps = this.timestamps.filter(t => now - t < this.TIME_WINDOW_MS);

    if (this.timestamps.length >= this.MAX_REQUESTS) {
      const oldest = this.timestamps[0];
      const retryAfterMs = Math.ceil(this.TIME_WINDOW_MS - (now - oldest));
      return {
        allowed: false,
        retryAfterMs,
        message: `ALERTA DE SEGURANÇA: Limite de taxa de requisições excedido (Spam preventivo). Aguarde ${Math.ceil(retryAfterMs / 1000)}s.`
      };
    }

    this.timestamps.push(now);
    return { allowed: true, retryAfterMs: 0 };
  }
}
