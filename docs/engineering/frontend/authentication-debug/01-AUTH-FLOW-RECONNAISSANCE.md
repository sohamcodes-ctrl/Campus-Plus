# 01 — Authentication Flow Reconnaissance & Forensic Audit

**Product:** Campus Plus  
**Subsystem:** Authentication & Account Creation Gateway  
**Date:** 2026-09-13  
**Classification:** FORENSIC AUDIT REPORT  

---

## 1. Executive Summary

A forensic audit of the end-to-end authentication and registration experience was conducted across the codebase, PostgreSQL database schema, Supabase Auth service configuration, and client presentation components.

The reported blocking defect was:
- **Expected:** Landing Page → Create New Account → Select Role → Complete Registration → Account Created → Authenticated Session → Role Dashboard.
- **Actual:** Landing Page → Create New Account → Registration Form → Misleading redirect to `/login` → User attempts sign-in with newly submitted credentials → Generic authentication failure: `"Unable to sign in. Please check your credentials and try again."`.

---

## 2. Component Inventory & Audit Findings

### 2.1 Registration Gateway (`src/app/register/page.tsx` & `RoleRegistrationForm.tsx`)
- The registration page renders a 5-role option chooser and role-specific intake forms.
- Form submissions were previously intercepted by a local state simulation (`setTimeout`), setting state to `PENDING_VERIFICATION` or `INSTITUTIONAL_VERIFICATION_REQUIRED`.
- **Defect Identified:** The post-submission card rendered a prominent primary CTA: `"Sign In with Verified Credentials →"` pointing to `/login`. This misled users into believing an active account had been created and was immediately usable.

### 2.2 Login Gateway (`src/app/login/page.tsx` & `SignInForm.tsx`)
- The login form correctly accepts email and password and delegates authentication to `useAuth().signIn(email, password)`.
- When Supabase Auth rejected credentials, `mapAuthErrorMessage` caught the error and mapped multiple distinct failure categories (`invalid login credentials`, `email not confirmed`, `user not found`, `user deactivated`, `unmapped identity`) into a single opaque string:
  `"Unable to sign in. Please check your credentials and try again."`

### 2.3 Supabase Auth & Session Layer (`AuthContext.tsx`)
- `AuthContext` initializes the browser Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `signIn` calls `client.auth.signInWithPassword({ email, password })`.
- Upon success, it updates `user` state and invokes `resolveActor()` to fetch `/api/v1/auth/me`.

### 2.4 Server Authority & Identity Resolution (`AuthenticationAdapter.ts` & `/api/v1/auth/me`)
- The `/api/v1/auth/me` endpoint extracts the Bearer JWT from headers and verifies it via `AuthenticationAdapter`.
- `AuthenticationAdapter` verifies the Supabase Auth user ID against PostgreSQL `public.users`:
  ```sql
  SELECT u.id, u.email, u.full_name, u.is_active, ur.role_id, dm.department_id
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN department_memberships dm ON u.id = dm.user_id AND dm.is_active = TRUE
  WHERE u.id = $1 LIMIT 1;
  ```
- If the user exists in `auth.users` but has no matching record in `public.users`, `AuthenticationAdapter` throws:
  `AuthenticationError("Authenticated identity does not map to any active user record in institution directory.")`
  returning HTTP 401 with code `AUTHENTICATION_ERROR`.

### 2.5 Database Schema & Triggers (`migrations/00003_identity_and_access_tables.sql`)
- Database inspection confirmed that `public.users` contains only 7 seeded accounts.
- **Critical Architectural Truth:** There are **zero triggers** on `auth.users` syncing to `public.users` or `user_roles`.
- There is **no public registration endpoint** (`POST /api/v1/auth/register`) in `src/app/api/v1/auth/`.
- Therefore, self-service account registration does not currently exist on the backend (`BCR-AUTH-001` is strictly OPEN).
