# Phase 08-C-F: Public Landing Page Visual & Product Audit

## 1. Scope & Objective
Audit the primary entry point (`src/app/page.tsx`) to verify institutional visual quality, brand hierarchy, product narrative, and responsive design.

## 2. Architecture & Components
1. **Institutional Header**: Fixed header with Campus Plus monogram (`C+`), system title, "Grievance Resolution" tag, navigation anchors ("How It Works", "Roles", "Governance", "FAQ"), and dual CTA buttons ("Sign In", "Create Account").
2. **Hero Proposition**:
   - Title: "One campus. One accountable grievance system."
   - Subtitle: Clear institutional positioning eliminating lost paperwork, unaccountable verbal complaints, and bureaucratic dead-ends.
   - Dual Primary CTAs: "Submit a Grievance" (routes to `/login?redirect=/complaints/new`) and "Track Existing Case" (routes to `/login?redirect=/dashboard`).
3. **Problem vs. Solution Card Grid**: Side-by-side comparison contrasting chaotic verbal/chat channels with structured institutional SLAs.
4. **8-Stage Lifecycle Stepper**: Visual progression mapping the domain state machine: Draft → Submitted → Reviewed → Assigned → In Progress → Resolved → Closed → Reopened/Disputed.
5. **5-Persona Ecosystem Grid**: Interactive cards showcasing Student, Faculty/Handler, HOD, Director, and Management roles with their locked primary accent colors.
6. **Simulated Case Stepper (Rule 5 Compliance)**:
   - Tracking Code: `CP-2026-08412` prominently tagged with "Illustrative Example Workflow" and "Sample Case" badge to prevent confusion with real telemetry.
7. **Trust & Governance Charter**: Institutional commitments to Privacy & Anonymity, Complete Auditability, SLA Transparency, and Zero Retaliation.
8. **Interactive FAQ Accordion**: Clarifies resolution timelines, anonymous submission safeguards, escalation mechanics, and tracking codes.
9. **Footer**: Institutional copyright, emergency notice, and system disclaimer.

## 3. Automated Route Protection
- Unauthenticated visitors see the full landing page.
- Authenticated visitors are automatically redirected via `router.replace("/dashboard")`, with an accessible `ShellLoading` screen rendered during transition.

## 4. Acceptance Status
- **Visual Design**: PASS (Clean typography, institutional palette, generous whitespace).
- **Brand Hierarchy**: PASS.
- **Data Honesty**: PASS (Sample badge explicitly present).
