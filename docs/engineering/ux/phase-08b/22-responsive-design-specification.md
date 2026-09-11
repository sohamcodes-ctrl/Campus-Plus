# Phase 08-B: Responsive Design & Viewport Specification

**Document Identifier:** `22-responsive-design-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Viewport breakpoints, mobile touch metrics, fluid layouts, and responsive adaptations.

---

## 1. Breakpoint Grid & Fluid System

Campus Plus strictly supports viewports from `360px` (mobile baseline per `NFR-008`) up to high-resolution `2560px` displays:

| Breakpoint | Target Devices | Grid Columns | Margin / Padding | Layout Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **`xs` (360px - 479px)** | Small smartphones | 1 Col | `px-4` (16px) | Full-width vertical stack, mobile bottom bar (`h-[56px]`). |
| **`sm` (480px - 767px)** | Large smartphones | 1 Col | `px-4` (16px) | Full-width cards, expandable sidebars as drawers. |
| **`md` (768px - 1023px)**| Tablets / Small laptops | 2 Cols | `px-6` (24px) | Collapsible sidebar, 2-column dashboard widgets. |
| **`lg` (1024px - 1279px)**| Standard laptops | 3 Cols | `px-8` (32px) | Persistent sidebar (`w-[240px]`), full tabular data grids. |
| **`xl` (1280px - 1535px)**| Desktop displays | 4 Cols | `px-8` (32px) | Max container width `max-w-[1280px]`, metadata sidecars. |
| **`2xl` (>= 1536px)** | Large monitors | 4 Cols | `px-8` (32px) | Centered container `max-w-[1400px] mx-auto`. |

---

## 2. Mobile Touch & Interaction Standards (`xs` & `sm`)

- **Minimum Touch Target:** All buttons, links, and form toggles must occupy a minimum hitbox of `44px x 44px` (`min-h-[44px] min-w-[44px]`).
- **Form Fields on Mobile:** Input heights set to `h-11` (44px) with font size `16px` (`text-base`) to prevent iOS auto-zoom on focus.
- **Table Transformation:** Tables automatically transform from horizontal scrolling rows into stacked, card-based summaries on viewports `< 768px`.
