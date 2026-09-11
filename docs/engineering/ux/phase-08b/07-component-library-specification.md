# Phase 08-B: Component Library Specification & Master Component Register

**Document Identifier:** `07-component-library-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Exhaustive specification of the design system component library, anatomical structure, prop interfaces, accessibility roles, and styling tokens.

---

## 1. Master Component Register

The Campus Plus component library comprises 36 standardized components grouped into five functional tiers:

| Component ID | Component Name | Functional Tier | Description | WCAG Role | Primary Props |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CMP-BASE-01** | `Button` | Base Primitives | Action triggers with primary, secondary, outline, destructive, and ghost variants | `button` | `variant`, `size`, `isLoading`, `disabled`, `leftIcon`, `rightIcon` |
| **CMP-BASE-02** | `Badge` | Base Primitives | Muted metadata and numeric count indicator | `status` | `variant`, `size`, `label` |
| **CMP-BASE-03** | `Card` | Base Primitives | Elevated content container with header, body, footer slots | `region` / `article` | `elevated`, `roleAccent`, `padding`, `bordered` |
| **CMP-BASE-04** | `Modal` | Base Primitives | Trapped modal dialog for confirmations, assignments, and escalations | `dialog`, `aria-modal` | `isOpen`, `onClose`, `title`, `size`, `initialFocusRef` |
| **CMP-BASE-05** | `Drawer` | Base Primitives | Slide-over panel for notification feed and filter sidebars | `complementary` | `isOpen`, `onClose`, `placement`, `title` |
| **CMP-BASE-06** | `DropdownMenu` | Base Primitives | Contextual actions popover anchored to interactive trigger | `menu` | `trigger`, `items`, `align` |
| **CMP-BASE-07** | `Tooltip` | Base Primitives | Non-essential contextual helper text triggered on hover/focus | `tooltip` | `content`, `placement`, `delay` |
| **CMP-BASE-08** | `Avatar` | Base Primitives | User initials fallback with role-tinted border | `img` / `presentation` | `name`, `role`, `size` |
| **CMP-BASE-09** | `Tabs` | Base Primitives | Accessible horizontal navigation switch for view scoping | `tablist`, `tab`, `tabpanel`| `tabs`, `activeTab`, `onChange` |
| **CMP-BASE-10** | `Divider` | Base Primitives | Subtle spatial rule separating logical content sections | `separator` | `orientation`, `spacing` |
| **CMP-FORM-01** | `TextInput` | Form Controls | Single-line text entry with label, error text, helper text, and clear button | `textbox` | `label`, `error`, `helperText`, `maxLength`, `showCount` |
| **CMP-FORM-02** | `TextArea` | Form Controls | Multi-line text field with mandatory live character counter and validation | `textbox`, `multiline` | `label`, `error`, `minLength`, `maxLength`, `rows` |
| **CMP-FORM-03** | `Select` | Form Controls | Native or accessible custom dropdown selector with search filtering | `combobox` / `listbox` | `label`, `options`, `value`, `onChange`, `placeholder` |
| **CMP-FORM-04** | `RadioGroup` | Form Controls | Mutually exclusive option selection (e.g. priority levels) | `radiogroup`, `radio` | `name`, `options`, `value`, `onChange`, `orientation` |
| **CMP-FORM-05** | `Checkbox` | Form Controls | Independent boolean toggle with focus ring and label alignment | `checkbox` | `checked`, `onChange`, `label`, `indeterminate` |
| **CMP-FORM-06** | `FileUploader` | Form Controls | Drag-and-drop attachment container with file type, size validation, and progress | `button` / `region` | `accept`, `maxFiles`, `maxSizeMB`, `onFilesSelected` |
| **CMP-FORM-07** | `SearchInput` | Form Controls | Fast filter input with search icon, clear button, and `Ctrl+K` shortcut cue | `searchbox` | `value`, `onChange`, `onSearch`, `debounceMs` |
| **CMP-FORM-08** | `CharacterCounter` | Form Controls | Real-time threshold indicator (e.g. 10-120 chars, min 30 chars) | `status`, `aria-live` | `current`, `min`, `max`, `hasError` |
| **CMP-FORM-09** | `DateRangePicker` | Form Controls | Dual calendar date range selector for triage and management reporting | `dialog` / `group` | `startDate`, `endDate`, `onChange`, `presets` |
| **CMP-FEED-01** | `AlertBanner` | Feedback & System | Prominent inline callout for institutional alerts, SLA warnings, and breaches | `alert` / `status` | `type` (info, warning, error, success), `title`, `dismissible` |
| **CMP-FEED-02** | `Toast` | Feedback & System | Ephemeral notification pill for operation feedback (success, undo, retry) | `status`, `aria-live` | `message`, `type`, `duration`, `action` |
| **CMP-FEED-03** | `EmptyState` | Feedback & System | Zero-data placeholder with contextual illustration, description, and primary CTA | `region` | `title`, `description`, `icon`, `actionButton` |
| **CMP-FEED-04** | `SkeletonLoader` | Feedback & System | Accessible pulsing gray geometric placeholders matching card/table geometry | `presentation` | `variant` (card, row, text, avatar), `count` |
| **CMP-FEED-05** | `InlineError` | Feedback & System | High-contrast error message tied directly to form controls via `aria-describedby`| `alert` | `id`, `message` |
| **CMP-FEED-06** | `Spinner` | Feedback & System | Minimal rotational SVG indicator for background network requests | `status`, `progressbar`| `size`, `label` |
| **CMP-FEED-07** | `ConfirmDialog` | Feedback & System | Standardized high-consequence confirmation modal (Cancellation, Disputing) | `alertdialog` | `title`, `message`, `confirmText`, `cancelText`, `isDestructive`|
| **CMP-FEED-08** | `ConflictModal` | Feedback & System | Concurrency conflict (HTTP 409) resolution dialog with diff display | `alertdialog` | `currentData`, `staleData`, `onReload` |
| **CMP-NAV-01** | `TopBar` | Navigation & Shell | Global header with institution crest, search shortcut, role badge, profile menu | `banner` | `user`, `role`, `notificationCount`, `onSearchClick` |
| **CMP-NAV-02** | `Sidebar` | Navigation & Shell | Desktop persistent navigation links with active state indicator and collapse | `navigation` | `navItems`, `currentRoute`, `roleColor` |
| **CMP-NAV-03** | `BottomNav` | Navigation & Shell | Mobile-only bottom navigation bar (`h-[56px]`) with touch-friendly 44px tap targets| `navigation` | `navItems`, `currentRoute` |
| **CMP-NAV-04** | `Breadcrumbs` | Navigation & Shell | Hierarchical location trail (e.g. Dashboard > Complaints > CP-2026-00142) | `navigation`, `breadcrumb`| `items` (label, href) |
| **CMP-NAV-05** | `Pagination` | Navigation & Shell | Server-side paginator with page counts, jump-to, and page-size selector | `navigation` | `currentPage`, `totalPages`, `pageSize`, `onPageChange` |
| **CMP-DOM-01** | `TrackingCodeBadge`| Domain & Complaint | High-visibility monospace badge (`CP-YYYY-XXXXX`) with one-click copy button | `status` | `trackingCode`, `copyable` |
| **CMP-DOM-02** | `StatusPill` | Domain & Complaint | Standardized semantic color-coded pill representing the 13 FSM lifecycle states | `status` | `status` (SUBMITTED, IN_PROGRESS, RESOLVED, etc.) |
| **CMP-DOM-03** | `PriorityBadge` | Domain & Complaint | Institutional urgency indicator (LOW, MEDIUM, HIGH, URGENT) with dot cue | `status` | `priority` |
| **CMP-DOM-04** | `TimelineFeed` | Domain & Complaint | Chronological action history feed with public/internal segregation toggle | `feed` | `events`, `showInternalNotes`, `userRole` |

---

## 2. Component Anatomy & Implementation Blueprint

### 2.1 CMP-BASE-01: `Button`
- **Anatomy:**
  ```
  +-------------------------------------------------------------+
  |  [Left Icon Slot]   Button Label Text   [Right Icon Slot]   |
  |  (w-4 h-4 mr-2)     (text-sm font-medium)  (w-4 h-4 ml-2)   |
  +-------------------------------------------------------------+
  ```
- **Variants:**
  - `primary`: Background matches role primary token (`bg-[var(--role-primary)]`), text `#FFFFFF`, hover `opacity-90`, focus ring `ring-2 ring-[var(--role-primary)] ring-offset-2`.
  - `secondary`: Subtle background `bg-surface-subtle`, border `border border-border`, text `text-text-primary`, hover `bg-surface-hover`.
  - `outline`: Border `border border-[var(--role-primary)]`, text `text-[var(--role-primary)]`, hover `bg-[var(--role-accent)]`.
  - `destructive`: Background `bg-status-rejected-text`, text `#FFFFFF`, hover `bg-status-rejected-border`, focus ring `ring-2 ring-status-rejected-text`.
  - `ghost`: Transparent background, hover `bg-surface-subtle`, text `text-text-primary`.
- **States:** Default, Hover, Active, Focus-Visible, Disabled (`opacity-40 cursor-not-allowed pointer-events-none`), Loading (`pointer-events-none`, label hidden or spinner prepended).
- **TypeScript Props Interface:**
  ```typescript
  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```

### 2.2 CMP-DOM-02: `StatusPill`
- **Anatomy:**
  ```
  +----------------------------------------------------+
  |  (*) [Status Dot]   STATUS TEXT (UPPERCASE)        |
  |      (w-1.5 h-1.5)  (text-xs font-semibold px-2.5) |
  +----------------------------------------------------+
  ```
- **Token Class Mappings:**
  - `SUBMITTED`: `bg-[var(--status-submitted-bg)] text-[var(--status-submitted-text)] border border-[var(--status-submitted-border)]`
  - `IN_PROGRESS`: `bg-[var(--status-inprogress-bg)] text-[var(--status-inprogress-text)] border border-[var(--status-inprogress-border)]`
  - `RESOLVED`: `bg-[var(--status-resolved-bg)] text-[var(--status-resolved-text)] border border-[var(--status-resolved-border)]`
  - `ESCALATED`: `bg-[var(--status-escalated-bg)] text-[var(--status-escalated-text)] border border-[var(--status-escalated-border)]`
  - `CLOSED`: `bg-[var(--status-closed-bg)] text-[var(--status-closed-text)] border border-[var(--status-closed-border)]`
  - `REJECTED`: `bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border border-[var(--status-rejected-border)]`

### 2.3 CMP-FORM-02: `TextArea` with Real-time Character Counter
- **Anatomy:**
  ```
  +-------------------------------------------------------------+
  |  Field Label *                      [Optional Helper Icon]   |
  |  +-------------------------------------------------------+  |
  |  | Input text area contents...                           |  |
  |  |                                                       |  |
  |  +-------------------------------------------------------+  |
  |  [Inline Error Message]              Character Count (34/120)|
  +-------------------------------------------------------------+
  ```
- **Validation State Logic:**
  - If `charCount < minLength`: Counter renders `text-text-muted` or `text-status-rejected-text` when field is blurred or dirty.
  - If `charCount >= minLength && charCount <= maxLength`: Counter renders `text-status-resolved-text`.
  - If `charCount > maxLength`: Hard stop on keyboard entry or red warning banner.
  - ARIA: `aria-invalid={hasError}`, `aria-describedby="field-id-error field-id-counter"`.

### 2.4 CMP-DOM-01: `TrackingCodeBadge`
- **Anatomy:**
  ```
  +----------------------------------------------------+
  |  CP-2026-00482                            [ Copy ] |
  |  (font-mono tracking-wider font-semibold)  (w-3.5) |
  +----------------------------------------------------+
  ```
- **Styling:** `inline-flex items-center gap-2 px-2.5 py-1 bg-surface-subtle border border-border rounded-md font-mono text-xs font-semibold text-text-primary`.
- **Interaction:** On click, copy to clipboard, transient tooltip: "Copied!".
