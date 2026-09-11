# Phase 04 — Database Security Threat Model & Verification

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design (Post-Gate Forensic Reconciliation Verified)  
**Date**: 2026-09-10  
**Status**: Formal Security Threat Model & Verification Approved  

---

## 1. Database Threat Modeling Matrix (STRIDE-aligned)

| Threat ID | Threat Category | Attack Path | Likelihood | Impact | Concrete Control | Residual Risk |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **`DB-T01`** | **Tampering** | Rogue actor or compromised account attempts to modify `action_history` audit records. | LOW | CRITICAL | PL/pgSQL trigger `trg_action_history_no_mutation` + `REVOKE UPDATE, DELETE` at DB kernel. | **NEGLIGIBLE** |
| **`DB-T02`** | **Information Disclosure** | Student queries internal staff notes via direct ID or API filter manipulation (IDOR). | MEDIUM | HIGH | Dedicated `internal_notes` table with isolated RLS policy completely denying student role. | **VERY LOW** |
| **`DB-T03`** | **Information Disclosure** | Student A attempts to read Student B's complaint records (`SELECT * FROM complaints`). | HIGH | HIGH | RLS policy `p_complaints_student_select` restricting rows to `complainant_id = auth.uid()`. | **VERY LOW** |
| **`DB-T04`** | **Elevation of Privilege** | Student inserts a row into `user_roles` granting themselves `ROLE_ADMIN`. | MEDIUM | CRITICAL | Default Deny on `user_roles`; zero INSERT policy for non-admin accounts. | **VERY LOW** |
| **`DB-T05`** | **Tampering** | Handler in Department A modifies complaint assigned to Department B. | MEDIUM | HIGH | RLS update policy enforces `department_id = auth_user_department_id()`. | **VERY LOW** |
| **`DB-T06`** | **Denial of Service** | Malicious client submits massive binary payload (100MB+) via attachment registration. | HIGH | MEDIUM | Database CHECK constraint `file_size_bytes <= 5242880` (5 MB max) + storage presigning check. | **VERY LOW** |
| **`DB-T07`** | **Malicious Code Execution** | Attacker uploads executable `.exe` or `.sh` script disguised as document evidence. | HIGH | CRITICAL | CHECK constraint `mime_type IN ('image/jpeg', 'image/png', 'application/pdf')`. | **VERY LOW** |
| **`DB-T08`** | **Information Disclosure** | Attacker enumerates tracking references (`CP-2026-00001` .. `00050`) to harvest student data. | HIGH | HIGH | Public tracking code lookup passes through RLS; non-owners receive 0 rows. | **VERY LOW** |
| **`DB-T09`** | **Concurrency Corruption** | Two department handlers accept and triage the same unassigned complaint simultaneously. | HIGH | MEDIUM | Optimistic Concurrency Control (`version` column); second writer receives 409 Conflict. | **VERY LOW** |
| **`DB-T10`** | **Supply Chain / Drift** | Developer manually alters tables in cloud dashboard, breaking production deployments. | MEDIUM | HIGH | Automated migration verification with SHA-256 checksums in `_schema_migrations`. | **VERY LOW** |

---

## 2. Automated Security Verification Suite

All database security invariants are backed by executable automated test suites (`tests/database/rls-authorization.test.ts` and `tests/database/audit-immutability.test.ts`):
1. **Audit Immutability Test**: Asserts that `UPDATE` and `DELETE` on `action_history` fail with SQL state `55000` via `trg_action_history_no_mutation`.
2. **Student Isolation Test**: Asserts that queries executed under Student A's identity return zero records belonging to Student B (tested under unprivileged role `app_user` with `SET ROLE app_user;`).
3. **Internal Notes Secrecy Test**: Asserts that Student queries against `internal_notes` return 0 rows under all query parameters (Zero Leakage).
4. **MIME Whitelist Integrity Test**: Asserts that inserting an attachment with `mime_type = 'application/x-msdownload'` violates `chk_attachment_mime_whitelist`.
5. **File Size Boundary Test**: Asserts that inserting an attachment with `file_size_bytes = 10000000` violates `chk_attachment_size_limit`.
