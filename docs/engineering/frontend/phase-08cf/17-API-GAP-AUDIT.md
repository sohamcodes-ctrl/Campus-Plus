# Phase 08-C-F: API Gap Register & Reality Check

## 1. Open API Gaps
- **GAP-001: Notifications API (`GET /api/v1/notifications`)**
  - Status: OPEN.
  - Frontend Mitigation: Notifications drawer displays honest notice explaining in-app real-time notification push is scheduled for backend Phase 09.
- **GAP-002: Analytics Pre-Aggregation API (`GET /api/v1/analytics/overview`)**
  - Status: OPEN.
  - Frontend Mitigation: Management dashboard displays honest telemetry pending notice.
- **GAP-003: Attachment Binding in Complaint Intake Payload**
  - Status: OPEN.
  - Reality: Presigned upload URL generation (`POST /api/v1/attachments/presign-upload`) works, and files upload to private Supabase Storage. However, `POST /api/v1/complaints` schema does not accept an `attachmentIds` array.
  - Honest Stance: GAP-003 is NOT marked as resolved. Documented as an active Backend Change Request (BCR-001).
- **GAP-004: Self-Service Student Registration API (`POST /api/v1/auth/register`)**
  - Status: OPEN. Handled via `IAM-REG-PENDING` registrar workflow.
- **GAP-005: Department Handler Roster Lookup API**
  - Status: OPEN. Handled via manual handler ID input in HOD assignment modal.

## 2. Acceptance Status
- **API Gap Handling**: PASS (Honest documentation, zero mock facades).
