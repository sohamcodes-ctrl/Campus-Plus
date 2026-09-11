# Campus Plus — Phase 08-C-D: Technical Debt & Gap Register

**Authority:** Principal Frontend Architect, QA Lead  
**Stage:** 08-C-D  
**Status:** ACTIVE REGISTER  

---

## 1. Technical Debt & API Gap Items

| Item ID | Category | Description | Stage Impact | Recommended Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **GAP-001** | Backend API | No `GET /api/v1/notifications` endpoint exists. | Notification drawer displays honest empty state. | Implement notification retrieval route in Phase 09. |
| **GAP-002** | Backend API | No `POST /api/v1/notifications/read` endpoint exists. | Mark as read is not implemented. | Implement notification read route in Phase 09. |
| **DEBT-08CD-01** | Architecture | Modal & Drawer render with fixed CSS overlays rather than `createPortal`. | Suitable for Next.js App Router root layout without nested transforms. | Refactor to `createPortal` if layout transforms require it in future phases. |
| **DEBT-08CD-02** | Responsive | Breadcrumbs hide on very small mobile viewports (`hidden sm:flex`). | Minor UX tradeoff to save vertical screen space on 360px screens. | Retain TopBar title as primary context indicator on mobile. |
