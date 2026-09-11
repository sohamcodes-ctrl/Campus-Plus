-- ==============================================================================
-- Migration 00008: Row-Level Security (RLS) Policies & Security Functions
-- ==============================================================================

-- 1. Portability Shim: Ensure auth.uid() function exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA auth;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'auth' AND p.proname = 'uid'
    ) THEN
        EXECUTE $fn$
            CREATE FUNCTION auth.uid()
            RETURNS UUID AS $f$
            BEGIN
                RETURN COALESCE(
                    NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID,
                    NULLIF(current_setting('app.current_user_id', true), '')::UUID
                );
            EXCEPTION WHEN OTHERS THEN
                RETURN NULL;
            END;
            $f$ LANGUAGE plpgsql STABLE;
        $fn$;
    END IF;
EXCEPTION WHEN insufficient_privilege THEN
    NULL;
END;
$$;

-- 2. Security Helper Functions
CREATE OR REPLACE FUNCTION auth_has_role(required_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role_id = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

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

-- 3. Enable and Force RLS on All Protected Tables
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints FORCE ROW LEVEL SECURITY;

ALTER TABLE internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_notes FORCE ROW LEVEL SECURITY;

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments FORCE ROW LEVEL SECURITY;

ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_history FORCE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;

-- 4. Complaints RLS Policies
CREATE POLICY p_complaints_student_select ON complaints
FOR SELECT TO PUBLIC
USING (
    complainant_id = auth.uid()
);

CREATE POLICY p_complaints_dept_staff_select ON complaints
FOR SELECT TO PUBLIC
USING (
    department_id = auth_user_department_id()
    AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD'))
);

CREATE POLICY p_complaints_management_select ON complaints
FOR SELECT TO PUBLIC
USING (
    auth_has_role('ROLE_MANAGEMENT') OR auth_has_role('ROLE_ADMIN')
);

CREATE POLICY p_complaints_student_insert ON complaints
FOR INSERT TO PUBLIC
WITH CHECK (
    complainant_id = auth.uid()
    AND status = 'SUBMITTED'
);

CREATE POLICY p_complaints_handler_update ON complaints
FOR UPDATE TO PUBLIC
USING (
    department_id = auth_user_department_id()
    AND assigned_handler_id = auth.uid()
    AND auth_has_role('ROLE_HANDLER')
);

CREATE POLICY p_complaints_dept_head_update ON complaints
FOR UPDATE TO PUBLIC
USING (
    department_id = auth_user_department_id()
    AND auth_has_role('ROLE_DEPT_HEAD')
);

-- 5. Internal Notes RLS Policies (Completely Invisible to Students)
CREATE POLICY p_internal_notes_staff_select ON internal_notes
FOR SELECT TO PUBLIC
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
FOR INSERT TO PUBLIC
WITH CHECK (
    author_id = auth.uid()
    AND (
        auth_has_role('ROLE_HANDLER') 
        OR auth_has_role('ROLE_DEPT_HEAD')
        OR auth_has_role('ROLE_MANAGEMENT')
        OR auth_has_role('ROLE_ADMIN')
    )
);

-- 6. Attachments RLS Policies
CREATE POLICY p_attachments_select ON attachments
FOR SELECT TO PUBLIC
USING (
    EXISTS (
        SELECT 1 FROM complaints c
        WHERE c.id = attachments.complaint_id
        AND (
            c.complainant_id = auth.uid()
            OR (c.department_id = auth_user_department_id() AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD')))
            OR auth_has_role('ROLE_MANAGEMENT')
            OR auth_has_role('ROLE_ADMIN')
        )
    )
);

CREATE POLICY p_attachments_insert ON attachments
FOR INSERT TO PUBLIC
WITH CHECK (
    uploaded_by_id = auth.uid()
);

-- 7. Notifications RLS Policies
CREATE POLICY p_notifications_select ON notifications
FOR SELECT TO PUBLIC
USING (
    recipient_id = auth.uid()
);

CREATE POLICY p_notifications_update ON notifications
FOR UPDATE TO PUBLIC
USING (
    recipient_id = auth.uid()
);

-- 8. Action History RLS Policies (Read-Only)
CREATE POLICY p_action_history_select ON action_history
FOR SELECT TO PUBLIC
USING (
    EXISTS (
        SELECT 1 FROM complaints c
        WHERE c.id = action_history.complaint_id
        AND (
            c.complainant_id = auth.uid()
            OR (c.department_id = auth_user_department_id() AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD')))
            OR auth_has_role('ROLE_MANAGEMENT')
            OR auth_has_role('ROLE_ADMIN')
        )
    )
);
