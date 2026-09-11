# Campus Plus — Phase 08-C: Guided Complaint Intake Wizard UX Specification

**Document Classification:** Frontend Engineering Specification  
**Route:** `/complaints/new`  
**Component:** `src/app/complaints/new/page.tsx`  
**Authority:** Senior UX Engineer, Application Security Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. 8-Step Progressive Intake Flow

The submission page guides students through an accessible, high-usability intake wizard:

1. **Step 1: Category Selection:** Structured selection across institutional categories (`HOSTEL_MAINTENANCE`, `NETWORK_WIFI`, `CLASSROOM_INFRASTRUCTURE`, `ACADEMIC_EVALUATION`, `CAMPUS_SANITATION`, `OTHER`).
2. **Step 2: Department Scope:** Selects or auto-defaults target department.
3. **Step 3: Title Entry:** Validates against domain value object `ComplaintTitle` (10–120 characters, live counter).
4. **Step 4: Detailed Description:** Validates against domain value object `ComplaintDescription` (minimum 30 characters, live counter).
5. **Step 5: Location Specification:** Captures campus building, block, floor, and specific room details.
6. **Step 6: Suggested Priority:** Complainant selects initial suggested priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
7. **Step 7: Supporting Evidence:** Integration with `FileUploader` utilizing presigned uploads (`POST /api/v1/attachments/presign-upload`) with 5MB file size limits and MIME filtering (PNG, JPEG, PDF).
8. **Step 8: Review & Confirm:** Comprehensive summary review before submission.

---

## 2. Idempotency Boundary (`Idempotency-Key`)

In strict compliance with architecture contracts:
- The submission handler generates a unique UUIDv4 idempotency key via `crypto.randomUUID()`.
- The key is passed in the `Idempotency-Key` HTTP header to `POST /api/v1/complaints`.
- Network retries or rapid double-submissions safely return the identical created grievance without creating duplicate database rows.\n