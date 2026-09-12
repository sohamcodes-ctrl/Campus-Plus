# Phase Landing: Forensic Reconnaissance & Baseline Inspection

## 1. Executive Summary
This document establishes the forensic baseline and implementation plan for the pixel-accurate visual reconstruction of the Campus Plus Public Landing Page (`/`), strictly adhering to the authoritative visual specification provided in the user reference image (`media_1789225728762.jpg`).

## 2. Current Landing Page Implementation Inspection
- **File**: `src/app/page.tsx`
- **Current Behavior**:
  - Implements an unauthenticated public landing view with an 8-stage stepper, problem-vs-solution matrix, 5-persona grid, and FAQ accordion.
  - Implements authoritative auth redirect: authenticated users (`authState === "AUTHENTICATED"`) are automatically routed to `/dashboard` via `router.replace("/dashboard")`.
  - In-flight session states (`INITIALIZING`, `AUTHENTICATING`, etc.) display accessible `<ShellLoading />`.
  - Error and forbidden states render `<ShellError />` and `<ForbiddenState />` respectively.
- **Architectural Observation**: The current page is functional, but its layout, section hierarchy, copy, card geometry, and visual styling differ from the pixel-accurate reference image provided.

## 3. Discrepancy & Conflict Analysis (Current vs. Authoritative Reference)

| Subsystem / Section | Current Implementation | Authoritative Reference Image | Action Required |
| :--- | :--- | :--- | :--- |
| **Header Branding** | Shield monogram with "C+", "Grievance Resolution System" | Shield emblem with cross/plus, "Campus Plus", sub-tagline: "Accountable. Transparent. Together." | Reconstruct brand lockup |
| **Navigation Links** | "How It Works", "Role Ecosystem", "Trust & Governance", "FAQ" | "Home" (with blue active underline), "How It Works", "Roles", "Transparency", "Help & Support" | Align exact navigation anchors |
| **Header CTAs** | "Sign In", "Create Account" | "Sign In" (white with navy border), "Create Account" (solid navy `#0B3C78`) | Match exact geometry and colors |
| **Hero Headline** | "One campus. One accountable grievance system." | "One Campus.
One Accountable System." (two lines, bold navy) | Match exact typographic scale |
| **Hero Paragraph** | General multi-channel description | "Campus Plus is the official platform for lodging, tracking, and resolving grievances with clarity, accountability, and transparency." | Exact copy alignment |
| **Hero CTAs** | "Submit a Grievance", "Track Existing Case" | "Submit a Complaint" (solid navy with arrow `→`), "Sign In to Your Account" (white with blue border and user icon `👤`) | Exact CTA alignment |
| **Hero Visual (Right)** | Interactive Simulation Card (`CP-2026-08412`) | Photographic institutional campus building with landscaped driveway and "Our Commitment" signboard | Replaced with exact reference photo asset (`/images/campus-hero.jpg`) |
| **Trust / Value Strip** | Horizontal pill cards | 4-item strip with line icons and vertical dividers below hero CTAs | Implement 4-item trust strip |
| **Metrics Bar** | None (avoided fake metrics) | Floating white card overlapping hero with 4 metrics: 2,482 Registered, 1,842 Resolved, 98% Actioned in Time, 100% Confidentiality | Reproduce visual geometry; badge honestly as Illustrative |
| **How It Works** | 8-stage text-heavy grid | 5-step horizontal process with numbered circular icons and connecting arrows | Implement exact 5-step flow |
| **Role Ecosystem** | 5 locked role cards | 6 cards ("Who Can Use Campus Plus"): Students, Faculty / Handlers, HODs, Directors / Authorities, Institutional Management, System Admins | Implement exact 6-card grid |
| **Footer** | Light slate footer with governance bullets | Deep institutional navy (`#0A2540`) footer with left branding, center support email, right emergency prompt, and copyright | Implement exact dark navy footer |

## 4. Reusable Components & Design Tokens
- **Design Tokens**: Defined in `src/app/globals.css` via Tailwind CSS v4 `@theme`.
  - Palette: Deep institutional navy (`#0A2540`, `#0B3C78`), soft slate neutrals (`#F8FAFC`, `#F1F5F9`, `#E2E8F0`), and role accent highlights.
- **Component Primitives**: `Button`, `Badge`, `Card`, `Divider` in `src/presentation/components/primitives/`.
- **Shell Components**: `ShellLoading`, `ShellError`, `ForbiddenState`, `AppShell`.

## 5. Assets Available & Prepared
- **Campus Hero Asset**: Extracted cleanly from the authoritative reference image into `public/images/campus-hero.jpg` (516x260, modern campus building, pillars, driveway, and "Our Commitment" signboard).
- **Brand SVG Shield**: Custom inline scalable SVG shield with institutional cross/plus.
- **Iconography**: Restrained, consistent SVG line icons matching the optical weight of the reference.

## 6. Functional & Security Preservations
- **Auth Preservation**:
  - `authState === "AUTHENTICATED"` triggers immediate redirect to `/dashboard`.
  - `authState === "UNAUTHENTICATED"` renders public landing page.
  - In-flight states render `ShellLoading`.
- **Navigation Preservation**:
  - "Submit a Complaint" routes to `/login?redirect=/complaints/new`.
  - "Sign In" / "Sign In to Your Account" routes to `/login`.
  - "Create Account" routes to `/register`.
- **Data Honesty**:
  - The 4 metrics (2,482 / 1,842 / 98% / 100%) are explicitly accompanied by a subtle "Illustrative Example Metrics" indicator to honor institutional data integrity rules while faithfully reproducing the visual card geometry.

## 7. Scope Boundary & File Modification Plan
- **Files to Modify**:
  - `src/app/page.tsx`: Full pixel-accurate visual reconstruction.
  - `tests/frontend/landing-page.test.ts`: Updated test assertions matching the new visual elements and copy.
- **Files Created**:
  - `public/images/campus-hero.jpg`: Extracted high-fidelity photo asset.
  - `docs/engineering/frontend/phase-landing/00-RECONNAISSANCE.md` (this file).
  - `docs/engineering/frontend/phase-landing/01-VISUAL-QA.md`: Visual QA section-by-section audit.
  - `docs/engineering/frontend/phase-landing/FINAL-GATE.md`: Final acceptance report.
- **Files Remaining Untouched**:
  - ALL backend, database, domain, and API routes.
  - All role dashboards (`StudentDashboard.tsx`, etc.).
  - `AuthContext.tsx`, `ProtectedRoute.tsx`, `TopBar.tsx`, `Sidebar.tsx`.

## 8. Backend Check
No backend changes are required. This task is 100% frontend only.
