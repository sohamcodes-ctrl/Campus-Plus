# Campus Plus — Phase 08-C: Registration & IAM Provisioning Architecture

**Document Classification:** Identity Governance & Provisioning Specification  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Target:** `/register` Experience & Privilege Boundaries  
**Date:** 2026-09-13  
**Status:** COMPLETE & VERIFIED  

---

## 1. Institutional Security Policy

In an institutional grievance and complaints system, unrestricted public registration into administrative or staff roles represents a severe vulnerability. In Campus Plus:
- **Only Students** are allowed self-service intake.
- **Faculty Handlers, HODs, Directors, and Management** are officially provisioned through the institutional registrar, human resources, or campus directory service.

---

## 2. Two-Step Registration Experience

1. **Step 1: Account Type Selection (`RegistrationFlow.tsx`)**
   - The user selects their campus identity from the 5 operational personas.
   - If `Student` is selected, the interface advances to the **Student Intake Form**.
   - If a privileged role (`Faculty / Handler`, `HOD`, `Director`, `Management`) is selected, the interface displays the **Privileged Role Provisioning Notice**.
   - The user can switch personas at any point using the prominent `"← Change account type"` link.

2. **Step 2A: Student Self-Service Intake (`StudentRegistrationForm.tsx`)**
   - **Form Fields:**
     - Full Official Name (`id="fullName"`)
     - Student Roll / ID Number (`id="rollNumber"`, e.g. `23011045`)
     - Academic Department (`id="departmentId"`, dropdown of accredited departments)
     - Institutional Campus Email (`id="email"`)
     - Password (`id="reg-password"`, min 8 characters)
     - Confirm Password (`id="confirmPassword"`)
     - Terms & Privacy Agreement (`id="terms"`)
   - **Validation:** Live field-level validation and matching checks.
   - **Zero Fake Backend Mutation:** When submitted, the client generates an institutional submission receipt (`IAM-REG-PENDING-[HASH]`), displaying next steps for campus email verification without attempting unauthorized backend DB writes.

3. **Step 2B: Privileged Role Provisioning Notice (`PrivilegedRoleProvisioningNotice.tsx`)**
   - Renders role-specific guidance:
     - **Faculty / Handler:** Registrar Department & Dean's Office provisioning instructions.
     - **HOD:** Executive Academic Council appointment workflow.
     - **Director:** Directorate IT Security & Governance division.
     - **Management:** Board of Governors IAM coordinator.
   - Includes contact email: `identity-governance@campus.edu`.
   - Clear button to return to Sign In or switch persona.

---

## 3. Visual Directory Verification Table

The left panel on `/register` renders the authoritative Persona Directory:

| Persona | Provisioning Channel | Badge Style |
|---|---|---|
| Student / Complainant | Self-Service Intake | Blue pill |
| Faculty / Staff / HOD | Registrar Provisioned | Purple pill |
| Director / Senior Authority | Directorate Issued | Slate pill |
| Institutional Management | Board Authorized | Rose pill |
