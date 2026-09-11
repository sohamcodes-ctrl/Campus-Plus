# Authoritative Endpoint Inventory (18 Endpoints)

| # | HTTP Method | Route Path | Authorized Roles | Request Body | Success Code |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/complaints` | `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN` | `SubmitComplaintSchema` | `201 Created` |
| 2 | `GET` | `/api/v1/complaints` | All authenticated roles (scoped) | Query params (page, limit, filters) | `200 OK` |
| 3 | `GET` | `/api/v1/complaints/[id]` | Complainant, Owning Staff, Admin | None (UUID or Tracking Code) | `200 OK` |
| 4 | `GET` | `/api/v1/complaints/[id]/timeline` | Complainant, Owning Staff, Admin | None (UUID or Tracking Code) | `200 OK` |
| 5 | `POST` | `/api/v1/complaints/[id]/review` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ expectedVersion? }` | `200 OK` |
| 6 | `POST` | `/api/v1/complaints/[id]/assign` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ handlerId, reason?, expectedVersion? }` | `200 OK` |
| 7 | `POST` | `/api/v1/complaints/[id]/progress` | Assigned `ROLE_HANDLER`, `ROLE_ADMIN` | `{ expectedVersion? }` | `200 OK` |
| 8 | `POST` | `/api/v1/complaints/[id]/forward` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ targetDepartmentId, rationale, expectedVersion? }` | `200 OK` |
| 9 | `POST` | `/api/v1/complaints/[id]/escalate` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ targetTier, reason, expectedVersion? }` | `200 OK` |
| 10 | `POST` | `/api/v1/complaints/[id]/resolve` | Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ resolutionSummary, proofAttachmentKeys?, expectedVersion? }` | `200 OK` |
| 11 | `POST` | `/api/v1/complaints/[id]/verify` | Complainant `ROLE_STUDENT`, `ROLE_FACULTY` | `{ expectedVersion? }` | `200 OK` |
| 12 | `POST` | `/api/v1/complaints/[id]/dispute` | Complainant `ROLE_STUDENT`, `ROLE_FACULTY` | `{ disputeReason, expectedVersion? }` | `200 OK` |
| 13 | `POST` | `/api/v1/complaints/[id]/close` | `ROLE_ADMIN`, `ROLE_MANAGEMENT` | `{ reason, expectedVersion? }` | `200 OK` |
| 14 | `POST` | `/api/v1/complaints/[id]/reject` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ reason, expectedVersion? }` | `200 OK` |
| 15 | `POST` | `/api/v1/complaints/[id]/duplicate`| `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `{ originalRefId, expectedVersion? }` | `200 OK` |
| 16 | `POST` | `/api/v1/complaints/[id]/cancel` | Complainant `ROLE_STUDENT`, `ROLE_FACULTY` | `{ reason, expectedVersion? }` | `200 OK` |
| 17 | `POST` | `/api/v1/attachments/presign-upload`| All authenticated roles | `{ filename, mimeType, fileSizeBytes }` | `200 OK` |
| 18 | `GET` | `/api/v1/auth/me` | All authenticated roles | None | `200 OK` |
