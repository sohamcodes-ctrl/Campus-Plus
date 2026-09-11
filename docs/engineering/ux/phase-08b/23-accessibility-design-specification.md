# Phase 08-B: Accessibility & Inclusive Design Specification (WCAG 2.1 AA)

**Document Identifier:** `23-accessibility-design-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Compliance Target:** WCAG 2.1 Level AA Standard

---

## 1. Contrast Ratios & Visual Independence

Every color pairing within Campus Plus exceeds the minimum WCAG 2.1 AA threshold (4.5:1 for normal text, 3:1 for large text and UI components):

| Persona Surface | Background | Text Token | Contrast Ratio | WCAG 2.1 AA Rating |
| :--- | :--- | :--- | :---: | :---: |
| **Student** | `#FAFCFE` | `#33475B` | **9.1:1** | **PASS (AAA)** |
| **Handler** | `#FAFDFC` | `#2E4A42` | **8.9:1** | **PASS (AAA)** |
| **HOD** | `#FCFAFE` | `#43395A` | **10.2:1** | **PASS (AAA)** |
| **Director / Admin** | `#FBFCFD` | `#37495A` | **8.8:1** | **PASS (AAA)** |
| **Management** | `#FEFAFA` | `#5C333A` | **9.5:1** | **PASS (AAA)** |

### Non-Color Status Cues (Rule: Never Rely on Color Alone)
Every `StatusPill` and priority badge couples its color with:
1. An explicit text label (e.g. `IN_PROGRESS`, `RESOLVED`).
2. A distinct SVG icon or structural shape (e.g. pulsing dot for active, checkmark for resolved, alert triangle for escalated).

---

## 2. Keyboard Navigation & Focus Management

- **Skip Navigation:** Every page includes a hidden skip link: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`.
- **Focus Indicators:** Uncompromising, high-contrast focus rings: `focus-visible:ring-2 focus-visible:ring-[var(--role-primary)] focus-visible:ring-offset-2`.
- **Modal Focus Trapping:** When modals (`CMP-BASE-04`) open:
  1. Focus is trapped within modal boundaries (`Tab` and `Shift+Tab` cycle within dialog).
  2. Background content is marked `aria-hidden="true"`.
  3. Pressing `Escape` closes the modal.
  4. Closing modal returns focus to the triggering element.
- **Screen Reader Live Regions:**
  - Character counters use `aria-live="polite"`.
  - Error callouts and conflict dialogs use `aria-live="assertive"` with `role="alert"`.
