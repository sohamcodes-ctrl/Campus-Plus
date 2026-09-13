# 01 — Authentication Architecture Forensic Reconnaissance
**Campus Plus Final Five-Role Authentication Experience**
**Status:** COMPLETE & VERIFIED  
**Date:** 2026-09-13  
**Classification:** ARCHITECTURE FORENSIC AUDIT

---

## 1. Executive Summary
A comprehensive forensic investigation was conducted across the Campus Plus codebase to establish the exact, immutable truth regarding authentication, role-based access control (RBAC), database schemas, and registration capabilities.

---

## 2. Infrastructure & Data Layer Truth

### 2.1 Database Schema (`migrations/00003_identity_and_access_tables.sql`)
1. **`users` Table:**
   - `id` (UUID, Primary Key)
   - `email` (VARCHAR(255), UNIQUE, NOT NULL)
   - `full_name` (VARCHAR(255), NOT NULL)
   - `phone_number` (VARCHAR(32), NULL)
   - `roll_or_prn` (VARCHAR(64), NULL) — Institutional Roll / PRN / Employee ID
   - `is_active` (BOOLEAN, NOT NULL DEFAULT TRUE)
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   *Note: Academic Year, Semester, Appointment Reference, and Board Division do NOT exist in the schema.*

2. **`roles` Table:**
   - Standard roles: `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`.

3. **`user_roles` Table:**
   - `user_id` (UUID, FK -> `users.id`)
   - `role_id` (TEXT, FK -> `roles.name`)

4. **`department_memberships` Table:**
   - `user_id` (UUID, FK -> `users.id`)
   - `department_id` (UUID, FK -> `departments.id`)
   - `is_head` (BOOLEAN, NOT NULL DEFAULT FALSE)
   - `is_active` (BOOLEAN, NOT NULL DEFAULT TRUE)

### 2.2 Server-Side Authentication Adapter (`src/infrastructure/auth/AuthenticationAdapter.ts`)
- Queries PostgreSQL `users`, `user_roles`, and `department_memberships`.
- If user record is missing or `is_active = FALSE`, throws `AuthenticationError("User account is inactive or not provisioned")`.
- Authoritative endpoint: `GET /api/v1/auth/me`.

---

## 3. Registration Capability Matrix
- **Public Self-Service Registration API:** None currently exists in `src/app/api/`.
- **Identity Creation Model:** Pre-provisioning / Institutional validation via Registrar and IT Directorate.
- **Frontend Intake Strategy:**
  - Student: Intake under institutional verification protocol (`IAM-REG-PENDING`).
  - Staff / Privileged Roles: Intake under verification protocols (`IAM-STAFF-PENDING`, `IAM-HOD-PENDING`, `IAM-DIR-PENDING`, `IAM-MGT-PENDING`) with explicit notice that accounts are pre-provisioned.
