# 04 — Role Authorization & Security Model
**Campus Plus Final Five-Role Authentication Experience**
**Status:** RATIFIED & AUDITED  
**Date:** 2026-09-13  
**Classification:** DOMAIN AUTHORIZATION ANALYSIS

---

## 1. Critical Faculty vs. Handler Reconciliation
A vital requirement of Campus Plus is the precise separation between `ROLE_FACULTY` and `ROLE_HANDLER`.

### 1.1 Forensic Findings in Domain Model (`src/domain/complaint/AuthorizationPolicy.ts`):
```typescript
export const COMPLAINANT_ROLES: readonly UserRoleType[] = [
  UserRole.ROLE_STUDENT,
  UserRole.ROLE_FACULTY,
] as const;
```
- **`ROLE_FACULTY` is a Complainant Role.** A faculty member filing a grievance has identical permissions to a student: `SUBMIT`, `VIEW` (own complaints), `VERIFY_RESOLUTION`, `DISPUTE_REOPEN`, `CANCEL` (own pre-triage).
- **`ROLE_HANDLER` is an Operational Department-Scoped Role.** An operational handler has permissions to: `VIEW` (department-scoped), `START_PROGRESS` (assigned), `RESOLVE` (assigned), `FORWARD`, `ESCALATE`.
- Handler operations require active membership in `department_memberships`.

### 1.2 Public Persona Reconciliation:
- Public Persona: **"Faculty / Complaint Handler"**
- Technical Mapping:
  - Base account can hold `ROLE_FACULTY` (acting as Complainant).
  - Elevated operational handling requires explicitly assigned `ROLE_HANDLER` and verified `department_memberships`.
- **Security Invariant:** Selecting "Faculty / Complaint Handler" in the UI NEVER grants `ROLE_HANDLER` permissions. Server identity via `GET /api/v1/auth/me` is strictly authoritative.

---

## 2. Server Authority & Anti-Tampering Rules
1. Client payload `role` is treated solely as an intent hint.
2. The server-authoritative response from `GET /api/v1/auth/me` governs routing and workspace permissions.
3. If an authenticated user navigates to `/register`, the authenticated guard detects the active session, displays their server-verified role, and redirects to their dashboard, preventing client-side role re-assignment.
