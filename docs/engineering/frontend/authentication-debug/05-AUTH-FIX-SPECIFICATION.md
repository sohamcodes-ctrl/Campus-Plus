# 05 — Authentication Defect Fix Specification

**Product:** Campus Plus  
**Subsystem:** Applied Architectural & Presentation Fixes  
**Date:** 2026-09-13  
**Classification:** IMPLEMENTATION SPECIFICATION  

---

## 1. Applied Changes Overview

To resolve the blocking defect without manufacturing fake accounts or violating backend boundaries, the following production changes were implemented:

### 1.1 Truthful Case-B Post-Registration Interface (`RoleRegistrationForm.tsx`)
- **Eliminated Misleading CTA:** Removed `<Link href="/login">Sign In with Verified Credentials →</Link>`.
- **Truthful Status Headers:**
  - Badge: `"Institutional Verification Required"`
  - Header: `"Account Request Submitted"`
  - Subtitle: Clear explanation referencing the specific tracking protocol (e.g., `IAM-REG-PENDING`, `IAM-STAFF-PENDING`).
- **Policy Notice:** Explains that Campus Plus enforces server-authoritative institutional provisioning and that credentials cannot be used until verified in the campus directory.
- **Safe Navigation:**
  - Primary button: `"← Return to Campus Plus Home"` (`/`)
  - Secondary button: `"Submit Another Intake Request"` (resets form)
  - Clear, distinct helper link: *"Already have an active, pre-provisioned institutional account? Sign In →"*

### 1.2 Granular Auth Error Classification (`SignInForm.tsx`)
- Replaced the single catch-all mapping with a safe classification function:
  ```typescript
  export type AuthErrorCode =
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_CONFIRMED"
    | "ACCOUNT_INACTIVE"
    | "IDENTITY_NOT_PROVISIONED"
    | "NETWORK_FAILURE"
    | "SERVER_FAILURE"
    | "UNKNOWN_AUTH_FAILURE";
  ```
- **Error Mapping Rules:**
  - `invalid login credentials` / `wrong password` / `user not found` → `"The email or password is incorrect."`
  - `email not confirmed` → `"Please verify your institutional email before signing in."`
  - `deactivated` / `inactive` → `"This account is currently inactive. Please contact your institution."`
  - `does not map to any active user record` / `not provisioned` → `"Your account exists, but institutional access has not yet been provisioned."`
  - `network` / `failed to fetch` / `timeout` → `"We couldn't reach Campus Plus. Please check your connection and try again."`
  - `internal server error` / `500` → `"Campus Plus could not complete authentication right now. Please try again."`
  - Unknown fallback → `"Unable to verify campus credentials. Please check your details and try again."`

### 1.3 Unprovisioned Account Handling in `AuthContext.tsx`
- Refined `resolveActor()`: when an authenticated Supabase user calls `/api/v1/auth/me` and the server returns HTTP 401 with `"does not map to any active user record"`:
  - Transition state to `FORBIDDEN`.
  - Set error message: `"Your account exists, but institutional access has not yet been provisioned."`.
  - Prevent unnecessary redirection loops.
