# Phase 08-B: High-Fidelity Visual Design Specification

**Document Identifier:** `10-high-fidelity-visual-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Detailed visual parameters, border hierarchies, shadow elevations, role-accent geometries, and CSS variable styling rules.

---

## 1. Visual Hierarchy & Surface Elevation

Campus Plus relies on crisp borders and subtle contrast shifts rather than heavy drop shadows:

| Elevation Level | Token / Tailwind Class | Border Style | Box Shadow | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0 (Flat)** | `bg-surface border-border` | `1px solid var(--border)` | `none` | Table rows, input fields, dividers |
| **Level 1 (Card)** | `bg-surface border-border shadow-xs` | `1px solid var(--border)` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Dashboard widgets, complaint cards |
| **Level 2 (Dropdown)** | `bg-surface border-border-strong shadow-md` | `1px solid var(--border-strong)` | `0 4px 6px -1px rgba(0, 0, 0, 0.08)` | Menus, popovers, notification panel |
| **Level 3 (Modal)** | `bg-surface border-border-strong shadow-lg` | `1px solid var(--border-strong)` | `0 10px 15px -3px rgba(0, 0, 0, 0.12)`| Confirmation dialogs, forward modals |

---

## 2. Institutional Role Accent Geometries

To ensure immediate visual role recognition without garish color saturation, role colors are applied via strict geometric rules:

```mermaid
graph TD
    APP[Master App Shell] --> TOP[3px Top Brand Bar: h-[3px] bg-[var(--role-primary)]]
    APP --> SIDE[Active Nav Border: border-l-[3px] border-[var(--role-primary)]]
    APP --> BADGE[Role Identifier Pill: bg-[var(--role-accent)] text-[var(--role-text)]]
    APP --> BTN[Primary Action Button: bg-[var(--role-primary)] text-white]
```

### Exact Code Rule:
```html
<!-- Master Brand Bar (rendered on every authenticated page layout) -->
<div class="h-[3px] w-full bg-[var(--role-primary)] transition-colors duration-200" role="presentation"></div>
```

---

## 3. Typography & Text Hierarchy Implementation

| Semantic Level | Font Size | Line Height | Weight | Color Class | Font Family |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title (H1)** | `24px` (`1.5rem`) | `32px` (`2.0rem`) | Semibold (`600`) | `text-text-primary` | Inter / Sans |
| **Card Header (H2)** | `18px` (`1.125rem`) | `24px` (`1.5rem`) | Semibold (`600`) | `text-text-primary` | Inter / Sans |
| **Section Label (H3)**| `14px` (`0.875rem`) | `20px` (`1.25rem`) | Medium (`500`) | `text-text-secondary` | Inter / Sans |
| **Body Primary** | `14px` (`0.875rem`) | `20px` (`1.25rem`) | Regular (`400`) | `text-text-primary` | Inter / Sans |
| **Body Muted** | `13px` (`0.8125rem`)| `18px` (`1.125rem`)| Regular (`400`) | `text-text-muted` | Inter / Sans |
| **Tracking Code** | `12px` (`0.75rem`) | `16px` (`1.0rem`) | Semibold (`600`) | `text-text-primary` | JetBrains Mono |
