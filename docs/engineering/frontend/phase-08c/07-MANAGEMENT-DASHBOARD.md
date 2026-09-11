# Campus Plus — Phase 08-C: Institutional Management Dashboard Specification

**Document Classification:** Role Experience Specification  
**Component:** `src/presentation/components/dashboard/ManagementDashboard.tsx`  
**Role Target:** `ROLE_MANAGEMENT`  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Primary Objectives & Role Persona

Institutional Management (Principals, Deans, Executive Directors) require campus-wide oversight, Tier 3 escalation intervention, and systemic hotspot identification across all academic and infrastructure departments.

---

## 2. Key Interface Modules

### 2.1 Executive Governance Banner
- Displays campus-wide purview badge, institutional authority indicator, and governance role.

### 2.2 Campus-Wide KPI Counters
- **Campus Total:** Total active complaints across all campus departments.
- **Critical / Escalated:** Tier 3 escalations and urgent-priority grievances requiring executive attention.
- **Under Investigation:** Active complaints across the institution.
- **Awaiting Verification:** Campus complaints currently pending student resolution verification.

### 2.3 Executive Attention Queue
- Prioritized table filtering for `ESCALATED` or `URGENT` grievances campus-wide.
- Enables direct intervention or supervision via `/complaints/[id]`.

### 2.4 Systemic Cluster Analytics Notice
- Displays an honest architectural placeholder for recurrence detection: **"Cluster Analytics Service Pending Backend Integration"**, noting that deterministic clustering over `recurring_complaint_clusters` will be enabled once the backend analytics route is ratified.\n