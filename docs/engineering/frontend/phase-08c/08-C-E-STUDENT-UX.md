# Phase 08-C-E: Student Experience UX Architecture & Design Specification
**Project:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 08-C-E — Student Experience + Product Experience Reconstruction  
**Document Type:** UX Architecture & Interaction Design Specification  
**Status:** RATIFIED & COMPLETED  

---

## 1. Vision & Emotional Charter

The student experience in Campus Plus is built around **trust, clarity, institutional accountability, and dignity**:
- Students are not treated as ticket numbers; grievances represent real disruptions to their education and campus life.
- The UI eliminates institutional obscurity: every complaint is assigned an immutable tracking code (`CP-YYYY-XXXXX`).
- Zero ambiguous statuses: what needs complainant action is surfaced immediately (e.g. resolution verification).
- Complainant privacy is absolute: students cannot see internal handler notes, other students' complaints, or unredacted investigator identities.

---

## 2. Locked Design System Tokens (Complainant Experience)

| Token | CSS Variable | Hex Value | Purpose |
|---|---|---|---|
| Primary | `--role-primary` | `#7FA8D9` | Brand identity, primary CTAs, active indicators |
| Secondary | `--role-secondary` | `#B8D0EC` | Borders, subtle highlights, badge outlines |
| Accent | `--role-accent` | `#EAF2FB` | Background fills for active selections, alert accents |
| Surface | `--role-surface` | `#FAFCFE` | Complainant container surface background |
| Text | `--role-text` | `#33475B` | Readable, accessible high-contrast text |
| Button Text | `--role-btn-text`| `#1E3A5F` | High-contrast button label text |

---

## 3. Information Architecture & Navigation

The complainant navigation hierarchy is intentionally flat and focused:
```
/dashboard                -> Student Grievance Workspace (Metrics, Active Complaints, Verification Alerts)
/complaints               -> My Complaints Ledger (Search, Category/Status/Priority Filters, History)
/complaints/new           -> Register Formal Grievance (5-Step Guided Intake with Review Step)
/complaints/[id]          -> Grievance Detail Hub (Public Timeline, Resolution Review, Dispute/Verify Actions)
```

Navigation conforms to WCAG 2.1 AA, providing 44px tap targets, high-contrast role tokens, and visible focus rings.
