# Campus Plus — Phase 08-C-D: Requirement Traceability Matrix

**Authority:** Principal Frontend Architect, QA Automation Lead  
**Stage:** 08-C-D  
**Status:** 100% TRACED  

---

## 1. End-to-End Traceability Mapping

| Requirement ID | Description | UX Touchpoint | Component / Route | Security Rule | Test Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-021** | Student Dashboard Experience | `/dashboard` | `DashboardContent`, `TopBar` | Server RLS scoping | `stage-08c-d.test.ts` |
| **FR-022** | Handler Worklist Experience | `/dashboard?tab=worklist` | `Sidebar`, `TopBar` | Department scope check | `stage-08c-d.test.ts` |
| **FR-023** | HOD Department Triage | `/dashboard?tab=triage` | `Sidebar`, `TopBar` | Department Head scope | `stage-08c-d.test.ts` |
| **FR-024** | Management Institutional View | `/dashboard?tab=analytics`| `Sidebar`, `TopBar` | Executive scope | `stage-08c-d.test.ts` |
| **SEC-001** | Authentication Boundary | `/login` | `LoginForm`, `AuthContext` | Supabase Auth + `/auth/me` | `stage-08c-d.test.ts` |
| **SEC-002** | Zero-Trust Role Scoping | All routes | `ProtectedRoute`, `ForbiddenState` | Server is sole authority | `stage-08c-d.test.ts` |
| **NFR-008** | Responsive Viewport (>= 360px)| Desktop & Mobile | `Sidebar`, `MobileNav`, `TopBar` | Full width touch targets | `stage-08c-d.test.ts` |
| **CWE-601** | Open Redirect Prevention | `/login?redirect=...` | `security.ts:isValidInternalRedirect` | Prohibits external URLs | `stage-08c-d.test.ts` |
