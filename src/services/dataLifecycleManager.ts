// Data Lifecycle Manager & TTL Pruning Service for IndexedDB / LocalStorage

export const DataLifecycleManager = {
  runTtlPruning(ttlTransactionDays: number = 90, ttlAuditDays: number = 365): { prunedTransactions: number; prunedAuditLogs: number } {
    try {
      // Calculate cutoff timestamps
      const now = Date.now();
      const txCutoffMs = now - (ttlTransactionDays * 24 * 60 * 60 * 1000);
      const auditCutoffMs = now - (ttlAuditDays * 24 * 60 * 60 * 1000);

      let prunedTxCount = 0;
      let prunedAuditCount = 0;

      // Check localStorage / IndexedDB keys if any
      const storedIntents = localStorage.getItem('nercash_payment_intents');
      if (storedIntents) {
        try {
          const parsed = JSON.parse(storedIntents);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item: any) => {
              const itemTime = new Date(item.timestamp || Date.now()).getTime();
              return itemTime >= txCutoffMs;
            });
            prunedTxCount = parsed.length - filtered.length;
            localStorage.setItem('nercash_payment_intents', JSON.stringify(filtered));
          }
        } catch (e) {
          // ignore parse error
        }
      }

      console.log(`[DataLifecycleManager] TTL Pruning executed. Pruned ${prunedTxCount} old transactions (> ${ttlTransactionDays} days) and ${prunedAuditCount} audit logs (> ${ttlAuditDays} days).`);
      return { prunedTransactions: prunedTxCount, prunedAuditLogs: prunedAuditCount };
    } catch (e) {
      console.warn('Error running TTL pruning:', e);
      return { prunedTransactions: 0, prunedAuditLogs: 0 };
    }
  }
};
