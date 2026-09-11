# ADR-006: Escalation & SLA Architecture

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Systems Analyst  
**Traceability**: Resolves `OD-002`, `OD-006`, satisfies `FR-013`, `FR-014`, `BR-012`, `BR-013`, `BR-014`  

---

## 1. Context & Problem Statement

Unaddressed grievances create administrative bottlenecks and student frustration. Requirements specify two distinct escalation mechanisms:
1. **Manual Escalation (`FR-013`)**: Initiated by a handler or department head when blocked by budget, authority, or cross-department deadlock.
2. **Automated SLA Escalation (`FR-014`)**: Triggered when a complaint remains unattended or unresolved beyond defined time limits.

Phase 01 noted that specific numeric SLA durations (e.g. Urgent: 24h, High: 48h) are example values (`OD-006`) requiring institutional ratification.

We must design an escalation architecture that cleanly separates policy configuration from the technical execution mechanism.

---

## 2. Decision: Dual-Path Escalation with Configurable Policy Engine

We architect a **Tiered Escalation Engine** with explicit separation between **Manual Elevation** and **Automated SLA Scanning**.

### 2.1 Escalation Tiers & Routing (`OD-002`)
The system defines 3 standardized escalation tiers:
- **Tier 1 (Operational Handling)**: Assigned Handler / Staff Technician.
- **Tier 2 (Departmental Supervision)**: Department Head (`ROLE_DEPT_HEAD`) / Grievance Officer.
- **Tier 3 (Institutional Executive)**: Central Campus Grievance Redressal Committee / Principal (`ROLE_MANAGEMENT`).

### 2.2 Configurable SLA Policy Schema (`OD-006`)
Rather than hardcoding hours in application logic, SLA thresholds are stored in a configurable relational entity `sla_policies`:
```sql
-- Conceptual schema (Not deployed in Phase 02)
sla_policies (
    id UUID PRIMARY KEY,
    category_id UUID REFERENCES categories(id),
    priority VARCHAR NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    response_threshold_hours INTEGER NOT NULL,  -- Time to reach ASSIGNED / IN PROGRESS
    resolution_threshold_hours INTEGER NOT NULL, -- Time to reach RESOLVED
    escalation_target_tier INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE
)
```
- Default seed values provide standard campus benchmarks (Urgent: 24h, High: 48h, Medium: 120h, Low: 240h).
- Institutional administrators can update thresholds without application redeployment (`REQUIRES-INSTITUTIONAL-INPUT` for production values).

### 2.3 Automated SLA Evaluation Mechanism
1. **Scheduled Batch Evaluation**: A lightweight scheduled job (cron worker running every 15 minutes) queries active complaints where `status IN ('SUBMITTED', 'ASSIGNED', 'IN PROGRESS')` and `CURRENT_TIMESTAMP > (created_at + INTERVAL 'threshold_hours')`.
2. **Working Calendar Consideration (`ASM-004`)**: The SLA calculation engine computes elapsed hours based on standard working days, discounting Sundays and institutional holidays.
3. **Idempotent Elevation**: If a breach is detected, the engine atomically:
   - Sets `complaints.is_escalated = TRUE` and increments `escalation_tier`.
   - Records an action history entry with actor `SYSTEM_SLA_WATCHDOG` and reason `AUTOMATED_SLA_BREACH`.
   - Dispatches high-priority notification to Tier 2/3 authorities.

---

## 3. Consequences

### Positive
- Zero code changes required when institution adjusts SLA policies.
- Prevents redundant alerts: Escalation status is tracked with clear idempotency guards.
- Retains handler ownership context: Escalation alerts authorities without orphaning the assigned technician.

### Negative / Tradeoffs
- Requires a reliable background task runner/cron mechanism.

---

## 4. Phase Isolation
No background workers, cron jobs, or database tables are implemented in Phase 02.
