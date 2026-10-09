-- ============================================================================
-- Migration 00012: Temporary attachment upload tracking and cleanup
-- ============================================================================

CREATE TABLE temporary_attachment_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key VARCHAR(500) NOT NULL UNIQUE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_temporary_attachment_uploads_expiry
    ON temporary_attachment_uploads (expires_at);