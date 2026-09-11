# Phase 08-B: Design Token Architecture & CSS Variable Map

**Document Identifier:** `03-design-token-system.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Maps all abstract tokens into concrete CSS custom properties (`var(--token)`) ready for Tailwind CSS v4 `@theme` integration.

---

## 1. Design Token Architecture Overview

Tokens are structured into 3 distinct tiers:
1. **Global Base Tokens:** Raw color scales, base spacing units, typography primitives.
2. **Semantic Theme Tokens:** Meaning-based tokens (`--surface-primary`, `--border-subtle`, `--text-main`).
3. **Role & Component Tokens:** Context-specific tokens (`--role-primary`, `--status-resolved-bg`).

---

## 2. Master CSS Custom Property Specifications

### 2.1 Neutral Surfaces & Borders
```css
:root {
  /* Neutral Surfaces */
  --surface-canvas: #FAFAFA;
  --surface-card: #FFFFFF;
  --surface-muted: #F8FAFC;
  --surface-inset: #F1F5F9;
  --surface-overlay: rgba(15, 23, 42, 0.4);

  /* Neutral Borders */
  --border-subtle: #E2E8F0;
  --border-strong: #CBD5E1;
  --border-focus: #33475B;

  /* Text & Typography */
  --text-primary: #0F172A;
  --text-secondary: #334155;
  --text-muted: #64748B;
  --text-disabled: #94A3B8;
  --text-inverse: #FFFFFF;
}
```

### 2.2 Role-Scoped Theme Variables (Injected via `data-role` Attribute)
```css
/* Student / Complainant */
[data-role="ROLE_STUDENT"], [data-role="ROLE_FACULTY"] {
  --role-primary: #7FA8D9;
  --role-secondary: #B8D0EC;
  --role-accent: #EAF2FB;
  --role-surface: #FAFCFE;
  --role-text: #33475B;
  --role-ring: rgba(127, 168, 217, 0.35);
}

/* Faculty Handler / Technician */
[data-role="ROLE_HANDLER"] {
  --role-primary: #7FC4B2;
  --role-secondary: #B7E0D3;
  --role-accent: #E9F6F1;
  --role-surface: #FAFDFC;
  --role-text: #2E4A42;
  --role-ring: rgba(127, 196, 178, 0.35);
}

/* Department Head / HOD */
[data-role="ROLE_DEPT_HEAD"] {
  --role-primary: #B39DDB;
  --role-secondary: #D6C6EC;
  --role-accent: #F3EDFA;
  --role-surface: #FCFAFE;
  --role-text: #43395A;
  --role-ring: rgba(179, 157, 219, 0.35);
}

/* Director / Administrator */
[data-role="ROLE_ADMIN"] {
  --role-primary: #9FB4C7;
  --role-secondary: #C7D5E0;
  --role-accent: #EEF3F7;
  --role-surface: #FBFCFD;
  --role-text: #37495A;
  --role-ring: rgba(159, 180, 199, 0.35);
}

/* College Body / Management */
[data-role="ROLE_MANAGEMENT"] {
  --role-primary: #E3A6AE;
  --role-secondary: #F0C9CE;
  --role-accent: #FBEDEF;
  --role-surface: #FEFAFA;
  --role-text: #5C333A;
  --role-ring: rgba(227, 166, 174, 0.35);
}
```

### 2.3 Semantic Feedback Tokens
```css
:root {
  /* Success */
  --status-success-bg: #F0FDF4;
  --status-success-text: #15803D;
  --status-success-border: #BBF7D0;

  /* Warning / Pending */
  --status-warning-bg: #FFFBEB;
  --status-warning-text: #B45309;
  --status-warning-border: #FDE68A;

  /* Danger / Escalated / Error */
  --status-danger-bg: #FFF1F2;
  --status-danger-text: #BE123C;
  --status-danger-border: #FECDD3;

  /* Info / In Progress */
  --status-info-bg: #EFF6FF;
  --status-info-text: #1D4ED8;
  --status-info-border: #BFDBFE;
}
```

---

## 3. Spatial, Radius, Shadow & Motion Tokens

| Token Category | Token Identifier | Value | Tailwind v4 Equivalent | Functional Application |
| :--- | :--- | :---: | :--- | :--- |
| **Radius** | `--radius-sm` | `4px` | `rounded-sm` | Checkboxes, tags |
| | `--radius-md` | `6px` | `rounded-md` | Buttons, inputs, dropdowns |
| | `--radius-lg` | `8px` | `rounded-lg` | Cards, table containers |
| | `--radius-xl` | `12px` | `rounded-xl` | Modals, flyout panels |
| | `--radius-full`| `9999px` | `rounded-full`| Status pills, avatars |
| **Shadow** | `--shadow-subtle` | `0 1px 2px 0 rgba(0,0,0,0.05)` | `shadow-sm` | Resting cards, table rows |
| | `--shadow-card` | `0 2px 4px -1px rgba(0,0,0,0.06)` | `shadow` | Active/hovered cards |
| | `--shadow-modal`| `0 10px 15px -3px rgba(0,0,0,0.1)` | `shadow-lg` | Modals, popovers, drawers |
| **Motion** | `--ease-standard`| `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out` | Default transitions |
| | `--duration-fast`| `150ms` | `duration-150` | Button hover, toggle |
| | `--duration-base`| `200ms` | `duration-200` | Accordion, drawer slide |
| | `--duration-modal`| `250ms` | `duration-250` | Dialog fade & scale |
