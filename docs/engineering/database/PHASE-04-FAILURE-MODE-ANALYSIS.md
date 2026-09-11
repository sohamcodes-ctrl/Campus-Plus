# Phase 04 — Database Failure Mode & Recovery Analysis

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Failure Mode Analysis Approved  

---

## 1. Failure Modes & Deterministic Recovery Matrix

| Failure Scenario | Immediate Operational Consequence | Architectural Behavior & Recovery Mechanism |
| :--- | :--- | :--- |
| **1. Database Unavailable** | Application cannot read or write data. Health endpoint `/api/health` reports readiness failure. | Application returns HTTP `503 Service Unavailable`. Connection pooling in Next.js/pg retries with exponential backoff. Zero partial data written. |
| **2. Migration Partially Fails** | DDL script errors mid-execution (e.g. invalid syntax or constraint conflict). | **Transactional DDL**: PostgreSQL rolls back the entire migration transaction. `_schema_migrations` is NOT updated. Database remains at clean prior version. |
| **3. Audit Insertion Fails** | Database rejects `action_history` insert (e.g. disk quota or constraint violation). | **Fail Closed**: The enclosing domain transaction (complaint creation, transition) **ABORTS and ROLLS BACK**. No state mutation is permitted without audit capture. |
| **4. Storage Upload Succeeds, but DB Insert Fails** | File is written to private object bucket, but database transaction fails. | **Orphan Management**: Presigned upload includes short-lived metadata tag (`status=uncommitted`). A nightly background cron purges storage objects lacking a corresponding `attachments` record after 24 hours. |
| **5. DB Insert Succeeds, but Notification Worker Crashes** | Complaint is saved, but in-app notification is not yet dispatched to recipient. | **Transactional Outbox Recovery**: The event is safely persisted in `outbox_events` (`status = 'PENDING'`). When worker restarts, it queries pending events from `idx_outbox_pending` and resumes dispatch with at-least-once delivery. |
| **6. Concurrent Status Transition** | Two handlers attempt to assign or resolve the same ticket simultaneously. | **Optimistic Concurrency Control**: Second query evaluates `WHERE id = :id AND version = :version`. Affected rows is 0; transaction rolls back and returns HTTP `409 Conflict`. |
| **7. Circular Forwarding Loop** | Department A forwards to B, B forwards back to A repeatedly. | **Anti-Deadlock Escalation**: System queries `forward_sequence`. Upon reaching 3 transfers (`forward_sequence >= 3`), system elevates ticket to `ESCALATED` for Management adjudication (`EDGE-004`). |
