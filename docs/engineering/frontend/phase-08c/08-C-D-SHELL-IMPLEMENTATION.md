# Campus Plus — Phase 08-C-D: Application Shell Implementation

**Authority:** Senior Next.js Engineer, UX Systems Lead  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Shell Components Specification

### 1.1 TopBar (`src/presentation/components/shell/TopBar.tsx`)
- **3px Brand Bar:** Fixed at the top, consuming `var(--role-primary,#7FA8D9)`.
- **Institutional Branding:** "Campus Plus" monogram and subtitle.
- **Active Role Badge:** Uses 08-C-C `Badge` with `variant="role"` and dot indicator.
- **Notification Drawer Trigger:** Opens `Drawer` with honest empty state (GAP-001/002).
- **User Actions Menu:** Displays actor identity, department scope, and Sign Out action.

### 1.2 Sidebar (`src/presentation/components/shell/Sidebar.tsx`)
- Desktop sidebar (`w-60`), role-filtered navigation items, active route indicator (`border-l-3` and role accent fill).

### 1.3 Mobile Navigation (`src/presentation/components/shell/MobileNav.tsx`)
- Bottom navigation bar (`h-14`, minimum 44px tap targets), primary items + "More" slide-over drawer trigger.

### 1.4 Breadcrumbs (`src/presentation/components/shell/Breadcrumbs.tsx`)
- `<nav aria-label="Breadcrumb">`, Home (`/dashboard`) root, truncates long tracking codes or UUIDs.

### 1.5 ProtectedRoute (`src/presentation/components/auth/ProtectedRoute.tsx`)
- Guards protected surfaces, evaluates 9-state auth machine, handles loading, unauthenticated redirect, and 403 Forbidden states.
