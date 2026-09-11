# ADR-002: Authentication Strategy & Identity Management

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Security Engineer, Lead Software Architect  
**Traceability**: Resolves `OD-004`, satisfies `SEC-001`, `SEC-003`, `BR-001`, `PRIV-001`  

---

## 1. Context & Problem Statement

Phase 00 and Phase 01 identified that the target institution's exact Single Sign-On (SSO) infrastructure is unknown and not currently accessible in the workspace environment (`OD-004`). However, `BR-001` mandates verified complainant identity, `SEC-001` requires authenticated access for all non-public routes, and `SEC-003` requires secure session token handling.

We must define an authentication architecture that guarantees identity verification today without hard-locking external identity providers that would block development and local testing.

---

## 2. Considered Options

1. **Option 1: Hard-Coded Institutional SAML / Shibboleth / Azure AD SSO**:
   - Requires active institutional enterprise directory federation credentials during development.
   - High risk of stalling development when offline or outside campus intranet.
2. **Option 2: Open Self-Registration (Any Email/Password)**:
   - Vulnerable to non-campus spam, fake complainants, and malicious flooding. Violates institutional accountability.
3. **Option 3: Domain-Restricted Institutional Email Authentication with Pluggable SSO Adapter**:
   - Accounts restricted to verified institutional domain patterns (e.g., `@rcpit.ac.in` or configurable domains).
   - Core system uses token-based identity (JWT / Secure HTTP-Only Session Cookies).
   - Pluggable external identity provider (OAuth2 / OIDC / SAML) adapter interface in the application gateway.

---

## 3. Decision

We **adopt Option 3: Domain-Restricted Authentication with Pluggable SSO Abstraction**.

### Technical Blueprint:
1. **Domain Whitelisting**: The registration/login boundary verifies that the user's email matches institutional patterns defined in configuration (`INSTITUTION_EMAIL_DOMAINS`).
2. **Role Mapping**:
   - Students register and verify their email via secure token link / OTP. Default role is strictly `ROLE_STUDENT`.
   - Staff, Handlers, Department Heads, and Administrators cannot self-assign elevated roles; elevated roles are provisioned by an Administrator (`ROLE_ADMIN`).
3. **Session & Token Management**:
   - Cryptographically signed sessions/tokens using standard algorithms (HMAC-SHA256 / EdDSA).
   - 24-hour inactivity timeout; immediate revocation on logout.
   - Secure transmission: Enforced `HttpOnly`, `SameSite=Lax`, and `Secure` cookie attributes.
4. **SSO Ready Adapter**:
   - The auth service exposes a generic `IdentityProvider` interface:
     ```typescript
     interface IdentityProvider {
       authenticate(credentials: AuthCredentials): Promise<AuthSession>;
       validateSession(token: string): Promise<UserIdentity>;
     }
     ```
   - Standard domain credentials adapter for development/MVP; OIDC/SAML adapter can be swapped via configuration post-MVP.

---

## 4. Consequences

### Positive
- Zero external blocker: can be developed, tested, and verified locally and in staging environments immediately.
- Strict security: institutional domain restriction prevents unauthorized public access.
- Future-proof: institutional Google Workspace or Microsoft Entra SSO can be plugged in without modifying domain models.

### Negative / Tradeoffs
- Requires email sending capability (or admin manual activation fallback) for email verification.

---

## 5. Phase Isolation
No authentication libraries, Supabase connections, or credential stores are implemented in Phase 02.
