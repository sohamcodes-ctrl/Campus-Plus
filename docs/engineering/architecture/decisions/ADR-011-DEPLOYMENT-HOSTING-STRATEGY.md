# ADR-011: Deployment & Hosting Target Strategy

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: DevOps Engineer, Lead Software Architect  
**Traceability**: Resolves `OD-005`, satisfies `NFR-002`, `NFR-004`  

---

## 1. Context & Problem Statement

Phase 00 forensic reconnaissance revealed the development host environment:
- Windows 11 (X64), Node.js v24.13.0, npm 11.6.2, pnpm 11.22.0.
- Vercel CLI 54.4.1 is installed globally.
- Docker and Docker Compose are NOT installed / not on the host PATH.
- Production hosting infrastructure for the academic institution has not been formally provisioned.

We must define a deployment architecture that is strictly 12-Factor compliant, environment-agnostic, and capable of operating smoothly in local development without Docker while supporting seamless deployment to either modern cloud PaaS (e.g. Vercel) or a dedicated institutional Linux server.

---

## 2. Considered Options

1. **Option 1: Docker-Only Mandatory Orchestration**:
   - Mandate Docker Desktop for all development and deployment.
   - *Flaw*: Fails immediately on current host environment because Docker is absent on PATH.
2. **Option 2: Proprietary Cloud Vendor Lock-In**:
   - Deeply couple to proprietary vendor APIs (e.g. AWS Lambda-specific triggers).
   - *Flaw*: High institutional migration friction if institution requires on-premise hosting.
3. **Option 3: 12-Factor Environment-Agnostic Web Application**:
   - Built on standard Node.js / TypeScript runtime.
   - Configuration via environment variables (`.env`).
   - Stateless HTTP services interfacing external PostgreSQL and S3-compatible storage.
   - Deployable via Vercel CLI / Next.js hosting, or containerized via standard `Dockerfile` on any Linux VPS.

---

## 3. Decision

We **adopt Option 3: 12-Factor Environment-Agnostic Web Architecture**.

### 3.1 Architecture Blueprint
1. **Stateless Compute**: The application server stores zero persistent session state on local disk. All state resides in the relational database and object storage.
2. **Configuration by Environment**: All operational parameters (database URL, JWT secret, storage keys, CORS origins, SLA policies) are injected strictly via standard environment variables.
3. **Dual Deployment Targets**:
   - **Target A (Primary Managed Cloud / Staging)**: Vercel serverless / Edge hosting for web client and API endpoints, connected to managed PostgreSQL.
   - **Target B (Institutional On-Premise / Self-Hosted VPS)**: Standard Node.js process managed via PM2 or Linux systemd / Docker container, connected to campus PostgreSQL.

```text
       ┌────────────────────────────────────────────────────────┐
       │             12-Factor Application Core                 │
       │           (Standard Node.js / TypeScript)              │
       └───────────────────────────┬────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [Target A: Cloud PaaS]                     [Target B: Institutional VPS]
   (Vercel CLI / Managed)                     (Node.js / PM2 / Docker)
```

---

## 4. Consequences

### Positive
- Works natively on the current Windows development machine without requiring Docker installation.
- Enables immediate staging previews and user feedback via Vercel CLI.
- Retains 100% data portability for educational institutions requiring on-premise compliance.

### Negative / Tradeoffs
- Background scheduled cron tasks in serverless environments require external invocation (e.g. Vercel Cron or GitHub Actions webhook) rather than long-running in-process daemons.

---

## 5. Phase Isolation
No deployment scripts, Vercel deployments, or Docker configurations are executed in Phase 02.
