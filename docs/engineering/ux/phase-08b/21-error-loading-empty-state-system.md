# Phase 08-B: Error, Loading & Empty State System Specification

**Document Identifier:** `21-error-loading-empty-state-system.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Scope:** Deterministic API error mapping, skeleton loading states, concurrency conflict modals, and empty state guides.

---

## 1. Deterministic API Error Taxonomy & UI Mapping

Campus Plus maps every standardized backend error envelope (`ApiErrorEnvelope`) directly to user-facing feedback:

| HTTP Status | Error Code | Backend Condition | UI Presentation & Actionable Guidance |
| :--- | :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Zod schema constraint violation | Form input highlighted red, inline error message rendered below field (`CMP-FEED-05`). |
| **401** | `UNAUTHORIZED` | Expired or missing Supabase JWT | Ephemeral toast: "Session expired. Redirecting to login..." -> redirect to `/login`. |
| **403** | `FORBIDDEN` | Role or department RLS check failed | Red callout: "Access Denied: You do not have authorization to perform this operation." |
| **404** | `NOT_FOUND` | Complaint ID or record does not exist | Full-page 404 card: "Complaint Not Found or Access Restricted. [Return to Dashboard]". |
| **409** | `CONFLICT` | Optimistic concurrency version mismatch | Modal: "Record Modified by Another User. Review changes before re-submitting." |
| **422** | `INVALID_TRANSITION`| FSM lifecycle violation | Modal/Banner: "This action cannot be performed because the complaint status has changed." |
| **500** | `INTERNAL_ERROR` | Unhandled server exception | Banner: "An unexpected error occurred. Error reference: [UUID]. Please contact IT." |

---

## 2. Skeleton Loading Patterns (`CMP-FEED-04`)

To prevent cumulative layout shift (CLS), every asynchronous view renders geometry-matching skeletons:
- **Card Skeleton:** `w-full h-[140px] rounded-lg bg-gray-100 animate-pulse border border-border`.
- **Table Skeleton:** 5 table rows with pulsing text blocks for tracking code, title, and badge.
- **Detail Skeleton:** Left column with headline and paragraph skeletons; right column with metadata pills.

---

## 3. Empty State Standards (`CMP-FEED-03`)

Empty states provide positive reassurance and clear next actions:
- **Student Dashboard Empty:** "No grievances filed. Campus Plus is ready whenever you encounter campus issues. [ Submit New Complaint ]".
- **Handler Worklist Empty:** "Worklist clear. All assigned complaints have been serviced. Good job!".
- **Triage Queue Empty:** "Triage queue clear. No unassigned complaints awaiting review."
