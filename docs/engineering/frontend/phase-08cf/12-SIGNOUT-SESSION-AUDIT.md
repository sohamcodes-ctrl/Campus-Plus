# Phase 08-C-F: Sign-Out & Session Destruction Audit

## 1. Scope & Objective
Audit session termination, token destruction, theme reset, and backward navigation protection.

## 2. Verified Implementation
- **TopBar & MobileNav Handlers**:
  ```typescript
  onClick={async () => {
    setIsUserMenuOpen(false);
    await signOut();
    if (typeof window !== "undefined") {
      window.location.replace("/");
    }
  }}
  ```
- **AuthContext Protocol**:
  1. `client.auth.signOut()` destroys active Supabase session tokens in browser storage.
  2. In-memory actor and role state set to null.
  3. `applyRoleTheme(UserRole.ROLE_STUDENT)` resets document CSS custom variables to neutral default.
  4. `window.location.replace("/")` forces a hard browser load of the Public Landing Page, overwriting history.

## 3. Back-Button Safety
After sign-out, pressing the browser's Back button does not reveal cached authenticated data; `ProtectedRoute` immediately intercepts unauthenticated state and redirects to `/login`.

## 4. Acceptance Status
- **Sign-Out Flow**: PASS.
- **Back-Button Safety**: PASS.
