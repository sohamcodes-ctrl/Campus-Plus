# 04 — Root Cause Analysis of Authentication Defect

**Product:** Campus Plus  
**Subsystem:** Defect Investigation & Failure Mode Matrix  
**Date:** 2026-09-13  
**Classification:** ROOT CAUSE ANALYSIS (RCA)  

---

## 1. Defect Investigation Matrix

| Step | Expected | Actual | Evidence | Defect |
| :--- | :--- | :--- | :--- | :--- |
| **1. Intake Submission** | User fills registration form and submits details. | Form sets local state to `PENDING_VERIFICATION` via `setTimeout`. | `RoleRegistrationForm.tsx:116-119` | No backend API exists; simulation occurred without server persistence. |
| **2. Post-Submission UI** | User is shown an intake confirmation informing them of verification timeline. | Form rendered a prominent button: `"Sign In with Verified Credentials →"` linking to `/login`. | `RoleRegistrationForm.tsx:212-221` (Original) | **Misleading Navigation:** Misrepresented unprovisioned credentials as ready for immediate login. |
| **3. Sign In Attempt** | If directed to login, credentials should either work or display a specific, honest explanation. | User typed newly chosen password; `signInWithPassword()` failed with `invalid_credentials`. | Live Supabase test in `scratch/test_login_errors.js` | User identity does not exist in `auth.users` or `public.users`. |
| **4. Error Presentation** | Form should explain why authentication failed (unregistered user / verification required). | Form displayed generic catch-all: `"Unable to sign in. Please check your credentials and try again."` | `SignInForm.tsx:14-25` (Original) | **Opaque Error Masking:** Collapsed unconfirmed emails, missing users, and network errors into one generic string. |

---

## 2. Forensic Answers to Specific Diagnostic Inquiries (A – Q)

- **A. Is `signUp()` actually being called?**  
  **NO.** `RoleRegistrationForm.tsx` used a simulated `setTimeout` without invoking `supabase.auth.signUp()` or any HTTP endpoint.
- **B. Does `signUp()` return a user?**  
  If called directly in staging with a valid domain (`@college.edu`), Supabase Auth creates an identity in `auth.users` (`hasUser: true`).
- **C. Does `signUp()` return a session?**  
  **NO.** Staging Supabase Auth has email confirmation enabled; `signUp()` returns `session: null` and `confirmation_sent_at`.
- **D. Is email confirmation enabled?**  
  **YES.** Verified via live probe: Supabase returns unconfirmed status on new registrations.
- **E. If confirmation is enabled, is redirecting to `/login` intentional?**  
  It was an erroneous UI design decision that gave users false expectations of immediate account access.
- **F. Is the created user present in Supabase Auth?**  
  Only if manually or administratively provisioned. Form submission did not create an `auth.users` record.
- **G. Does the user exist in `public.users`?**  
  **NO.** There are zero database triggers syncing `auth.users` to `public.users`.
- **H. Does the user have `user_roles`?**  
  **NO.** Only pre-seeded demonstration accounts possess roles in `public.user_roles`.
- **I. Does `/api/v1/auth/me` recognize the user?**  
  **NO.** `AuthenticationAdapter` throws `AuthenticationError` because the UUID is absent in `public.users`.
- **J. Is AuthContext seeing the new session?**  
  **NO.** No session exists for unconfirmed/uncreated accounts.
- **K. Is there a race condition between `signUp()` and `auth/me`?**  
  Deeper than a race condition: an architectural barrier exists because `public.users` is never inserted by `signUp()`.
- **L. Is the login form using the correct email/password?**  
  The user typed the credentials they filled on `/register`, but those credentials were never stored in Supabase Auth.
- **M. Is the browser Supabase client configured properly?**  
  **YES.** Configured with valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **N. Is the login error being incorrectly normalized into a generic message?**  
  **YES.** `mapAuthErrorMessage` previously collapsed `invalid credentials`, `email not confirmed`, `user not found`, and `deactivated` into `"Unable to sign in. Please check your credentials and try again."`.
- **O. Is the account created but unverified?**  
  In the current implementation, no account was created in Supabase Auth or database upon form submission.
- **P. Is the account created but missing required authorization/provisioning?**  
  Yes; in Campus Plus, any newly created Supabase user would lack `public.users` and `user_roles` records without backend provisioning.
- **Q. Is `/login` being reached because registration intentionally does not create an authenticated session?**  
  The registration screen erroneously provided a primary button navigating to `/login`, creating the defect cycle.

---

## 3. Exact Root Cause Summary

1. **Root Cause 1 (Misleading Navigation):** The registration confirmation view displayed a prominent primary CTA `"Sign In with Verified Credentials →"` linking to `/login`, falsely signaling that newly entered credentials were ready for sign-in.
2. **Root Cause 2 (Opaque Error Normalization):** `mapAuthErrorMessage` collapsed all login errors into a single generic message, obscuring why authentication failed.
3. **Root Cause 3 (Backend Gap BCR-AUTH-001):** The backend does not yet possess self-service registration endpoints or database triggers syncing `auth.users` to `public.users`.
