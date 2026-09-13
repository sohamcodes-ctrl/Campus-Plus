# Campus Plus — Student Dashboard Reconnaissance & Baseline Audit

**Document ID:** `CP-DOC-FE-STU-01`  
**Phase:** Student Dashboard Visual Replacement & High-Fidelity Implementation  
**Status:** APPROVED / EXECUTED  
**Date:** 2026-09-13  
**Target Surface:** `src/presentation/components/dashboard/StudentDashboard.tsx`  
**Authoritative Visual Reference:** `media_1789261297862.png`

---

## 1. Executive Summary & Objective

The objective of this engagement was to completely replace the legacy Student Dashboard with a production-grade, pixel-accurate implementation that faithfully reproduces the visual composition, typography, spatial geometry, card hierarchy, and institutional aesthetic of the authoritative visual reference (`media_1789261297862.png`).

Critically, the implementation was executed under strict institutional governance constraints:
1. **Zero Fake Data:** All rendered metrics, lists, and metadata are driven exclusively by authenticated session state and real API payloads (`GET /api/v1/complaints`).
2. **Canonical FSM Alignment:** Only the 13 canonical domain lifecycle states are rendered. No invented states (such as `AWAITING_VERIFICATION`) exist.
3. **Existing API Contract First:** Strict preservation of existing REST endpoints without inventing unbacked backend endpoints or mutating backend domain models.
4. **Locked Student Palette:** Strict application of `#7FA8D9` (Primary), `#B8D0EC` (Secondary), `#EAF2FB` (Accent), `#FAFCFE` (Surface), `#33475B` (Text), and `#1E3A5F` (Action Text).

---

## 2. Legacy Baseline vs. Target Specification

### 2.1 Pre-Replacement State
Prior to this implementation, the Student Dashboard (`src/presentation/components/dashboard/StudentDashboard.tsx`) exhibited several architectural and visual limitations:
- **Generic Layout:** Composed of basic cards without a tailored two-column institutional grid.
- **Disconnected Shell:** The TopBar and Sidebar lacked role-specific micro-interactions, institutional identifiers, and the exact navigation rhythm present in the visual reference.
- **Hero Deficiency:** The welcome hero was a simple banner lacking the large circular avatar, academic metadata pills, the quotation glyph badge, and the campus architectural illustration.
- **Missing Action Required Mechanism:** Complaints in `RESOLVED` status awaiting student verification were not surfaced in a dedicated, prominent alert container.
- **Table Incompleteness:** The recent complaints table lacked high-fidelity typography, canonical priority/status pills, and dynamic pagination controls.
- **Missing Side Widgets:** Quick Actions and Announcements were not isolated into dedicated, cohesive institutional widgets.

### 2.2 Target Architecture Decomposition (`media_1789261297862.png`)
The visual reference established a 7-tier layout hierarchy:
1. **Global Header (`TopBar`):**
   - Brand emblem with shield monogram `C+` (`#7FA8D9` fill, rounded geometry).
   - Brand title "Campus Plus" and subtitle "Accountable. Transparent. Together.".
   - Center navigation (`Dashboard` [active indicator], `My Complaints`, `Submit Complaint`, `Notifications`, `Help & Support`).
   - User profile section: Initials avatar (`SS`), full name, "Student" role subtitle, honest notification bell (no fabricated badge number).
2. **Left Navigation (`Sidebar`):**
   - Main menu section: `Dashboard` (active blue indicator bar + tint), `My Complaints`, `Submit Complaint`, `My Verifications`, `Announcements`, `Help & Support`, `My Account`.
   - Institutional identifier block directly beneath menu: Building icon in rounded container, "R.C. Patel Institute of Technology", "Shirpur".
3. **Student Welcome Hero (`StudentWelcomeHero`):**
   - Large avatar with student initials.
   - Greeting "Welcome back," and display name.
   - Dynamic academic metadata pills (Department, Roll Number, Semester) — data-driven, omitted if absent.
   - Quote block with quotation glyph badge: *"Your voice matters. We are here to listen, act, and resolve."*
   - Blended campus background illustration.
4. **Metric Statistics Row (`StudentStatsRow`):**
   - Three cards positioned horizontally at the top of the main column:
     - **Total Complaints:** Document icon (`#EAF2FB`), count, subtitle "You have raised".
     - **In Progress:** Hourglass icon (`#FEF3C7`), count, subtitle "Currently being handled".
     - **Resolved:** Checkmark icon (`#DCFCE7`), count, subtitle "Successfully resolved".
5. **Action Required Alert (`StudentActionRequiredBanner`):**
   - High-visibility amber banner (`#FFFBEB`, border `#FDE68A`).
   - Rendered *strictly* when complaints are in `RESOLVED` status awaiting verification.
   - Direct CTA: "Review Now >".
6. **Two-Column Content Grid:**
   - **Left Workspace (~68% width):** `StudentRecentComplaintsTable` with semantic desktop table, mobile card view, canonical pills, eye action button, and dynamic pagination summary footer.
   - **Right Workspace (~32% width):**
     - `StudentQuickActions`: Primary CTA `+ Submit New Complaint` and secondary link actions.
     - `StudentAnnouncementsWidget`: Institutional header and honest empty state.
7. **Footer (`StudentDashboardFooter`):**
   - Clean institutional copyright notice and legal links.

---

## 3. Backend Contract & Data Dependency Matrix

| Component | Required Data | Source / Endpoint | Contract Compliance Strategy |
|---|---|---|---|
| `TopBar` | Student Name, Role | `AuthContext` (`useAuth`) | Reads `actor.role` and `user.user_metadata.full_name` / `user.email`. |
| `StudentWelcomeHero` | Name, Department, Roll No, Semester | `AuthContext` (`user.user_metadata`) | Graceful degradation: pills render only when metadata exists. Zero fictitious values. |
| `StudentStatsRow` | Metric Counts | Client-side aggregation of real complaints | Computed from `complaints` returned by `GET /api/v1/complaints`. |
| `StudentActionRequiredBanner` | Verification Count | Filter: `c.status === "RESOLVED" && !c.resolution?.studentVerified` | Conditionally rendered. Fully hidden when count is 0. |
| `StudentRecentComplaintsTable` | Complaint Records, Pagination | `GET /api/v1/complaints?page=X&limit=5` | Consumes `PaginationMeta` (`total_records`, `page`, `total_pages`). Dynamic pagination summary. |
| `StudentAnnouncementsWidget` | Announcements List | None (GAP-001/002) | Renders honest institutional empty state: *"No campus announcements at this time. Administrative notices will appear here once published."* |
| `TopBar` Notifications | Unread Notification Count | None (GAP-001/002) | Bell icon rendered with honest zero badge. Opens drawer with honest empty state. |

---

## 4. Architectural Boundaries & Non-Regressive Guardrails

1. **Presentation Scope Only:** No edits to `src/domain/*`, `src/application/*`, `src/infrastructure/*`, or `migrations/*`.
2. **Role Isolation:** Zero modifications to `HandlerDashboard`, `HodDashboard`, `AdminDashboard`, or `ManagementDashboard`.
3. **Shared Component Backward Compatibility:** Enhancements to `TopBar.tsx`, `Sidebar.tsx`, and `AppShell.tsx` are conditionally role-scoped or structurally neutral, maintaining 100% test compatibility across all 5 user roles.
