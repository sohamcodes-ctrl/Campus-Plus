-- ==============================================================================
-- Migration 00001: Initial Types, Extensions, and Schema Versioning Table
-- ==============================================================================

-- 1. Schema Migrations Ledger
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enumerated Domain Types

-- Complaint Lifecycle Statuses
CREATE TYPE complaint_status_enum AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'REVIEWED',
    'ASSIGNED',
    'IN_PROGRESS',
    'FORWARDED',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
    'REJECTED',
    'DUPLICATE',
    'CANCELLED'
);

-- Priority Levels
CREATE TYPE complaint_priority_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- Escalation Tiers
CREATE TYPE escalation_tier_enum AS ENUM (
    'TIER_1_HANDLER',
    'TIER_2_DEPARTMENT_HEAD',
    'TIER_3_MANAGEMENT'
);

-- Attachment Classifications
CREATE TYPE attachment_type_enum AS ENUM (
    'INITIAL_EVIDENCE',
    'RESOLUTION_PROOF'
);

-- Outbox Processing States
CREATE TYPE outbox_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'PUBLISHED',
    'FAILED'
);
