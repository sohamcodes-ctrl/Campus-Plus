# PHASE 07-B: Live Integration Plan & Architectural Justification

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Status:** **ACTIVE / VERIFIED INTEGRATION BOUNDARY**  
**Lead Authority:** Principal Engineer • Staff Software Architect • Security Architect • Database Architect  

---

## 1. Executive Mission & Scope

Phase 07-B transforms the Campus Plus engineering architecture to operate with full fidelity against **target Supabase cloud infrastructure** (PostgreSQL, Supabase Auth, and Private Supabase Storage) while maintaining strict isolation, zero schema drift, and absolute parity with the locked Phase 05/06 domain and application boundaries.

### Core Architectural Mandates
1. **No Silent Fallback**: If a live database (`DATABASE_URL`) is configured and fails, the application must throw an immediate fatal error (`CRITICAL INFRASTRUCTURE FAILURE`). Silent degradation to local in-memory PGlite is strictly forbidden.
2. **No Runtime DDL**: Application startup must never execute `CREATE SEQUENCE`, `CREATE TABLE`, `CREATE INDEX`, or other schema-mutating DDL. All schema objects are version-controlled in SQL migrations.
3. **Formalization of `tracking_code_seq`**: Migration `00010_tracking_code_sequence.sql` formally provisions the sequence in PostgreSQL schema.
4. **Authentic Supabase Auth & Identity Mapping**: In production/staging, requests authenticate via Bearer JWTs verified against Supabase Auth. Verified `auth.users.id` must explicitly map to an active institutional record in `public.users`.
5. **Private Storage Enclosure**: Storage bucket `campus-plus-attachments` remains private. Pre-signed upload URLs enforce a 5 MB file size ceiling, strict MIME whitelist (`image/jpeg`, `image/png`, `application/pdf`), and directory-traversal-resistant file keys.
6. **Zero-Regression Guarantee**: All 197 existing tests must remain green. 14 new Phase 07-B infrastructure verification tests expand the total passing suite to 211 tests.

---

## 2. Infrastructure Component Architecture

```text
HTTP Client Request
  │
  ├─► [1] AuthenticationAdapter (Bearer Token)
  │     ├── Supabase Auth API (jwt validation)
  │     └── PostgreSQL Directory Lookup (users + user_roles + department_memberships)
  │           ▼
  │         Trusted ActorContext (userId, role, departmentId)
  │
  ├─► [2] Application Layer Use Cases (Clean Architecture)
  │     └── Domain Invariants & State Machine Enforcement
  │
  ├─► [3] Dual-Mode PostgreSQL Persistence (pool.ts)
  │     ├── STAGING/PROD: pg.Pool (DATABASE_URL with SSL & connectionTimeout: 2s)
  │     │     └── Transaction Runner: client checkout -> BEGIN -> COMMIT/ROLLBACK
  │     └── LOCAL/OFFLINE: @electric-sql/pglite (in-memory WASM PostgreSQL)
  │           └── Auto-migrates 00010 migrations + applies synthetic seeds
  │
  └─► [4] Private Storage Adapter (SupabaseStorageAdapter.ts)
        ├── Server-Side MIME & Size Guards (<= 5 MB; JPEG, PNG, PDF)
        ├── Key Sanitization (complaints/temp/{uuid}-{sanitized_filename})
        └── Supabase Storage API: createSignedUploadUrl / createSignedUrl
```

---

## 3. Justification of Architectural Modifications

| Component | Nature of Change | Architectural Rationale & Evidence |
| :--- | :--- | :--- |
| `migrations/00010_tracking_code_sequence.sql` | **NEW MIGRATION** | Eliminates runtime DDL from `pool.ts`. Fixes the critical finding where `tracking_code_seq` was created at application startup. |
| `src/infrastructure/database/pool.ts` | **ENHANCEMENT** | Added `PostgresLiveQueryAdapter` and `PostgresClientQueryAdapter` using `pg.Pool`. Implemented explicit connection probe and enforced Section 51 rule against silent fallback. |
| `src/infrastructure/auth/AuthenticationAdapter.ts` | **ENHANCEMENT** | Integrated `@supabase/supabase-js` `auth.getUser(token)` for live staging/production JWT verification. Preserved strict exclusion of `x-actor-id` in production (`NODE_ENV === 'production'`). |
| `src/infrastructure/storage/SupabaseStorageAdapter.ts` | **NEW ADAPTER** | Implemented `StoragePort` with authentic Supabase Storage client integration for signed upload/download URLs. |
| `src/infrastructure/container.ts` | **ENHANCEMENT** | Dynamically binds `SupabaseStorageAdapter` when Supabase credentials are present, falling back to `InMemoryStorageAdapter` during offline local testing. |
| `tests/integration/supabase-infrastructure.test.ts` | **NEW TEST SUITE** | 14 comprehensive tests verifying migration 00010, silent fallback prohibition, auth bypass prevention, storage guards, sequence concurrency, and audit triggers. |
