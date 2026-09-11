# Campus Plus — Phase 08-C-D: Backend Change Requests Register

**Authority:** Backend Integration Engineer, Principal Architect  
**Stage:** 08-C-D  
**Status:** ZERO BACKEND CHANGES MADE (STRICT IMMUTABILITY PRESERVED)  

---

## 1. Backend Immutability Compliance

Under the strict protocol directives:
- `src/domain/*` — **0 files modified**
- `src/application/*` — **0 files modified**
- `src/infrastructure/*` — **0 files modified**
- `migrations/*` — **0 files modified**

---

## 2. Documented Downstream Backend Change Requests

| BCR ID | Affected Contract | Problem Description | Proposed Solution | Why Frontend-Only Workaround is Incomplete | Downstream Phase Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BCR-08CD-01** | `GET /api/v1/notifications` | No backend API exists for in-app notification retrieval (`FR-020`). | Ratify route returning notifications for authenticated actor. | Frontend drawer renders honest empty state ("Pending API ratification"). | Phase 09 / Post-MVP |
| **BCR-08CD-02** | `POST /api/v1/complaints` intake schema | Intake schema `.strict()` rejects attachments array, preventing persistence of uploaded fileKeys. | Permit `attachments` array of `{ fileKey, fileSizeBytes, mimeType }` in intake schema. | Frontend validates upload and presigns, but cannot bind attachments to complaint record. | Stage 08-C-E (Complainant Experience) |
