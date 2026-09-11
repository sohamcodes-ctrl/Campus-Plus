-- ==============================================================================
-- Seed 001: Master Reference Data (Roles, Departments, Categories, Calendars, SLA)
-- ==============================================================================

-- 1. System Roles
INSERT INTO roles (id, description) VALUES
('ROLE_STUDENT', 'Enrolled student submitting and tracking grievances'),
('ROLE_HANDLER', 'Staff member assigned to investigate and resolve grievances'),
('ROLE_DEPT_HEAD', 'Department head triaging, assigning, and escalating grievances'),
('ROLE_MANAGEMENT', 'Executive leadership reviewing institution-wide escalation and analytics'),
('ROLE_ADMIN', 'System administrator managing configuration and master metadata')
ON CONFLICT (id) DO NOTHING;

-- 2. Master Departments
INSERT INTO departments (id, code, name, description, contact_email) VALUES
('00000000-0000-0000-0000-000000000010', 'DEPT-IT', 'Information Technology', 'Campus network, Wi-Fi, computer labs, and portal systems', 'it-support@synthetic.campusplus.internal'),
('00000000-0000-0000-0000-000000000020', 'DEPT-HOSTEL', 'Hostel Administration', 'Hostel rooms, mess dining, water, and resident welfare', 'hostel-admin@synthetic.campusplus.internal'),
('00000000-0000-0000-0000-000000000030', 'DEPT-MAINT', 'Campus Maintenance', 'Electrical fixtures, plumbing, civil repairs, and air conditioning', 'maintenance@synthetic.campusplus.internal'),
('00000000-0000-0000-0000-000000000040', 'DEPT-ACAD', 'Academic Affairs', 'Curriculum, timetable, grade disputes, and faculty coordination', 'academic-affairs@synthetic.campusplus.internal'),
('00000000-0000-0000-0000-000000000050', 'DEPT-SANIT', 'Sanitation & Hygiene', 'Restroom cleanliness, waste disposal, and campus hygiene', 'sanitation@synthetic.campusplus.internal')
ON CONFLICT (code) DO NOTHING;

-- 3. Standard Categories
INSERT INTO categories (id, name, description, default_department_id, requires_resolution_proof) VALUES
('00000000-0000-0000-0000-000000000101', 'Network & Wi-Fi', 'Internet connectivity drops, router failure, portal login issues', '00000000-0000-0000-0000-000000000010', FALSE),
('00000000-0000-0000-0000-000000000102', 'Hostel Room Maintenance', 'Broken furniture, plumbing leaks, electrical faults in hostels', '00000000-0000-0000-0000-000000000020', TRUE),
('00000000-0000-0000-0000-000000000103', 'Classroom Infrastructure', 'Projectors, whiteboards, air conditioning, and seating repairs', '00000000-0000-0000-0000-000000000030', TRUE),
('00000000-0000-0000-0000-000000000104', 'Academic Evaluation', 'Evaluation discrepancies, attendance logging, timetable overlap', '00000000-0000-0000-0000-000000000040', FALSE),
('00000000-0000-0000-0000-000000000105', 'Campus Sanitation', 'Dirty restrooms, uncollected trash, water cooler hygiene', '00000000-0000-0000-0000-000000000050', TRUE)
ON CONFLICT (name) DO NOTHING;

-- 4. Standard Locations
INSERT INTO locations (id, campus, building, block, floor, room_or_area) VALUES
('00000000-0000-0000-0000-000000000201', 'Main Campus', 'Central Library', 'East Wing', '2nd Floor', 'Reading Hall A'),
('00000000-0000-0000-0000-000000000202', 'Main Campus', 'Hostel Block 4', 'A Block', '3rd Floor', 'Room 312'),
('00000000-0000-0000-0000-000000000203', 'Main Campus', 'Academic Complex', 'CS Block', 'Ground Floor', 'Lab 102')
ON CONFLICT DO NOTHING;

-- 5. Working Calendar
INSERT INTO working_calendars (id, name, timezone, work_start_time, work_end_time, work_days_bitmask) VALUES
('00000000-0000-0000-0000-000000000301', 'Main Academic Calendar', 'Asia/Kolkata', '09:00:00', '17:00:00', 62)
ON CONFLICT (name) DO NOTHING;

-- 6. Default SLA Policies
INSERT INTO sla_policies (id, category_id, priority, response_threshold_hours, resolution_threshold_hours, escalation_target_tier) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000101', 'LOW', 48, 168, 'TIER_2_DEPARTMENT_HEAD'),
('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000101', 'MEDIUM', 24, 72, 'TIER_2_DEPARTMENT_HEAD'),
('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000101', 'HIGH', 12, 24, 'TIER_3_MANAGEMENT'),
('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000101', 'URGENT', 4, 12, 'TIER_3_MANAGEMENT')
ON CONFLICT (category_id, priority) DO NOTHING;
