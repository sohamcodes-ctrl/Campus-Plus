# Campus Plus — Phase 08-C: Audit Timeline & Public History UX Specification

**Document Classification:** Frontend Engineering Specification  
**Component:** `src/presentation/components/domain/TimelineFeed.tsx`  
**Authority:** UX Lead, Security Architect  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Public vs Internal Timeline Segregation

In accordance with institutional privacy rules (PRIV-001, INV-012):
- **Complainant View:** Students see only public workflow milestones (Created, Reviewed, Assigned, In Progress, Forwarded, Escalated, Resolved, Closed, Reopened). Internal staff investigation notes are never rendered.
- **Staff View:** Handlers, HODs, Management, and Admins see full audit history, including internal operational remarks, forwarding rationales, and escalation reasons.

---

## 2. Visual Representation

- **Vertical Chronological Feed:** Distinct icons and color tokens for each transition type.
- **Actor Role Attribution:** Clear badges indicating the authority level of the actor executing the transition.
- **Timestamp Formatting:** Localized, accessible timestamps with relative age indicators.
- **Status Progression:** Clear "Previous Status -> New Status" indicators.\n