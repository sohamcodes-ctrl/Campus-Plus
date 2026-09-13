# Phase Landing: 04 — Functional QA & Security Boundary Report

## 1. Functional Route Invariants
- **Unauthenticated Visitor**: Accessing `/` renders the Public Landing Page with all informational sections.
- **Authenticated User**: Accessing `/` automatically executes `router.replace("/dashboard")`, redirecting to the user's role-specific portal.
- **Primary Hero CTA**: "Submit a Complaint" links to `/login?redirect=/complaints/new`, ensuring unauthenticated users must sign in before filing.
- **Secondary Hero CTA**: "Sign In to Your Account" links to `/login`.
- **Header CTAs**: "Sign In" links to `/login`; "Create Account" links to `/register`.
- **Role Card CTAs**: "Learn more →" links to `/login?redirect=/dashboard`.

## 2. Security & Session Integrity
- Zero client-side role spoofing.
- No staging credentials or hardcoded keys embedded in HTML or client bundles.
- Zero backend, database, or API contract modifications.
