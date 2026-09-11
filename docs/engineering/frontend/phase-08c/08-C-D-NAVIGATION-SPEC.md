# Campus Plus — Phase 08-C-D: Navigation Specification

**Authority:** UX Systems Engineer, Design Systems Lead  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Unified Navigation Configuration (`navigationConfig.ts`)

Navigation is declared in a single, authoritative typed structure and consumed across Desktop Sidebar and Mobile Bottom Navigation:

```typescript
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  allowedRoles: UserRoleType[];
  exact?: boolean;
  mobilePriority?: boolean;
}
```

### Authoritative Navigation Item Definitions:
1. **`nav-dashboard`**: Label "Dashboard", href `/dashboard`, allowed for all roles.
2. **`nav-new-complaint`**: Label "New Grievance", href `/complaints/new`, allowed for Complainants (`ROLE_STUDENT`, `ROLE_FACULTY`).
3. **`nav-triage`**: Label "Department Triage", href `/dashboard?tab=triage`, allowed for `ROLE_DEPT_HEAD`.
4. **`nav-worklist`**: Label "Assigned Worklist", href `/dashboard?tab=worklist`, allowed for `ROLE_HANDLER`, `ROLE_DEPT_HEAD`.
5. **`nav-escalations`**: Label "Escalation Queue", href `/dashboard?tab=escalations`, allowed for `ROLE_DEPT_HEAD`, `ROLE_ADMIN`, `ROLE_MANAGEMENT`.
6. **`nav-analytics`**: Label "Institutional Analytics", href `/dashboard?tab=analytics`, allowed for `ROLE_MANAGEMENT`, `ROLE_ADMIN`.
