# Campus Plus — Phase 08-C: Student Complainant Dashboard Specification

**Document Classification:** Role Experience Specification  
**Component:** `src/presentation/components/dashboard/StudentDashboard.tsx`  
**Role Target:** `ROLE_STUDENT` (and `ROLE_FACULTY` complainants)  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Primary Objectives & Role Persona

Students require an empowering, transparent, and frictionless interface to submit grievances, monitor progress through public milestones, and verify or dispute resolution outcomes.

---

## 2. Key Interface Modules

### 2.1 Greeting & Primary Action Banner
- Prominent greeting acknowledging the student user.
- High-visibility primary action button: **"Submit New Grievance"** linking directly to `/complaints/new`.

### 2.2 Metrics Grid (Strictly Real Data)
Calculates real counts directly from the student's active complaints collection:
- **Total Filed:** All-time count of student complaints.
- **Active In-Progress:** Count of grievances actively being handled (`SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `REOPENED`).
- **Awaiting Verification:** Count of grievances in `RESOLVED` status requiring complainant verification.
- **Closed:** Grievances successfully verified and archived.

### 2.3 Resolution Verification Banner
When any grievance reaches `RESOLVED` status, a high-priority amber `AlertBanner` appears alerting the student that their grievance is pending resolution review, with a direct link to review and verify or dispute the resolution.

### 2.4 "My Active Complaints" Worklist Table
- Responsive semantic table displaying: `Tracking Code` badge (`CP-YYYY-XXXXX`), `Subject`, `Category`, `Status` pill, `Priority` badge, `Submitted Date`, and drill-down link to `/complaints/[id]`.
- Empty state with educational prompt and primary submission CTA when no grievances exist.
- Accessible loading skeletons while API data resolves.\n