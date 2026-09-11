# PHASE 07-B: Supabase Auth Integration & Trusted Identity Mapping

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Status:** **VERIFIED & SECURED (Production Bypass Prohibited)**  

---

## 1. Authentication Architecture & Trust Boundary

In Campus Plus, client claims are considered untrusted by default. The presentation layer never accepts user IDs, role designations, or department scopes directly from request payloads or client headers.

```text
HTTP Request
  │
  ├─► Authorization: Bearer <supabase_access_token>
  │
  ▼
AuthenticationAdapter.extractActorContext(request)
  │
  ├─► Step 1: Provider Verification (Supabase Auth API)
  │     └── supabase.auth.getUser(token)
  │           ├── Error / Expired / Invalid signature ──► 401 Unauthorized
  │           └── Valid Token ──► Returns authenticated Supabase User ID
  │
  ├─► Step 2: Institutional Identity Mapping (PostgreSQL Query)
  │     └── SELECT u.id, u.is_active, ur.role_id, dm.department_id
  │         FROM users u
  │         LEFT JOIN user_roles ur ON u.id = ur.user_id
  │         LEFT JOIN department_memberships dm ON u.id = dm.user_id AND dm.is_active = TRUE
  │         WHERE u.id = $1
  │           ├── Zero rows ──► 401 (Identity not enrolled in directory)
  │           ├── is_active = FALSE ──► 401 (Account deactivated)
  │           └── Active row ──► Resolves verified role & department
  │
  ▼
Trusted ActorContext: { userId, role, departmentId }
```

---

## 2. Production Bypass Gate & Security Analysis (Section 19)

### The Test Actor Fixture (`x-actor-id`)
During Phase 05/06 unit and offline development, a development convenience header (`x-actor-id`) was used to simulate synthetic actors without running external network calls.

### Hardened Production Defense
In [`src/infrastructure/auth/AuthenticationAdapter.ts`](file:///d:/Deparment%20Project/department%20project/src/infrastructure/auth/AuthenticationAdapter.ts):
```typescript
const isProduction = process.env.NODE_ENV === "production";
const testActorHeader = request.headers.get("x-actor-id");

if (!isProduction && testActorHeader) {
  resolvedUserId = testActorHeader.trim();
} else {
  // Production strictly forces authentic Bearer Token verification
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    ...
```

### Verification Evidence
1. **Header Rejection in Production**:
   - When `NODE_ENV === "production"`, requests passing `x-actor-id` are immediately rejected with `AuthenticationError("Authentication token or session is missing.")`.
   - Verified by test: `tests/integration/supabase-infrastructure.test.ts:107` (*strictly rejects x-actor-id header in production mode*).
2. **Raw Token Rejection in Production**:
   - In production mode without an active Supabase client configuration, passing raw UUID tokens is rejected with `AuthenticationError("Live authentication provider is not configured in production environment.")`.
   - Verified by test: `tests/integration/supabase-infrastructure.test.ts:121` (*strictly rejects raw UUID bearer tokens in production mode when Supabase client is unconfigured*).
3. **Deactivated Account Enforcement**:
   - When an enrolled user has `is_active = FALSE`, authentication throws `AuthenticationError("User account is deactivated.")`.
   - Verified by test: `tests/integration/supabase-infrastructure.test.ts:135`.
4. **Unknown Identity Enforcement**:
   - When an authenticated identity does not map to any record in `public.users`, authentication throws `AuthenticationError("Authenticated identity does not map to any active user record in institution directory.")`.
   - Verified by test: `tests/integration/supabase-infrastructure.test.ts:153`.

---

## 3. RBAC Identity Mapping Matrix

| Role Identifier | Institutional Description | Application Scope | RLS Policy Mapping |
| :--- | :--- | :--- | :--- |
| `ROLE_STUDENT` | Enrolled Student Complainant | Submit complaints, view own tickets, verify/dispute resolutions | `complainant_id = auth.uid()` |
| `ROLE_HANDLER` | Department Resolution Officer | Assigned tickets within own department, mark progress, resolve | `department_id = auth_user_department_id() AND assigned_handler_id = auth.uid()` |
| `ROLE_DEPT_HEAD`| Head of Department | Department queue triage, officer assignment, ticket forwarding | `department_id = auth_user_department_id()` |
| `ROLE_MANAGEMENT`| Campus Dean / Grievance Cell | Escalated tickets across departments, institutional analytics | `auth_has_role('ROLE_MANAGEMENT')` |
| `ROLE_ADMIN` | System Administrator | System-wide administrative operations, role assignment | `auth_has_role('ROLE_ADMIN')` |
