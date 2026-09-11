-- ==============================================================================
-- Migration 00004: Core Complaint Aggregate, Assignments, Forwarding & Escalations
-- ==============================================================================

-- 1. Complaints Table (Aggregate Root)
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_id VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    complainant_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    location_details VARCHAR(255) NOT NULL,
    status complaint_status_enum NOT NULL DEFAULT 'SUBMITTED',
    suggested_priority complaint_priority_enum NOT NULL DEFAULT 'MEDIUM',
    official_priority complaint_priority_enum NOT NULL DEFAULT 'MEDIUM',
    assigned_handler_id UUID REFERENCES users(id) ON DELETE SET NULL,
    escalation_tier escalation_tier_enum NOT NULL DEFAULT 'TIER_1_HANDLER',
    is_escalated BOOLEAN NOT NULL DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1,
    sla_due_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_complaint_title_len CHECK (char_length(title) >= 10 AND char_length(title) <= 120),
    CONSTRAINT chk_complaint_desc_len CHECK (char_length(description) >= 30),
    CONSTRAINT chk_complaint_version CHECK (version >= 1)
);

-- 2. Complaint Assignments History Table
CREATE TABLE complaint_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    handler_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT
);

-- 3. Complaint Forwards Table (Inter-Departmental Handoffs)
CREATE TABLE complaint_forwards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    from_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    to_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    forwarded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    forward_sequence INTEGER NOT NULL DEFAULT 1,
    rationale TEXT NOT NULL,
    forwarded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_forward_diff_dept CHECK (from_department_id <> to_department_id),
    CONSTRAINT chk_forward_rationale_len CHECK (char_length(rationale) >= 10)
);

-- 4. Complaint Escalations Table
CREATE TABLE complaint_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    from_tier escalation_tier_enum NOT NULL,
    to_tier escalation_tier_enum NOT NULL,
    escalated_by_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if system automated SLA escalation
    is_automated BOOLEAN NOT NULL DEFAULT FALSE,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Resolutions Table (1-to-1 with Complaint)
CREATE TABLE resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    resolved_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolution_summary TEXT NOT NULL,
    resolved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    student_verified BOOLEAN,
    verification_feedback TEXT,
    dispute_reason TEXT,
    disputed_at TIMESTAMPTZ,
    CONSTRAINT chk_resolution_summary_len CHECK (char_length(resolution_summary) >= 20)
);
