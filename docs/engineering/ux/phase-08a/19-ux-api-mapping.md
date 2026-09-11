# Phase 08-A: API → UX Traceability Mapping

**Document Identifier:** `19-ux-api-mapping.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Maps every implemented Next.js backend endpoint to its consuming UX screens, triggering actions, data payloads, and error states.

---

## 1. Master API to UX Mapping Table (All 19 Implemented Endpoints)

| API Endpoint | HTTP Method | Consuming Screen | Triggering User Action | Request Payload / Params | Expected Response Data | Loading State Treatment | Error Feedback Strategy |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | `ADM-001` | Page mount / auto-poll | `?type=liveness` or `readiness` | `{ status: "ok", memoryMb, uptime }` | Mini status spinner | Amber warning banner |
| `/api/v1/auth/me` | `GET` | All Screens | App initialization / layout mount | Bearer token in header | `{ userId, role, departmentId }` | Full-page shell skeleton | Redirect to `/login` |
| `/api/v1/attachments/presign-upload` | `POST` | `STU-002`, `FAC-005` | File dropped in dropzone | `{ filename, mimeType, fileSizeBytes }` | `{ uploadUrl, fileKey, expiresInSeconds }` | Inline upload progress bar | Toast: "Upload failed: File > 5MB" |
| `/api/v1/complaints` | `POST` | `STU-002` | Click `[Submit Complaint]` | `{ title, description, categoryId, departmentId, locationDetails, priority }` | `{ complaintId, trackingCode, status }` | Submit button disabled + spinner | Inline field error highlights |
| `/api/v1/complaints` | `GET` | `STU-001`, `FAC-001`, `HOD-001` | Dashboard mount / search / filter | `?status=&priority=&page=&limit=` | `{ data: ComplaintSummaryView[], pagination }` | Table shimmer / card skeletons | "Unable to load complaints" card |
| `/api/v1/complaints/[id]` | `GET` | `STU-003`, `FAC-002` | Complaint card click / deep-link | Path `id` (UUID or tracking code) | `StudentComplaintDTO` or `StaffComplaintDTO` | Full detail skeleton layout | 404 / 403 Safe Error Page |
| `/api/v1/complaints/[id]/timeline` | `GET` | `STU-003`, `FAC-002` | Detail view mount / tab click | Path `id` | `TimelineItemView[]` | Timeline line pulse shimmer | Empty state or retry link |
| `/api/v1/complaints/[id]/review` | `POST` | `HOD-001`, `HOD-002` | Click `[Mark as Reviewed]` | `{ expectedVersion }` | `{ message: "Under review" }` | Button spinner | Toast: "Review failed" |
| `/api/v1/complaints/[id]/assign` | `POST` | `HOD-002` | Select handler & confirm | `{ handlerId, reason, expectedVersion }` | `{ message: "Handler assigned" }` | Modal button spinner | Toast: "Technician not in dept" |
| `/api/v1/complaints/[id]/progress` | `POST` | `FAC-002` | Click `[Start Progress]` | `{ expectedVersion }` | `{ message: "In progress" }` | Button spinner | Toast: 409 OCC Conflict modal |
| `/api/v1/complaints/[id]/forward` | `POST` | `FAC-003` | Select target dept & confirm | `{ targetDepartmentId, rationale, expectedVersion }` | `{ message: "Forwarded" }` | Modal button spinner | Toast: "Self-forwarding rejected" |
| `/api/v1/complaints/[id]/escalate` | `POST` | `FAC-004` | Select tier & enter reason | `{ targetTier, reason, expectedVersion }` | `{ message: "Escalated" }` | Modal button spinner | Toast: "Justification mandatory" |
| `/api/v1/complaints/[id]/resolve` | `POST` | `FAC-005` | Enter summary & proof upload | `{ resolutionSummary, proofKeys, expectedVersion }` | `{ message: "Resolved" }` | Modal button spinner | Toast: "Category mandates proof" |
| `/api/v1/complaints/[id]/verify` | `POST` | `STU-004` | Click `[Verify & Close]` | `{ expectedVersion }` | `{ message: "Verified and closed" }` | Modal button spinner | Toast: 409 OCC Conflict modal |
| `/api/v1/complaints/[id]/dispute` | `POST` | `STU-004` | Enter reason & confirm dispute | `{ disputeReason, expectedVersion }` | `{ message: "Disputed & reopened" }` | Modal button spinner | Toast: "5-day window expired" |
| `/api/v1/complaints/[id]/close` | `POST` | `FAC-002`, `HOD-001` | Admin closure click | `{ reason, expectedVersion }` | `{ message: "Closed" }` | Modal button spinner | Toast: "Closure failed" |
| `/api/v1/complaints/[id]/reject` | `POST` | `HOD-003` | Enter rejection rationale | `{ reason, expectedVersion }` | `{ message: "Rejected" }` | Modal button spinner | Toast: "Rejection failed" |
| `/api/v1/complaints/[id]/duplicate`| `POST` | `HOD-004` | Enter master tracking code | `{ originalRefId, expectedVersion }` | `{ message: "Marked duplicate" }` | Modal button spinner | Toast: "Master code not found" |
| `/api/v1/complaints/[id]/cancel` | `POST` | `STU-003` | Click `[Cancel Complaint]` | `{ reason, expectedVersion }` | `{ message: "Cancelled" }` | Modal button spinner | Toast: "Cannot cancel reviewed" |
