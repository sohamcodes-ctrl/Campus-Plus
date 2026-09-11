# Campus Plus — Phase 08-C: Complaint Detail Hub & Lifecycle Mutation UX Specification

**Document Classification:** Frontend Engineering Specification  
**Route:** `/complaints/[id]`  
**Component:** `src/app/complaints/[id]/page.tsx`  
**Authority:** Principal Frontend Architect, Application Security Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Overview & Security Architecture

The Complaint Detail Hub provides the central workspace for reviewing grievance history, inspecting timeline milestones, and executing contextual lifecycle transitions.

### Security Guarantees:
1. **Identifier Validation:** `validateRouteId(id)` validates input against UUIDv4 and `CP-YYYY-XXXXX` tracking code patterns before issuing API requests.
2. **Privacy Boundary (INV-012):** Internal staff notes are strictly hidden from complainants. Complainants see only public timeline milestones.
3. **Optimistic Concurrency Control (OCC):** Every lifecycle mutation payload includes the entity's current `expectedVersion`. Stale mutations trigger HTTP 409 and render the accessible `ConflictModal`.

---

## 2. Contextual Action Modals

Based on the complaint's current status and the authenticated actor's permissions:
- **Review (HOD):** Prompts for review confirmation; transitions `SUBMITTED` -> `REVIEWED`.
- **Assign (HOD):** Prompts for handler ID and optional instructions; transitions to `ASSIGNED`.
- **Progress (Handler):** Prompts for progress remarks; transitions `ASSIGNED` -> `IN_PROGRESS`.
- **Forward (Staff):** Prompts for target department and mandatory rationale (>= 10 chars); transitions to `FORWARDED`.
- **Escalate (Staff):** Prompts for escalation tier and justification; transitions to `ESCALATED`.
- **Resolve (Handler/HOD):** Prompts for mandatory resolution summary (>= 20 chars); transitions to `RESOLVED`.
- **Verify (Student):** Prompts student to confirm resolution; transitions `RESOLVED` -> `CLOSED`.
- **Dispute (Student):** Prompts student for dispute reason; transitions `RESOLVED` -> `REOPENED`.
- **Reject (HOD):** Prompts for mandatory rejection justification; transitions to `REJECTED`.
- **Duplicate (HOD):** Prompts for duplicate master tracking code; transitions to `DUPLICATE`.
- **Cancel (Student):** Prompts student to confirm cancellation; transitions `SUBMITTED` -> `CANCELLED`.

---

## 3. 409 Conflict Recovery (`ConflictModal`)

When a mutation is rejected with HTTP 409, `ConflictModal` opens explaining that another staff member modified the record. The user is provided a single **"Reload Latest State"** CTA which safely synchronizes the UI with the latest ledger state.\n