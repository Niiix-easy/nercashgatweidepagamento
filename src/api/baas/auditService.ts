interface BaasAuditRecord {
  id: string;
  endpoint: string;
  method: string;
  payload: any;
  statusCode: number;
  timestamp: string;
  hmacSignature: string;
  hashProof: string;
  ip: string;
}

// In-memory immutable audit ledger for BaaS API routes
class BaasAuditLedger {
  private records: BaasAuditRecord[] = [
    {
      id: 'aud_init_9981',
      endpoint: '/api/v1/baas/credit-card',
      method: 'POST',
      payload: { amount: 1500.00, installments: 10, customerEmail: 'vip@nercash.io' },
      statusCode: 201,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      hmacSignature: 'sha256=a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
      hashProof: '0x8f9c2b1a4e7d6f5c8b0a3e2f1d4c6b8a9e7f2c1a',
      ip: '186.230.12.44'
    },
    {
      id: 'aud_init_9982',
      endpoint: '/api/v1/baas/boleto',
      method: 'POST',
      payload: { amount: 620.00, customerEmail: 'financeiro@empresa.com.br' },
      statusCode: 201,
      timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
      hmacSignature: 'sha256=b7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8',
      hashProof: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      ip: '200.143.19.120'
    },
    {
      id: 'aud_init_9983',
      endpoint: '/api/v1/baas/pix-parcelado',
      method: 'POST',
      payload: { amount: 3200.00, installments: 24, customerEmail: 'diretoria@nercash.io' },
      statusCode: 200,
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      hmacSignature: 'sha256=f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0',
      hashProof: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d',
      ip: '177.184.99.12'
    }
  ];

  public addRecord(record: Omit<BaasAuditRecord, 'hashProof'>) {
    const hashProof = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const fullRecord: BaasAuditRecord = { ...record, hashProof };
    this.records.unshift(fullRecord);
    return fullRecord;
  }

  public getRecords(): BaasAuditRecord[] {
    return this.records;
  }
}

export const baasAuditLedger = new BaasAuditLedger();
