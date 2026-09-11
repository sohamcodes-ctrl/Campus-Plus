# Phase 08-B: Student Persona UI Specification (ROLE_STUDENT)

**Document Identifier:** `11-student-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Target Role:** `ROLE_STUDENT` (Complainant)  
**Locked Palette:** Primary `#7FA8D9` | Secondary `#B8D0EC` | Accent `#EAF2FB` | Surface `#FAFCFE` | Text `#33475B` (Contrast 9.1:1)

---

## 1. Persona Mental Model & Core Objectives

Students interact with Campus Plus intermittently, primarily when experiencing friction with campus infrastructure, academics, or hostel life.
- **Primary Need:** Transparent, friction-free submission and unambiguous status tracking.
- **Key Anxiety:** "Did my complaint disappear into a void? Who is working on it? When will it be fixed?"
- **UX Tenet:** Immediate proof of submission (Tracking Code `CP-YYYY-XXXXX`), visible progress milestones, and total control over closure verification.

---

## 2. Screen Specifications

### 2.1 STU-001: Student Dashboard (`/dashboard`)
- **Layout & Structure:**
  - **Header Bar:** Master TopBar with `#7FA8D9` 3px accent bar, student name, notification bell with unread badge.
  - **Welcome Banner:** Quick greeting with prominent primary CTA: `[ + Submit New Complaint ]` (`bg-[#7FA8D9] text-white`).
  - **Summary Metric Cards (3 Columns):**
    1. *Active Grievances:* Count of complaints in `SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `REOPENED`.
    2. *Pending Verification:* Count of complaints in `RESOLVED` requiring student sign-off (highlighted with amber border if > 0).
    3. *Resolved Archive:* Total count of `CLOSED` complaints.
  - **Complaints Feed / List:**
    - Filter Tabs: `[ All ]` `[ Active ]` `[ Resolved ]` `[ Closed ]`.
    - Cards display: `TrackingCodeBadge`, Title, Category, Department, Date, `StatusPill`.
    - Click target: Entire card links to `/complaints/[id]`.
- **Empty State:** When count = 0, render `EmptyState` component with illustration: "No grievances filed. Campus Plus is here whenever you encounter campus issues."

### 2.2 STU-002: Submit Complaint Form (`/complaints/new`)
- **Fields & Validations (Zod-aligned):**
  1. **Title:** Single line input. `min: 10`, `max: 120`. Live character counter (`CMP-FORM-08`).
  2. **Category:** Dropdown (`Select`). Options: `NETWORK_WIFI`, `HOSTEL_MAINTENANCE`, `CLASSROOM_INFRASTRUCTURE`, `ACADEMIC_EVALUATION`, `CAMPUS_SANITATION`, `OTHER`.
  3. **Department:** Dropdown (`Select`). Auto-populates recommended default department based on selected category.
  4. **Location:**
     - Building / Block (Dropdown or text, e.g. "Hostel B", "Science Block").
     - Floor / Room (Text, e.g. "Room 204", "Lab 4").
     - Additional Details (Optional text, e.g. "Near emergency exit").
  5. **Description:** Multi-line textarea. `min: 30` characters. Character counter indicates threshold.
  6. **Urgency Level:** Radio group: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (URGENT requires brief reason).
  7. **Evidence Attachments:** Drag-and-drop file uploader (`CMP-FORM-06`).
     - Max 3 files. Max 5MB per file. Accepted MIME types: `image/jpeg`, `image/png`, `application/pdf`.
     - Presigned upload workflow: Calls `POST /api/v1/attachments/presign-upload`, then uploads directly to Supabase storage.
- **Idempotency & Submission:**
  - Generates client UUID for `Idempotency-Key` header.
  - Disable submit button on first click, show `Spinner`, render "Submitting Grievance...".
  - Success redirect to `/complaints/[id]` with celebratory toast: "Complaint Submitted Successfully. Tracking Code: CP-2026-XXXXX".

### 2.3 STU-003: Complaint Detail View (`/complaints/[id]`)
- **Data Boundaries (Security & Privacy):**
  - **Zero Internal Notes:** Internal staff notes (`is_internal = true`) are strictly stripped by backend RLS and hidden from DOM (`INV-012`).
  - **Handler Privacy:** Displays handler name only (e.g. "Assigned Handler: R. Verma"), no personal phone or direct email.
  - **Timeline:** Public milestone entries only (SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED).
- **Interactive Action Bar:**
  - If status is `RESOLVED`: Display prominent banner with **[ Verify & Close ]** and **[ Dispute & Reopen ]** buttons.
  - If status is `SUBMITTED`: Display **[ Cancel Complaint ]** button (requires confirmation).
  - If status is `CLOSED` or `REJECTED`: Read-only view with complete resolution/rejection statement.

### 2.4 STU-004: Verify / Dispute Modal Dialog
- **Anatomy:**
  ```text
  +-------------------------------------------------------------+
  | Resolution Verification: CP-2026-00842                      |
  +-------------------------------------------------------------+
  | The department reported this issue resolved:                |
  | "Replaced damaged desk surface and secured leg screws."     |
  |                                                             |
  | Did this satisfactorily resolve your grievance?             |
  |                                                             |
  | ( ) Yes, the issue is completely resolved                   |
  | ( ) No, the issue persists or was inadequately addressed    |
  |                                                             |
  | [If No selected]:                                           |
  | Please explain why the resolution is unsatisfactory: *       |
  | [ Textarea (minimum 20 characters)                        ] |
  |                                                             |
  | [ Cancel ]           [ Submit Verification / Dispute ]      |
  +-------------------------------------------------------------+
  ```
- **Mutation:** Calls `POST /api/v1/complaints/[id]/verify` or `POST /api/v1/complaints/[id]/dispute`.
