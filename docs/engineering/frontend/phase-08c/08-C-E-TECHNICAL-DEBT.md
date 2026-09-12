# Phase 08-C-E: Technical Debt & Backend Contract Gap Register
**Project:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Document Type:** Technical Debt & Contract Gaps  
**Status:** TRACKED & DOCUMENTED  

---

## 1. Tracked API Contract Gaps

| Gap ID | Description | Impact | Current Frontend Handling | Planned Resolution |
|---|---|---|---|---|
| **GAP-001** | Missing Notification Retrieval API (`GET /notifications`) | In-app notification drawer cannot fetch live notifications | Renders honest "Notifications Unavailable" state | Phase 08-D backend integration |
| **GAP-002** | Missing Dashboard Aggregates API | Dashboard metrics computed client-side from complaint list | Client-side filtering over `listComplaints` limit 50 | Future analytics aggregation endpoint |
| **GAP-003** | Attachment Binding in Complaint Intake | `SubmitComplaintInput` does not accept attachment IDs | Files uploaded via presigned URL; logged in intake audit | Backend complaint payload schema update |
| **GAP-004** | Department/Handler Directory APIs | Assign and Forward modals require manual UUID entry | Input fields with UUID placeholders | Department/staff directory endpoint |
