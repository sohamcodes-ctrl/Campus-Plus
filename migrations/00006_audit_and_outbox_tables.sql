-- ==============================================================================
-- Migration 00006: Audit Journal, Immutability Trigger, Outbox & Idempotency
-- ==============================================================================

-- 1. Action History Table (Append-Only Audit Trail)
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL indicates automated daemon
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    remarks TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Audit Immutability Trigger & Function
CREATE OR REPLACE FUNCTION trg_enforce_action_history_immutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SECURITY VIOLATION: action_history is an immutable append-only journal. UPDATE and DELETE are prohibited.'
        USING ERRCODE = '55000'; -- Object not modifiable
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_action_history_no_mutation
BEFORE UPDATE OR DELETE ON action_history
FOR EACH ROW EXECUTE FUNCTION trg_enforce_action_history_immutable();

-- 3. Transactional Outbox Events Table
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status outbox_status_enum NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ
);

-- 4. Idempotency Keys Table
CREATE TABLE idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_code INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);
