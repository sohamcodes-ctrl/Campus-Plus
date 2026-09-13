# Campus Plus — Phase 08-C: Authentication Architecture & Design System

**Document Classification:** Architecture Specification & Design System Documentation  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Target:** `/login` & `/register` Experience  
**Date:** 2026-09-13  
**Status:** COMPLETE & VERIFIED  

---

## 1. System Architecture

The authentication experience is designed as an institutional gateway conforming strictly to clean architectural boundaries:

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx              <-- Public Entrypoint for Sign In (CSR + Suspense)
│   └── register/
│       └── page.tsx              <-- Public Entrypoint for Registration (CSR + Suspense)
└── presentation/
    ├── components/
    │   └── auth/
    │       ├── authTypes.ts                       <-- Persona IDs, locked color tokens, role mappings
    │       ├── CampusPlusAuthShell.tsx            <-- Common auth frame, 3px role accent bar, top bar
    │       ├── AuthBrandPanel.tsx                 <-- Left brand column with institutional guarantees
    │       ├── RoleSelector.tsx                   <-- 5-persona grid/stack selection component
    │       ├── RoleOptionCard.tsx                 <-- Individual persona option card with custom SVG
    │       ├── PasswordField.tsx                  <-- Accessible password input with show/hide toggle
    │       ├── SignInForm.tsx                     <-- Interactive 5-persona sign-in form & error mapping
    │       ├── RegistrationFlow.tsx               <-- 2-step persona selection and registration router
    │       ├── StudentRegistrationForm.tsx        <-- Student self-service intake form with live validation
    │       ├── PrivilegedRoleProvisioningNotice.tsx <-- Official IAM provisioning notice for staff roles
    │       └── AuthFooter.tsx                     <-- Institutional copyright, legal, and IT links
    └── context/
        └── AuthContext.tsx                        <-- Global session & actor hydration state
```

---

## 2. Design System Tokens & Role Palettes

The 5-persona visual system uses CSS custom properties dynamically bound to the selected persona, ensuring that the visual context updates instantaneously when a persona is selected.

### 2.1 Color Tokens Specification

```css
:root {
  /* Student Persona */
  --persona-student-primary: #7FA8D9;
  --persona-student-secondary: #B8D0EC;
  --persona-student-accent: #EAF2FB;
  --persona-student-action-text: #1E3A5F;

  /* Faculty / Handler Persona */
  --persona-handler-primary: #7FC4B2;
  --persona-handler-secondary: #B7E0D3;
  --persona-handler-accent: #E9F6F1;
  --persona-handler-action-text: #2E4A42;

  /* HOD Persona */
  --persona-hod-primary: #B39DDB;
  --persona-hod-secondary: #D6C6EC;
  --persona-hod-accent: #F3EDFA;
  --persona-hod-action-text: #43395A;

  /* Director / Senior Authority Persona */
  --persona-director-primary: #9FB4C7;
  --persona-director-secondary: #C7D5E0;
  --persona-director-accent: #EEF3F7;
  --persona-director-action-text: #37495A;

  /* Institutional Management Persona */
  --persona-management-primary: #E3A6AE;
  --persona-management-secondary: #F0C9CE;
  --persona-management-accent: #FBEDEF;
  --persona-management-action-text: #5C333A;
}
```

### 2.2 Dynamic Role Accent Bar
At the top of the viewport, a persistent 3px bar (`CampusPlusAuthShell.tsx`) smoothly transitions to the primary color of the active persona (`style={{ backgroundColor: palette.primary }}`), providing an instant, subtle institutional cue across desktop, tablet, and mobile displays.

---

## 3. Typography & Spacing Scale

1. **Brand Headers:** `font-extrabold text-slate-900 tracking-tight leading-tight` (Desktop: `text-3xl` to `text-4xl`, Mobile: `text-2xl`).
2. **Section Headings:** `font-bold text-slate-900` (`text-xl` to `text-2xl`).
3. **Field Labels:** `text-xs font-semibold uppercase text-slate-700 tracking-wide`.
4. **Input Fields:** `px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2`.
5. **Action Buttons:** `py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-opacity hover:opacity-95 cursor-pointer`.
6. **Helper Text & Microcopy:** `text-[11px] text-slate-500 leading-normal`.

---

## 4. Two-Column Asymmetric Responsive Grid

- **Wide Desktop & Desktop (`>= 1024px`):** 12-column grid container with max-width `6xl` (`max-w-6xl mx-auto`).
  - Left column (`lg:col-span-6`): Institutional brand panel with campus background, governance charter, and security advisory.
  - Right column (`lg:col-span-6`): White card container with rounded-3xl geometry, subtle shadow, and 1px border (`border-slate-200/80`).
- **Tablet & Mobile (`< 1024px`):** Single-column stacked layout. The left brand panel is gracefully collapsed so the interactive form is immediately in the viewport without requiring vertical scrolling past marketing banners.
