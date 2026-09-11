-- ==============================================================================
-- Seed 002: Synthetic Personas & Development Test Fixtures (Zero Real PII)
-- ==============================================================================

-- 1. Synthetic Users
INSERT INTO users (id, email, full_name, phone_number, roll_or_prn) VALUES
('00000000-0000-0000-0000-000000001001', 'student.a@synthetic.campusplus.internal', 'Synthetic Student Alpha', '+919999900001', 'PRN-2026-001'),
('00000000-0000-0000-0000-000000001002', 'student.b@synthetic.campusplus.internal', 'Synthetic Student Beta', '+919999900002', 'PRN-2026-002'),
('00000000-0000-0000-0000-000000001003', 'handler.it1@synthetic.campusplus.internal', 'Synthetic IT Handler One', '+919999900003', NULL),
('00000000-0000-0000-0000-000000001004', 'handler.hostel1@synthetic.campusplus.internal', 'Synthetic Hostel Handler One', '+919999900004', NULL),
('00000000-0000-0000-0000-000000001005', 'hod.it@synthetic.campusplus.internal', 'Synthetic Head of IT', '+919999900005', NULL),
('00000000-0000-0000-0000-000000001006', 'management@synthetic.campusplus.internal', 'Synthetic Campus Director', '+919999900006', NULL),
('00000000-0000-0000-0000-000000001007', 'sysadmin@synthetic.campusplus.internal', 'Synthetic System Admin', '+919999900007', NULL)
ON CONFLICT (email) DO NOTHING;

-- 2. User Roles Assignment
INSERT INTO user_roles (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000001001', 'ROLE_STUDENT'),
('00000000-0000-0000-0000-000000001002', 'ROLE_STUDENT'),
('00000000-0000-0000-0000-000000001003', 'ROLE_HANDLER'),
('00000000-0000-0000-0000-000000001004', 'ROLE_HANDLER'),
('00000000-0000-0000-0000-000000001005', 'ROLE_DEPT_HEAD'),
('00000000-0000-0000-0000-000000001006', 'ROLE_MANAGEMENT'),
('00000000-0000-0000-0000-000000001007', 'ROLE_ADMIN')
ON CONFLICT DO NOTHING;

-- 3. Department Memberships
INSERT INTO department_memberships (user_id, department_id, is_head, is_active) VALUES
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000010', FALSE, TRUE),
('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000020', FALSE, TRUE),
('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000010', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- 4. Sample Synthetic Complaint (Student A)
INSERT INTO complaints (
    id, ref_id, title, description, complainant_id, department_id, category_id, 
    location_id, location_details, status, suggested_priority, official_priority, 
    assigned_handler_id, version, created_at
) VALUES (
    '00000000-0000-0000-0000-000000002001',
    'CP-2026-00001',
    'Wi-Fi unreachable in 2nd Floor Reading Hall A',
    'Unable to connect to campus network Wi-Fi SSID in the east wing library reading hall. IP configuration fails repeatedly.',
    '00000000-0000-0000-0000-000000001001',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    'East Wing Reading Hall A near table 14',
    'IN_PROGRESS',
    'HIGH',
    'HIGH',
    '00000000-0000-0000-0000-000000001003',
    2,
    CURRENT_TIMESTAMP - INTERVAL '2 days'
) ON CONFLICT (ref_id) DO NOTHING;

-- 5. Sample Audit Log for Complaint 00001
INSERT INTO action_history (complaint_id, actor_id, actor_role, action_type, from_status, to_status, remarks, created_at) VALUES
('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000001001', 'ROLE_STUDENT', 'SUBMIT', NULL, 'SUBMITTED', 'Grievance submitted by student', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000002001', '00000000-0000-0000-0000-000000001005', 'ROLE_DEPT_HEAD', 'ASSIGN', 'SUBMITTED', 'IN_PROGRESS', 'Assigned to Handler IT1 for on-site AP reboot', CURRENT_TIMESTAMP - INTERVAL '1 day');
