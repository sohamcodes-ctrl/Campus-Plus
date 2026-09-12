# Phase 08-C-E: Student Dashboard Component Specification
**Component:** `StudentDashboard.tsx` (`src/presentation/components/dashboard/StudentDashboard.tsx`)  
**Route:** `/dashboard` (when authenticated as `ROLE_STUDENT` or `ROLE_FACULTY`)  
**Document Type:** Component Engineering Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. Component Overview

`StudentDashboard.tsx` serves as the primary daily workspace for campus complainants. It presents:
1. **Authenticated Identity & Greeting:** Natural greeting displaying `Student Grievance Workspace`, user email (`user?.email`), and role badge (`Complainant` or `Faculty Complainant`).
2. **Primary Action CTA:** A high-visibility `"Submit a Complaint"` button visible without scrolling.
3. **Action Required Queue:** Prominently alerts the student to any grievance in `RESOLVED` status requiring verification or dispute.
4. **Authoritative Metric Counters:** Four real API-computed metrics:
   - Total Filed (`complaints.length`)
   - Active In-Progress (`SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `REOPENED`)
   - Awaiting Verification (`RESOLVED`)
   - Closed (`CLOSED`)
5. **My Active Complaints Worklist:**
   - Desktop view: High-density data table with columns for Tracking Code, Subject, Category, Status, Priority, Submitted Date, and Action link.
   - Mobile view (`md:hidden`): Responsive cards optimized for small viewports with 44px tap targets.
6. **Welcoming Empty State:** Rendered when no complaints exist, guiding the user to file their first grievance.
7. **Honest Milestone Activity Note:** Discloses that audit timeline history is recorded per grievance on each complaint's detail page.
