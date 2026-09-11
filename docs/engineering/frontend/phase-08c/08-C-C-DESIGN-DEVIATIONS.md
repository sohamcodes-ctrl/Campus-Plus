# Campus Plus — Phase 08-C: Stage 08-C-C Design Deviations Register

**Authority:** Principal Frontend Architect, Design Systems Architect  
**Stage:** 08-C-C  
**Status:** DOCUMENTED & RATIFIED  

---

## 1. Design Deviations Log

| ID | Component | Mockup / Blueprint Specification | Reconciled Implementation | Engineering Rationale | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEV-001** | `Button` | White text (`#FFFFFF`) on Student pastel `#7FA8D9` | Dark high-contrast text (`#1E3A5F`) on `#7FA8D9` | White text yielded a failing contrast ratio of 2.62:1. Remediated dark text achieves **5.24:1**, passing WCAG 2.1 AA (4.5:1). | **SECURITY / A11Y REMEDIATION** |
| **DEV-002** | Iconography | External icon packages (Lucide / Heroicons / Feather) | Semantic, zero-dependency inline SVG icons | Strict project directive: 0 external dependency installations. Custom SVGs are fully accessible, tree-shakable, and require zero runtime overhead. | **DEPENDENCY MINIMIZATION** |
| **DEV-003** | Concurrency Error | Generic toast error message on HTTP 409 | Dedicated `ConflictModal` with version diff & reload action | OCC 409 conflicts indicate another actor updated the complaint. A toast is easily missed; a modal prevents destructive stale overwrites. | **DATA INTEGRITY PROTECTION** |
| **DEV-004** | Status Pills | Single color badge | Dual representation: color token + distinct dot/icon symbol + text | WCAG 1.4.1 mandates that information must not be conveyed by color alone. Every FSM status has a distinct geometric/iconic cue. | **A11Y REMEDIATION** |
