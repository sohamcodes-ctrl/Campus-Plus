# Phase 08-B: System Administrator UI Specification (ROLE_ADMIN)

**Document Identifier:** `15-admin-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Target Role:** `ROLE_ADMIN` (Campus System Administrator)  
**Locked Palette:** Primary `#9FB4C7` | Secondary `#C7D5E0` | Accent `#EEF3F7` | Surface `#FBFCFD` | Text `#37495A` (Contrast 8.8:1)

---

## 1. Persona Mental Model & Core Objectives

System Administrators maintain system health, user account roles, institutional categories, and audit immutability.
- **Primary Need:** System status monitoring, user role mapping, category directory maintenance, and security log inspection.
- **Key Question:** "Is the system healthy, are all users properly mapped to departments/roles, and are there security anomalies?"
- **UX Tenet:** Rigorous data integrity, clear administrative status, explicit audit trails, and zero destructive shortcuts.

---

## 2. Screen Specifications

### 2.1 ADM-001: System Admin Dashboard (`/dashboard`)
- **Header Bar:** TopBar with `#9FB4C7` 3px accent bar, admin role badge.
- **System Health Monitor (4 Widgets):**
  1. *Database & Storage Status:* Supabase PostgreSQL connection pool, storage bucket health.
  2. *Total Provisioned Users:* Count of active accounts across all 5 roles.
  3. *Audit Log Throughput:* Daily transaction events recorded in immutable audit log.
  4. *Outbox Queue Status:* Transactional outbox delivery state (0 failed events).
- **Administrative Navigation Modules:**
  - User & Role Directory (`ADM-002`).
  - Department & Category Configuration.
  - System Audit Log Explorer.

### 2.2 ADM-002: User & Role Directory View (`/admin/users`)
- **Features & Controls:**
  - Search bar: Filter by name, email, roll number, or employee ID.
  - Role Filter: `All`, `Student`, `Handler`, `Dept Head`, `Management`, `Admin`.
  - Department Filter: Filter staff by assigned department.
  - Table Columns: User Name, Institutional Email, Role Badge, Department, Account Status, Last Active.
  - Role Mapping Modal (Proposed): Interface for assigning staff members to specific handler queues or HOD roles.
