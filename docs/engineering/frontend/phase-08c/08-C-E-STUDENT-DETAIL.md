# Phase 08-C-E: Complaint Detail Hub & Lifecycle Actions Specification
**Component:** `ComplaintDetailPage` (`src/app/complaints/[id]/page.tsx`)  
**Route:** `/complaints/[id]`  
**Document Type:** Screen Engineering Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. Security & Route Validation
- Route parameter `id` is validated via `validateRouteId(id)` supporting UUIDv4 and `CP-YYYY-XXXXX` regex formats.
- Invalid identifiers immediately render an error boundary without sending requests to the backend.

## 2. Complainant Action Surface
- When complaint status is `RESOLVED`:
  - **Confirm Resolution:** Prompts confirmation modal; executes `POST /api/v1/complaints/[id]/verify`. Transitions grievance to `CLOSED`.
  - **Dispute & Reopen:** Prompts modal requiring dispute rationale; executes `POST /api/v1/complaints/[id]/dispute`. Transitions grievance to `REOPENED`.
- When complaint status is `SUBMITTED`:
  - **Cancel Grievance:** Prompts confirmation modal; executes `POST /api/v1/complaints/[id]/cancel`. Transitions grievance to `CANCELLED`.

## 3. Optimistic Concurrency Control (OCC) Handling
- Every mutation passes `expectedVersion: complaint.version`.
- On HTTP 409 Conflict, the application catches the error and opens `ConflictModal.tsx`, preventing silent data overwrite and offering immediate record refresh.
