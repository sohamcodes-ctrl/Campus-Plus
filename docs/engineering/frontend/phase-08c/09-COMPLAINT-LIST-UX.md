# Campus Plus — Phase 08-C: Complaints Directory & Search UX Specification

**Document Classification:** Frontend Engineering Specification  
**Route:** `/complaints`  
**Component:** `src/app/complaints/page.tsx`  
**Authority:** Senior Next.js Engineer, UX Lead  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Overview & Accessibility

The `/complaints` directory provides a unified, searchable, and filterable ledger of grievances scoped automatically by the user's role and department permissions:

- **Complainants (Students/Faculty):** Automatically restricted by backend RLS to their own complaints.
- **Handlers & HODs:** Scoped by backend RLS to complaints within their department jurisdiction.
- **Management & Admins:** Campus-wide visibility across all departments.

---

## 2. Filtering & Search Capabilities

1. **Text Search Bar:** Filters in real-time across complaint title, tracking code (`CP-YYYY-XXXXX`), and description.
2. **Status Dropdown Filter:** Supports filtering by all 13 domain states (`SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `RESOLVED`, `CLOSED`, `REOPENED`, `REJECTED`, `DUPLICATE`, `CANCELLED`).
3. **Priority Dropdown Filter:** Supports filtering by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
4. **Active Filter Counters & Reset Action:** Displays count of active filters with a one-click "Reset" button.

---

## 3. Responsive Grievance Table

- Displays `Tracking Code Badge`, `Subject Title`, `Category`, `Status Pill`, `Priority Badge`, `Created Date`, and `View Details` action link.
- Accessible empty states when zero records match the selected criteria.
- Loading skeletons during async pagination and data fetching.\n