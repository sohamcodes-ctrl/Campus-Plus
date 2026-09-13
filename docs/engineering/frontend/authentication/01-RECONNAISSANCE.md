# Campus Plus — Phase 08-C: Authentication Experience Reconnaissance & Baseline Audit

**Document Classification:** Architecture Baseline & Forensic Reconnaissance  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Target:** `/login` & `/register` Public Gateway  
**Date:** 2026-09-13  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

This document establishes the forensic baseline and reconnaissance findings for the Campus Plus authentication and enrollment experience. Prior to this implementation, the authentication system featured a rudimentary single-persona login card that lacked institutional stature, had no explicit role-awareness, failed to convey campus governance commitments, and presented potential UX confusion regarding user privilege levels.

The target was to implement a unified, institutional-grade authentication experience supporting **five operational personas** (Student, Faculty / Complaint Handler, HOD, Director / Senior Authority, Institutional Management) across both `/login` (Sign In) and `/register` (Account Enrollment & Institutional Provisioning).

---

## 2. Source of Truth Hierarchy & Invariant Rules

All architectural and UX decisions strictly follow the non-negotiable hierarchy of truth:

1. **Existing Approved Requirements:** (Phase 01 SRS, Phase 02 Architecture, ADRs)
2. **Domain & Application Contracts:** (`src/domain/complaint/`, `src/application/use-cases/`)
3. **Database & API Contracts:** (`migrations/`, `src/app/api/`)
4. **Authentication / RBAC / RLS Enforcement:** (`src/presentation/context/AuthContext.tsx`, `AuthorizationPolicy.ts`, Postgres RLS)
5. **Verified Frontend Architecture:** (Next.js App Router 16.3.4, React 19, Tailwind CSS v4)
6. **Design System & Visual Language:** Locked 5-role palettes and institutional typography
7. **Prompt / Implementation UX Decisions:** Subordinate to all higher layers.

### 2.1 Critical Invariant: Persona Selection is NOT Authorization
A user selecting an account type (e.g. "Director" or "HOD") during login is strictly a **UI/UX intent hint** to tailor the welcoming context and provide role-specific guidance. **It is never an authorization mechanism.** Authorization is 100% governed by the backend server session verified via `GET /api/v1/auth/me`. If a student attempts to log in with the "Director" persona selected, their authentic server role (`ROLE_STUDENT`) will be verified; an institutional role-mismatch banner informs them of their actual privileges and directs them to their authorized workspace.

### 2.2 Critical Invariant: Zero Fake Accounts & Zero Fake Writes
Public users cannot self-register into privileged governance roles (Complaint Handler, HOD, Director, Management). Allowing unrestricted self-registration for staff or administrative accounts would violate institutional security and access control integrity. Self-service registration is strictly limited to Students (`ROLE_STUDENT`). Privileged roles display official institutional IAM provisioning instructions with contact details for university administration.

---

## 3. Forensic Codebase Inspection

### 3.1 Existing Authentication Infrastructure
- **Auth Context:** `src/presentation/context/AuthContext.tsx` handles Supabase session management, JWT tokens, actor hydration, and sign-out.
- **Actor Hydration Endpoint:** `GET /api/v1/auth/me` returns the authenticated `Actor` (`id`, `role`, `departmentId`, `email`).
- **Security Utilities:** `src/presentation/utils/security.ts` sanitizes open redirects, validating prefixes (`/dashboard`, `/complaints`, `/login`, `/register`).
- **Role Constants:** `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`.

### 3.2 Route Baseline & Inventory
| Route | Access Level | Primary Component | Purpose |
|---|---|---|---|
| `/login` | Public (Unauthenticated) | `src/app/login/page.tsx` | 5-persona sign-in with server-authoritative role verification |
| `/register` | Public (Unauthenticated) | `src/app/register/page.tsx` | Student self-enrollment intake & staff IAM provisioning guidance |
| `/dashboard` | Authenticated (Role-scoped) | `src/app/dashboard/page.tsx` | Role-aware dashboard routing |

---

## 4. Locked Role Palettes (Design System Tokens)

The authentication system strictly enforces the locked color palettes defined in Phase 08-C:

| Persona | Technical Roles | Primary Accent | Secondary | Background/Accent | Action Text |
|---|---|---|---|---|---|
| **Student** | `ROLE_STUDENT` | `#7FA8D9` | `#B8D0EC` | `#EAF2FB` | `#1E3A5F` |
| **Faculty / Handler** | `ROLE_FACULTY`, `ROLE_HANDLER` | `#7FC4B2` | `#B7E0D3` | `#E9F6F1` | `#2E4A42` |
| **HOD** | `ROLE_DEPT_HEAD` | `#B39DDB` | `#D6C6EC` | `#F3EDFA` | `#43395A` |
| **Director** | `ROLE_ADMIN` | `#9FB4C7` | `#C7D5E0` | `#EEF3F7` | `#37495A` |
| **Management** | `ROLE_MANAGEMENT` | `#E3A6AE` | `#F0C9CE` | `#FBEDEF` | `#5C333A` |

---

## 5. Identified Gaps Prior to Implementation

1. **Lack of Role Context in Gateway:** Prior login did not allow users to select their operational context, leading to cognitive friction.
2. **Missing Brand Authority:** The login screen lacked institutional governance guarantees (Role-Scoped Privacy, Verifiable Closure, Tamper-Evident Audit).
3. **No Dedicated Provisioning Guidance:** Staff attempting to register had no clear pathway or explanation of institutional IAM controls.
4. **Microcopy & Semantic Inconsistencies:** Previous input fields lacked accessible autocomplete and structured descriptive IDs.

All identified gaps were reconciled in this phase with zero backend breaking changes and 100% test preservation.
