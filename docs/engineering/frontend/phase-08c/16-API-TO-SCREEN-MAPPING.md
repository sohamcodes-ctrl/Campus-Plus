# Campus Plus — Phase 08-C: API-to-Screen Mapping Specification

**Document Classification:** API Integration Specification  
**Authority:** Backend Integration Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. API Route Coverage Across Application Screens

| Screen Route | Screen Purpose | API Routes Invoked | Method | Payload / Envelope |
|---|---|---|---|---|
| `/login` | Authentication | Supabase Auth `signInWithPassword`, `/api/v1/auth/me` | POST, GET | Standard Auth Session + Actor DTO |
| `/dashboard` | Role Hub | `GET /api/v1/complaints` (role-scoped), `GET /api/health` (Admin) | GET | Paginated Collection Envelope |
| `/complaints` | Directory | `GET /api/v1/complaints` (with search/status query params) | GET | Paginated Collection Envelope |
| `/complaints/new`| Intake | `POST /api/v1/attachments/presign-upload`, `POST /api/v1/complaints` | POST | Presign URL + Intake DTO (`Idempotency-Key`) |
| `/complaints/[id]`| Detail | `GET /api/v1/complaints/[id]`, `GET /api/v1/complaints/[id]/timeline` | GET | Single Entity Envelope + Timeline Array |
| `/complaints/[id]`| Mutations | `POST /api/v1/complaints/[id]/*` (review, assign, progress, forward, escalate, resolve, verify, dispute, reject, duplicate, cancel) | POST | OCC Mutation Payload (`expectedVersion`) |\n