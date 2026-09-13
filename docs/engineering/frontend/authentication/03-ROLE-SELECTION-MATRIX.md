# Campus Plus — Phase 08-C: Role Selection Matrix & Identity Governance

**Document Classification:** Role Governance Specification  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Target:** 5 Operational Personas & Mapping to Domain Roles  
**Date:** 2026-09-13  
**Status:** COMPLETE & VERIFIED  

---

## 1. Five Operational Personas Overview

The Campus Plus authentication experience provides tailored visual identity, microcopy, and operational expectations for five distinct user types.

| Persona ID | Public Display Label | Description & Scope | Associated Technical Roles | Allowed Self-Registration? |
|---|---|---|---|---|
| `student` | **Student** | Submit and track campus complaints | `ROLE_STUDENT` | **YES** (Self-Service Intake Form) |
| `handler` | **Faculty / Complaint Handler** | Review, manage, and resolve complaints | `ROLE_FACULTY`, `ROLE_HANDLER` | **NO** (Registrar Provisioned) |
| `hod` | **HOD** | Department oversight & escalation triage | `ROLE_DEPT_HEAD` | **NO** (Registrar / Dean Provisioned) |
| `director` | **Director / Senior Authority** | Institutional governance & oversight | `ROLE_ADMIN` | **NO** (Directorate Issued) |
| `management` | **Institutional Management** | Executive KPI monitoring & accountability | `ROLE_MANAGEMENT` | **NO** (Board Authorized) |

---

## 2. Server-Authoritative Identity Rule (Non-Negotiable)

```
                       User Selects Persona in UI
                                  │
                                  ▼
                     User Submits Credentials
                                  │
                                  ▼
                      POST /auth/v1/token (JWT)
                                  │
                                  ▼
                        GET /api/v1/auth/me
                                  │
                                  ▼
                  Authoritative Actor Role Returned
                                  │
               ┌──────────────────┴──────────────────┐
               ▼                                     ▼
        Role Matches Persona                Role Mismatches Persona
               │                                     │
               ▼                                     ▼
      Redirect to /dashboard            Display Institutional Role Notice
                                        (Prevent Silent Priv Escalation)
                                                     │
                                                     ▼
                                        User Proceeds to Authorized Role
```

### 2.1 Mismatch Detection & UI Handling
When an authenticated user's authoritative role does not match the selected persona:
1. An amber `AlertBanner` of type `warning` is rendered at the top of the sign-in form.
2. The user is informed: `"Your account is registered as a [Server Role] account. Privileges are strictly governed by your server-authoritative credentials."`
3. A direct action button is provided: `"Continue to [Server Role] Workspace →"`.
4. This completely eliminates any risk of client-side privilege escalation or confusion regarding institutional permissions.

---

## 3. Keyboard Navigation Specification

The `RoleSelector` component supports full WCAG 2.1 AA keyboard navigation:
- `Tab` / `Shift+Tab`: Focuses into and out of the radio group.
- `ArrowRight` / `ArrowDown`: Moves selection to the next persona in the sequence.
- `ArrowLeft` / `ArrowUp`: Moves selection to the previous persona in the sequence.
- `Home`: Jumps selection immediately to the first persona (`student`).
- `End`: Jumps selection immediately to the last persona (`management`).
- `Space` / `Enter`: Activates and selects the focused persona card.
