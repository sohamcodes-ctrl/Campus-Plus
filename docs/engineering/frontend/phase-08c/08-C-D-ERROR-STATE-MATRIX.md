# Campus Plus — Phase 08-C-D: Error State & Failure Handling Matrix

**Authority:** QA Automation Lead, Application Security Engineer  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Error State Handling Matrix

| HTTP / Error Code | Root Scenario | Frontend Component Handling | User-Facing Safe Message | Data Leakage Prevention |
| :--- | :--- | :--- | :--- | :--- |
| **400 Bad Request** | Malformed route parameter or validation failure | `AlertBanner` on route, or parameter validation error | "Invalid Complaint Identifier format. Reference must be a valid UUID or Tracking Code." | Prevents API execution for malformed input |
| **401 Unauthorized** | Missing or expired JWT session | `ProtectedRoute` transition to `UNAUTHENTICATED` | "Authentication session expired. Please sign in again." | Redirects to `/login?redirect=...` |
| **403 Forbidden** | Role mismatch or cross-student BOLA attempt | `ForbiddenState` component | "403 — Access Denied: Your current campus account role does not have permission to access this area." | Strips all privileged data; links to `/dashboard` |
| **404 Not Found** | Record does not exist or hidden by RLS | Dedicated 404 state in `ComplaintDetailView` | "Complaint Not Found: No complaint record exists with the requested identifier." | Same generic message for non-existent and hidden records |
| **409 Conflict** | Optimistic Concurrency Control (OCC) mismatch | `ConflictModal` component | "Record Modified by Another User (HTTP 409): This complaint was updated by another administrator or workflow." | Prompts "Reload Latest Complaint" action |
| **500 Server Error** | Unexpected backend exception | `ShellError` component | "Campus Plus Session Error: A system error occurred while loading your campus session." | Stack traces and SQL queries completely suppressed |
| **Network Failure** | Client disconnected / offline | `ShellError` with code `NETWORK_ERROR` | "Network connection failed. Please check your internet connection." | Offers "Retry Connection" button |
