# 10 — Browser Visual Verification & Transition Evidence

**Product:** Campus Plus  
**Subsystem:** Headless Browser CDP Visual Verification  
**Date:** 2026-09-13  
**Classification:** VISUAL EVIDENCE REPORT  

---

## 1. Before vs. After Behavior Comparison

| Flow Phase | Defective Behavior (Before Fix) | Corrected Behavior (After Fix) |
| :--- | :--- | :--- |
| **Registration Post-Submit** | Displayed button `"Sign In with Verified Credentials →"` linking to `/login`. | Displays `"Account Request Submitted"` & `"Institutional Verification Required"`. Primary CTA returns to Home (`/`). No misleading login redirect. |
| **Invalid Login Error** | Showed generic: `"Unable to sign in. Please check your credentials and try again."` | Displays specific: `"The email or password is incorrect."` |
| **Staging Account Sign-In** | Blocked if passwords were unknown or misaligned. | Signs in cleanly, resolves `ROLE_STUDENT` via `GET /api/v1/auth/me`, redirects to `/dashboard`. |
| **Sign-Out** | N/A | Opens user menu, executes `signOut()`, cleans session, redirects immediately to `/`. |

---

## 2. Captured Screenshot Evidence

Preserved under `scratch/screenshots/auth-debug/`:

1. **`debug-01-account-request-submitted.png`:**
   - Shows completed intake submission for student *Aarav Sharma*.
   - Prominently displays: `"Institutional Verification Required"` badge and `"Account Request Submitted"` header.
   - Contains protocol code `IAM-REG-PENDING`.
   - Offers `"← Return to Campus Plus Home"` and `"Submit Another Intake Request"`.
   - Clear secondary link for users who already possess pre-provisioned credentials.

2. **`debug-02-invalid-credentials-error.png`:**
   - Shows login failure on `/login` when entering unregistered credentials.
   - Banner displays: `"Authentication Notice: The email or password is incorrect."`.

3. **`debug-test3-login-result.png`:**
   - Full live rendering of the Student Dashboard at `http://localhost:3000/dashboard`.
   - Shows authenticated user `student a`, total complaints counter, recent complaints table, and quick action buttons.

4. **`debug-04-signout-landing.png`:**
   - Shows clean redirection to `http://localhost:3000/` following sign-out.
   - Zero stale session state; displays full public landing experience.
