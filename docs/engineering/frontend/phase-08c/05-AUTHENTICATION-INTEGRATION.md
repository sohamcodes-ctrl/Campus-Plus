# Phase 08-C: Authentication & Session Integration Specification

**Document Identifier:** `05-AUTHENTICATION-INTEGRATION.md`  
**Classification:** Authentication & Identity Architecture  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Stage:** 08-C-B (Architecture Foundation, Tokens & API Client)  

---

## 1. Authentication Lifecycle & Server Trust Boundary

The frontend authentication subsystem is implemented in `src/presentation/context/AuthContext.tsx` and adheres to strict server trust:

1. **Session Establishment:** The user signs in via Supabase Auth (`signInWithPassword`). The client receives a JWT access token.
2. **Token Provider Binding:** `AuthContext` injects a dynamic `TokenProvider` callback into `apiClient`, ensuring every outbound HTTP request contains `Authorization: Bearer <token>`.
3. **Actor Identity Resolution:** Immediately upon session discovery or auth change, the client invokes `GET /api/v1/auth/me`.
4. **Authoritative Role Context:** The backend database verifies the token, queries the `users`, `user_roles`, and `department_memberships` tables, and returns `{ userId, role, departmentId }`.
5. **Role Theme Injection:** `applyRoleTheme(role)` dynamically applies the corresponding institutional theme tokens (`--role-primary`, `--role-btn-text`, etc.) to `:root`.
6. **Zero Client Privilege:** The frontend does NOT allow users to switch roles or claim permissions via localStorage or client cookies.
