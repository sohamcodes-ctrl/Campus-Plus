# Phase 08-B: Screen-to-API Data Mapping Specification

**Document Identifier:** `26-screen-to-api-data-mapping.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Complete technical binding of every UI screen and user action to backend API routes, payloads, and envelopes.

---

## 1. Master Screen-to-Route Mapping Table

| Screen ID | Screen Name | HTTP Route | Method | Request Payload / Params | Response Envelope | Triggering UI Element |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **AUTH-001**| Login | Supabase Auth | `POST` | `{ email, password }` | Auth Session + JWT | `[ Sign In Button ]` |
| **STU-001** | Student Dashboard | `/api/v1/complaints` | `GET` | `?limit=20&page=1` | `ApiSuccessEnvelope<ComplaintSummary[]>` | Page Load / Tab Switch |
| **STU-002** | Submit Complaint | `/api/v1/complaints` | `POST` | `CreateComplaintDto` + `Idempotency-Key` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Submit Complaint Button ]` |
| **STU-002** | Presign Attachment | `/api/v1/attachments/presign-upload`| `POST` | `{ filename, contentType, sizeBytes }` | `ApiSuccessEnvelope<PresignResult>` | File Selection Dropzone |
| **STU-003** | Student Detail | `/api/v1/complaints/[id]`| `GET` | None | `ApiSuccessEnvelope<ComplaintDetail>` | Card Click / Direct URL |
| **STU-003** | Timeline View | `/api/v1/complaints/[id]/timeline`| `GET` | None | `ApiSuccessEnvelope<TimelineEntry[]>` | Detail Page Load |
| **STU-004** | Verify Resolution | `/api/v1/complaints/[id]/verify` | `POST` | None | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Verify & Close Button ]` |
| **STU-004** | Dispute Resolution | `/api/v1/complaints/[id]/dispute`| `POST` | `{ reason: string }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Dispute Resolution Button ]`|
| **STU-003** | Cancel Complaint | `/api/v1/complaints/[id]/cancel` | `POST` | None | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Cancel Complaint Button ]` |
| **FAC-001** | Handler Worklist | `/api/v1/complaints` | `GET` | `?assigned_to_me=true` | `ApiSuccessEnvelope<ComplaintSummary[]>` | Page Load |
| **FAC-002** | Start Progress | `/api/v1/complaints/[id]/progress`| `POST`| `{ remarks?: string }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Start Progress Button ]` |
| **FAC-003** | Forward Complaint | `/api/v1/complaints/[id]/forward` | `POST` | `{ targetDepartmentId, rationale }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Forward Button ]` |
| **FAC-004** | Escalate Complaint| `/api/v1/complaints/[id]/escalate`| `POST`| `{ tier, reason, remarks }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Escalate Button ]` |
| **FAC-005** | Resolve Complaint | `/api/v1/complaints/[id]/resolve` | `POST` | `{ resolutionSummary, proofKeys }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Resolve Button ]` |
| **HOD-001** | Triage Queue | `/api/v1/complaints` | `GET` | `?department_id=dept_id` | `ApiSuccessEnvelope<ComplaintSummary[]>` | Page Load |
| **HOD-001** | Review Complaint | `/api/v1/complaints/[id]/review` | `POST` | None | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Review Button ]` |
| **HOD-002** | Assign Handler | `/api/v1/complaints/[id]/assign` | `POST` | `{ handlerId, notes? }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Assign Button ]` |
| **HOD-003** | Reject Complaint | `/api/v1/complaints/[id]/reject` | `POST` | `{ reason: string }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Reject Button ]` |
| **HOD-004** | Mark Duplicate | `/api/v1/complaints/[id]/duplicate`| `POST`| `{ masterComplaintId: string }` | `ApiSuccessEnvelope<ComplaintDetail>` | `[ Confirm Duplicate Button ]`|
| **MGT-001** | Executive Dashboard| `/api/v1/complaints` | `GET` | Cross-department query | `ApiSuccessEnvelope<ComplaintSummary[]>` | Page Load |
| **ADM-001** | Admin Health | `/api/health` | `GET` | None | `{ status: "ok", timestamp }` | Page Load |
| **SHR-002** | Search Complaints | `/api/v1/complaints` | `GET` | `?search=query&status=...` | `ApiSuccessEnvelope<ComplaintSummary[]>` | Search Input Enter / Filter |
