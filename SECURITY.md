# Security Policy — Campus Plus

Campus Plus handles sensitive student grievances, institutional complaints, and disciplinary records. Maintaining the confidentiality, integrity, and availability of student and staff data is of paramount importance.

---

## 1. Reporting Vulnerabilities

If you discover a security vulnerability within Campus Plus, please **DO NOT** open a public issue.

Instead, submit your findings confidentially to the security response team:

* **Email**: `security@campusplus.institutional.internal`
* **Response SLA**: Within 24 hours of initial submission
* **Triage & Remediation Target**: Critical issues remediated within 48 hours

Please include:
- A detailed description of the vulnerability.
- Steps to reproduce or proof-of-concept payload.
- Affected components, files, or endpoints.
- Potential impact assessment.

---

## 2. Core Security Principles

### 2.1 Anonymity & Privacy Preservation
- Anonymized complaints must never leak complainant identity (`user_id`, student ID, IP address, session ID) to department staff or handlers.
- Complainant identity columns must be isolated behind strict database Row-Level Security (RLS) and encrypted at rest.

### 2.2 Secret Management
- Zero secrets in source control.
- All secrets (API keys, Supabase Service Role Keys, JWT secrets) must be loaded through environment variables.
- Server-only secrets must NEVER be prefixed with `NEXT_PUBLIC_` or imported into client components.
- The repository `.gitignore` strictly blocks all `.env` files except `.env.example`.

### 2.3 PII Redaction in Observability
- Application logs must pass through `sanitizeLogData()` in `@/shared/utils/pii`.
- Passwords, JWTs, cookies, bearer tokens, student IDs, phone numbers, and emails must be automatically redacted before writing to stdout or cloud log aggregators.

### 2.4 Immutable Audit Logging
- All state transitions, triage decisions, assignments, and resolution actions must produce an immutable audit log record.
- Audit records must include timestamp, actor ID (or "ANONYMOUS_USER" indicator), action type, and state diff.
