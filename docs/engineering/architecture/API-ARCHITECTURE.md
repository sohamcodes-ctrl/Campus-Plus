# Campus Plus — API Architecture & Interface Contracts

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: API-ARCHITECTURE.md  
**Version**: 1.0  
**Status**: Formal Interface & Contract Blueprint  
**Authors**: Lead Software Architect, Systems Analyst  

---

## 1. Executive Summary

This document specifies the **RESTful API Contracts**, request/response schemas, server-side validation rules, idempotency semantics, and standardized error taxonomy for Campus Plus. 

All API boundaries enforce strict server-side authentication (`SEC-001`), declarative RBAC authorization (`SEC-002`), input sanitization (`SEC-004`), and atomic transaction boundaries (`ADR-001`, `ADR-005`). No API endpoints are implemented in code during this phase.

---

## 2. Global API Conventions & Protocol Standards

1. **Base Path**: `/api/v1`
2. **Transport Security**: HTTPS strictly enforced. All non-HTTPS requests redirected.
3. **Content Type**: `application/json; charset=utf-8` for payloads.
4. **Authentication Header**: `Authorization: Bearer <session_jwt>` or secure `HttpOnly` cookie session.
5. **Idempotency Header**: Optional for read operations; strongly recommended for state-mutating requests (`POST`, `PATCH`): `Idempotency-Key: <UUIDv4>`.
6. **Correlation & Tracing Header**: Every response returns an opaque correlation tracking header: `X-Correlation-ID: <UUIDv4>` (`NFR-009`).

---

## 3. Standardized Error Taxonomy & Response Format

In accordance with Section 32 of the protocol, the API utilizes a consistent, machine-readable error format that **never leaks internal database stack traces, SQL syntax, or server environment details** to the client:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable sanitized message explaining the failure.",
    "correlation_id": "550e8400-e29b-41d4-a716-446655440000",
    "details": [
      {
        "field": "description",
        "issue": "Description must contain at least 30 characters."
      }
    ]
  }
}
```

### Error Taxonomy Mapping:

| Error Code | HTTP Status | Triggering Scenario | Client Action |
| :--- | :---: | :--- | :--- |
| **`UNAUTHENTICATED`** | 401 | Missing, expired, or cryptographically invalid session token. | Redirect user to login interface. |
| **`FORBIDDEN`** | 403 | Authenticated user lacks RBAC role or data scope permission. | Display access denied; do not reveal resource existence if scoped. |
| **`RESOURCE_NOT_FOUND`** | 404 | Complaint reference ID or entity does not exist. | Inform user item was not found. |
| **`VALIDATION_FAILED`** | 422 | Input schema violated (e.g. empty title, file size $> 5$ MB). | Highlight specific invalid fields in UI. |
| **`INVALID_STATE_TRANSITION`** | 409 | Requested lifecycle transition violates FSM transition rules. | Refresh ticket status and update UI action buttons. |
| **`CONCURRENCY_CONFLICT`** | 409 | Optimistic concurrency check failed (`version` mismatch). | Refresh view with latest server state and prompt retry. |
| **`IDEMPOTENCY_IN_FLIGHT`** | 409 | Identical request key currently processing. | Client waits and polls for completion. |
| **`RATE_LIMIT_EXCEEDED`** | 429 | Client exceeded request quota (e.g. $> 10$ submissions/min). | Back off request according to `Retry-After` header. |
| **`STORAGE_FAILURE`** | 502 | Object storage upload ticket generation or validation failed. | Non-blocking retry with temporary warning. |
| **`INTERNAL_SERVER_ERROR`** | 500 | Unhandled system exception. Stack trace logged internally. | Display generic error and reference `correlation_id`. |

---

## 4. Core Domain API Operations Catalog

### 4.1 Authentication & Identity Context
- **`POST /api/v1/auth/login`**:
  - *Actor*: Public / All Roles.
  - *Request*: `{ "email": "student@rcpit.ac.in", "password": "..." }`.
  - *Validation*: Email must match institutional domain pattern (`ADR-002`).
  - *Response (200)*: `{ "user": { "id": "...", "role": "ROLE_STUDENT", "name": "..." }, "token": "..." }`.
- **`GET /api/v1/auth/me`**:
  - *Actor*: Authenticated User.
  - *Response (200)*: Current user profile, role claims, department binding, and permissions vector.

---

### 4.2 Complaint Intake & Tracking
- **`POST /api/v1/complaints`** (`FR-001`, `FR-005`):
  - *Actor*: `ROLE_STUDENT` only.
  - *Header*: `Idempotency-Key: <UUID>`.
  - *Request*:
    ```json
    {
      "title": "Broken bench in Mechanical Workshop Lab",
      "description": "Two wooden planks are cracked, posing safety hazard to students.",
      "category_id": "8f87e55b-...",
      "department_id": "4a12c33d-...",
      "suggested_priority": "MEDIUM",
      "location_details": "Workshop Building 2, Ground Floor",
      "attachment_keys": ["complaints/temp/uuid1.jpg"]
    }
    ```
  - *Validation*: Title 10–120c, Desc $\ge 30$c, active Category/Dept, valid attachment keys.
  - *Transaction Boundary*: Atomic insert of `complaints` row + `attachments` rows + `action_history` entry (`SUBMITTED`) + enqueue notification event.
  - *Response (201)*: `{ "reference_id": "CP-2026-00124", "status": "SUBMITTED", "created_at": "..." }`.

- **`GET /api/v1/complaints/{reference_id}`** (`FR-006`):
  - *Actor*: Authenticated (Scoped by RBAC/RLS).
  - *Response (200)*: Complete complaint details. Complainants receive public timeline; staff receive full timeline including internal remarks (`PRIV-002`).

---

### 4.3 Triage, Assignment & Forwarding
- **`POST /api/v1/complaints/{reference_id}/assign`** (`FR-008`):
  - *Actor*: `ROLE_DEPT_HEAD`, `ROLE_ADMIN` (Scoped to complaint's owning department).
  - *Request*: `{ "handler_id": "uuid-handler-1", "instructions": "Please inspect before noon." }`.
  - *Transaction Boundary*: Atomic update `status = ASSIGNED`, `handler_id = ...` + `action_history` entry + `ComplaintAssignedEvent`.
  - *Response (200)*: `{ "status": "ASSIGNED", "assigned_handler_id": "...", "updated_at": "..." }`.

- **`POST /api/v1/complaints/{reference_id}/forward`** (`FR-010`):
  - *Actor*: Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`.
  - *Request*: `{ "target_department_id": "uuid-dept-civil", "forwarding_reason": "Plumbing failure requires civil team excavation." }`.
  - *Validation*: Reason $\ge 15$ chars; target department must be active and different from current.
  - *Transaction Boundary*: Atomic update `department_id = target`, `handler_id = NULL`, `status = FORWARDED` + `action_history` entry + notification dispatch.
  - *Response (200)*: `{ "status": "FORWARDED", "owning_department_id": "...", "updated_at": "..." }`.

---

### 4.4 Lifecycle Progress, Escalation & Resolution
- **`POST /api/v1/complaints/{reference_id}/progress`** (`FR-011`):
  - *Actor*: Assigned `ROLE_HANDLER`.
  - *Request*: `{ "remarks": "Procured replacement valve; installation scheduled." }`.
  - *Response (200)*: `{ "status": "IN_PROGRESS", "updated_at": "..." }`.

- **`POST /api/v1/complaints/{reference_id}/escalate`** (`FR-013`):
  - *Actor*: Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`.
  - *Request*: `{ "escalation_reason": "Budget sanction required exceeding department limit.", "target_tier": 2 }`.
  - *Transaction Boundary*: Atomic update `is_escalated = TRUE`, `escalation_tier = ...`, `status = ESCALATED` + `action_history` + urgent alert.
  - *Response (200)*: `{ "status": "ESCALATED", "escalation_tier": 2, "updated_at": "..." }`.

- **`POST /api/v1/complaints/{reference_id}/resolve`** (`FR-015`, `FR-016`):
  - *Actor*: Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`.
  - *Request*:
    ```json
    {
      "resolution_summary": "Replaced cracked wooden planks with new hardwood bench top and varnished.",
      "proof_attachment_keys": ["complaints/resolved/proof-uuid.jpg"]
    }
    ```
  - *Validation*: Summary $\ge 20$c. If category requires proof (`requires_resolution_proof == true`), attachment is mandatory.
  - *Transaction Boundary*: Atomic update `status = RESOLVED`, `resolved_at = NOW` + insert `resolutions` record + `action_history` + verification prompt to student.
  - *Response (200)*: `{ "status": "RESOLVED", "resolved_at": "..." }`.

- **`POST /api/v1/complaints/{reference_id}/verify`** (`FR-017`):
  - *Actor*: Complainant (`ROLE_STUDENT` who filed ticket).
  - *Request*: `{ "satisfaction_rating": 5, "feedback": "Resolved promptly, thank you." }`.
  - *Response (200)*: `{ "status": "CLOSED", "closed_at": "..." }`.

- **`POST /api/v1/complaints/{reference_id}/dispute`** (`FR-018`):
  - *Actor*: Complainant (`ROLE_STUDENT` who filed ticket).
  - *Request*: `{ "dispute_reason": "Bench wobbles dangerously when seated on right corner." }`.
  - *Validation*: Within 5 business days of `resolved_at`; dispute reason $\ge 20$ chars.
  - *Transaction Boundary*: Atomic update `status = REOPENED`, `resolved_at = NULL` + insert dispute record + urgent reopening alert to Department Head.
  - *Response (200)*: `{ "status": "REOPENED", "reopened_count": 1 }`.

---

### 4.5 Supporting Evidence & Storage Ticket
- **`POST /api/v1/attachments/presign-upload`** (`FR-004`, `SEC-005`):
  - *Actor*: Authenticated User.
  - *Request*: `{ "filename": "leakage.jpg", "mime_type": "image/jpeg", "file_size_bytes": 2410290 }`.
  - *Validation*: Size $\le 5,242,880$ bytes (5 MB); MIME strictly in `['image/jpeg', 'image/png', 'application/pdf']`.
  - *Response (200)*:
    ```json
    {
      "upload_url": "https://storage.provider/bucket/complaints/temp/uuid.jpg?token=...",
      "storage_key": "complaints/temp/uuid.jpg",
      "expires_at": "2026-09-10T17:00:00Z"
    }
    ```

---

### 4.6 Notifications & Dashboards
- **`GET /api/v1/notifications`** (`FR-020`):
  - *Actor*: Authenticated User.
  - *Query*: `?unread_only=true&limit=20`.
  - *Response (200)*: Array of user notifications with unread count.
- **`PATCH /api/v1/notifications/{id}/read`**:
  - *Actor*: Notification recipient. Marks record read.

- **`GET /api/v1/dashboards/overview`** (`FR-021` - `FR-024`):
  - *Actor*: Authenticated User (Response dynamically structured per user's RBAC role):
    - `ROLE_STUDENT`: My complaints summary (active, pending, resolved counts).
    - `ROLE_HANDLER`: Assigned task queue, priority breakdowns, SLA risk warnings.
    - `ROLE_DEPT_HEAD`: Department unassigned triage count, handler workloads, SLA breach count.
    - `ROLE_MANAGEMENT`: Institution-wide volume, average resolution turnaround, recurring hotspot count.

- **`GET /api/v1/analytics/recurring-hotspots`** (`FR-025`, `ADR-010`):
  - *Actor*: `ROLE_DEPT_HEAD`, `ROLE_ADMIN`, `ROLE_MANAGEMENT`.
  - *Query*: `?window_days=30`.
  - *Response (200)*: Array of recurring clusters from SQL view (`recurring_complaint_clusters`).

---

## 5. Architecture Verification Summary

- [x] All 14 major domain use cases mapped to concrete RESTful endpoints.
- [x] Standardized error taxonomy defined with sanitized, machine-readable JSON structure.
- [x] Server-side validation rules specified for text bounds, MIME types, and role scopes.
- [x] Idempotency keys specified for all state-mutating requests to eliminate duplicate submissions.
- [x] Zero endpoint implementation code written in this phase.
