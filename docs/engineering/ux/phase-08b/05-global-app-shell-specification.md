# Phase 08-B: Global App Shell & Role Header Specification

**Document Identifier:** `05-global-app-shell-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Defines the master application layout shell, role brand bar, global top bar, user menu, and notification drawer.

---

## 1. Global Shell Anatomy & Layout Zones

The layout shell wraps all authenticated pages in a unified, accessible structure conforming to landmark specifications.

```
+-----------------------------------------------------------------------------------------+
| [ROLE ACCENT BAR - 3px solid var(--role-primary)]                                       |
+-----------------------------------------------------------------------------------------+
| LOGO & INSTITUTION    | SEARCH BAR (Ctrl+K)           | NOTIF [3] | USER PROFILE & ROLE |
+-----------------------+-------------------------------+-----------+---------------------+
| SIDEBAR (240px)       | BREADCRUMBS: Dashboard > Complaints > CP-2026-00104             |
|                       +-----------------------------------------------------------------+
| - [Dashboard]         | MAIN VIEWPORT (Flexible, max-w-7xl)                             |
| - [My Complaints]     |                                                                 |
| - [Submit Intake]     |                                                                 |
| - [Department Queue]  |                                                                 |
| - [Workload Triage]   |                                                                 |
| - [Recurrence]        |                                                                 |
| - [Audit Trail]       |                                                                 |
|                       |                                                                 |
| [Collapse Rail <<]    | FOOTER: Campus Plus v1.0 • Confidential Grievance System        |
+-----------------------+-----------------------------------------------------------------+
```

---

## 2. Shell Region Specifications

### 2.1 Top Shell Header (`h-[60px]`, `border-b border-slate-200`)
- **Top Accent Line:** `3px` solid horizontal bar spanning 100% viewport width colored with active `var(--role-primary)`.
- **Institution Identity:** Campus Plus brand icon + "Campus Plus" title + subtle institutional badge ("RCPIT Autonomous Grievance Cell").
- **Omnipresent Search Box:**
  - Width: `280px` on desktop (collapses to icon button on mobile).
  - Placeholder: `"Search tracking code (CP-...)"`
  - Keyboard hint badge: `Ctrl + K` (or `Cmd + K`).
  - Action: Typing format `CP-YYYY-XXXXX` directly routes to complaint; otherwise opens search modal (`SHR-002`).
- **Notification Trigger (`SHR-001`):**
  - Bell icon button with red badge counter indicating unread count (`notifications` table).
  - Clicking toggles the slide-over notification drawer.
- **User Session & Identity Badge:**
  - User full name + role pill tag (e.g. `[Student]` in `#EAF2FB` / `[HOD]` in `#F3EDFA`).
  - Dropdown menu containing: User PRN/Email, Bound Department, `[Accessibility Settings]`, and `[Sign Out]`.

### 2.2 Sidebar Navigation Shell (`w-[240px]`, `border-r border-slate-200`)
- Fixed desktop width `240px`. Background `#FFFFFF`.
- Items organized into logical sections: `Workspace`, `Operations`, `Analytics`, `System`.
- Active item treatment: Background `var(--role-accent)`, text `var(--role-text)`, left indicator bar `3px solid var(--role-primary)`.
- Bottom rail collapse trigger button: Toggles sidebar into a compact `64px` icon-only rail.

---

## 3. Responsive Shell Transformation Behavior

| Breakpoint Tier | Sidebar Behavior | Header Search | User Profile | Mobile Navigation |
| :--- | :--- | :--- | :--- | :--- |
| **Desktop (`>= 1024px`)** | Fixed expanded `240px` sidebar | Visible input field (`280px`) | Full name + Role badge | Hidden |
| **Tablet (`768px - 1023px`)** | Collapsed `64px` icon rail | Expandable search icon button | Avatar + Role badge | Hidden |
| **Mobile (`< 768px`)** | Hidden; accessible via hamburger drawer | Search icon button (opens modal) | Avatar only (tap opens menu)| Bottom Navigation Bar (4 icons) |
