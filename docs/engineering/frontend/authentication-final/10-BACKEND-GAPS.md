# 10 — Backend Gaps & Formal Change Request BCR-AUTH-001
**Campus Plus Final Five-Role Authentication Experience**
**Status:** SUBMITTED  
**Date:** 2026-09-13  
**Classification:** BACKEND CHANGE REQUEST (BCR)

---

## 1. Formal Backend Change Request: BCR-AUTH-001

### 1.1 Problem Statement
The Campus Plus frontend now exposes an enterprise-grade five-persona authentication and onboarding interface. However, the current backend infrastructure lacks public self-service registration endpoints (`POST /api/v1/auth/register`) and an automated workflow for institutional provisioning of privileged roles.

### 1.2 Current Backend Capabilities
- PostgreSQL `users`, `user_roles`, and `department_memberships` tables exist with complete constraint definitions.
- `AuthenticationAdapter` verifies existing provisioned records via Supabase Auth + database lookup.
- No public user creation route exists; user provisioning is performed manually or via database migration seeds.

### 1.3 Required Future Capabilities
1. **Endpoint: `POST /api/v1/auth/register/student`**
   - Public self-service registration for students.
   - Validates student institutional email domain (`@college.edu`).
   - Creates Supabase Auth user + inserts into `users` (`full_name`, `email`, `roll_or_prn`) and binds `ROLE_STUDENT` in `user_roles`.
2. **Endpoint: `POST /api/v1/auth/requests/privileged`**
   - Submits onboarding/appointment verification requests for Faculty, HOD, Director, and Management.
   - Places request into an administrative audit queue for Registrar / Dean approval before inserting into `user_roles`.
3. **Database Schema Enhancements (Optional):**
   - Table `registration_requests`: `id`, `email`, `full_name`, `identifier`, `requested_role`, `department_id`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `reviewed_by`.

### 1.4 Security & Audit Requirements
- Rate-limiting (max 5 registration attempts per IP/hour).
- Non-repudiable audit logging for all registration and role approvals.
- Complainant roles (`ROLE_STUDENT`, `ROLE_FACULTY`) strictly partitioned from operational roles (`ROLE_HANDLER`, `ROLE_DEPT_HEAD`).
