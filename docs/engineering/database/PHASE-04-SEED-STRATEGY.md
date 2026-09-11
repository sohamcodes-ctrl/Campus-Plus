# Phase 04 — Seed Strategy & Synthetic Test Fixtures

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Seed Strategy Approved  

---

## 1. Seed Tiers & Environment Segregation

Campus Plus divides seed data into three distinct, non-overlapping tiers:

```
[Tier 1: Reference Data Seed]
└── System Roles, Standard Categories, Initial Departments, Default SLA Policies
    (Applied across all environments: Test, Development, Staging, Production)

[Tier 2: Synthetic Development Seed]
└── Synthetic Personas (Student A, Student B, Staff, HOD, Management, Admin)
    (Applied ONLY in Local Development & Automated Test Suites)

[Tier 3: Production Master Initialization]
└── Verified Institutional Departments & Authorized Administrative Accounts
    (Applied during official institutional onboarding via secure admin portal)
```

---

## 2. Zero Real PII Rule

Per Phase 04 Rule 54:
- Real student names, real faculty phone numbers, actual student registration numbers, and live institutional credentials must NEVER be placed in seed files.
- All test identities are explicitly synthetic with domain `@synthetic.campusplus.internal` or `@test.edu`.

---

## 3. Standard Synthetic Personas Catalog

| Persona Identifier | System Role | Department Affiliation | Synthetic Email | Purpose in Testing |
| :--- | :--- | :--- | :--- | :--- |
| **Student A** | `ROLE_STUDENT` | None (Student) | `student.a@synthetic.campusplus.internal` | Primary complainant; verifies student isolation & ownership. |
| **Student B** | `ROLE_STUDENT` | None (Student) | `student.b@synthetic.campusplus.internal` | Secondary complainant; verifies cross-student IDOR blocking. |
| **Handler A1** | `ROLE_HANDLER` | Department of IT (`DEPT-IT`) | `handler.a1@synthetic.campusplus.internal` | Staff handler; tests worklists and task updates. |
| **Handler B1** | `ROLE_HANDLER` | Hostel & Facilities (`DEPT-HOSTEL`) | `handler.b1@synthetic.campusplus.internal` | Staff handler in different department; tests cross-department BOLA. |
| **HOD IT** | `ROLE_DEPT_HEAD`| Department of IT (`DEPT-IT`) | `hod.it@synthetic.campusplus.internal` | Department head; tests triage, delegation, and escalation. |
| **Management** | `ROLE_MANAGEMENT`| Institution-Wide | `management@synthetic.campusplus.internal` | Executive adjudicator; tests institutional dashboards. |
| **System Admin** | `ROLE_ADMIN` | Institution-Wide | `sysadmin@synthetic.campusplus.internal` | Operational admin; tests reference data and system configuration. |
