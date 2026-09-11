# Campus Plus — Phase 08-C-D: Routing Architecture & Access Matrix

**Authority:** Principal Frontend Architect, QA Automation Lead  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Application Routing Matrix

| Route Path | Type | Access Requirement | Allowed Roles | Data Authorization Source | Fallback / Error Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/`** | Public / Landing | None | Public | Static page | N/A |
| **`/login`** | Authentication | Anonymous | Public | Supabase Auth | Redirects to `/dashboard` if already authenticated |
| **`/dashboard`** | Protected | Valid session + Actor | All 6 Roles | `GET /api/v1/complaints` (role-scoped by backend RLS) | Redirects to `/login?redirect=/dashboard` if unauthenticated |
| **`/complaints/new`** | Protected | Valid session + Actor | `ROLE_STUDENT`, `ROLE_FACULTY` | Backend schema validation | 403 `ForbiddenState` for non-complainant roles |
| **`/complaints/[id]`** | Protected | Valid session + Actor | Role-scoped per record | `GET /api/v1/complaints/[id]` (authoritative backend check) | 400 on malformed ID, 403 if unauthorized, 404 if not found |
| **`/_not-found`** | Error | None | Public | Static | Renders accessible 404 view |
