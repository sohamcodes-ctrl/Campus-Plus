# Phase 08-B: Typography Scale & Spatial Layout System

**Document Identifier:** `04-typography-and-spacing-system.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Defines the complete font stack, typographic scale, line-height pairings, and 4px baseline spatial rhythm.

---

## 1. Font Family Stack

To maintain institutional authority, high rendering performance, zero external web-font loading lag, and zero layout shift (CLS), Campus Plus utilizes an optimized native system font stack:
- **Primary Sans Font:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace Code Font (Tracking References):** `"JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`

---

## 2. Implementation-Grade Typographic Scale

| Type Role | Font Size (px / rem) | Font Weight | Line Height | Letter Spacing | CSS / Tailwind Class | Usages |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Display 1** | `28px` / `1.75rem` | Bold (700) | `34px` / `1.2` | `-0.02em` | `text-2xl font-bold tracking-tight` | Top-level dashboard greetings |
| **Page Title (`h1`)** | `22px` / `1.375rem` | SemiBold (600) | `28px` / `1.3` | `-0.015em`| `text-xl font-semibold` | Screen headers (`STU-002`, `STU-003`) |
| **Section Header (`h2`)** | `18px` / `1.125rem` | SemiBold (600) | `24px` / `1.35` | `-0.01em` | `text-lg font-semibold` | Card group titles, form section dividers |
| **Card Header (`h3`)** | `15px` / `0.9375rem` | Medium (500) | `22px` / `1.45` | `0` | `text-base font-medium` | Individual card titles, table headings |
| **Body (Default)** | `14px` / `0.875rem` | Regular (400) | `20px` / `1.5` | `0` | `text-sm font-normal` | Descriptions, narratives, form labels |
| **Body (Medium)** | `14px` / `0.875rem` | Medium (500) | `20px` / `1.5` | `0` | `text-sm font-medium` | Button labels, list titles, active nav |
| **Small / Metadata** | `12px` / `0.75rem` | Regular (400) | `16px` / `1.4` | `+0.01em` | `text-xs font-normal` | Timestamps, secondary helper copy |
| **Small (Medium)** | `12px` / `0.75rem` | Medium (500) | `16px` / `1.4` | `+0.01em` | `text-xs font-medium` | Status pills, role tags, table badges |
| **Tracking Reference** | `13px` / `0.8125rem` | SemiBold (600) | `18px` / `1.4` | `+0.04em` | `font-mono text-xs font-semibold` | `CP-YYYY-XXXXX` reference strings |

---

## 3. The 4px Spatial Rhythm Scale

All margins, paddings, gap dimensions, and component heights adhere to a strict mathematical scale based on multiples of 4px:

| Spacing Token | Pixels | Rem Equivalent | Tailwind Class | Standard Architectural Application |
| :--- | :---: | :---: | :--- | :--- |
| `--space-1` | `4px` | `0.25rem` | `p-1`, `gap-1` | Badge padding, icon gap |
| `--space-2` | `8px` | `0.5rem` | `p-2`, `gap-2` | Compact button padding, input internal gap |
| `--space-3` | `12px` | `0.75rem` | `p-3`, `gap-3` | Input horizontal padding, card internal stack gap |
| `--space-4` | `16px` | `1.0rem` | `p-4`, `gap-4` | Standard card body padding, form row vertical gap |
| `--space-5` | `20px` | `1.25rem` | `p-5`, `gap-5` | Roomy card padding, drawer content padding |
| `--space-6` | `24px` | `1.5rem` | `p-6`, `gap-6` | Page container padding, major section dividers |
| `--space-8` | `32px` | `2.0rem` | `p-8`, `gap-8` | Dashboard widget separation, modal internal margins |
| `--space-12` | `48px` | `3.0rem` | `p-12`, `gap-12`| Empty state vertical centering, hero padding |

---

## 4. Layout Grid & Container Dimensions
- **Max Content Width:** `1280px` (`max-w-7xl`). Centered with `mx-auto`.
- **Fixed Sidebar Width:** `240px` (`w-60`). Collapses to `64px` rail on tablet and slide-out drawer on mobile.
- **Top App Header Height:** `60px` (`h-[60px]`). Fixed position with sticky top anchoring.
- **Mobile Touch Padding:** Screens strictly maintain minimum horizontal edge padding of `16px` (`px-4`) on viewports `< 768px`.
