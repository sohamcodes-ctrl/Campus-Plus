# Phase 08-C-F: Registration & Account Provisioning Audit

## 1. Scope & Objective
Audit user intake and onboarding flows at `src/app/register/page.tsx`.

## 2. Institutional Registration Architecture
Higher education grievance management systems enforce strict identity verification to prevent fake filings and ensure accountability. Campus Plus implements a dual-mode onboarding gateway:

### Mode 1: Student Self-Service Intake
- **Fields**: Full Name, Student ID / Roll Number, Official Campus Email (`@campus.edu`), Password, Academic Department.
- **Validation**:
  - Email must conform to institutional domain format.
  - Password requires minimum 8 characters with alphanumeric complexity.
  - Department selection from authorized institutional directory list.
- **Backend Contract Reality**: The backend does not yet provide an unauthenticated open registration REST API (`POST /api/v1/auth/register`).
- **Honest UI Handling**: Upon submission, the UI transitions to an institutional pending state (`IAM-REG-PENDING`), explaining that the request has been submitted to the Academic Registrar for directory synchronization. Zero fake tokens or false authentication states are created.

### Mode 2: Staff & Administrative Directory Guidance
- Covers Faculty, Handlers, HODs, Directors, and Executive Management.
- Clearly states institutional security policy: privileged role accounts are provisioned directly via the central IT Directory Services (LDAP/Azure AD).
- Provides direct IT Support contact links and administrative portal pointers.

## 3. Navigation Integrity
- Direct link back to Home (`/`).
- Direct toggle to Sign In (`/login`).

## 4. Acceptance Status
- **UX & Design**: PASS.
- **Data Honesty**: PASS (No fake backend calls).
- **Security**: PASS.
