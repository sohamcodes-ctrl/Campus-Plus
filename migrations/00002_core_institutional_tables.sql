-- ==============================================================================
-- Migration 00002: Core Institutional Master & Reference Tables
-- ==============================================================================

-- 1. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_department_code_format CHECK (code ~ '^[A-Z0-9_-]+$')
);

-- 2. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    requires_resolution_proof BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Locations Table (Normalized for Clustering)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus VARCHAR(100) NOT NULL DEFAULT 'Main Campus',
    building VARCHAR(100) NOT NULL,
    block VARCHAR(50),
    floor VARCHAR(20),
    room_or_area VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_locations_unique_spot UNIQUE (campus, building, block, floor, room_or_area)
);

-- 4. Working Calendars Table
CREATE TABLE working_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    work_start_time TIME NOT NULL DEFAULT '09:00:00',
    work_end_time TIME NOT NULL DEFAULT '17:00:00',
    work_days_bitmask INTEGER NOT NULL DEFAULT 62, -- Monday (bit 1) through Friday (bit 5)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Calendar Holidays Table
CREATE TABLE calendar_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES working_calendars(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    description VARCHAR(200) NOT NULL,
    CONSTRAINT uk_calendar_holiday UNIQUE (calendar_id, holiday_date)
);
