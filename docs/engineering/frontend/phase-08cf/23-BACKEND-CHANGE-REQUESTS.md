# Phase 08-C-F: Backend Change Requests (BCR)

| BCR ID | Priority | Target Subsystem | Description | Corresponding Gap |
| :--- | :--- | :--- | :--- | :--- |
| **BCR-001** | P1 | Complaint Intake API | Extend `POST /api/v1/complaints` schema to accept `attachmentIds: string[]` to atomically bind presigned uploaded files | GAP-003 |
| **BCR-002** | P2 | Notifications API | Implement `GET /api/v1/notifications` and `PATCH /api/v1/notifications/:id/read` | GAP-001 |
| **BCR-003** | P2 | Analytics API | Implement `GET /api/v1/analytics/overview` returning pre-aggregated institutional metrics | GAP-002 |
| **BCR-004** | P3 | Identity / Auth API | Implement `POST /api/v1/auth/register` with student ID registrar verification | GAP-004 |
| **BCR-005** | P3 | Department Directory | Implement `GET /api/v1/departments/:id/handlers` for HOD assignment dropdown | GAP-005 |
