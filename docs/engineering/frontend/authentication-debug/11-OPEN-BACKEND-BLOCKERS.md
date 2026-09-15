# 11 — Open Backend Blockers & BCR-AUTH-001 Status

**Product:** Campus Plus  
**Subsystem:** Backend Gaps & Infrastructure Requirements  
**Date:** 2026-09-13  
**Classification:** BACKEND CHANGE REQUEST AUDIT  
**Status of BCR-AUTH-001:** **OPEN**  

---

## 1. Open Backend Dependencies

While the frontend authentication gateway and onboarding presentation have been reconciled to strictly adhere to Case B, full end-to-end self-service account registration requires backend infrastructure enhancements:

### Blocker 1: Public Self-Service Registration Endpoint (`POST /api/v1/auth/register/student`)
- **Required Capability:** Allow students with verified institutional email domains (`@college.edu`) to register autonomously.
- **Backend Responsibility:**
  1. Validate email institutional domain and format.
  2. Create Supabase Auth identity in `auth.users`.
  3. In an atomic transaction, insert corresponding record into `public.users` (`full_name`, `email`, `roll_or_prn`).
  4. Assign `ROLE_STUDENT` in `public.user_roles`.
  5. Optionally bind active department in `public.department_memberships`.

### Blocker 2: Privileged Intake & Approval Workflow (`POST /api/v1/auth/requests/privileged`)
- **Required Capability:** Staff, Faculty, HOD, Director, and Management intake forms cannot self-provision.
- **Backend Responsibility:**
  1. Create a persistent queue (`registration_requests` table).
  2. Store pending appointment details, reference documents, and requested roles.
  3. Provide administrative review endpoints for the Academic Registrar and Dean of Academic Affairs to approve or reject requests.
  4. Upon approval, provision `public.users`, `public.user_roles`, and `public.department_memberships`.

### Blocker 3: Database Synchronization Triggers (Alternative Architecture)
- If Supabase client-side `auth.signUp()` were to be utilized in future phases, a PostgreSQL trigger on `auth.users` would be required to automatically insert a baseline row into `public.users` with default `ROLE_STUDENT`.

---

## 2. Inviolable Security Boundaries

The frontend will NEVER:
1. Call Supabase Admin APIs using service role keys from client-side code.
2. Manufacture fake sessions or mock tokens in production.
3. Automatically assign elevated roles (`ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_ADMIN`, `ROLE_MANAGEMENT`) based on client radio card selection.
4. Auto-insert records into `public.users` without backend transactional authorization.
