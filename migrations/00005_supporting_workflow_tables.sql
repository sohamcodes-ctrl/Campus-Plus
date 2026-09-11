-- ==============================================================================
-- Migration 00005: Attachments, Internal Staff Notes, SLA Policies, and Notifications
-- ==============================================================================

-- 1. Attachments Table (Private Storage Metadata)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    attachment_type attachment_type_enum NOT NULL DEFAULT 'INITIAL_EVIDENCE',
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attachment_size_limit CHECK (file_size_bytes > 0 AND file_size_bytes <= 5242880), -- 5 MB max
    CONSTRAINT chk_attachment_mime_whitelist CHECK (mime_type IN ('image/jpeg', 'image/png', 'application/pdf'))
);

-- 2. Internal Notes Table (Strictly Staff-Only, Zero Student Visibility)
CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    author_role VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_internal_note_len CHECK (char_length(note) >= 5)
);

-- 3. SLA Policies Table
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    priority complaint_priority_enum NOT NULL,
    response_threshold_hours INTEGER NOT NULL,
    resolution_threshold_hours INTEGER NOT NULL,
    escalation_target_tier escalation_tier_enum NOT NULL DEFAULT 'TIER_2_DEPARTMENT_HEAD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_category_priority_sla UNIQUE (category_id, priority),
    CONSTRAINT chk_sla_positive_hours CHECK (response_threshold_hours > 0 AND resolution_threshold_hours >= response_threshold_hours)
);

-- 4. In-App Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
