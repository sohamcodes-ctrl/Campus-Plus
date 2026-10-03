-- ============================================================================
-- Migration 00011: Verified account enrollment workflow
-- ============================================================================

CREATE TABLE registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    roll_or_prn VARCHAR(50),
    department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
    programme VARCHAR(150),
    academic_year SMALLINT,
    requested_role VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    auth_user_id UUID,
    roster_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_registration_status CHECK (status IN ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'PROVISIONED')),
    CONSTRAINT chk_registration_academic_year CHECK (academic_year IS NULL OR academic_year BETWEEN 1 AND 10)
);

CREATE UNIQUE INDEX uk_registration_pending_email
    ON registration_requests (lower(email))
    WHERE status IN ('PENDING_VERIFICATION', 'APPROVED', 'PROVISIONED');

CREATE INDEX ix_registration_requests_status ON registration_requests (status, created_at);