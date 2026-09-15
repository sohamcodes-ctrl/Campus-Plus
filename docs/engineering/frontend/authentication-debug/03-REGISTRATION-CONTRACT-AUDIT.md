# 03 — Registration Contract Audit & Technical Role Mapping

**Product:** Campus Plus  
**Subsystem:** Account Creation Backend Contract Audit  
**Date:** 2026-09-13  
**Classification:** BACKEND CONTRACT AUDIT  

---

## 1. Backend Registration Contract Reality

A comprehensive scan of the repository was executed to determine whether a public self-service registration contract exists:

| Investigation Vector | Target | Result | Evidence |
| :--- | :--- | :--- | :--- |
| **API Endpoints** | `src/app/api/v1/auth/register` | **DOES NOT EXIST** | Only `src/app/api/v1/auth/me/route.ts` is implemented. |
| **Direct Supabase signUp** | `client.auth.signUp()` | **NOT INTEGRATED** | The client application did not call `signUp()`; only `signInWithPassword()` is integrated in `AuthContext`. |
| **Database Sync Triggers** | `auth.users` → `public.users` | **ZERO TRIGGERS** | PostgreSQL `information_schema.triggers` confirmed 0 triggers on `auth.users` or `public.users`. |
| **Table Provisioning** | `public.users`, `user_roles` | **SEEDED ONLY** | Only 7 pre-seeded demonstration accounts exist in PostgreSQL from migration 00003. |
| **Live Supabase Auth** | `auth.users` records | **5 IDENTITIES** | Only 5 dedicated staging accounts provisioned via `scripts/provision-staging-accounts.js` exist in Supabase Auth. |

---

## 2. Public Personas vs. Technical Database Roles

The system strictly enforces the distinction between public product personas and technical authorization roles:

| Public Product Persona | Technical Database Role | Complainant Capabilities | Operational / Handling Capabilities | Provisioning Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `ROLE_STUDENT` | `SUBMIT`, `VIEW_OWN`, `VERIFY`, `DISPUTE`, `CANCEL_OWN` | None | Academic Registrar Office |
| **Faculty / Complaint Handler** | `ROLE_FACULTY` (Complainant) & `ROLE_HANDLER` (Operational) | Identical to Student when filing complaints | `VIEW_DEPT`, `START_PROGRESS`, `RESOLVE`, `FORWARD`, `ESCALATE` (Requires `department_memberships`) | Department Chair & Registrar |
| **HOD (Department Head)** | `ROLE_DEPT_HEAD` | Standard Complainant | `REVIEW`, `ASSIGN`, `FORWARD`, `ESCALATE`, `RESOLVE`, `CLOSE`, `REJECT`, `DUPLICATE` | Academic Dean & Directorate |
| **Director / Senior Authority** | `ROLE_ADMIN` | Standard Complainant | Cross-departmental institutional oversight & administrative audit | Directorate IT Security Office |
| **Institutional Management** | `ROLE_MANAGEMENT` | Standard Complainant | Executive governance, KPI analytics, Tier-3 deadlock resolution | College Board of Trustees Secretariat |

### Critical Architectural Constraint
**`selectedRoleFromClient` is NEVER an authorization source.**
- Selecting "Faculty / Complaint Handler" in the browser CANNOT grant `ROLE_HANDLER`.
- Technical authorization is derived exclusively from server-side database records verified by `AuthenticationAdapter`.

---

## 3. Status of BCR-AUTH-001

- **Requirement:** Self-service registration endpoint (`POST /api/v1/auth/register/student`) and institutional provisioning workflow (`POST /api/v1/auth/requests/privileged`).
- **Status:** **OPEN** (Future Backend Roadmap).
- **Frontend Stance:** The frontend strictly reflects reality (Case B): it records user intake requests under tracking protocols without manufacturing fake accounts or sessions.
