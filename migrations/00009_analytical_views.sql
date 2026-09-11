-- ==============================================================================
-- Migration 00009: Analytical Views (Recurring Hotspots & SLA Performance)
-- ==============================================================================

-- 1. Recurring Hotspot Clusters View (FR-025, ADR-010)
CREATE OR REPLACE VIEW recurring_complaint_clusters AS
SELECT 
    c.department_id,
    d.name AS department_name,
    c.category_id,
    cat.name AS category_name,
    c.location_id,
    COALESCE(loc.room_or_area || ', ' || loc.building, c.location_details) AS normalized_location,
    COUNT(*) AS incident_count,
    COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED') THEN 1 END) AS active_unresolved_count,
    ARRAY_AGG(c.ref_id ORDER BY c.created_at DESC) AS complaint_ref_ids,
    MIN(c.created_at) AS first_reported_at,
    MAX(c.created_at) AS last_reported_at
FROM complaints c
JOIN departments d ON c.department_id = d.id
JOIN categories cat ON c.category_id = cat.id
LEFT JOIN locations loc ON c.location_id = loc.id
WHERE c.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY 
    c.department_id, 
    d.name, 
    c.category_id, 
    cat.name, 
    c.location_id, 
    COALESCE(loc.room_or_area || ', ' || loc.building, c.location_details)
HAVING COUNT(*) >= 3;

-- 2. Department SLA Performance Summary View
CREATE OR REPLACE VIEW department_sla_performance AS
SELECT 
    d.id AS department_id,
    d.name AS department_name,
    COUNT(c.id) AS total_complaints,
    COUNT(CASE WHEN c.status IN ('RESOLVED', 'CLOSED') THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN c.status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED') AND c.sla_due_at < CURRENT_TIMESTAMP THEN 1 END) AS overdue_count,
    COUNT(CASE WHEN c.is_escalated = TRUE THEN 1 END) AS escalated_count
FROM departments d
LEFT JOIN complaints c ON d.id = c.department_id
GROUP BY d.id, d.name;
