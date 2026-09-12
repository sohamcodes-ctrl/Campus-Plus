# Phase 08-C-F: Student Experience Audit

## 1. Scope & Objective
Audit the student portal (`StudentDashboard.tsx`) and complaint filing experience (`/complaints/new`, `/complaints/[id]`).

## 2. Dashboard Experience (`/dashboard`)
- **Metric Cards**: Active Complaints, Pending Verification, Resolved, Closed.
- **Quick Action**: Prominent "Submit New Complaint" button styled with Student Blue accent (`#7FA8D9`).
- **Responsive Layout**:
  - Desktop: Structured table showing Reference ID, Title, Category, Priority, Status, and Date.
  - Mobile (`<768px`): Stacked card views with accessible touch targets and status badges.
- **Filter Tabs**: All, Active, Resolved, Closed.
- **Privacy Enforcement**: BOLA/IDOR protection verified; students see only their own complaints. Internal notes are strictly excluded from the student view (`INV-012`).

## 3. Complaint Submission Flow (`/complaints/new`)
- Character counters with live validation feedback:
  - Title: 10–120 characters (`ComplaintTitle` value object).
  - Description: minimum 30 characters (`ComplaintDescription` value object).
- Category and department dropdowns.
- Structured location selectors (Campus, Building, Block, Floor, Room).
- Suggested priority selection (LOW, MEDIUM, HIGH, URGENT).

## 4. Acceptance Status
- **Student UX**: PASS.
- **Responsive Behavior**: PASS.
- **Information Boundary**: PASS.
