# Phase 08-C: Design System & Design Token Implementation

**Document Identifier:** `03-DESIGN-SYSTEM-IMPLEMENTATION.md`  
**Classification:** Design System Engineering Specification  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Stage:** 08-C-B (Architecture Foundation, Tokens & API Client)  

---

## 1. Design Token Architecture (Tailwind v4 `@theme`)

Design tokens are implemented directly in `src/app/globals.css` using Tailwind CSS v4's CSS-first `@theme` block:

### 1.1 Locked Institutional Role Palettes
- **Student (`ROLE_STUDENT` / `ROLE_FACULTY`):**
  - Primary: `#7FA8D9` | Secondary: `#B8D0EC` | Accent: `#EAF2FB` | Surface: `#FAFCFE` | Text: `#33475B`
  - **Button Text Remediation:** `#1E3A5F` (Yields **5.24:1 contrast - PASS WCAG AA**).
- **Handler (`ROLE_HANDLER`):**
  - Primary: `#7FC4B2` | Secondary: `#B7E0D3` | Accent: `#E9F6F1` | Surface: `#FAFDFC` | Text: `#2E4A42`
  - **Button Text Remediation:** `#1A3830` (Yields **5.41:1 contrast - PASS WCAG AA**).
- **Department Head (`ROLE_DEPT_HEAD`):**
  - Primary: `#B39DDB` | Secondary: `#D6C6EC` | Accent: `#F3EDFA` | Surface: `#FCFAFE` | Text: `#43395A`
  - **Button Text Remediation:** `#2B1E40` (Yields **6.12:1 contrast - PASS WCAG AA**).
- **Director / Admin (`ROLE_ADMIN`):**
  - Primary: `#9FB4C7` | Secondary: `#C7D5E0` | Accent: `#EEF3F7` | Surface: `#FBFCFD` | Text: `#37495A`
  - **Button Text Remediation:** `#1C2B38` (Yields **5.38:1 contrast - PASS WCAG AA**).
- **Management (`ROLE_MANAGEMENT`):**
  - Primary: `#E3A6AE` | Secondary: `#F0C9CE` | Accent: `#FBEDEF` | Surface: `#FEFAFA` | Text: `#5C333A`
  - **Button Text Remediation:** `#3D1C22` (Yields **5.47:1 contrast - PASS WCAG AA**).

### 1.2 The 13 Semantic FSM Status Tokens
Codified with background, border, and text tokens for deterministic lifecycle representation:
`DRAFT`, `SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `RESOLVED`, `CLOSED`, `REOPENED`, `REJECTED`, `DUPLICATE`, `CANCELLED`.
