# Phase 08-C: Centralized API Client & Route Integration Specification

**Document Identifier:** `07-API-INTEGRATION.md`  
**Classification:** API Integration Architecture  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Stage:** 08-C-B (Architecture Foundation, Tokens & API Client)  

---

## 1. Master API Operation Coverage (19 Operations)

Implemented in `src/presentation/services/apiClient.ts`:

| Operation Method | HTTP Route | Method | Idempotency Header? | Concurrency Token? | Target DTO / Return |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `getHealth()` | `/api/health` | `GET` | No | None | `{ status: string; timestamp: string }` |
| `getAuthMe()` | `/api/v1/auth/me` | `GET` | No | None | `AuthMeResponse` (`userId`, `role`, `departmentId`) |
| `submitComplaint(payload, key)` | `/api/v1/complaints` | `POST` | **YES** (`Idempotency-Key`) | None | `SubmitComplaintResult` |
| `listComplaints(params)` | `/api/v1/complaints` | `GET` | No | None | `{ items, pagination }` |
| `getComplaint(id)` | `/api/v1/complaints/[id]` | `GET` | No | None | `StudentComplaintDTO \| StaffComplaintDTO` |
| `getTimeline(id)` | `/api/v1/complaints/[id]/timeline` | `GET` | No | None | `TimelineItem[]` |
| `reviewComplaint(id, ver)` | `/api/v1/complaints/[id]/review` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `assignComplaint(id, payload)`| `/api/v1/complaints/[id]/assign` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `startProgress(id, ver)` | `/api/v1/complaints/[id]/progress`| `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `forwardComplaint(id, payload)`| `/api/v1/complaints/[id]/forward` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `escalateComplaint(id, payload)`| `/api/v1/complaints/[id]/escalate`| `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `resolveComplaint(id, payload)`| `/api/v1/complaints/[id]/resolve` | `POST` | No | **YES** (`expectedVersion`) | `{ message: string }` |
| `verifyResolution(id, ver)` | `/api/v1/complaints/[id]/verify` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `disputeResolution(id, payload)`| `/api/v1/complaints/[id]/dispute`| `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `closeComplaint(id, payload)` | `/api/v1/complaints/[id]/close` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `rejectComplaint(id, payload)`| `/api/v1/complaints/[id]/reject` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `duplicateComplaint(id, payload)`| `/api/v1/complaints/[id]/duplicate`| `POST`| No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `cancelComplaint(id, payload)`| `/api/v1/complaints/[id]/cancel` | `POST` | No | **YES** (`expectedVersion`) | `ComplaintDetail` |
| `presignUpload(payload)` | `/api/v1/attachments/presign-upload`| `POST`| No | None | `PresignUploadResult` |

---

## 2. Error Normalization (`ApiClientError`)

All HTTP non-2xx status codes and network faults are normalized into `ApiClientError`:
- `.isConflict` (`statusCode === 409`): Triggers the Concurrency Conflict Modal.
- `.isUnauthorized` (`statusCode === 401`): Prompts session re-authentication.
- `.isForbidden` (`statusCode === 403`): Displays permission denial callout.
- `.isValidation` (`statusCode === 400`): Maps field-level issues to form inputs.
- `.isNotFound` (`statusCode === 404`): Renders not-found error state.
