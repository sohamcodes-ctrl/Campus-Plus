-- ==============================================================================
-- Migration 00007: Performance Indexes (Composite & Partial)
-- ==============================================================================

-- 1. Public Tracking Reference Lookup
CREATE UNIQUE INDEX idx_complaints_ref_id 
    ON complaints (ref_id);

-- 2. Student Personal Worklist (Equality on Student, Sorted by Date)
CREATE INDEX idx_complaints_student_list 
    ON complaints (complainant_id, created_at DESC);

-- 3. Department Head Triage Worklist
CREATE INDEX idx_complaints_dept_queue 
    ON complaints (department_id, status, official_priority, created_at DESC);

-- 4. Handler Assigned Active Worklist
CREATE INDEX idx_complaints_handler_queue 
    ON complaints (assigned_handler_id, status, created_at DESC);

-- 5. SLA Monitor Overdue Partial Index (Active Tickets Only)
CREATE INDEX idx_complaints_sla_overdue 
    ON complaints (status, sla_due_at) 
    WHERE status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED');

-- 6. Management Escalation Worklist (Escalated Tickets Only)
CREATE INDEX idx_complaints_escalation_queue 
    ON complaints (escalation_tier, department_id, created_at DESC) 
    WHERE is_escalated = TRUE;

-- 7. Recurring Hotspot Aggregation Index
CREATE INDEX idx_complaints_recurring_hotspots 
    ON complaints (department_id, category_id, location_id, created_at);

-- 8. Audit Timeline Rendering
CREATE INDEX idx_action_history_timeline 
    ON action_history (complaint_id, created_at ASC);

-- 9. In-App User Inbox Alerts
CREATE INDEX idx_notifications_inbox 
    ON notifications (recipient_id, is_read, created_at DESC);

-- 10. Background Outbox Dispatcher (Pending Events Only)
CREATE INDEX idx_outbox_pending 
    ON outbox_events (status, created_at ASC) 
    WHERE status = 'PENDING';

-- 11. Foreign Key Supporting Indexes
CREATE INDEX idx_attachments_complaint 
    ON attachments (complaint_id);

CREATE INDEX idx_internal_notes_complaint 
    ON internal_notes (complaint_id);
