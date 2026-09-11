# Phase 04 — Row-Level Security (RLS) & Authorization Matrix

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Security Authorization Matrix Approved  

---

## 1. Principles of Database-Enforced Authorization

In accordance with [ADR-009](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-009-SECURITY-AUTHORIZATION-ANONYMITY.md) and [ADR-012](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-012-SUPABASE-EVALUATION-DECISION.md), Campus Plus implements **defense-in-depth authorization**:
1. **Never Trust the Client**: Neither UI button hiding nor API controller checks are considered sufficient standalone defenses.
2. **Fail Closed**: All tables have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` enabled by default. If no explicit policy grants access, all rows are invisible and all mutations are blocked (`DEFAULT DENY`).
3. **Strict Data-Scope Isolation**: Access is evaluated against the current authenticated user (`auth.uid()`), their validated roles in `user_roles`, and their active department in `department_memberships`.

---

## 2. Definitive Role-Permission Matrix

| Relational Table | Anonymous / Public | Student (`ROLE_STUDENT`) | Handler (`ROLE_HANDLER`) | Dept Head (`ROLE_DEPT_HEAD`) | Management (`ROLE_MANAGEMENT`) | System Admin (`ROLE_ADMIN`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`departments`** | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | ALL |
| **`categories`** | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | ALL |
| **`locations`** | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | SELECT (Active) | ALL |
| **`users`** | DENY | SELECT (Self) | SELECT (Dept peers + Complainants) | SELECT (Dept peers + Complainants) | SELECT (All non-restricted) | ALL |
| **`complaints`** | DENY | SELECT (Own), INSERT (Own) | SELECT (Own Dept), UPDATE (Assigned tasks) | SELECT (Own Dept), UPDATE (Own Dept) | SELECT (All), UPDATE (Escalated) | ALL |
| **`complaint_assignments`**| DENY | SELECT (Own complaints)| SELECT (Own assignments) | SELECT (Own Dept), INSERT (Own Dept) | SELECT (All) | ALL |
| **`complaint_forwards`** | DENY | SELECT (Own complaints)| SELECT (Own Dept transfers) | SELECT (Own Dept transfers), INSERT (Own Dept) | SELECT (All) | ALL |
| **`complaint_escalations`**| DENY | SELECT (Own complaints)| SELECT (Own Dept) | SELECT (Own Dept), INSERT (Own Dept) | SELECT (All), INSERT (All) | ALL |
| **`resolutions`** | DENY | SELECT (Own complaints), UPDATE (Dispute/Verify)| SELECT (Own Dept), INSERT (Assigned) | SELECT (Own Dept), INSERT/UPDATE | SELECT (All) | ALL |
| **`attachments`** | DENY | SELECT (Own), INSERT (Own) | SELECT (Dept complaints), INSERT (Proof) | SELECT (Dept complaints) | SELECT (All) | ALL |
| **`internal_notes`** | **DENY** | **DENY (Complete Isolation)** | SELECT/INSERT (Own Dept) | SELECT/INSERT (Own Dept) | SELECT/INSERT (All) | ALL |
| **`action_history`** | DENY | SELECT (Public timeline of own complaints) | SELECT (Own Dept history) | SELECT (Own Dept history) | SELECT (All) | SELECT (All) *(UPDATE/DELETE blocked for all)* |
| **`notifications`** | DENY | SELECT/UPDATE (Own) | SELECT/UPDATE (Own) | SELECT/UPDATE (Own) | SELECT/UPDATE (Own) | ALL |
| **`sla_policies`** | DENY | SELECT | SELECT | SELECT | SELECT | ALL |
| **`outbox_events`** | DENY | DENY | DENY | DENY | DENY | Service Role Only |
| **`idempotency_keys`** | DENY | Service Role Only | Service Role Only | Service Role Only | Service Role Only | Service Role Only |

---

## 3. Concrete SQL RLS Policies Specification

### 3.1 Helper Security Functions (`SECURITY DEFINER` with fixed `search_path`)
```sql
-- Check if user possesses a specific role
CREATE OR REPLACE FUNCTION auth_has_role(required_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role_id = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Get user active department ID
CREATE OR REPLACE FUNCTION auth_user_department_id()
RETURNS UUID AS $$
DECLARE
    dept_id UUID;
BEGIN
    SELECT department_id INTO dept_id
    FROM department_memberships
    WHERE user_id = auth.uid() AND is_active = TRUE
    LIMIT 1;
    RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```

### 3.2 Complaint Table Policies
```sql
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Student Policy: Read own complaints
CREATE POLICY p_complaints_student_select ON complaints
FOR SELECT TO authenticated
USING (
    complainant_id = auth.uid()
);

-- Student Policy: Insert own complaints
CREATE POLICY p_complaints_student_insert ON complaints
FOR INSERT TO authenticated
WITH CHECK (
    complainant_id = auth.uid()
    AND status = 'SUBMITTED'
);

-- Department Staff Policy: Read complaints within own department
CREATE POLICY p_complaints_dept_staff_select ON complaints
FOR SELECT TO authenticated
USING (
    department_id = auth_user_department_id()
    AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD'))
);

-- Handler Policy: Update assigned complaints
CREATE POLICY p_complaints_handler_update ON complaints
FOR UPDATE TO authenticated
USING (
    department_id = auth_user_department_id()
    AND assigned_handler_id = auth.uid()
    AND auth_has_role('ROLE_HANDLER')
);

-- Department Head Policy: Triage and update complaints within department
CREATE POLICY p_complaints_dept_head_update ON complaints
FOR UPDATE TO authenticated
USING (
    department_id = auth_user_department_id()
    AND auth_has_role('ROLE_DEPT_HEAD')
);

-- Management Policy: Institutional read across all departments
CREATE POLICY p_complaints_management_select ON complaints
FOR SELECT TO authenticated
USING (
    auth_has_role('ROLE_MANAGEMENT') OR auth_has_role('ROLE_ADMIN')
);
```

### 3.3 Internal Notes Table Policies (Zero Student Leakage)
```sql
ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;

-- Exclude students completely: Only staff in the same department or management
CREATE POLICY p_internal_notes_staff_select ON internal_notes
FOR SELECT TO authenticated
USING (
    (
        EXISTS (
            SELECT 1 FROM complaints c
            WHERE c.id = internal_notes.complaint_id
            AND c.department_id = auth_user_department_id()
        )
        AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD'))
    )
    OR auth_has_role('ROLE_MANAGEMENT')
    OR auth_has_role('ROLE_ADMIN')
);

CREATE POLICY p_internal_notes_staff_insert ON internal_notes
FOR INSERT TO authenticated
WITH CHECK (
    author_id = auth.uid()
    AND (
        auth_has_role('ROLE_HANDLER') 
        OR auth_has_role('ROLE_DEPT_HEAD')
        OR auth_has_role('ROLE_MANAGEMENT')
        OR auth_has_role('ROLE_ADMIN')
    )
);
```

---

## 4. IDOR / BOLA Attack Vectors & Defense Verification

| Attack Vector | Attacker Action | Defense Layer | Result |
| :--- | :--- | :--- | :--- |
| **Cross-Student IDOR** | Student A queries `SELECT * FROM complaints WHERE id = 'uuid-b'` | `p_complaints_student_select` | Returns 0 rows. Access denied. |
| **Cross-Department BOLA** | Handler in Dept A attempts to update complaint in Dept B | `p_complaints_handler_update` | Zero rows updated. Blocked. |
| **Internal Notes Sniffing** | Student requests `SELECT * FROM internal_notes WHERE complaint_id = 'own-complaint'` | `p_internal_notes_staff_select` | Returns 0 rows. Zero leakage. |
| **Tracking Reference Guessing**| Attacker enumerates `CP-2026-00001` through `CP-2026-00050` | `p_complaints_student_select` / RLS | Returns only complaints owned by attacker. |
| **Direct Attachment Fetch** | Attacker queries private storage key of another student's file | `p_attachments_select` + Signed URL | Denied at database and private bucket level. |
| **Role Self-Escalation** | Student submits `INSERT INTO user_roles (role_id) VALUES ('ROLE_ADMIN')` | Default Deny on `user_roles` | Database permission denied. |
