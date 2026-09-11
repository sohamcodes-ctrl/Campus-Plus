# Phase 05 Requirements & Architecture Traceability Matrix

## 1. Traceability Principles

Phase 05 establishes complete bidirectional traceability between:
- Phase 01 Functional & Non-Functional Requirements (`FR`, `NFR`)
- Phase 01 Business Rules (`BR`) & Edge Cases (`EDGE`)
- Phase 01 Open Decisions & Assumptions (`OD`, `ASM`)
- Phase 02 Architecture Decision Records (`ADR`)
- Phase 04 Database Schema & Constraints
- Phase 05 Domain Core Components & Automated Tests

---

## 2. Comprehensive Bidirectional Traceability Table

| Req / Decision ID | Institutional Rule / Statement | Phase 04 Database Enforcement | Phase 05 Domain Realization | Automated Test Verification |
| :--- | :--- | :--- | :--- | :--- |
| **FR-001 / FR-002** | Role-based identity & permissions (Student, Handler, Head, Admin, Management) | `profiles.role IN (...)`, Supabase RLS policies | `ComplaintTypes.ts (UserRole)`, `AuthorizationPolicy.ts` | `tests/unit/domain-authorization.test.ts` |
| **FR-004 / BR-004** | Structured complaint filing with Tracking Code (`CP-YYYY-XXXXX`), Title (10-120), Description (>= 30) | `complaints.ref_id`, `chk_title_len`, `chk_desc_len` | `ValueObjects.ts` (`TrackingCode`, `ComplaintTitle`, `ComplaintDescription`) | `tests/unit/domain-complaint-aggregate.test.ts` |
| **FR-007 / BR-006** | Triage review by Department Head; classification and priority confirmation | `complaint_status_enum ('REVIEWED')`, `complaints.reviewed_at` | `Complaint.review()`, `ReviewComplaintUseCase.ts` | `tests/unit/domain-fsm.test.ts`, `tests/unit/domain-complaint-aggregate.test.ts` |
| **FR-008 / BR-008** | Single departmental handler assignment; handler must belong to owning department | `complaint_assignments`, `chk_single_active_assignment` partial index | `Complaint.assignHandler()`, `INV-007`, `AssignComplaintUseCase.ts` | `tests/unit/domain-invariants.test.ts`, `tests/unit/domain-complaint-aggregate.test.ts` |
| **FR-009** | Handler begins resolution progress (`IN_PROGRESS`) | `complaint_status_enum ('IN_PROGRESS')` | `Complaint.startProgress()`, `StartProgressUseCase.ts` | `tests/unit/domain-fsm.test.ts` |
| **FR-010 / BR-010** | Inter-departmental forwarding with rationale (>= 10 chars); no self-forwarding | `complaint_forwards`, `chk_forward_diff_dept`, `chk_forward_rationale_len` | `Complaint.forwardDepartment()`, `INV-002`, `ForwardingRationale` | `tests/unit/domain-invariants.test.ts` |
| **EDGE-004 / INV-010**| Anti-deadlock forwarding: 3rd departmental transfer elevates to TIER_3_MANAGEMENT | `complaint_forwards.forward_sequence INT`, `complaint_escalations` | `Complaint.forwardDepartment()`, `BusinessInvariants.isAntiDeadlockTriggered()` | `tests/unit/domain-invariants.test.ts` |
| **FR-013 / BR-013** | Hierarchical escalation (`TIER_1` -> `TIER_2` -> `TIER_3`) with mandatory rationale | `complaint_escalations`, `complaint_status_enum ('ESCALATED')` | `Complaint.manualEscalate()`, `Complaint.systemEscalate()`, `EscalateComplaintUseCase.ts` | `tests/unit/domain-complaint-aggregate.test.ts` |
| **FR-016 / BR-015** | Resolution summary length $\ge 20$ chars | `complaint_resolutions`, `chk_resolution_summary_len` | `ResolutionSummary`, `INV-005`, `BusinessInvariants.validateResolutionSummary()` | `tests/unit/domain-invariants.test.ts` |
| **FR-016 / BR-007** | Mandatory proof attachments for designated infrastructure categories | Storage bucket rules, attachments schema | `IResolutionEvidencePolicy`, `INV-006`, `ResolveComplaintUseCase.ts` | `tests/unit/domain-invariants.test.ts` |
| **FR-017 / BR-016** | Complainant satisfaction verification transitions complaint to `CLOSED` | `complaint_status_enum ('CLOSED')`, `complaints.closed_at` | `Complaint.verifyResolution()`, `CloseComplaintUseCase.ts` | `tests/unit/domain-complaint-aggregate.test.ts` |
| **FR-018 / BR-018** | Reopening dispute window driven by campus business calendar (default 5 working days) | `complaint_status_enum ('REOPENED')`, `complaint_resolutions.dispute_reason` | `IReopenPolicy`, `IWorkingCalendarPort`, `ReopenComplaintUseCase.ts` | `tests/unit/domain-complaint-aggregate.test.ts`, `tests/unit/domain-invariants.test.ts` |
| **FR-019 / BR-019** | Append-only audit trail logging for all mutations | `audit_events`, trigger `trg_prevent_audit_modification` | `DomainEvents.ts`, `INV-011`, `BusinessInvariants.validateAuditEmission()` | `tests/unit/domain-invariants.test.ts`, `tests/database/audit-immutability.test.ts` |
| **FR-020 / BR-020** | Internal notes secrecy; hidden from student complainants | RLS policies restricting note visibility | `INV-012`, `BusinessInvariants.validateInternalNoteAccess()` | `tests/unit/domain-invariants.test.ts` |
| **NFR-003 / ADR-006**| Request deduplication & command idempotency | Idempotency token storage table | `IIdempotencyPort`, `INV-013`, `SubmitComplaintUseCase.ts` | `tests/unit/domain-concurrency-idempotency.test.ts` |
| **NFR-004 / ADR-003**| Optimistic Concurrency Control preventing silent overwrites | `complaints.version INT NOT NULL DEFAULT 1` | `ComplaintVersion`, `INV-009`, `BusinessInvariants.validateConcurrency()` | `tests/unit/domain-concurrency-idempotency.test.ts` |
| **OD-006 / ASM-002** | Provisional SLA hours by priority (Urgent: 12h, High: 24h, Medium: 72h, Low: 120h) | `sla_due_at TIMESTAMPTZ` | `ComplaintTypes.ts (PROVISIONAL_DEFAULT_SLA_HOURS)`, `ISLAPolicyPort.ts` | `tests/unit/domain-fsm.test.ts` |
| **OD-008 / ASM-004** | Working calendar dispute window abstraction (no caller-supplied hours) | Calendar table / working hours | `IReopenPolicy.ts`, `IWorkingCalendarPort.ts` | `tests/unit/domain-complaint-aggregate.test.ts` |
