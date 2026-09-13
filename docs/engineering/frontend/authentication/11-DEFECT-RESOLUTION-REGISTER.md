# Campus Plus — Phase 08-C: Defect Resolution Register

**Document Classification:** Quality Assurance & Defect Remediation Log  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Date:** 2026-09-13  
**Status:** ALL DEFECTS RESOLVED  

---

## 1. Defect Log & Remediation History

| Defect ID | Severity | Component | Defect Description | Root Cause | Resolution Applied | Verification |
|---|---|---|---|---|---|---|
| **DEF-AUTH-001** | Medium | `SignInForm.tsx` | Password input used generic `id="password"` instead of institutional `id="campus-password"`. | Initial component scaffold used standard id. | Updated `id` to `"campus-password"` and matching `htmlFor`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-002** | Medium | `SignInForm.tsx` | Email input lacked explicit helper text `"Use your registered academic or administrative email address."`. | Helper text was present only in label. | Added dedicated `<p id="campus-email-helper">` with exact text and `aria-describedby`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-003** | Low | `SignInForm.tsx` | Email autocomplete was set to `"username"` instead of `"email"`. | Default browser autofill hint. | Changed to `autoComplete="email"`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-004** | Low | `SignInForm.tsx` | Placeholder was `"name@campus.edu"` instead of standard `"username@institution.edu"`. | Placeholder variation in initial mockup. | Standardized placeholder to `"username@institution.edu"`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-005** | Medium | `SignInForm.tsx` | Missing IT helpdesk footer text on login card. | IT helpdesk link was only in global footer. | Added card footer with `"Having trouble signing in? Contact your institutional IT department or grievance coordinator"`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-006** | Medium | `CampusPlusAuthShell.tsx` | Missing exact subtitle `"Campus Complaint & Grievance Resolution System"` and `"Official Grievance Resolution Portal"`. | Subtitle was shortened to tagline. | Added official title and subtitle in header. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-007** | Medium | `AuthBrandPanel.tsx` | Missing `"All lifecycle actions are immutably logged for audit integrity."` in security advisory. | Minor microcopy omission in brand panel text. | Added exact audit sentence to security notice. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-008** | Medium | `SignInForm.tsx` | Button style did not include CSS variable fallback format `var(--role-primary,#7FA8D9)`. | Direct inline hex color used. | Updated style attribute to reference `var(--role-primary,#7FA8D9)` and `var(--role-btn-text,#1E3A5F)`. | Verified in `login-ux.test.ts`. |
| **DEF-AUTH-009** | High | `security.ts` | `/register` was missing from `ALLOWED_INTERNAL_PREFIXES` in open redirect sanitization. | Original list only contained `/dashboard`, `/complaints`, `/login`. | Added `"/register"` to `ALLOWED_INTERNAL_PREFIXES`. | Verified in unit & integration tests. |

---

## 2. Regression Impact Assessment

- **Zero Breaking Changes:** No database schemas, migrations, or domain interfaces were altered.
- **API Contracts Preserved:** All 20 API endpoints retain exact request and response envelopes.
- **RLS & Security Invariants:** All RLS policies and OCC guarantees remain active.
