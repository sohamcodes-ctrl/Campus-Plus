# Security Foundation & Privacy Controls

## 1. Threat Model Context & Defense in Depth

In accordance with **ADR-009 (Security, Authorization, and Anonymity Architecture)**, Campus Plus treats security, student anonymity, and data protection as core architectural tenets rather than afterthoughts.

---

## 2. Implemented Security Controls

### 2.1 Automated PII Masking & Log Sanitization (`src/shared/utils/pii.ts`)
- **Email Redaction**: Masks emails to preserve readability for support while eliminating PII exposure in logs (e.g. `john.doe@campus.edu` -> `j******e@campus.edu`).
- **Phone Redaction**: Retains only the last 4 digits (e.g. `+919876543210` -> `*********3210`).
- **Deep Object Sanitization**: Recursively inspects log payloads and redacts keys containing:
  - `password`, `token`, `secret`, `authorization`, `cookie`, `session`, `jwt`, `apiKey`, `service_role_key`, `phone`, `email`, `aadhaar`, `student_id`, `registration_number`.

### 2.2 Client / Server Secret Boundary Enforcement (`src/config/env.ts`)
- Server-only secrets are validated against `serverSchema`.
- Only explicitly prefixed `NEXT_PUBLIC_*` variables are exposed to the browser.
- A JavaScript runtime `Proxy` prevents client-side code from reading server credentials by throwing immediate runtime security errors if accessed.

### 2.3 Error Information Leakage Prevention (`src/shared/errors/AppError.ts`)
- Application errors implement a standardized `toJSON()` method.
- In production mode, raw stack traces, SQL error fragments, and internal server paths are stripped from client HTTP responses.
- All errors are tagged with a unique `correlationId` allowing operations engineers to trace errors in internal logs without exposing raw errors to end users.

### 2.4 Decoupled Health Endpoint (`src/app/api/health/route.ts`)
- Exposes no institutional data, complainant identities, or database credentials.
- Distinguishes liveness vs readiness probes with strict `Cache-Control: no-store` headers.

---

## 3. Git Secret Governance
- `.gitignore` enforces exclusion of:
  - `.env`
  - `.env*.local`
  - `.env.production`
  - `.env.staging`
  - `.env.test`
- Only `.env.example` containing non-functional placeholder values is permitted in version control.
