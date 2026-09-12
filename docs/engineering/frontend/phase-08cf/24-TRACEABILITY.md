# Phase 08-C-F: Requirements Traceability Matrix

| Requirement | Description | Implementing Component | Test Verification | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Complaint Submission | `src/app/complaints/new/page.tsx` | `complaint-workflows.test.ts` | Satisfied |
| **FR-002** | Category Selection | `ComplaintForm.tsx` | `complaint-workflows.test.ts` | Satisfied |
| **FR-003** | Structured Location | `LocationSelector.tsx` | `stage-08c-c.test.ts` | Satisfied |
| **FR-004** | Attachment Upload | Presign upload integration | `stage-08c-c.test.ts` | Partial (GAP-003) |
| **FR-006** | Complaint Detail View | `src/app/complaints/[id]/page.tsx` | `complaint-workflows.test.ts` | Satisfied |
| **FR-008** | Handler Assignment | `HodDashboard.tsx` (AssignModal) | `role-dashboards.test.ts` | Satisfied |
| **FR-015** | Complaint Resolution | `HandlerDashboard.tsx` (ResolveModal)| `role-dashboards.test.ts` | Satisfied |
| **FR-017** | Complainant Verify | `ComplaintDetailView.tsx` | `complaint-workflows.test.ts` | Satisfied |
| **FR-018** | Dispute & Reopen | `ComplaintDetailView.tsx` | `complaint-workflows.test.ts` | Satisfied |
| **FR-021** | Student Dashboard | `StudentDashboard.tsx` | `role-dashboards.test.ts` | Satisfied |
| **FR-022** | Handler Dashboard | `HandlerDashboard.tsx` | `role-dashboards.test.ts` | Satisfied |
| **FR-023** | HOD Dashboard | `HodDashboard.tsx` | `role-dashboards.test.ts` | Satisfied |
| **FR-024** | Management Dashboard| `ManagementDashboard.tsx` | `role-dashboards.test.ts` | Satisfied |
| **NFR-008**| Viewport >= 360px | Mobile card layouts, `MobileNav.tsx` | Responsive tests | Satisfied |
| **SEC-001**| Auth Enforcement | `ProtectedRoute.tsx`, `AuthContext.tsx` | `root-route.test.ts` | Satisfied |
| **SEC-002**| Role Scoping & RLS | Server `AuthorizationPolicy.ts` | Domain test suites | Satisfied |
