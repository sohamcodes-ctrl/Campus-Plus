# Phase 08-C-E: Complaints Directory & Ledger Specification
**Component:** `ComplaintsPage` (`src/app/complaints/page.tsx`)  
**Route:** `/complaints`  
**Document Type:** Screen Engineering Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. Screen Architecture

The Complaints Directory provides comprehensive search and multi-dimensional filtering across all grievances accessible to the current user:
- **Role-Aware Header:**
  - For complainants (`ROLE_STUDENT`, `ROLE_FACULTY`): Displays `"My Complaints Ledger"` with CTA `"+ Submit a Complaint"`.
  - For staff/management: Displays `"Grievance Directory & Records"`.
- **Multi-Filter Toolbar:**
  - Search Input: Real-time case-insensitive match against `trackingCode`, `title`, and `categoryId`.
  - Category Filter: All Categories, Network & Campus Wi-Fi, Hostel Maintenance, Classroom & Lab Infrastructure, Academic & Evaluation, Campus Sanitation, Other.
  - Status Filter: All Statuses or individual lifecycle state.
  - Priority Filter: All Priorities, Low, Medium, High, Urgent.
  - Reset Filters button: Appears dynamically when any filter is active.
- **Responsive Layout:**
  - Desktop: Full HTML `<table>` with semantic `<thead>` and `<tbody>`.
  - Mobile: Card-based listing with clear status badges and detail navigation buttons.
