# Phase 08-C-E: Complainant Timeline & Privacy Specification
**Component:** `TimelineFeed.tsx` (`src/presentation/components/domain/TimelineFeed.tsx`)  
**Document Type:** Privacy & Event Narrative Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. Public vs. Internal Event Segregation (INV-012)
- As mandated by invariant INV-012, students and faculty are restricted to **Public Timeline Events**:
  - `SUBMISSION`, `STATUS_CHANGE`, `ASSIGNMENT`, `PROGRESS`, `RESOLUTION`, `VERIFICATION`, `DISPUTE`, `CANCELLATION`.
- **Internal Staff Notes** and private handler deliberations are completely filtered out by backend use cases (`GetTimelineUseCase`) and never sent over the wire to complainant sessions.

## 2. UI Event Presentation
- Events are rendered in chronological order with humanized timestamps, status transition pills, and formatted action badges.
