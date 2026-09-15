# 07 — Technical Role to Dashboard Routing Matrix

**Product:** Campus Plus  
**Subsystem:** Server-Authoritative Dashboard Dispatcher  
**Date:** 2026-09-13  
**Classification:** ROUTING & AUTHORIZATION SPECIFICATION  

---

## 1. Technical Role to Dashboard Mapping

In `src/app/dashboard/page.tsx`, the `DashboardDispatcher` evaluates the technical role returned by `GET /api/v1/auth/me`:

| Technical Role (`users.role_id`) | Rendered Dashboard Component | View Characteristics | Verification Status |
| :--- | :--- | :--- | :--- |
| **`ROLE_STUDENT`** | `<StudentDashboard />` | Complainant worklist, quick submit action, verification prompts. | **PASS** — Verified via live staging login. |
| **`ROLE_FACULTY`** | `<StudentDashboard />` | Identical complainant interface for faculty filing complaints. | **PASS** — Verified per `AuthorizationPolicy.ts`. |
| **`ROLE_HANDLER`** | `<HandlerDashboard />` | Assigned worklist, progress triggers, SLA indicators. | **PASS** — Requires active `department_memberships`. |
| **`ROLE_DEPT_HEAD`** | `<HodDashboard />` | Department oversight, triage queue, handler assignment. | **PASS** — Department head scoped. |
| **`ROLE_ADMIN`** | `<AdminDashboard />` | System health, governance, institutional audit. | **PASS** — Senior Authority / Director purview. |
| **`ROLE_MANAGEMENT`** | `<ManagementDashboard />` | Cross-department KPIs, turnaround trends, recurring clusters. | **PASS** — Board & Executive purview. |

---

## 2. Invariants & Security Boundaries

1. **Server Authority Invariant:** Client state, local storage, or selected registration cards can NEVER alter the role received from `/api/v1/auth/me`.
2. **Faculty vs. Handler Partition:** `ROLE_FACULTY` users who file complaints receive the Complainant dashboard. Only users provisioned with `ROLE_HANDLER` and assigned department membership access the Handler dashboard.
3. **No Unauthenticated Leaks:** `ProtectedRoute` wraps the dispatcher, ensuring unauthenticated or unprovisioned requests are blocked before dashboard rendering.
