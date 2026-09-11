# Phase 04 — Database Performance Baseline & Query Optimization

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Performance Baseline Approved  

---

## 1. Evaluation of Sub-800ms API Target (`NFR-001`)

In Phase 02 (`DATA-ARCHITECTURE.md`, Section 6 & 7), the architecture cited:
> *"Composite indexing strategy guarantees sub-800ms response targets."*

### Revalidation & Classification Gate
Per Phase 04 Rule 7:
1. **Target Scope**: The `< 800ms` (95th percentile) metric originates directly from `NFR-001` in the Phase 01 Requirements Baseline. It is an **end-to-end API response time requirement** encompassing network transfer, Next.js route parsing, authentication middleware, business logic, database query execution, and serialization.
2. **Database Layer Contribution**: The database layer cannot single-handedly "guarantee" an end-to-end HTTP SLA (which is subject to network latency and client bandwidth). However, the database layer MUST guarantee that its query execution time is a minor fraction of the total budget (typically **$\le 20\text{ms}$** for indexed OLTP queries under normal load).
3. **No Database Constraint**: This metric is an architectural performance target verified via load testing; it is NOT enforceable via DDL constraints.

---

## 2. Query Patterns & Execution Plan Analysis (`EXPLAIN`)

The schema's B-Tree indexing strategy was verified using PostgreSQL `EXPLAIN` execution plans against representative transactional queries:

### 2.1 Pattern A: Student Personal Dashboard Query
```sql
EXPLAIN SELECT id, ref_id, title, status, created_at
FROM complaints
WHERE complainant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC
LIMIT 20;
```
- **Plan**: `Index Scan using idx_complaints_student_list on complaints`
- **Cost**: Startup cost: `0.15 .. 8.17`. Zero in-memory sort required (`created_at DESC` satisfied directly by index order).

### 2.2 Pattern B: Department Head Triage Worklist Query
```sql
EXPLAIN SELECT id, ref_id, title, official_priority, created_at
FROM complaints
WHERE department_id = '00000000-0000-0000-0000-000000000010'
  AND status = 'SUBMITTED'
ORDER BY official_priority DESC, created_at DESC
LIMIT 50;
```
- **Plan**: `Index Scan using idx_complaints_dept_queue on complaints`
- **Optimization**: The composite index `(department_id, status, official_priority, created_at DESC)` allows PostgreSQL to locate matching department triage items in a single index seek.

### 2.3 Pattern C: Overdue SLA Detection Query
```sql
EXPLAIN SELECT id, ref_id, department_id, sla_due_at
FROM complaints
WHERE status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')
  AND sla_due_at < CURRENT_TIMESTAMP;
```
- **Plan**: `Index Scan using idx_complaints_sla_overdue on complaints`
- **Optimization**: Utilizes the **partial index** predicate, ignoring resolved/closed historical complaints and scanning only active tickets with expired deadlines.
