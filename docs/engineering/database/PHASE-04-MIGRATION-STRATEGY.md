# Phase 04 — Database Migration Strategy & Reproducibility Architecture

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Migration Strategy Approved  

---

## 1. Migration Philosophy & Rules of Engagement

1. **Strict Versioned Ordering**:
   - All migrations are stored as deterministic SQL files in `migrations/` with a 5-digit sequential prefix:
     `00001_initial_types_and_extensions.sql`
     `00002_core_institutional_tables.sql`
     `00003_identity_and_access_tables.sql`
     `00004_complaint_aggregate_tables.sql`
     `00005_supporting_workflow_tables.sql`
     `00006_audit_and_outbox_tables.sql`
     `00007_indexes_and_performance.sql`
     `00008_row_level_security_policies.sql`
     `00009_analytical_views.sql`
2. **Zero Manual Dashboard Tweaks**:
   - Manual schema changes in Supabase Studio or database GUI tools are strictly prohibited. The repository SQL files are the sole authoritative source of truth.
3. **Deterministic Zero-to-Current Execution**:
   - Any developer on a clean machine must be able to initialize an empty database and apply all migrations sequentially to reach the exact target schema with zero errors.
4. **Schema Drift Rejection**:
   - Migrations represent an unalterable historical sequence. Modifying an existing, applied migration file is forbidden; changes must be introduced as new forward migrations.

---

## 2. Schema Migration Tracking Table (`_schema_migrations`)

```sql
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Verification & Checksum Invariant
Before executing any new migration, the migration engine calculates the SHA-256 hash of each previously applied migration file and compares it to the checksum recorded in `_schema_migrations`. If a mismatch is detected (indicating unapproved historical file tampering), execution halts immediately.

---

## 3. Production Rollback & Expand-Contract Strategy

- In production databases containing live institutional records, blind `DOWN` migrations (e.g. `DROP TABLE`, `DROP COLUMN`) cause permanent data loss.
- **Expand-Contract Pattern**:
  1. *Expand*: Add new nullable columns or tables alongside legacy structures.
  2. *Migrate*: Backfill or dual-write data to new structures.
  3. *Switch*: Direct application traffic to the new schema.
  4. *Contract*: Remove deprecated columns/tables only after verifying stability.
- **Transactional Migrations**:
  - PostgreSQL natively supports transactional DDL (`CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX` inside `BEGIN ... COMMIT`). If a migration statement fails, the entire migration aborts and rolls back completely, leaving no partial state.
