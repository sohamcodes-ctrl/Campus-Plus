# Phase 08-A: Testable UX Acceptance Criteria (Given / When / Then)

**Document Identifier:** `23-ux-acceptance-criteria.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Defines unambiguous, testable acceptance criteria using Gherkin format for every core user interaction across the system.

---

## 1. Complaint Intake & Submission Flow

### Scenario 1.1: Successful Grievance Submission with Attachments
```gherkin
Given a student is authenticated with role "ROLE_STUDENT"
  And the student is on the submission screen "/complaints/new" (STU-002)
When the student inputs:
  | Field        | Value                                                |
  | Title        | "Broken water cooler tap leaking on 3rd floor"       |
  | Category     | "Campus Sanitation"                                  |
  | Department   | "Civil Maintenance"                                  |
  | Campus       | "Main Campus"                                        |
  | Building     | "Mechanical Building"                                |
  | Floor/Room   | "Floor 3, Near Room 304"                             |
  | Description  | "Water cooler pipe valve is broken and leaking continuously creating a slipping hazard." |
  | Priority     | "HIGH"                                               |
  And the student uploads an evidence photo "leakage.jpg" (2.1 MB)
  And the student confirms and clicks "Confirm & Submit Complaint"
Then the system creates a complaint in status "SUBMITTED"
  And assigns a unique tracking code matching regex "^CP-\d{4}-\d{5}$" (e.g. "CP-2026-00104")
  And displays the Success Modal (STU-002-S) showing the tracking code with a "Copy Reference" button
  And appends a "SUBMISSION" event to the immutable action history
  And increments the unread triage count for Civil Maintenance Department Head.
```

### Scenario 1.2: Client Validation Rejection on Truncated Title or Description
```gherkin
Given a student is on "/complaints/new"
When the student enters a title with 8 characters (e.g. "Leak tap")
  Or enters a description with 20 characters (e.g. "Tap is leaking here.")
  And attempts to click "Confirm & Submit Complaint"
Then the form submission is blocked client-side
  And zero network requests are dispatched to "/api/v1/complaints"
  And the offending inputs display red validation borders
  And an inline error message states: "Title must be between 10 and 120 characters"
  And focus is automatically moved to the first invalid field.
```

---

## 2. Handler Assignment & Remediation Flow

### Scenario 2.1: Department Head Assigns Complaint to Department Technician
```gherkin
Given a Department Head of "Electrical Maintenance" is logged in (HOD-001)
  And an unassigned complaint "CP-2026-00088" exists in status "REVIEWED"
When the Department Head opens the assignment modal (HOD-002)
  And selects technician "Alex Rivera" who belongs to "Electrical Maintenance"
  And clicks "Confirm Assignment"
Then the complaint transitions to status "ASSIGNED"
  And "assigned_handler_id" is set to Alex Rivera's user ID
  And an "ASSIGNMENT" action history record is appended recording assignor and assignee
  And technician Alex Rivera receives an in-app task notification
  And the complaint appears in Alex Rivera's worklist on "/dashboard" (FAC-001).
```

### Scenario 2.2: Cross-Department Handler Assignment Blocked (INV-007)
```gherkin
Given a Department Head of "Electrical Maintenance"
When the Department Head attempts to assign a technician from "Computer Engineering"
Then the system rejects the assignment with HTTP 403 (DepartmentScopeViolationError)
  And the UI displays an alert: "Technician does not belong to the owning department"
  And the complaint remains unassigned.
```

---

## 3. Resolution, Verification & Dispute Flow

### Scenario 3.1: Handler Submits Resolution with Required Proof
```gherkin
Given a complaint is in status "IN_PROGRESS" in category "Infrastructure"
  And technician "Alex Rivera" is the assigned handler
When Alex opens the resolution dialog (FAC-005)
  And enters a resolution summary of 35 characters: "Replaced damaged circuit breaker and tested voltage."
  And uploads a photo proof "breaker_fixed.jpg" (1.4 MB)
  And clicks "Submit Resolution"
Then the complaint status transitions to "RESOLVED"
  And "resolved_at" is stamped with current UTC time
  And a "RESOLVE" event is appended to the audit trail
  And an in-app notification is sent to the complainant student
  And the student detail view (STU-003) enables the "Verify & Close" and "Dispute" action buttons.
```

### Scenario 3.2: Complainant Student Verifies Resolution and Closes Complaint
```gherkin
Given a complaint is in status "RESOLVED"
  And the student viewing the complaint is the original submitter
When the student clicks "Verify & Close Complaint" (STU-004)
  And confirms the action in the permanent closure dialog
Then the complaint status transitions to "CLOSED"
  And "closed_at" is stamped with current timestamp
  And the complaint status badge updates to neutral slate "CLOSED"
  And all interactive action buttons on the complaint detail are permanently disabled
  And the ticket cannot be mutated further by any user (INV-003).
```

### Scenario 3.3: Complainant Student Disputes Inadequate Resolution within 5 Days
```gherkin
Given a complaint was transitioned to "RESOLVED" 2 business days ago
  And the original student complainant inspects the physical location and finds the issue unresolved
When the student clicks "Dispute Resolution" on STU-003
  And enters a mandatory dispute explanation (>=10 chars): "Circuit breaker still trips when projector is turned on."
  And confirms the dispute
Then the complaint status transitions to "REOPENED"
  And a "REOPEN" audit entry is appended with the dispute rationale
  And an urgent alert is dispatched to the Department Head and Assigned Handler
  And the complaint re-enters the active departmental remediation worklist.
```

---

## 4. Cross-Department Forwarding Flow

### Scenario 4.1: Forwarding Misdirected Complaint with Rationale
```gherkin
Given a complaint is in status "ASSIGNED" in "Hostel Office"
When the handler identifies the issue is plumbing and clicks "Forward Complaint" (FAC-003)
  And selects target department "Civil Maintenance"
  And inputs rationale: "Leak originates from main ceiling conduit requiring civil masonry."
  And confirms transfer
Then the complaint transitions to status "FORWARDED"
  And "department_id" updates to "Civil Maintenance"
  And "assigned_handler_id" is reset to NULL
  And an audit record captures previous department, new department, and rationale
  And Civil Maintenance triage queue displays the incoming forwarded complaint.
```

### Scenario 4.2: Anti-Deadlock Automatic Elevation to Management (INV-010)
```gherkin
Given a complaint has already been forwarded 2 times
When an authority attempts a 3rd forward transfer
Then the anti-deadlock rule triggers automatically
  And the complaint transitions directly to "ESCALATED"
  And "escalation_tier" is elevated to "TIER_3_MANAGEMENT"
  And direct lateral forwarding is blocked
  And an alert is sent to Central Management for executive deadlock intervention.
```

---

## 5. Security, Concurrency & Privacy Flow

### Scenario 5.1: Unauthorized Student Access Blocked (BOLA Defense)
```gherkin
Given Student A is logged in
When Student A manually navigates to "/complaints/CP-2026-00099" (owned by Student B)
Then the system returns HTTP 403 Forbidden
  And renders the standardized "Complaint Not Found or Inaccessible" screen
  And reveals zero information regarding Student B's name, category, or department.
```

### Scenario 5.2: Optimistic Concurrency Collision Recovery
```gherkin
Given Handler A and HOD B both open complaint "CP-2026-00050" (Version 2)
When HOD B reassigns the ticket to a new technician (advancing DB to Version 3)
  And Handler A subsequently attempts to click "Start Progress" (sending expectedVersion: 2)
Then the server rejects the request with HTTP 409 Conflict (StaleVersionConflictError)
  And Handler A's browser renders the Concurrency Resolution Modal
  And preserves any drafted notes Handler A typed in client memory
  And offers a button "Reload Latest Version & Keep My Notes".
```
