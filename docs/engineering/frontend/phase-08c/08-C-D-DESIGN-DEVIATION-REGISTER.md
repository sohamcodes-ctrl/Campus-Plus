# Campus Plus — Phase 08-C-D: Design Deviation Register

**Authority:** Principal Frontend Architect, Design Systems Lead  
**Stage:** 08-C-D  
**Status:** RATIFIED  

---

## 1. Design Deviations Log

| Deviation ID | Specification Reference | Original Specification | Reconciled Implementation | Engineering Rationale | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEV-08CD-01** | Section 10 Login UX | Generic third-party SSO buttons | Pure institutional email/password credentials | Third-party SSO providers (Google/Azure) are not configured in staging Supabase environment. | **RATIFIED** |
| **DEV-08CD-02** | Section 15 Breadcrumbs | Complex dropdown breadcrumb trail | Clean linear breadcrumb with tracking code truncation | Prevents layout breakages on mobile and tablet viewports when long tracking codes are viewed. | **RATIFIED** |
| **DEV-08CD-03** | Section 27 Notifications | Speculative notification feeds | Honest empty drawer with API gap notice (GAP-001/002) | Zero fake data rule strictly prohibits mocking notifications when backend route does not exist. | **RATIFIED** |
