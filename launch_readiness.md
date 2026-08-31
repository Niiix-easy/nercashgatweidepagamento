# Platform Launch Readiness Checklist - Nercash

**Document Version:** 1.0.0-Production  
**Target Environment:** Cloud Run Production Cluster (Region: us-central1)  
**Scope:** Pre-flight validation, external integration stress-testing, multi-tenancy DB migration scripts, and compliance audit workflows.

---

## 1. External Integration Stress-Testing Endpoints

To ensure zero-downtime performance under high concurrency with external BaaS and payment processors (Iugu, Juno, Asaas, Stone, Cielo), the platform requires rigorous stress-testing against the following endpoints:

- **`/api/v1/stress/burst-gateway`**: Validates asynchronous rate-limiting and circuit breaker trip thresholds under simulated bursts of 500+ concurrent payment requests.
- **`/api/v1/stress/baas-latency`**: Measures round-trip handshake degradation and failover recovery time when simulating 200ms+ network jitter on Iugu/Asaas APIs.
- **`/api/v1/stress/webhook-flood`**: Tests webhook queue backpressure and idempotent event deduplication under a load of 2,000 asynchronous webhook payloads per minute.

---

## 2. Database Schema Migration Scripts (Multi-Tenancy & Sharding)

For true multi-tenant isolation and horizontal scalability across merchant accounts, the underlying relational database (Cloud SQL PostgreSQL) requires strict schema versioning and tenant separation:

```sql
-- Migration Script: V4.2.0__multi_tenant_sharding.sql

-- 1. Enable Row Level Security (RLS) on Tenant Tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_history ENABLE ROW LEVEL SECURITY;

-- 2. Create Tenant Isolation Policy
CREATE POLICY tenant_isolation_policy ON transactions
    USING (merchant_id = current_setting('app.current_tenant_id', true));

-- 3. Multi-Tenant Partitioning by Merchant Region / ID Range
CREATE TABLE transactions_partitioned (
    transaction_id VARCHAR(64) NOT NULL,
    merchant_id VARCHAR(64) NOT NULL,
    amount_brl NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (merchant_id);

-- 4. Audit Log Immutability Constraint
CREATE TABLE audit_logs_immutable (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(128) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
REVOKE UPDATE, DELETE ON audit_logs_immutable FROM PUBLIC;
```

---

## 3. Final Security Audit Workflow & Compliance Validation

Before opening the platform to the public, the following compliance verification workflows must be completed and signed off:

1. **PCI-DSS SAQ-D Compliance Verification**:
   - Automated scan of all client-side bundles to ensure zero PAN/CVV exposure.
   - Verification that tokenization (P2PE/E2EE) via `PciTokenVault` is active for all card transactions.
2. **Automated CSP & Header Hardening**:
   - Enforcement of strict Content Security Policy (`script-src 'self'`, `object-src 'none'`) across all checkout views (`SuperCheckoutView`).
3. **Key Rotation & Secret Hygiene**:
   - Automated rotation of all staging API keys and enforcement of environment variable isolation via Secret Manager.
4. **Signed CSV Audit Log Verification**:
   - End-to-end test of Ed25519 signature verification on monthly settlement files to prevent tampering.
