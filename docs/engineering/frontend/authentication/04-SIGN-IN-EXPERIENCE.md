# Campus Plus — Phase 08-C: Sign In Experience Specification

**Document Classification:** Functional & Technical Specification  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Target:** `/login` Interactive Sign-In Flow  
**Date:** 2026-09-13  
**Status:** COMPLETE & VERIFIED  

---

## 1. Overview & Behavioral Contract

The Sign In experience (`/login`) allows institutional users across all 5 personas to authenticate securely. It enforces:
- **Zero Hardcoded Credentials:** The form strictly initializes with empty state (`useState("")`), eliminating demo credentials, default usernames, or test passwords.
- **Controlled Persona Selection:** Selecting an account type dynamically adjusts the button color, active accent bar, and contextual welcoming messaging.
- **Anti-Enumeration Microcopy:** Authentication errors return uniform, institutional messages that never reveal whether a given email address exists in the system.
- **Accessible Inputs:** Every input includes unambiguous `id` and `htmlFor` association, `aria-describedby` helper texts, and proper `autoComplete` attributes.

---

## 2. Component Structure

- **Container:** `SignInForm` (`src/presentation/components/auth/SignInForm.tsx`)
- **Key Form Controls:**
  1. `RoleSelector`: 5-card persona selector (`role="radiogroup"`, `aria-label="ACCOUNT TYPE"`).
  2. `campus-email`: Email input (`type="email"`, `autoComplete="email"`, `placeholder="username@institution.edu"`).
  3. `campus-password`: Password input (`type="password"`, `autoComplete="current-password"`, with show/hide password toggle).
  4. `Session Indicator`: `"Session secured via JWT"` indicator with shield SVG.
  5. `Submit Button`: Dynamically styled submit button with loading spinner when `isSubmitting` is true.
  6. `Helpdesk Footer`: Direct instructions to contact the IT department or grievance coordinator.

---

## 3. Error Microcopy & Anti-Enumeration Mapping

The function `mapAuthErrorMessage` in `SignInForm.tsx` maps raw errors into calm, security-hardened institutional microcopy:

| Input / Error Condition | Internal Error Message | Rendered User Microcopy | Rationale |
|---|---|---|---|
| Invalid password | `Invalid login credentials` | `Unable to sign in. Please check your credentials and try again.` | Prevents password brute-forcing |
| Non-existent user | `User not found` | `Unable to sign in. Please check your credentials and try again.` | Anti-account enumeration (SEC-002) |
| Unverified email | `Email not confirmed` | `Unable to sign in. Please check your credentials and try again.` | Anti-account enumeration |
| Network disconnect | `Failed to fetch` / `Network connection failed` | `Unable to connect to authentication services. Please verify your network connection or contact IT support.` | Clear connection recovery guidance |
| Unexpected exception | Arbitrary string / object | `Unable to verify campus credentials. Please check your details and try again.` | Safe fail-closed fallback |

---

## 4. Post-Authentication Redirection

Upon successful authentication:
1. The `redirect` search query parameter is extracted.
2. The URL is passed through `sanitizeRedirect` (`src/presentation/utils/security.ts`).
3. If valid, the user is redirected to the requested internal destination (e.g., `/complaints/c-uuid-1`).
4. If invalid or an external URL (e.g. `https://evil.com` or `//attacker.com`), the user is safely redirected to `/dashboard`.
