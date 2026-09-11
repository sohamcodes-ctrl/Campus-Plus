# Phase 08-B: UI Acceptance Test Specification (Gherkin BDD Scenarios)

**Document Identifier:** `27-ui-acceptance-test-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Exhaustive Gherkin feature scenarios defining frontend test criteria across all personas and core states.

---

## 1. Feature: Student Complaint Lifecycle (STU-001 to STU-004)

```gherkin
Feature: Student Grievance Submission and Verification
  As an authenticated student
  I want to submit a formal grievance with evidence and track it to resolution
  So that campus issues are transparently resolved by the administration

  Scenario: Successful complaint submission with valid inputs and attachment
    Given the user is authenticated as "ROLE_STUDENT"
    And the user is on the "/complaints/new" page
    When the user enters "Air conditioning failure in Lecture Hall 3" into the title field
    And the user selects category "CLASSROOM_INFRASTRUCTURE"
    And the user selects building "Academic Complex" and room "LH-3"
    And the user enters "The central AC blower has ceased functioning since morning lectures, ambient temp 34C." into description
    And the user selects suggested priority "HIGH"
    And the user uploads "ac_error_code.jpg" (1.2 MB)
    And the user clicks "Submit Complaint"
    Then a POST request is sent to "/api/v1/complaints" with an "Idempotency-Key" header
    And the user is redirected to the complaint details page
    And a success toast displays "Complaint Submitted Successfully"
    And the tracking code matching format "CP-[0-9]{4}-[0-9]{5}" is prominently displayed
    And the status badge renders as "SUBMITTED"

  Scenario: Form validation error on short description (< 30 characters)
    Given the user is on the "/complaints/new" page
    When the user enters "Valid Title Text Here" into the title field
    And the user enters "Too short text" into the description field
    And the user clicks "Submit Complaint"
    Then the submission is prevented
    And the description character counter highlights in red "14 / 30 minimum"
    And an inline error displays "Description must contain at least 30 characters."

  Scenario: Student verifies and closes resolved complaint
    Given a complaint exists with status "RESOLVED" owned by the student
    And the student navigates to "/complaints/[id]"
    Then the action banner displays "The department has marked this complaint RESOLVED"
    When the student clicks "Verify & Close Complaint"
    And confirms the action in the verification dialog
    Then a POST request is sent to "/api/v1/complaints/[id]/verify"
    And the status badge transitions to "CLOSED"
    And the action banner is removed
```

---

## 2. Feature: Handler Operational Workflow (FAC-001 to FAC-005)

```gherkin
Feature: Handler Task Execution and Resolution
  As an assigned departmental handler
  I want to update complaint progress and record formal resolution
  So that the issue is remediated within institutional SLA

  Scenario: Handler starts work and resolves complaint with proof
    Given the user is authenticated as "ROLE_HANDLER"
    And a complaint "CP-2026-00891" is assigned to the handler in status "ASSIGNED"
    When the handler opens the complaint details page
    And the handler clicks "Start Progress"
    Then a POST request is sent to "/api/v1/complaints/[id]/progress"
    And the status updates to "IN_PROGRESS"
    When the handler clicks "Resolve"
    And enters "Replaced blown thermal fuse and recharged refrigerant." into the resolution summary
    And uploads "work_slip.pdf"
    And clicks "Confirm Resolution"
    Then a POST request is sent to "/api/v1/complaints/[id]/resolve"
    And the status updates to "RESOLVED"
```

---

## 3. Feature: Optimistic Concurrency Conflict Handling (OCC 409)

```gherkin
Feature: Concurrent Modification Conflict Defense
  As an active user modifying a complaint
  I want clear conflict notification if another user modified the complaint first
  So that data overwrites and race conditions are prevented

  Scenario: Concurrency collision prompts reload dialog
    Given a user is reviewing complaint "CP-2026-00842" at version 2
    And another user resolves the complaint, incrementing the version to 3
    When the first user attempts to forward the complaint
    Then the backend returns HTTP 409 Conflict with code "CONCURRENCY_CONFLICT"
    And the UI displays the "Record Modified by Another User" modal
    And the user is given options to "Review Latest Changes" or "Copy Draft"
```
