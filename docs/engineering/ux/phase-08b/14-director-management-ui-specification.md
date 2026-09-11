# Phase 08-B: Management & Director Persona UI Specification (ROLE_MANAGEMENT)

**Document Identifier:** `14-director-management-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Target Role:** `ROLE_MANAGEMENT` (Executive Board / Director / Registrar)  
**Locked Palette:** Primary `#E3A6AE` | Secondary `#F0C9CE` | Accent `#FBEDEF` | Surface `#FEFAFA` | Text `#5C333A` (Contrast 9.5:1)

---

## 1. Persona Mental Model & Core Objectives

Executive Management reviews institution-level patterns, recurring infrastructure failures, and departmental accountability.
- **Primary Need:** Aggregated institutional KPIs, department performance benchmarks, and proactive identification of chronic issues.
- **Key Question:** "Which campus systems are failing repeatedly, which departments have backlogs, and what high-level escalations need intervention?"
- **UX Tenet:** Analytical clarity, recurring cluster visualization, comparative benchmarking, and non-intrusive governance.

---

## 2. Screen Specifications

### 2.1 MGT-001: Executive Management Dashboard (`/dashboard`)
- **Header Bar:** TopBar with `#E3A6AE` 3px accent bar, executive identity badge.
- **Campus-Wide KPI Summary (4 Metrics):**
  1. *Total Grievances Filed (Month):* Volume and month-over-month trend.
  2. *Campus SLA Compliance:* Institutional average resolution percentage (e.g. 93.8%).
  3. *Average Resolution Time:* Mean hours to closure across all categories.
  4. *Active Tier-3 Escalations:* Critical items requiring executive oversight.
- **Department Benchmark Comparison Table:**
  - Ranks departments by volume, SLA resolution percentage, average turnaround hours, and escalation rate.
- **Critical Escalations Queue:**
  - Lists complaints escalated to Tier 3 or forwarded >= 3 times.

### 2.2 MGT-002: Recurring Complaint Clusters View (`/analytics/recurring`)
- **Cluster Definition:** Automatically grouped complaints matching >= 3 filings in the same category, department, and campus location within a 30-day window (`BR-023`, `BR-024`).
- **Visual Card Structure:**
  - Red warning banner: `[!] Hotspot Detected: 7 complaints in 14 days`.
  - Cluster Meta: Category `NETWORK_WIFI` | Location `Science Block C, Floor 2` | Department `IT Infrastructure`.
  - Aggregated Complainant impact: "Filed by 5 distinct students and 2 faculty members".
  - Drill-down: Click to expand full list of constituent tracking codes (`CP-2026-XXXXX`).

### 2.3 MGT-003: Department SLA Performance View (`/analytics/performance`)
- **Features:**
  - Date range selector (Last 7 days, 30 days, Quarter, Custom).
  - Breakdown of complaint volume by priority and category.
  - Heatmap of complaint submission hours and peak days.
  - PDF / CSV report export configuration (Proposed for Phase 08-C).
