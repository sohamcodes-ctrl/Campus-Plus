# Campus Plus — Phase 08-C-D: Session Security & Multi-Tab Synchronization

**Authority:** IAM / Authentication Engineer, Application Security Engineer  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Session Lifecycle & Multi-Tab Synchronization

1. **Session Persistence:** Managed securely by Supabase Auth with `persistSession: true` and `autoRefreshToken: true`.
2. **Multi-Tab Logout Synchronization:**
   - Supabase client's `onAuthStateChange` listener listens to cross-tab auth events.
   - When Tab A executes `signOut()`, a `SIGNED_OUT` event is broadcast.
   - Tab B receives the `SIGNED_OUT` event, clears user and actor state, applies default Student theme, and transitions `authState` to `UNAUTHENTICATED`.
   - `ProtectedRoute` detects `UNAUTHENTICATED` state and immediately redirects to `/login`.
3. **Session Expiry Handling:**
   - If token refresh fails, `apiClient` returns 401 Unauthorized.
   - `AuthContext.resolveActor()` intercepts 401, sets `authState = "UNAUTHENTICATED"`, and prompts re-authentication.
