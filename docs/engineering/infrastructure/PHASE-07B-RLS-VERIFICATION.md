# PHASE 07-B: PostgreSQL Row Level Security (RLS) Verification

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Status:** **VERIFIED (13 Policies Forced on 6 Protected Tables)**  

---

## 1. RLS Architecture & Defense-in-Depth Principle

Campus Plus does not rely solely on application middleware or presentation checks for data isolation. If an attacker bypasses Next.js API routes or attempts direct database interaction, PostgreSQL **Row Level Security (RLS)** strictly enforces ownership, jurisdictional boundaries, and institutional privacy.

All protected tables have both `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` enabled.

---

## 2. Policy Catalog & Behavioral Mapping

| Table Name | Policy Name | Command | Target Role | Permitted Scope & Criteria |
| :--- | :--- | :---: | :--- | :--- |
| `complaints` | `p_complaints_student_select` | `SELECT` | Student | `complainant_id = auth.uid()` (Own complaints only) |
| `complaints` | `p_complaints_dept_staff_select` | `SELECT` | Staff | `department_id = auth_user_department_id() AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD'))` |
| `complaints` | `p_complaints_management_select` | `SELECT` | Management | `auth_has_role('ROLE_MANAGEMENT') OR auth_has_role('ROLE_ADMIN')` |
| `complaints` | `p_complaints_student_insert` | `INSERT` | Student | `complainant_id = auth.uid() AND status = 'SUBMITTED'` |
| `complaints` | `p_complaints_handler_update` | `UPDATE` | Handler | `department_id = auth_user_department_id() AND assigned_handler_id = auth.uid()` |
| `complaints` | `p_complaints_dept_head_update` | `UPDATE` | Dept Head | `department_id = auth_user_department_id() AND auth_has_role('ROLE_DEPT_HEAD')` |
| `internal_notes` | `p_internal_notes_staff_select` | `SELECT` | Staff | Ticket belongs to staff department OR user is Management/Admin. **Zero student visibility.** |
| `internal_notes` | `p_internal_notes_staff_insert` | `INSERT` | Staff | `author_id = auth.uid()` AND user holds staff/admin role. |
| `attachments` | `p_attachments_select` | `SELECT` | All | Allowed if caller has access to parent complaint. |
| `attachments` | `p_attachments_insert` | `INSERT` | All | `uploaded_by_id = auth.uid()` |
| `notifications`| `p_notifications_select` | `SELECT` | Recipient | `recipient_id = auth.uid()` |
| `notifications`| `p_notifications_update` | `UPDATE` | Recipient | `recipient_id = auth.uid()` (Mark as read) |
| `action_history`| `p_action_history_select` | `SELECT` | Authorized | Allowed if caller has read permission on parent complaint. |

---

## 3. RLS Test Execution Evidence

The RLS test suite in [`tests/database/rls-authorization.test.ts`](file:///d:/Deparment%20Project/department%20project/tests/database/rls-authorization.test.ts) exercises database-level security boundaries using simulated `auth.uid()` contexts:

1. **Student Isolation (BOLA Defense)**:
   - Setting `auth.uid()` to Student Alpha (`...1001`): `SELECT * FROM complaints` returns only complaints created by Student Alpha.
   - Student Beta (`...1002`) cannot see Student Alpha's complaints (returns 0 rows).
   - Direct `SELECT` by unauthenticated caller returns 0 rows.
2. **Staff Jurisdictional Isolation**:
   - Setting `auth.uid()` to IT Handler (`...1003`): Returns only IT department complaints. Hostel department complaints are completely hidden.
3. **Internal Notes Privacy**:
   - Student querying `internal_notes` returns 0 rows. Staff querying `internal_notes` retrieves staff discussion records.
4. **Audit Log Privacy**:
   - Students cannot read audit trails of complaints belonging to other students.
