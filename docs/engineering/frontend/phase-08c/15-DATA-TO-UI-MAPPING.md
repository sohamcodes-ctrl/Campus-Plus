# Campus Plus — Phase 08-C: Data-to-UI Mapping Specification

**Document Classification:** Frontend Data Integration Specification  
**Authority:** Senior React / Next.js Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Domain Entity to Presentation Component Mapping

| Domain Entity / Value Object | TypeScript DTO Type | UI Component / Presentation Element | Formatting / Presentation Rules |
|---|---|---|---|
| `TrackingCode` | `string` (`CP-YYYY-XXXXX`) | `TrackingCodeBadge` | Monospace badge with role accent outline and copy-to-clipboard |
| `ComplaintStatus` | `ComplaintStatus` (13 states)| `StatusPill` | Distinct semantic background, dot indicator, accessible text label |
| `Priority` | `Priority` (4 levels) | `PriorityBadge` | Color-coded badges (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) |
| `ComplaintTitle` | `string` (10–120 chars) | Input / Header text | Truncated in tables with full title tooltip |
| `ComplaintDescription`| `string` (>= 30 chars) | `TextArea` / Content Card | Paragraph rendering with preserved whitespace |
| `TimelineEvent` | `TimelineItem` | `TimelineFeed` | Chronological card stream with actor role badge |\n