# Campus Plus — Phase 08-C: Department Head Governance Dashboard Specification

**Document Classification:** Role Experience Specification  
**Component:** `src/presentation/components/dashboard/HodDashboard.tsx`  
**Role Target:** `ROLE_DEPT_HEAD`  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Primary Objectives & Role Persona

Department Heads (HODs) govern department complaints, conduct initial triage/review, assign handlers, monitor SLAs, and handle Tier 2 escalations.

---

## 2. Key Interface Modules

### 2.1 Governance Header
- Identifies department scope, authority level, and active oversight status.

### 2.2 Oversight Metrics
- **Department Total:** Total active complaints under department jurisdiction.
- **Unassigned Triage:** Grievances in `SUBMITTED` or `REVIEWED` status awaiting assignment.
- **In Progress:** Actively handled complaints.
- **Escalated (Tier 2):** Complaints escalated to the Department Head for intervention.

### 2.3 Department Triage & Assignment Queue Table
- Lists grievances requiring triage, assignment, or supervision.
- Provides immediate link to `/complaints/[id]` where the HOD can execute `Review`, `Assign`, `Reject`, `Duplicate`, or `Escalate` actions.

### 2.4 Honest Analytics Policy
- In compliance with institutional integrity standards, the dashboard features an honest **"Analytics Service Pending Phase 08 Aggregation Endpoint"** card. No fabricated charts, fake SLA adherence percentages, or synthetic satisfaction numbers are displayed.\n