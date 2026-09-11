# Phase 08-C: End-to-End Implementation Traceability Matrix

**Document Identifier:** `23-TRACEABILITY-MATRIX.md`  
**Classification:** Requirements & Architectural Traceability Matrix  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Standard:** Maps all 38 MUST requirements, user journeys, screens, components, backend APIs, roles, permissions, states, and verification tests.

---

## 1. Master Requirements Traceability Register

| Req ID | Requirement Summary | Target Screen(s) | Primary Component(s) | Backend API Endpoint | Target Role(s) | Permission Check | FSM State(s) | Automated Test Target | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **FR-001** | Complaint Submission Intake | `STU-002` | `TextInput`, `TextArea`, `Select`, `RadioGroup` | `POST /api/v1/complaints` | Student, Faculty | `CAN_SUBMIT` | `SUBMITTED` | `tests/frontend/STU-002.test.tsx` | Ready for Impl |
| **FR-002** | Tracking Code Generation | `STU-001`, `STU-003` | `TrackingCodeBadge` | `POST /api/v1/complaints` | All Roles | Public View | All States | `tests/frontend/TrackingCode.test.tsx` | Ready for Impl |
| **FR-003** | Mandatory Complaint Details | `STU-002` | `CharacterCounter`, `InlineError` | `POST /api/v1/complaints` | Student | Zod Validation | Pre-submit | `tests/frontend/FormValidation.test.tsx` | Ready for Impl |
| **FR-004** | Campus Location Structure | `STU-002`, `STU-003` | `LocationSelector`, `Card` | `POST /api/v1/complaints` | Student, Staff | Input Validation | All States | `tests/frontend/LocationInput.test.tsx` | Ready for Impl |
| **FR-005** | Evidence Attachment Upload | `STU-002` | `FileUploader`, `Progress` | `POST /api/v1/attachments/presign-upload`| Student, Staff | 5MB / 3 Files / MIME | `SUBMITTED`, `RESOLVED`| `tests/frontend/AttachmentUpload.test.tsx` | Ready for Impl |
| **FR-006** | Student View Own Grievances | `STU-001`, `STU-003` | `Card`, `StatusPill`, `Tabs` | `GET /api/v1/complaints`, `GET /api/v1/complaints/[id]`| Student | Complainant RLS | All States | `tests/frontend/STU-001.test.tsx` | Ready for Impl |
| **FR-007** | HOD Department Queue Triage | `HOD-001` | `Table`, `FilterBar`, `Badge` | `GET /api/v1/complaints` | Dept Head | Department Scope | `SUBMITTED`, `REVIEWED`| `tests/frontend/HOD-001.test.tsx` | Ready for Impl |
| **FR-008** | HOD Handler Assignment | `HOD-002` | `Modal`, `Select`, `Button` | `POST /api/v1/complaints/[id]/assign` | Dept Head | Same Dept Staff | `ASSIGNED` | `tests/frontend/HOD-002.test.tsx` | Ready for Impl |
| **FR-009** | Handler Worklist Visibility | `FAC-001` | `Table`, `Card`, `PriorityBadge` | `GET /api/v1/complaints` | Handler | Assigned Handler Scope | `ASSIGNED`, `IN_PROGRESS`| `tests/frontend/FAC-001.test.tsx` | Ready for Impl |
| **FR-010** | Handler Start Progress | `FAC-002` | `Button`, `Toast` | `POST /api/v1/complaints/[id]/progress` | Handler | Assigned Handler Only | `IN_PROGRESS` | `tests/frontend/FAC-002.test.tsx` | Ready for Impl |
| **FR-011** | Inter-Department Forwarding | `FAC-003` | `Modal`, `Select`, `TextArea` | `POST /api/v1/complaints/[id]/forward` | Handler, HOD | `INV-002` (Diff Dept) | `FORWARDED` | `tests/frontend/FAC-003.test.tsx` | Ready for Impl |
| **FR-012** | Forwarding Deadlock Defense | `FAC-003` | `AlertBanner` | `POST /api/v1/complaints/[id]/forward` | Handler, HOD | `INV-010` (Max 3) | `ESCALATED` | `tests/frontend/DeadlockWarning.test.tsx` | Ready for Impl |
| **FR-013** | Tiered Escalation Workflow | `FAC-004` | `Modal`, `Select`, `TextArea` | `POST /api/v1/complaints/[id]/escalate`| Handler, HOD | Tier Progression | `ESCALATED` | `tests/frontend/FAC-004.test.tsx` | Ready for Impl |
| **FR-014** | Handler Service Resolution | `FAC-005` | `Modal`, `TextArea`, `FileUploader`| `POST /api/v1/complaints/[id]/resolve` | Handler, HOD | Summary >= 20 chars | `RESOLVED` | `tests/frontend/FAC-005.test.tsx` | Ready for Impl |
| **FR-015** | Resolution Proof Upload | `FAC-005` | `FileUploader` | `POST /api/v1/attachments/presign-upload`| Handler, HOD | MIME & Size Check | `RESOLVED` | `tests/frontend/ResolutionProof.test.tsx` | Ready for Impl |
| **FR-016** | Complainant Resolution Sign-Off| `STU-003`, `STU-004`| `AlertBanner`, `Modal`, `Button` | `POST /api/v1/complaints/[id]/verify` | Complainant Only | 5-Day Window | `CLOSED` | `tests/frontend/STU-004.test.tsx` | Ready for Impl |
| **FR-017** | Complainant Dispute & Reopen | `STU-004` | `Modal`, `TextArea`, `Button` | `POST /api/v1/complaints/[id]/dispute` | Complainant Only | Reason >= 20 chars | `REOPENED` | `tests/frontend/DisputeReopen.test.tsx` | Ready for Impl |
| **FR-018** | Pre-Triage Cancellation | `STU-003` | `ConfirmDialog` | `POST /api/v1/complaints/[id]/cancel` | Complainant Only | `SUBMITTED` Only | `CANCELLED` | `tests/frontend/CancelComplaint.test.tsx` | Ready for Impl |
| **FR-019** | Chronological Action Timeline | `STU-003`, `FAC-002`| `TimelineFeed` | `GET /api/v1/complaints/[id]/timeline`| All Roles | Public/Internal Filter| All States | `tests/frontend/TimelineFeed.test.tsx` | Ready for Impl |
| **FR-020** | In-App Notifications Drawer | `SHR-001` | `Drawer`, `Badge`, `NotificationItem`| `GAP-001` (Fallback Contract) | All Roles | Recipient ID Scope | N/A | `tests/frontend/NotificationDrawer.test.tsx`| Ready for Impl |
| **FR-021** | Student Personal Dashboard | `STU-001` | `Card`, `StatusPill`, `EmptyState` | `GET /api/v1/complaints` | Student | Complainant Scope | All States | `tests/frontend/STU-001.test.tsx` | Ready for Impl |
| **FR-022** | Handler Worklist Dashboard | `FAC-001` | `Table`, `Card`, `Badge` | `GET /api/v1/complaints` | Handler | Handler Scope | Active States | `tests/frontend/FAC-001.test.tsx` | Ready for Impl |
| **FR-023** | HOD Oversight Dashboard | `HOD-001` | `Table`, `WorkloadBar`, `AlertBanner`| `GET /api/v1/complaints` | Dept Head | Department Scope | Active States | `tests/frontend/HOD-001.test.tsx` | Ready for Impl |
| **FR-024** | Management Executive Dashboard | `MGT-001` | `KPICard`, `Table` | `GET /api/v1/complaints` | Management | Cross-Department | All States | `tests/frontend/MGT-001.test.tsx` | Ready for Impl |
| **FR-025** | Recurring Complaint Clusters | `MGT-002` | `ClusterCard`, `Badge` | `GAP-006` (View Query) | Management, HOD | Cross-Department | All States | `tests/frontend/MGT-002.test.tsx` | Ready for Impl |
| **FR-026** | Multi-Criteria Search & Filter | `SHR-002` | `SearchInput`, `Select`, `DateRange`| `GET /api/v1/complaints` | All Roles | Role-Scoped Query | All States | `tests/frontend/SearchFilter.test.tsx` | Ready for Impl |
| **SEC-001**| Server Identity & JWT Auth | `AUTH-001` | `TextInput`, `Button` | Supabase Auth + `GET /auth/me` | All Roles | Server Verification | N/A | `tests/frontend/AuthContext.test.tsx` | Ready for Impl |
| **SEC-002**| Row-Level Security UI Defense | Global Shell | Global Shell & Routes | All APIs | All Roles | Server Authorization | All States | `tests/frontend/BOLAProtection.test.tsx` | Ready for Impl |
| **PRIV-001**| Student PII & Contact Masking | `FAC-002`, `HOD-001`| `Card`, `Table` | Backend DTO Projection | Staff Roles | Complainant Masking | All States | `tests/frontend/PIIMasking.test.tsx` | Ready for Impl |
| **PRIV-002**| Staff Internal Notes Privacy | `STU-003`, `FAC-002`| `Tabs`, `TimelineFeed` | `GET /api/v1/complaints/[id]` | Staff Only (`INV-012`)| Stripped for Students | All States | `tests/frontend/InternalNotes.test.tsx` | Ready for Impl |
| **NFR-001**| Sub-Second UI Navigation | Global Shell | App Router Transitions | Static & Dynamic Caching | All Roles | Client Routing | All States | `tests/frontend/Performance.test.tsx` | Ready for Impl |
| **NFR-002**| Concurrency Collision Handling | Global Modals | `ConflictModal` | HTTP 409 Response Envelope | All Roles | OCC Version Check | Mutable States | `tests/frontend/ConflictModal.test.tsx` | Ready for Impl |
| **NFR-003**| Idempotency Mutation Safety | Form Submissions | Client Request Interceptor | `Idempotency-Key` Header | All Roles | Server Replay Check | Mutation States | `tests/frontend/Idempotency.test.tsx` | Ready for Impl |
| **NFR-004**| Non-Blocking Offline Warning | Global Shell | `AlertBanner` | Window Online/Offline Event | All Roles | Client Network State | All States | `tests/frontend/OfflineMode.test.tsx` | Ready for Impl |
| **NFR-005**| WCAG 2.1 Level AA Accessibility| Design System | All Components | CSS Tokens & ARIA Rules | All Roles | WCAG Contrast & Keyboard| All States | `tests/frontend/A11y.test.tsx` | Ready for Impl |
| **NFR-006**| Viewport Responsive Scalability| Layout Shell | CSS Media Queries & Breakpoints| Tailwind v4 Responsive Grid | All Roles | 360px - 2560px Viewports| All States | `tests/frontend/Responsive.test.tsx` | Ready for Impl |
| **NFR-007**| Zero Data Layout Shifts (CLS) | Async Views | `SkeletonLoader` | Next.js Streaming & Skeletons | All Roles | Geometry Matching | Loading States | `tests/frontend/Skeletons.test.tsx` | Ready for Impl |
| **NFR-008**| Mobile Touch Targets (>= 44px) | Mobile Views | `Button`, `TextInput`, `BottomNav`| Touch Hitbox Styles | All Roles | Viewport < 768px | All States | `tests/frontend/TouchTargets.test.tsx` | Ready for Impl |
