-- ==============================================================================
-- Migration 00010: Tracking Code Sequence
-- ==============================================================================
-- Version: 00010
-- Name: tracking_code_sequence
-- Ensures concurrency-safe tracking code sequence exists in PostgreSQL schema
-- rather than mutating schema dynamically at application runtime.

CREATE SEQUENCE IF NOT EXISTS tracking_code_seq
START WITH 1
INCREMENT BY 1;
