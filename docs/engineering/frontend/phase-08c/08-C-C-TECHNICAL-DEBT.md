# Campus Plus — Phase 08-C: Stage 08-C-C Technical Debt & Gap Register

**Authority:** Principal Frontend Architect, QA Lead  
**Stage:** 08-C-C  
**Status:** ACTIVE REGISTER  

---

## 1. Technical Debt & API Gap Items

| Item ID | Category | Description | Stage Impact | Mitigation / Status |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-001** | Backend API | No `GET /api/v1/notifications` endpoint exists in Phase 06 backend. | Stage 08-C-C overlay `Drawer` is built and tested, but notification feed will display an honest empty status. | Drawer ready for API when ratified. |
| **GAP-002** | Backend API | No `POST /api/v1/notifications/read` endpoint exists. | Notification marking is not implemented. | Documented in Pre-Implementation Contract Reconciliation. |
| **GAP-008** | Intake Schema | Complaint submission intake schema does not bind attachments array to `complaints` table. | `FileUploader` handles client validation and presigning, but attachment reference persistence remains tracked as an API gap. | Presigned upload endpoint is fully tested and verified. |
| **DEBT-001** | Frontend Architecture | `Modal` and `Drawer` render directly into the DOM tree with fixed z-index overlays rather than `createPortal`. | Suitable for Next.js App Router root layout, but nested parent containers with CSS `transform` could theoretically affect positioning. | Evaluate `createPortal` in Stage 08-C-D if layout nesting requires it. |
