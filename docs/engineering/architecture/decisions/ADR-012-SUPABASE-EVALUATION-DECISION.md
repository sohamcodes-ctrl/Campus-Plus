# ADR-012: Supabase Technical Evaluation & Adoption Decision

**Status**: Adopted with Constraints (`ADOPT WITH CONSTRAINTS`)  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Security Engineer, Database Architect  
**Formal Evaluation Outcome**: **`ADOPT WITH CONSTRAINTS`**  

---

## 1. Context & Problem Statement

Section 13 of the engineering protocol mandates an objective, criteria-driven technical evaluation of **Supabase** against system requirements, host environment constraints, security invariants, and institutional operational factors.

The evaluation must produce a definitive verdict among: `ADOPT` | `ADOPT WITH CONSTRAINTS` | `DEFER` | `REJECT`.
Furthermore, the protocol strictly enforces: **Supabase must NOT be connected, provisioned, or initialized during Phase 02.**

---

## 2. Multi-Criteria Architectural Evaluation

| Evaluation Dimension | Requirement / Context Criterion | Supabase Capability & Assessment | Impact Rating |
| :--- | :--- | :--- | :---: |
| **1. Authentication Requirements** | Email domain validation, secure JWT sessions, role claims, future SSO readiness (`SEC-001`, `ADR-002`). | Supabase Auth provides robust JWT token generation, email verification, session revocation, and native hooks for Google Workspace / Microsoft Entra SSO. | **STRONG FIT** |
| **2. PostgreSQL Engine** | Relational integrity, foreign key cascades, complex views, composite B-tree indices (`ADR-004`, `ADR-010`). | Full standard open-source PostgreSQL (version 15+). Zero proprietary query dialects; standard SQL. | **STRONG FIT** |
| **3. Row-Level Security (RLS)** | Defense-in-depth database-enforced row isolation per role and user ID (`SEC-002`, `NFR-005`, `ADR-003`). | Native Postgres RLS engine. Policies execute at the kernel SQL layer using authenticated JWT claims (`auth.uid()`, `auth.jwt()`). | **CRITICAL FIT** |
| **4. Private Object Storage** | Secure file attachments, private buckets, time-limited presigned URLs, MIME boundary enforcement (`SEC-005`, `NFR-007`, `ADR-008`). | Supabase Storage provides private S3-compatible buckets with fine-grained RLS storage policies and time-limited signed URL generation. | **STRONG FIT** |
| **5. Auditability & Immutability** | Append-only transaction journal, database-enforced `REVOKE UPDATE/DELETE` triggers (`FR-019`, `NFR-003`, `SEC-006`, `ADR-009`). | Supported natively via standard PostgreSQL triggers and role privilege grants. | **STRONG FIT** |
| **6. Scalability & Workload** | 1,000 daily active campus users, 10,000 annual complaints, concurrent surges (`NFR-004`). | Supabase managed infrastructure effortlessly accommodates 10x this volume without configuration overhead. | **STRONG FIT** |
| **7. Host Environment Reality** | Windows 11 host with Node 24, npm 11; **Docker is NOT installed on host PATH** (Phase 00 finding). | Managed Supabase cloud completely unblocks development and local testing without requiring local Docker daemon installation on Windows. | **CRITICAL FIT** |
| **8. Institutional Deployment & Cost** | Academic project budget; potential future on-premise migration requirement (`OD-005`). | Generous free tier covers development and academic production. Being 100% open-source, Supabase can be self-hosted on campus servers via Docker/Kubernetes if mandated. | **STRONG FIT** |
| **9. Vendor Dependency & Portability** | Preventing proprietary vendor lock-in (`NFR-012`). | Because Supabase is unadulterated PostgreSQL, the database schema, DDL, views, triggers, and queries can be exported and run on any vanilla PostgreSQL instance (AWS RDS, DigitalOcean, local Postgres) with zero code rewrite. | **ACCEPTABLE (Managed via Constraints)** |

---

## 3. Formal Decision: `ADOPT WITH CONSTRAINTS`

We formally decide to **`ADOPT WITH CONSTRAINTS`** Supabase as the managed backend data and authentication platform for Campus Plus.

### Mandatory Architectural Constraints:
1. **Constraint 1 (Phase Boundary Isolation)**:
   - Absolutely **zero connection, project initialization, CLI execution, or table creation** is performed during Phase 02. Connection and schema migrations are deferred to Phase 03/04.
2. **Constraint 2 (Domain Layer Decoupling)**:
   - The application domain logic MUST NOT be tightly coupled to Supabase client SDKs.
   - All mutations must pass through application service layer validators (`SubmitComplaint`, `AssignHandler`, `ResolveComplaint`) before reaching the database, preventing "smart client / dumb server" anti-patterns.
3. **Constraint 3 (Vanilla PostgreSQL Portability)**:
   - All migrations, schemas, views, and functions must be written in standard, portable PostgreSQL DDL.
   - No proprietary vendor-specific extensions that would prevent migrating to self-hosted vanilla PostgreSQL on a campus server.

---

## 4. Consequences

### Positive
- Solves the local development blocker caused by missing Docker on Windows.
- Delivers enterprise-grade PostgreSQL RLS, Auth, and Private Storage out of the box.
- Keeps project costs at zero during development while ensuring seamless deployment with Vercel.

### Negative / Tradeoffs
- Requires managing API keys and environment variables securely in Phase 03.

---

## 5. Phase Isolation
No Supabase project is created, no keys configured, and no database tables provisioned in Phase 02.
