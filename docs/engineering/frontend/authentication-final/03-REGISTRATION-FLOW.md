# 03 — Five-Role Registration & Onboarding Flows
**Campus Plus Final Five-Role Authentication Experience**
**Status:** IMPLEMENTED & TESTED  
**Date:** 2026-09-13  
**Classification:** INTERACTION SPECIFICATION

---

## 1. Journey Architecture
The registration experience at `/register` serves as the institutional gateway for all five campus personas.

### Primary Entry Screen:
1. **Header:** `"Create your Campus Plus account"`
2. **Supporting Subtitle:** `"Choose how you participate in the campus grievance process."`
3. **Primary Chooser:** 5 balanced role cards presented in a responsive, accessible radiogroup.
4. **Active Selection:** Selecting any role dynamically binds the view to that role's locked color palette.
5. **Role Onboarding Experience:** Renders directly below the chooser with complete, role-appropriate fields and guidance.

---

## 2. Role-by-Role Onboarding Models

### 2.1 Student Enrollment
- **Model:** Institutional intake request.
- **Fields:** Full Official Name, Student Roll / ID Number, Institutional Campus Email, Academic Department, Password, Confirm Password, Terms Agreement.
- **Outcome:** Details recorded under `IAM-REG-PENDING` protocol for campus directory validation.

### 2.2 Faculty / Complaint Handler Onboarding
- **Model:** Institutional Verification / Registrar Provisioning.
- **Fields:** Full Official Name, Faculty / Staff ID Number, Institutional Campus Email, Academic Department, Password, Confirm Password, Terms Agreement.
- **Outcome:** Intake recorded under `IAM-STAFF-PENDING` protocol. Operational Handler privileges require Registrar department assignment.
- **Fast-Path:** "Already have institutional credentials? Sign In with Existing Account →".

### 2.3 HOD Onboarding
- **Model:** Appointment Verification / Directorate Provisioning.
- **Fields:** Full Official Name, Official Faculty / Staff ID, Institutional Faculty Email, Department Scope, Password, Confirm Password, Terms Agreement.
- **Outcome:** Verification request logged under `IAM-HOD-PENDING` protocol for Dean / Directorate authorization.
- **Fast-Path:** "Sign In with Existing Account →".

### 2.4 Director / Senior Authority Onboarding
- **Model:** Directorate Issuance / IT Security Pre-provisioning.
- **Fields:** Full Official Name, Directorate Authority ID, Official Directorate Email, Password, Confirm Password, Terms Agreement.
- **Outcome:** Verification inquiry transmitted under `IAM-DIR-PENDING` protocol.
- **Fast-Path:** "Sign In with Existing Account →" & "Contact Directorate IT Office".

### 2.5 Institutional Management Onboarding
- **Model:** Board Secretariat Authorization.
- **Fields:** Full Official Name, Institutional Officer / Trustee ID, Official Institutional Email, Password, Confirm Password, Terms Agreement.
- **Outcome:** Inquiry logged under `IAM-MGT-PENDING` protocol for Secretariat audit.
- **Fast-Path:** "Sign In with Existing Account →" & "Contact Board Secretariat".
