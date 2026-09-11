# DTO Projections & Data Minimization (INV-012)

## 1. Principle of Data Minimization

Raw domain entities and database tables are NEVER directly serialized or returned to clients over the HTTP API boundary.
All outputs are projected through role-scoped Data Transfer Objects (DTOs) in `src/presentation/dtos/complaintDTOs.ts`.

## 2. Role-Scoped Projections

```
                         Domain Complaint Aggregate
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             Actor is Student?                  Actor is Staff/Admin?
                    │                                 │
                    ▼                                 ▼
          StudentComplaintDTO                  StaffComplaintDTO
   - id, trackingCode                   - All StudentComplaintDTO fields
   - title, description                 - complainantId
   - categoryId, departmentId           - assignedHandlerId
   - status, priorities                 - escalationTier
   - timestamps (created, updated)      - assignments (handler, dates)
   - resolution (summary, verified)     - forwards (history & rationale)
   * (NO handler personal notes)        - escalations (history & tier)
   * (NO internal staff assignments)
```

## 3. Timeline Privacy Projection (INV-012)

The timeline endpoint (`GET /api/v1/complaints/[id]/timeline`) implements view-filtering based on actor authorization:

- **Students**: Receive public lifecycle transition events (e.g. `COMPLAINT_SUBMITTED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`). Internal administrative remarks and private triage commentary are sanitized or stripped to prevent exposure of sensitive internal operations.
- **Staff / Administrators**: Receive complete operational audit entries from `action_history` including verbatim internal remarks, reassignment reasons, and escalation triggers.
