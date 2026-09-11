# Phase 04 — Table Count Forensic Reconciliation

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 Post-Gate Forensic Reconciliation  
**Date**: 2026-09-10  
**Authoritative Verdict**: **Case C — 16 Functional Entity Groupings Expanded to 21 Domain Tables (+ 1 Migration Ledger = 22 Physical Base Tables)**

---

## 1. The Discrepancy

In the initial Phase 04 documentation artifacts (`PHASE-04-FINAL-REPORT.md` and `PHASE-04-ENTITY-RECONCILIATION.md`), an apparent discrepancy was identified:
- The **Executive Summary** and **Schema Quantification Summary** claimed:  
  `"comprising 16 tables, 12 specialized indexes..."`
- However, the **Physical Schema DDL** (`PHASE-04-SCHEMA-DESIGN.md`) and the **Migration Scripts** (`00001` through `00009`) defined **21 application domain tables** and **1 migration ledger table**, totaling **22 physical base tables** in the PostgreSQL catalog (`information_schema.tables`).

This document provides the definitive forensic trace of how this discrepancy occurred, proves which number is authoritatively correct, and reconciles the entire repository record.

---

## 2. Forensic Root Cause Analysis

### 2.1 Origin in the Phase 04 Entity Reconciliation Gate
In Phase 02 (`DATA-ARCHITECTURE.md`), the architecture baseline specified 9 conceptual entities:
1. `departments`
2. `categories`
3. `users`
4. `complaints`
5. `attachments`
6. `action_history`
7. `resolutions`
8. `sla_policies`
9. `notifications`

During Phase 04 execution, an Entity Reconciliation Gate was conducted (`PHASE-04-ENTITY-RECONCILIATION.md`, Section 3) to expand and normalize these 9 conceptual entities into production-grade relational structures.

In constructing the reconciliation matrix, the architect structured the table with **16 rows** representing **16 functional entity concepts**:

| Row # | Conceptual Category | Final DB Representation in Matrix | Physical SQL Base Tables Created |
| :---: | :--- | :--- | :--- |
| 1 | `departments` | Retained as Core Table | `departments` (1) |
| 2 | `categories` | Retained as Core Table | `categories` (1) |
| 3 | `users` | Normalized into 3 Tables *(Typo in text; actually 4)* | `users`, `roles`, `user_roles`, `department_memberships` (**4**) |
| 4 | *(New / Normalized)* | Controlled Physical Campus Locations | `locations` (1) |
| 5 | *(New / Normalized)* | Operating Calendars & Holiday Exclusions | `working_calendars`, `calendar_holidays` (**2**) |
| 6 | `complaints` | Core Aggregate Table | `complaints` (1) |
| 7 | *(New / Normalized)* | Historical Assignment Ledger | `complaint_assignments` (1) |
| 8 | *(New / Normalized)* | Inter-Department Forwarding History | `complaint_forwards` (1) |
| 9 | *(New / Normalized)* | Operational Escalation Log | `complaint_escalations` (1) |
| 10 | `resolutions` | Formal Resolution Record | `resolutions` (1) |
| 11 | `attachments` | Object Storage Metadata | `attachments` (1) |
| 12 | *(New / Security)* | Private Internal Staff Notes | `internal_notes` (1) |
| 13 | `action_history` | Append-Only Audit Journal | `action_history` (1) |
| 14 | `sla_policies` | Category & Priority SLA Config | `sla_policies` (1) |
| 15 | `notifications` | In-App User Inbox Alerts | `notifications` (1) |
| 16 | *(New / Reliability)* | Transactional Outbox & Idempotency Registry | `outbox_events`, `idempotency_keys` (**2**) |

### 2.2 The Mathematical Error
When writing the concluding remarks of `PHASE-04-ENTITY-RECONCILIATION.md` (Section 4) and subsequently copying summary metrics into `PHASE-04-FINAL-REPORT.md`, the author counted the **number of rows in the reconciliation matrix (16 rows)** and mistakenly wrote:
> *"comprising 16 tables..."*

In reality:
- Row 3 (`users`) generated **4 distinct tables** to decouple authentication identity (`users`), RBAC definitions (`roles`), role mapping (`user_roles`), and departmental staffing (`department_memberships`).
- Row 5 (`calendars`) generated **2 distinct tables** (`working_calendars` and `calendar_holidays`) to eliminate repeating groups of holiday dates.
- Row 16 (`reliability`) generated **2 distinct tables** (`outbox_events` and `idempotency_keys`) to separate domain event publishing from HTTP request deduplication.

Summing the physical tables across the 16 functional rows:
$$1 + 1 + 4 + 1 + 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 = \mathbf{21\text{ domain tables}}$$

Adding the migration engine tracking ledger (`_schema_migrations`):
$$\mathbf{21\text{ domain tables}} + \mathbf{1\text{ migration table}} = \mathbf{22\text{ base tables}}$$

Adding the 2 analytical views (`recurring_complaint_clusters`, `department_sla_performance`):
$$\mathbf{22\text{ base tables}} + \mathbf{2\text{ views}} = \mathbf{24\text{ total relations}}$$

---

## 3. Detailed Normalization Audit (Why 21 Tables is Structurally Required)

Collapsing the 21 domain tables into 16 tables would have introduced severe normalization anti-patterns and violated Third Normal Form (3NF):

1. **Why `roles`, `users`, `user_roles`, and `department_memberships` cannot be combined**:
   - Storing `role` or `department_id` on the `users` table forces single-role and single-department limitations.
   - It creates transitive dependencies (`user_id -> department_id -> department_head`).
   - Normalizing into 4 tables satisfies 3NF and enables multi-role actors (e.g. faculty member who is also a department handler) without data duplication.
2. **Why `working_calendars` and `calendar_holidays` cannot be combined**:
   - A calendar can have $N$ holidays. Storing holidays as an array or comma-separated string inside `working_calendars` violates 1NF (atomicity).
   - Normalizing into parent-child tables preserves 1NF, 2NF, and 3NF.
3. **Why `outbox_events` and `idempotency_keys` cannot be combined**:
   - Outbox events represent outbound domain integration messages with status lifecycle (`PENDING`, `PUBLISHED`, `FAILED`).
   - Idempotency keys represent inbound HTTP transaction deduplication with TTL expiration (`expires_at`).
   - Combining them would create orthogonal, nullable attributes with zero functional dependency on each other's primary keys, violating 2NF and 3NF.

---

## 4. Authoritative Reconciled Quantities

The following table supersedes all previous informal draft counts:

| Concept Category | Quantity | Authoritative Specification |
| :--- | :---: | :--- |
| **Phase 02 Conceptual Entities** | **9** | Conceptual business entities from Phase 02 data architecture |
| **Phase 04 Functional Entity Groupings** | **16** | Functional concept groupings in reconciliation matrix |
| **Authoritative Domain Base Tables** | **21** | Application tables in `public` schema executing domain business logic |
| **Migration Tracking Base Table** | **1** | `_schema_migrations` tracking DDL versions and checksums |
| **Total Physical Base Tables in Engine** | **22** | Exact count of `BASE TABLE` rows in PostgreSQL `information_schema.tables` |
| **Analytical Views** | **2** | `recurring_complaint_clusters`, `department_sla_performance` |
| **Total PostgreSQL Relations** | **24** | 22 Base Tables + 2 Views |
| **PostgreSQL Enumerated Types (ENUMs)** | **5** | Defined in `00001_initial_types_and_extensions.sql` |
| **Row-Level Security Policies** | **13** | Defined in `00008_row_level_security_policies.sql` |
| **Total B-Tree Indexes in Catalog** | **45** | 22 PK indexes + 11 UNIQUE constraint indexes + 12 explicit non-PK indexes |
| **Total Database Constraints** | **216** | Foreign keys, checks, primary keys, and unique invariants |

---

## 5. Conclusion

The discrepancy is formally resolved as **Case C**:
- There was **never a missing table or a deleted table**.
- All 21 domain tables were written into migrations `00002` through `00006` and are fully covered by schema constraints and tests.
- The reference to "16 tables" was a purely textual summation error that treated the 16 rows of the entity reconciliation matrix as a table count.
- The authoritative table count for Campus Plus Phase 04 is **21 domain tables** (or **22 base tables** including the migration ledger `_schema_migrations`).
