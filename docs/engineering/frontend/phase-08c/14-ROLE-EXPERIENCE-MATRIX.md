# Campus Plus — Phase 08-C: Role-to-Experience Matrix

**Document Classification:** Product Architecture Matrix  
**Authority:** Principal Frontend Architect, UX Engineering Lead  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Five Role Experience Summary

| Role | Primary Color Token | Navigation Scope | Dashboard Landing Module | Detail Hub Capabilities |
|---|---|---|---|---|
| `ROLE_STUDENT` | Blue (`#7FA8D9`) | Dashboard, Submit Grievance, My Complaints | `StudentDashboard`: Greeting, CTA, personal metrics, verification alert | Public timeline, Verify, Dispute, Cancel |
| `ROLE_HANDLER` | Emerald (`#7FC4B2`) | Dashboard, Complaints Directory | `HandlerDashboard`: Operational queue, assigned metrics, dual worklists | Assigned actions: Progress, Forward, Escalate, Resolve |
| `ROLE_DEPT_HEAD` | Purple (`#B39DDB`) | Dashboard, Complaints Directory | `HodDashboard`: Department oversight, triage queue, unassigned metrics | Full governance: Review, Assign, Reject, Duplicate, Escalate |
| `ROLE_MANAGEMENT`| Rose (`#E3A6AE`) | Dashboard, Complaints Directory | `ManagementDashboard`: Campus-wide KPIs, executive attention queue | Campus purview, Tier 3 intervention |
| `ROLE_ADMIN` | Slate (`#9FB4C7`) | Dashboard, Complaints Directory, System Tools | `AdminDashboard`: Liveness health card, role security directory | Full system oversight, audit trails |\n