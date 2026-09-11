# Phase 08-B: API Gap & Frontend Dependency Map

**Document Identifier:** `25-api-gap-and-frontend-dependency-map.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Forensic audit of backend API coverage versus UI screen requirements, documenting interim workarounds for Phase 08-C.

---

## 1. The 12 Cataloged API Gaps & Frontend Handling

| Gap ID | Missing Endpoint Operation | Impacted Screen(s) | Gap Classification | Phase 08-C Frontend Interim Strategy | Target Resolution Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-001** | `GET /api/v1/notifications` | `SHR-001`, All TopBars | **Missing MVP** | Render mock empty notification drawer or query Supabase client if enabled; contract defined in `20-notification-ui.md`. | Phase 08-C Route |
| **GAP-002** | `POST /api/v1/notifications/[id]/read`| `SHR-001` | **Missing MVP** | Optimistic local read state in React state/localStorage. | Phase 08-C Route |
| **GAP-003** | `GET /api/v1/departments` | `STU-002`, `FAC-003` | Available via View | Use static fallback constant array or query Supabase public view. | Phase 08-C Route |
| **GAP-004** | `GET /api/v1/categories` | `STU-002`, `SHR-002` | Available via View | Use static enum mapping from domain Value Object `ComplaintCategory.ts`. | Phase 08-C Route |
| **GAP-005** | `GET /api/v1/departments/[id]/handlers`| `HOD-002` | **Missing MVP** | Mock handler list based on verified department staff fixtures. | Phase 08-C Route |
| **GAP-006** | `GET /api/v1/analytics/recurring` | `MGT-002`, `HOD-001` | Available via View | Query `recurring_complaint_clusters` SQL view directly via Supabase client. | Phase 08-C Route |
| **GAP-007** | `GET /api/v1/analytics/sla-performance`| `MGT-003`, `HOD-001` | Available via View | Query `department_sla_performance` view via Supabase client. | Phase 08-C Route |
| **GAP-008** | `GET /api/v1/admin/users` | `ADM-002` | Post-MVP | Static mockup table with search filter demo state. | Phase 09 Admin |
| **GAP-009** | `POST /api/v1/admin/users` | `ADM-002` | Post-MVP | Disabled CTA with badge: "Admin User Provisioning Available Post-MVP". | Phase 09 Admin |
| **GAP-010** | `GET /api/v1/admin/audit-logs` | `ADM-001` | Post-MVP | View-only sample records or Supabase audit log query. | Phase 09 Admin |
| **GAP-011** | `POST /api/v1/complaints/export` | `MGT-003` | Post-MVP | Client-side CSV generator over currently filtered data table. | Phase 08-C Client |
| **GAP-012** | `PUT /api/v1/users/profile` | Profile Menu | Post-MVP | Read-only profile view displaying Supabase Auth metadata. | Phase 09 Profile |
