# Phase 08-C-F: Defect Register

| Defect ID | Description | Severity | Origin | Resolution Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | Root route displayed Phase 03 foundation scaffold instead of institutional landing page | High | Phase 03 legacy | RESOLVED |
| **DEF-002** | Login page contained hardcoded staging credentials and test user helpers | High | Phase 08-C-D | RESOLVED |
| **DEF-003** | Sign-out triggered `router.replace('/login?redirect=/dashboard')` causing redirect loop | Medium | Phase 08-C-D | RESOLVED |
| **DEF-004** | Dashboards lacked mobile card layouts, causing table overflow on screens <768px | Medium | Phase 08-C-E | RESOLVED |
| **DEF-005** | Landing page tracking code `CP-2026-08412` lacked explicit sample badge | Low | Rule 5 Check | RESOLVED |
| **DEF-006** | Registration route (`/register`) returned 404 | Medium | Missing route | RESOLVED |
