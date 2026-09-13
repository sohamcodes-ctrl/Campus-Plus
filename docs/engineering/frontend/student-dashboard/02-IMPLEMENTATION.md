# Campus Plus — Student Dashboard Implementation Architecture

**Document ID:** `CP-DOC-FE-STU-02`  
**Phase:** Student Dashboard Visual Replacement & High-Fidelity Implementation  
**Status:** APPROVED / EXECUTED  
**Date:** 2026-09-13  
**Target Surface:** `src/presentation/components/dashboard/StudentDashboard.tsx`

---

## 1. Modular Component Hierarchy

To maintain clean separation of concerns and high maintainability, the Student Dashboard was decomposed into a modular presentation hierarchy under `src/presentation/components/dashboard/student/`:

```
src/presentation/components/dashboard/
├── StudentDashboard.tsx                       # Orchestrator & State Container
└── student/
    ├── StudentWelcomeHero.tsx                 # Greeting, Avatar, Metadata, Quote, Campus Image
    ├── StudentStatsRow.tsx                    # 3 Metric Cards (Total, In Progress, Resolved)
    ├── StudentActionRequiredBanner.tsx        # Conditional Amber Verification Alert
    ├── StudentRecentComplaintsTable.tsx       # Complaints Table + Pagination + Mobile Fallback
    ├── StudentQuickActions.tsx                # Quick Action Action Card & Navigation CTAs
    ├── StudentAnnouncementsWidget.tsx         # Institutional Announcements with Empty State
    └── StudentDashboardFooter.tsx             # Institutional Copyright & Legal Links
```

---

## 2. Component Implementation Details

### 2.1 `StudentWelcomeHero.tsx`
- **Avatar:** Circular avatar (`w-14 h-14`) styled with student primary blue `#7FA8D9`, subtle white border, and bold uppercase student initials derived from `user.user_metadata.full_name` or `user.email`.
- **Greeting & Name:** "Welcome back," subtitle and bold student name (`text-2xl font-bold text-slate-800`).
- **Academic Chips:** Horizontal container of rounded metadata pills (`Department`, `Roll No`, `Semester`). Built to gracefully omit non-existent attributes:
  ```tsx
  {dept && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{dept}</span>}
  {rollNo && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Roll No: {rollNo}</span>}
  {semester && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Semester: {semester}</span>}
  ```
- **Quote Banner:** Features a rounded glyph badge containing quote marks (`“`) alongside the institutional assurance message: *"Your voice matters. We are here to listen, act, and resolve."*
- **Campus Illustration:** Uses Next.js `<Image>` at `/images/student-hero-campus.png` absolutely positioned at the right with a soft radial opacity mask to integrate with the card surface.

### 2.2 `StudentStatsRow.tsx`
Renders 3 metric cards aligned horizontally across the top of the left column:
1. **Total Complaints:** Card with `#EAF2FB` rounded icon container, blue document icon, numerical count, bold title "Total Complaints", and exact subtitle "You have raised".
2. **In Progress:** Card with `#FEF3C7` icon container, amber hourglass icon, count, title "In Progress", and subtitle "Currently being handled".
3. **Resolved:** Card with `#DCFCE7` icon container, green checkmark icon, count, title "Resolved", and subtitle "Successfully resolved".

### 2.3 `StudentActionRequiredBanner.tsx`
- Conditionally renders when complaints in canonical `RESOLVED` status await student verification (`c.status === "RESOLVED" && c.resolution?.studentVerified !== true`). Under the canonical domain FSM, resolved complaints only transition to `CLOSED` upon verification.
- Visual style: Amber warning container (`bg-amber-50/80 border border-amber-200 text-amber-800`).
- Header: Warning triangle icon + bold title "Action Required".
- Description: Informs the student of the exact count of complaints pending verification.
- CTA: Amber button "Review Now >" linking directly to the first unverified complaint detail view.

### 2.4 `StudentRecentComplaintsTable.tsx`
- **Header:** Title "Recent Complaints" with "View All →" link directing to `/complaints`.
- **Desktop Table:**
  - Semantic `<table>` with headers: `Tracking ID`, `Title`, `Category`, `Priority`, `Status`, `Last Updated`, `Action`.
  - Canonical `StatusPill` rendering the 13 domain lifecycle states.
  - Standard `PriorityBadge` with low/medium/high/urgent visual semantics.
  - Action column: Clean circular eye icon button linking to `/complaints/[id]` with `aria-label="View complaint details"`.
- **Dynamic Pagination:**
  - Responsive footer rendering `"Showing {start} to {end} of {total} complaints"`.
  - Previous / Next buttons wired directly to component state and `GET /api/v1/complaints` pagination query params.
- **Mobile Card View:** Fully responsive alternative rendered on mobile viewports (`md:hidden`), displaying complaint items as cards with tracking IDs, titles, badges, and view links.

### 2.5 `StudentQuickActions.tsx` & `StudentAnnouncementsWidget.tsx`
- **Quick Actions:** High-visibility right-column card.
  - Primary CTA: `+ Submit New Complaint` button in student primary `#7FA8D9` hover `#6895C9` with white text.
  - Secondary navigation actions: "View My Complaints", "My Verifications", and "View Announcements" with subtle chevron indicators.
- **Announcements Widget:** Card with megaphone icon, title "Announcements", and "View All →" link.
  - Honest empty state: *"No campus announcements at this time. Administrative notices will appear here once published."*

### 2.6 Shell Updates
- **`TopBar.tsx`:** Campus Plus shield icon with white `C+`, "Campus Plus" header, tagline "Accountable. Transparent. Together.", student navigation links with active indicator bar, complainant avatar with role label, and honest zero-count notification bell.
- **`Sidebar.tsx`:** Main menu with tailored SVGs, active indicator bar and background tint, plus the institutional block ("R.C. Patel Institute of Technology", "Shirpur") immediately below the navigation links.
- **`AppShell.tsx`:** Suppressed breadcrumbs on `/dashboard` to preserve the visual hero composition from the visual reference.

---

## 3. Student Design Token Mapping

| Token Name | Token Role | Hex Code | Tailwind / CSS Utility |
|---|---|---|---|
| Primary | Primary Student Brand | `#7FA8D9` | `bg-[#7FA8D9]`, `text-[#7FA8D9]`, `border-[#7FA8D9]` |
| Secondary | Border & Focus Rings | `#B8D0EC` | `border-[#B8D0EC]`, `focus:ring-[#7FA8D9]` |
| Accent | Background Tint / Pill Fill | `#EAF2FB` | `bg-[#EAF2FB]`, `hover:bg-[#EAF2FB]/80` |
| Surface | Base Card Surface | `#FAFCFE` | `bg-[#FAFCFE]`, `bg-white` |
| Text | Primary Body & Header Text | `#33475B` | `text-[#33475B]`, `text-slate-800` |
| Action Text | Dark Accent & Button Text | `#1E3A5F` | `text-[#1E3A5F]`, `hover:text-[#1E3A5F]` |
