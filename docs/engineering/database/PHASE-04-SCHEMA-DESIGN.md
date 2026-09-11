# Phase 04 — Physical Database Schema Design & DDL Architecture

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Schema Design Approved  

---

## 1. Schema Namespaces & Extensions

The schema utilizes standard PostgreSQL features and portability-first design:
- Schema: `public` (or institutional tenant schema).
- Extensions:
  - `pgcrypto` (or `uuid-ossp`): For `gen_random_uuid()`.

---

## 2. Enumerated Data Types (ENUMs)

```sql
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
```

---

## 3. Institutional Reference & Identity Tables

### 3.1 `departments`
```sql
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
```

### 3.2 `categories`
```sql
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
```

### 3.3 `locations`
```sql
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
```

### 3.4 `working_calendars` & `calendar_holidays`
```sql
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

CREATE TABLE calendar_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES working_calendars(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    description VARCHAR(200) NOT NULL,
    CONSTRAINT uk_calendar_holiday UNIQUE (calendar_id, holiday_date)
);
```

### 3.5 `users`, `roles`, `user_roles`, `department_memberships`
```sql
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    description TEXT NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    roll_or_prn VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE department_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    is_head BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    CONSTRAINT uk_active_department_membership UNIQUE (user_id, department_id, is_active)
);
```

---

## 4. Core Complaint Aggregate Tables

### 4.1 `complaints`
```sql
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
```

### 4.2 `complaint_assignments`
```sql
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
```

### 4.3 `complaint_forwards`
```sql
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
```

### 4.4 `complaint_escalations`
```sql
CREATE TABLE complaint_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    from_tier escalation_tier_enum NOT NULL,
    to_tier escalation_tier_enum NOT NULL,
    escalated_by_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL indicates automated system SLA escalation
    is_automated BOOLEAN NOT NULL DEFAULT FALSE,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 4.5 `resolutions`
```sql
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
```

---

## 5. Attachments & Private Notes Tables

### 5.1 `attachments`
```sql
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
```

### 5.2 `internal_notes`
```sql
CREATE TABLE internal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    author_role VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_internal_note_len CHECK (char_length(note) >= 5)
);
```

---

## 6. Audit & Outbox Tables

### 6.1 `action_history` (Append-Only Audit Journal)
```sql
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    remarks TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 `outbox_events` & `idempotency_keys`
```sql
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

CREATE TABLE idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_code INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);
```

### 6.3 `sla_policies` & `notifications`
```sql
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
```

---

## 7. Audit Immutability Trigger

```sql
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
```
