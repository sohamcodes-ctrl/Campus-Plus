# Campus Plus — Reliability, Failure Mode Analysis, Observability & Deployment Topology

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: RELIABILITY-OPERATIONS-DEPLOYMENT.md  
**Version**: 1.0  
**Status**: Formal Operational Architecture  
**Authors**: DevOps Engineer, Reliability Engineer, Lead Software Architect  

---

## 1. Executive Summary

This document specifies the **Reliability Engineering Blueprint**, **Failure Mode and Effects Analysis (FMEA)**, **Observability Architecture**, **Backup & Recovery Strategy**, and **12-Factor Multi-Environment Deployment Topology** for Campus Plus. 

The architecture guarantees high availability (`NFR-002`), transparent operational visibility (`NFR-009`), and graceful failure degradation across both cloud-hosted (Vercel) and institutional on-premise environments ([ADR-011](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-011-DEPLOYMENT-HOSTING-STRATEGY.md)).

---

## 2. Failure Mode and Effects Analysis (FMEA)

| Subsystem / Component | Failure Mode | Root Cause | Severity | Detection Mechanism | Architectural Mitigation & Fallback Strategy | User-Visible Experience |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **Relational Database** | Connection Pool Exhaustion / DB Unreachable | Spike in campus traffic, network partition, unindexed query | **CRITICAL** | API Gateway health probe (`/health/ready`) fails; DB driver throws connection timeout. | Circuit breaker trips; exponential backoff retries (3 attempts). Pool size tuned with statement timeouts (5s max). | Generic error: "System is experiencing high load. Please try again shortly." (`HTTP 503`). |
| **Private Object Storage** | Upload Ticket Generation / Bucket Network Timeout | Cloud storage provider outage, expired credentials | **HIGH** | Storage adapter catch block logs HTTP 502 / 504. | Non-blocking degradation: User is alerted that attachment service is temporarily unavailable; can proceed with text submission or retry upload. | "Attachment service temporarily offline. You may submit complaint with text details now." |
| **Authentication Service** | Token Verification Failure / Signature Expired | Secret key rotation, expired JWT, client clock drift | **MEDIUM** | Auth interceptor catches `TokenExpiredError`. | Client automatically prompts token refresh via secure cookie or redirects gracefully to login. | Clean redirect to login with notification: "Session expired. Please log in again." |
| **Notification Subsystem** | Delivery Failure to Recipient Inbox / Email Down | Transactional email provider rate limit, network blip | **LOW** | Notification dispatcher catch block logs delivery failure. | Asynchronous isolation: Core complaint transition commits successfully; notification failure enqueued for retry without rolling back complaint state. | User sees state transition complete; notification arrives upon retry. |
| **Concurrent Mutation** | Two Handlers Update / Assign Same Complaint Milliseconds Apart | Race condition in browser UI worklist | **MEDIUM** | Optimistic Concurrency Control (OCC) detects `version` mismatch (`rows_affected == 0`). | Atomic SQL rollback; returns `HTTP 409 Conflict` with latest entity state payload. | UI alerts: "Complaint was updated by another user. Refreshing view..." |
| **Network Flap / Duplicate Request** | User clicks "Submit Complaint" 4 times on flaky mobile cellular link | Slow upstream mobile connection | **MEDIUM** | Idempotency Key header filter (`Idempotency-Key: <UUID>`) checks in-memory / cache table. | First request processes; subsequent requests within 15 mins return initial cached response without duplicate records. | User receives single tracking reference without duplicate tickets. |
| **Partial Workflow Failure** | State updates, but audit log insert fails due to DB constraint | Disk full, memory pressure, schema constraint error | **CRITICAL** | Database transaction manager aborts. | Strict Atomic Transaction: Entire transition rolls back; zero untracked state mutations allowed (`ADR-005`, `ADR-009`). | "Action could not be recorded. No changes were made." |

---

## 3. Observability & Telemetry Architecture

To satisfy `NFR-009` without violating student confidentiality (`PRIV-001`), telemetry is partitioned into **Operational Telemetry** and the **Business Audit Journal**.

### 3.1 Structured Operational Logging
- **Format**: Structured JSON emitted to stdout/stderr.
- **Correlation ID**: Every HTTP request receives or generates a `correlation_id` (UUIDv4) passed across all service layers:
  ```json
  {
    "timestamp": "2026-09-10T17:05:00.123Z",
    "level": "INFO",
    "correlation_id": "8f87e55b-4b12-4c33-9d11-446655440000",
    "module": "ComplaintIntakeService",
    "event": "ComplaintCreated",
    "reference_id": "CP-2026-00104",
    "actor_role": "ROLE_STUDENT",
    "duration_ms": 142
  }
  ```
- **Strict Data Scrubbing Rules (Zero Leakage)**:
  - **PROHIBITED IN LOGS**: Passwords, plaintext tokens, student phone numbers, email addresses, grievance descriptive text, attachment binary contents.
  - **ALLOWED IN LOGS**: User IDs (UUID), reference IDs (`CP-YYYY-XXXXX`), HTTP status codes, error codes, latency durations.

### 3.2 Operational Metrics & Health Endpoints
- **Liveness Probe (`GET /health/live`)**: Returns HTTP 200 if Node.js process is responsive.
- **Readiness Probe (`GET /health/ready`)**: Executes a `SELECT 1` query to PostgreSQL and checks Object Storage reachability. Returns HTTP 200 if ready, HTTP 503 if dependencies fail.
- **Business SLA Health**: Monitored via the database analytical query counting active breached complaints:
  `SELECT COUNT(*) FROM complaints WHERE is_escalated = TRUE;`.

---

## 4. Backup & Disaster Recovery Architecture

In compliance with Section 40 and Section 64 of the protocol: Specific numeric Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) are marked **`NOT YET DEFINED`** pending institutional disaster recovery policy ratification.

### Conceptual Backup & Preservation Blueprint:
1. **Automated Database Backups**:
   - Continuous WAL archiving (Point-in-Time Recovery) + Daily automated full database snapshots.
   - Preserves complete relational state and immutable audit journals (`action_history`).
2. **Object Storage Replication**:
   - Attachments stored with versioning enabled and geographic cross-region replication (or secondary bucket mirror).
3. **Audit History Preservation Guarantee**:
   - Audit records in `action_history` are never purged. In backup restoration drills, audit journal consistency is verified via automated row-count checksums against complaint lifecycle event totals.

---

## 5. 12-Factor Multi-Environment Deployment Topology

The application is architected according to **The Twelve-Factor App** methodology, ensuring complete portability across environments:

```text
                                 [12-FACTOR CODEBASE REPOSITORY]
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
      [LOCAL DEVELOPMENT]               [STAGING PREVIEW]            [PRODUCTION RUNTIME]
      • Host: Windows 11 Node 24        • Host: Vercel Cloud         • Host: Managed PaaS / Linux VPS
      • DB: Cloud Supabase Dev DB       • DB: Cloud Staging DB       • DB: Production PostgreSQL + RLS
      • Storage: Dev Bucket (Private)   • Storage: Staging Bucket    • Storage: Production S3 Bucket
      • Log: Pretty Terminal JSON       • Log: JSON to Log Drain     • Log: Structured JSON to Datadog
```

### Multi-Environment Configuration Matrix:

| Configuration Parameter | Local Development | Staging Environment | Production Environment | Sensitivity |
| :--- | :--- | :--- | :--- | :---: |
| `NODE_ENV` | `development` | `staging` | `production` | Public |
| `DATABASE_URL` | Pooled connection string to Dev DB | Staging PostgreSQL connection | Production PostgreSQL connection | **SECRET** |
| `JWT_SECRET_KEY` | Development HMAC secret | Staging HMAC secret | Production 256-bit cryptographically random key | **CRITICAL SECRET** |
| `STORAGE_BUCKET_NAME` | `campus-plus-dev-attachments` | `campus-plus-staging-attachments` | `campus-plus-prod-attachments` | Internal |
| `INSTITUTION_EMAIL_DOMAIN`| `rcpit.ac.in,example.edu` | `rcpit.ac.in` | Institutional domain pattern only | Internal |
| `VERIFICATION_WINDOW_DAYS`| `5` | `5` | Confirmed institutional parameter | Internal |
| `ENABLE_IN_APP_NOTIFICATIONS`| `true` | `true` | `true` | Public |
| `ENABLE_EMAIL_NOTIFICATIONS` | `false` (mock adapter) | `false` / `true` (staging SMTP) | `true` (production SMTP) | Public |

---

## 6. Architecture Verification Summary

- [x] FMEA table details causes, mitigations, and user-visible behaviors for all 7 critical failure modes.
- [x] Observability blueprint defines structured JSON logging with correlation IDs and strict PII scrubbing.
- [x] Technical readiness probes (`/health/ready`) separated from business SLA health monitoring.
- [x] Backup strategy ensures immutable audit preservation; RPO/RTO preserved as `NOT YET DEFINED`.
- [x] 12-factor multi-environment topology proves seamless operation from Windows development to cloud production.
