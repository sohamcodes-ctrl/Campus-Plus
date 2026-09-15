# 02 — Authentication & Registration State Machines

**Product:** Campus Plus  
**Subsystem:** State Machine Specifications (AuthContext & RegistrationFlow)  
**Date:** 2026-09-13  
**Classification:** ARCHITECTURAL SPECIFICATION  

---

## 1. Authentication Context State Machine (`AuthContext.tsx`)

The client session state machine manages global authentication and actor resolution:

```mermaid
stateDiagram-v2
    [*] --> UNKNOWN
    UNKNOWN --> INITIALIZING: Client Boot / Mount
    INITIALIZING --> UNAUTHENTICATED: No Session Found
    INITIALIZING --> AUTHENTICATED_PENDING_ACTOR: Session Found
    
    UNAUTHENTICATED --> AUTHENTICATING: signIn(email, password)
    AUTHENTICATING --> AUTHENTICATED_PENDING_ACTOR: Supabase Auth Success
    AUTHENTICATING --> UNAUTHENTICATED: Invalid Credentials / Error
    
    AUTHENTICATED_PENDING_ACTOR --> AUTHENTICATED: GET /api/v1/auth/me Success
    AUTHENTICATED_PENDING_ACTOR --> FORBIDDEN: HTTP 403 OR Unprovisioned Identity (HTTP 401 unmapped)
    AUTHENTICATED_PENDING_ACTOR --> UNAUTHENTICATED: Session Expired
    AUTHENTICATED_PENDING_ACTOR --> ERROR: Network / Server Failure
    
    AUTHENTICATED --> SIGNING_OUT: signOut()
    SIGNING_OUT --> UNAUTHENTICATED: Session Cleared -> Redirect to /
    FORBIDDEN --> SIGNING_OUT: signOut()
    ERROR --> AUTHENTICATED_PENDING_ACTOR: retry / refreshActor()
```

### 1.1 AuthContext State Definitions

| State | Purpose | Transition Triggers | Security Guarantee |
| :--- | :--- | :--- | :--- |
| **`UNKNOWN`** | Initial SSR / pre-hydration state | Client hydration | Prevents flash of unauthenticated UI |
| **`INITIALIZING`** | Checking local storage / Supabase session | `getSession()` resolved | Renders shell loading indicator |
| **`AUTHENTICATING`** | Active sign-in request in progress | `signInWithPassword()` invoked | Disables submit button, shows spinner |
| **`AUTHENTICATED_PENDING_ACTOR`** | Supabase JWT acquired; resolving actor | `getAuthMe()` in-flight | User identity unconfirmed until server responds |
| **`AUTHENTICATED`** | Authoritative technical role confirmed | Valid actor DTO received | Renders role-specific workspace |
| **`UNAUTHENTICATED`** | No active session | User signed out or login failed | Protected routes redirect to `/login` |
| **`FORBIDDEN`** | Authenticated in Supabase but unprovisioned in `public.users` | Server returns 403 or unmapped 401 | Prevents access, renders 403 notice |
| **`ERROR`** | Network or server connectivity issue | 500 error / fetch failure | Displays retry control |
| **`SIGNING_OUT`** | Active sign-out in progress | `signOut()` invoked | Clears cookies/tokens, redirects to `/` |

---

## 2. Registration Flow State Machine (`RoleRegistrationForm.tsx`)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    IDLE --> VALIDATING: Form Submit
    VALIDATING --> VALIDATION_ERROR: Missing / Invalid Fields
    VALIDATION_ERROR --> IDLE: User Edits Input
    
    VALIDATING --> SUBMITTING: Validation Passed
    SUBMITTING --> PENDING_VERIFICATION: Case B Intake Recorded (Student)
    SUBMITTING --> INSTITUTIONAL_VERIFICATION_REQUIRED: Case B Intake Recorded (Staff/Privileged)
    
    PENDING_VERIFICATION --> IDLE: "Submit Another Request"
    INSTITUTIONAL_VERIFICATION_REQUIRED --> IDLE: "Submit Another Request"
```

### 2.1 State Truthfulness Guarantees
- In **Case B**, `SUBMITTING` transitions directly to `PENDING_VERIFICATION` or `INSTITUTIONAL_VERIFICATION_REQUIRED`.
- Under no circumstances does the state machine transition to `AUTHENTICATED`, `REGISTRATION_SUCCESS`, or `ACCOUNT_CREATED` without a verified server provisioning response.
- The UI strictly remains on the institutional confirmation screen with a clean link to home (`/`) and a secondary link for pre-provisioned accounts to `/login`.
