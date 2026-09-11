# Phase 08-B: Search, Filter & Table UI Specification

**Document Identifier:** `19-search-filter-table-ui.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Scope:** Complaint catalog search, multi-criteria filtering, and data table layouts (`SHR-002`).

---

## 1. Global Search & Filter Bar Architecture

The global search system provides fast, multi-criteria lookup constrained strictly by the user's role:

```text
+----------------------------------------------------------------------------------------------------+
| [ Search by Tracking Code (CP-YYYY-XXXXX) or Keyword...            (Ctrl+K) ]  [ Filter (3) v ]     |
+----------------------------------------------------------------------------------------------------+
| ACTIVE FILTERS: [ Status: In Progress x ] [ Priority: High x ] [ Dept: IT x ]      [ Clear All ]  |
+----------------------------------------------------------------------------------------------------+
```

### 1.1 Filter Criteria (URL Query Param Mappings)
- `search`: Keyword string matching tracking code prefix or title text.
- `status`: Multi-select enum (`SUBMITTED`, `IN_PROGRESS`, `RESOLVED`, etc.).
- `category`: Multi-select enum (`NETWORK_WIFI`, `HOSTEL_MAINTENANCE`, etc.).
- `priority`: Single or multi-select (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
- `dateFrom` / `dateTo`: ISO 8601 date range string.
- `page` / `limit`: Pagination parameters (default `page=1&limit=20`).

---

## 2. Responsive Table Structure & Mobile Fallback

- **Desktop View (>= 1024px):** Standard tabular grid with columns:
  - Checkbox (batch actions for HOD/Admin)
  - Tracking Code (`CMP-DOM-01`)
  - Title & Snippet
  - Category / Department
  - Priority Badge
  - SLA Indicator
  - Current Status Pill
  - Action Menu (`...`)
- **Mobile View (< 768px):** Automatic transformation to stacked cards:
  - Top line: Tracking code + Status Pill.
  - Middle: Complaint title (bold).
  - Bottom line: Department, SLA remaining, and quick chevron link.
