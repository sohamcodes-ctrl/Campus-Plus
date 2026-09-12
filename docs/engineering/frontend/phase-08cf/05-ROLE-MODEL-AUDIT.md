# Phase 08-C-F: Authoritative Server Role Resolution & Role Matrix Audit

## 1. Scope & Objective
Verify that user roles are authoritatively resolved from the backend (`/api/v1/auth/me`), client-side tampering is impossible, and the five locked personas are correctly styled.

## 2. Authoritative Server Role Resolution Flow
1. User authenticates via Supabase Auth (`signInWithPassword`).
2. Supabase returns a JWT containing user identity.
3. Client immediately calls `GET /api/v1/auth/me` with Bearer token.
4. Server queries database `users` table and returns authenticated `AuthMeResponse`:
   ```json
   {
     "userId": "uuid",
     "email": "user@campus.edu",
     "role": "ROLE_STUDENT",
     "departmentId": "dept-uuid"
   }
   ```
5. `AuthContext` stores this verified actor context. Any mismatch immediately triggers `FORBIDDEN` state.

## 3. Locked Product Personas vs Domain Technical Roles
| Product Persona | Domain Role (`UserRole`) | Primary Accent | Button Text | Permitted Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `ROLE_STUDENT` | `#7FA8D9` | `#1E3A5F` | Own complaints only, Submit, Verify, Dispute, Cancel |
| **Faculty / Handler** | `ROLE_HANDLER` | `#7FC4B2` | `#1B4332` | Department queue, Assigned worklist, Start, Resolve, Forward, Escalate |
| **Department Head (HOD)** | `ROLE_DEPT_HEAD` | `#B39DDB` | `#311B92` | Department triage, Assign handlers, Review, Reject, Mark duplicate |
| **Director / Senior Authority** | `ROLE_ADMIN` | `#9FB4C7` | `#1C3144` | Campus-wide overview, System administration, Full audit inspection |
| **Institutional Management** | `ROLE_MANAGEMENT` | `#E3A6AE` | `#5C1D24` | Executive oversight, SLA performance, Hotspot analytics, Tier 3 escalations |

### Technical Role Preservation: `ROLE_FACULTY`
The technical domain role `ROLE_FACULTY` is strictly preserved in the codebase. When a faculty member files a personal grievance, `navigationConfig.ts` maps `ROLE_FACULTY` to the Complainant experience (identical permissions to `ROLE_STUDENT`), preventing privilege escalation.

## 4. Dynamic CSS Custom Properties
Upon role resolution, `applyRoleTheme(role)` injects CSS variables to document root:
- `--role-primary`
- `--role-secondary`
- `--role-accent`
- `--role-surface`
- `--role-text`
- `--role-btn-text`

## 5. Acceptance Status
- **Authoritative Resolution**: PASS.
- **Palette Integrity**: PASS (Exact hex values verified).
- **Role Isolation**: PASS.
