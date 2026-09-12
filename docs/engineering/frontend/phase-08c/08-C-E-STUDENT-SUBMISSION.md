# Phase 08-C-E: Guided Complaint Intake Wizard Specification
**Component:** `NewComplaintPage` (`src/app/complaints/new/page.tsx`)  
**Route:** `/complaints/new`  
**Document Type:** Screen Engineering Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. 5-Step Guided Intake Workflow

1. **Step 1: Category & Jurisdiction**
   - 6 campus categories with automatic default department routing.
2. **Step 2: Grievance Details**
   - Title: Enforces 10–120 characters matching `ComplaintTitle` VO. Live character counter.
   - Description: Enforces >= 30 characters matching `ComplaintDescription` VO. Live character counter.
   - Location Details: Specific room, floor, or building text input.
3. **Step 3: Impact & Suggested Priority**
   - Complainant selects LOW, MEDIUM, HIGH, or URGENT with plain-language operational impact descriptions.
4. **Step 4: Evidence & Attachments (Optional)**
   - Upload up to 3 files (JPEG, PNG, PDF; max 5MB each).
   - Direct presigned upload via `apiClient.presignUpload`.
   - **Technical Note on GAP-003:** Discloses that attachment files are uploaded to secure storage, with entity payload binding pending backend intake schema update.
5. **Step 5: Review & Confirm Submission**
   - Comprehensive summary card displaying Category, Priority, Subject, Location, Description length, and Attached files count before final submission.
   - Client generates a UUIDv4 `Idempotency-Key` passed via HTTP headers to prevent duplicate grievance registration.
