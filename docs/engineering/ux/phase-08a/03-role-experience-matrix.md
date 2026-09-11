# Phase 08-A: Role Experience Matrix

This document outlines the UX architecture for the 5 distinct roles in the Campus Complaint and Grievance Resolution System (Phase 08-A).

## ROLE 1: STUDENT (`ROLE_STUDENT`)
**Primary Color:** #7FA8D9
**Frequency:** Occasional (submits complaints infrequently, checks status periodically) [SOURCE-DERIVED]
**Priority:** Submission form usability, status clarity, tracking code visibility [SOURCE-DERIVED]

### 1. What do they need to know?
- **Tracking code (CP-YYYY-XXXXX):** Essential for referencing the complaint. [SOURCE-DERIVED]
- **Current status:** Real-time progress indicator. [SOURCE-DERIVED]
- **Assigned department:** Who is handling it. [SOURCE-DERIVED]
- **Public timeline events:** Transparent updates on progress. [SOURCE-DERIVED]
- **Resolution summary:** Details of the outcome. [SOURCE-DERIVED]
- **Verification prompt:** Action required upon resolution. [SOURCE-DERIVED]
- **Previous complaints:** Ability to find prior submissions. [SOURCE-DERIVED]

### 2. What do they need to do?
- **SUBMIT:** File a new complaint. [SOURCE-DERIVED]
- **VIEW:** See their own complaints only. [SOURCE-DERIVED]
- **VERIFY_RESOLUTION:** Accept the resolution. [SOURCE-DERIVED]
- **DISPUTE_REOPEN:** Reject the resolution. [SOURCE-DERIVED]
- **CANCEL:** Withdraw their own complaint (only in SUBMITTED/DRAFT states). [SOURCE-DERIVED]

### 3. What should be immediately visible?
- **Active tracking code and current status:** For quick updates. [UX INFERENCE]
- **Submission form / Call to action:** Easily accessible for new complaints. [UX INFERENCE]

### 4. What should be secondary?
- **Previous complaints list:** History is useful but not primary. [UX INFERENCE]

### 5. What must remain hidden?
- **Internal notes (INV-012):** Not for student visibility. [SOURCE-DERIVED]
- **Handler personal details (beyond name):** Privacy protection. [SOURCE-DERIVED]
- **Other students' complaints:** Row-Level Security (RLS) enforces privacy. [SOURCE-DERIVED]
- **System audit internals:** Not relevant to users. [SOURCE-DERIVED]

### 6. What requires confirmation?
- **Submit complaint:** Prevent accidental submissions. [SOURCE-DERIVED]
- **Cancel complaint:** Prevent accidental withdrawals. [SOURCE-DERIVED]
- **Verify resolution:** Confirm acceptance. [SOURCE-DERIVED]
- **Dispute resolution:** Confirm rejection. [SOURCE-DERIVED]

### 7. What generates audit history?
- **SUBMISSION events** [SOURCE-DERIVED]
- **CANCEL events** [SOURCE-DERIVED]
- **VERIFY events** [SOURCE-DERIVED]
- **DISPUTE events** [SOURCE-DERIVED]

---

## ROLE 2: HANDLER (`ROLE_HANDLER`)
**Primary Color:** #7FC4B2
**Frequency:** Daily operational use, high interaction density [SOURCE-DERIVED]
**Priority:** "What requires my action NOW?" — assigned worklist, SLA urgency [SOURCE-DERIVED]

### 1. What do they need to know?
- **Full complaint details:** Context to resolve the issue. [SOURCE-DERIVED]
- **Complainant name & Attachments:** Necessary evidence and contact info. [SOURCE-DERIVED]
- **Prior action history & Forwarding notes:** Context of previous handling. [SOURCE-DERIVED]
- **Escalation context:** Why the issue was escalated. [SOURCE-DERIVED]
- **SLA indicators:** Time left to resolve. [SOURCE-DERIVED]

### 2. What do they need to do?
- **VIEW (dept):** See complaints in their department. [SOURCE-DERIVED]
- **START_PROGRESS:** Acknowledge and begin work (if assigned). [SOURCE-DERIVED]
- **RESOLVE:** Mark issue as resolved (if assigned). [SOURCE-DERIVED]
- **FORWARD:** Send to another department if misrouted. [SOURCE-DERIVED]
- **ESCALATE:** Raise issue if blocked. [SOURCE-DERIVED]

### 3. What should be immediately visible?
- **Assigned worklist:** Personal queue of tasks. [UX INFERENCE]
- **SLA urgency markers:** Highlighting tasks nearing breach. [UX INFERENCE]

### 4. What should be secondary?
- **Resolution history / All department complaints:** Contextual reference. [UX INFERENCE]
- **Internal notes:** Available for read/write. [SOURCE-DERIVED]

### 5. What must remain hidden?
- **Other departments' complaints:** Outside their scope. [SOURCE-DERIVED]
- **Management analytics:** Strategic, not operational. [SOURCE-DERIVED]
- **Admin system config:** Irrelevant to task handling. [SOURCE-DERIVED]

### 6. What requires confirmation?
- **Forward:** Requires rationale >=10 chars. [SOURCE-DERIVED]
- **Escalate:** Requires reason. [SOURCE-DERIVED]
- **Resolve:** Requires summary >=20 chars. [SOURCE-DERIVED]

### 7. What generates audit history?
- **PROGRESS events** [SOURCE-DERIVED]
- **FORWARD events** [SOURCE-DERIVED]
- **ESCALATE events** [SOURCE-DERIVED]
- **RESOLVE events** [SOURCE-DERIVED]

---

## ROLE 3: DEPARTMENT HEAD (`ROLE_DEPT_HEAD`)
**Primary Color:** #B39DDB
**Frequency:** Daily operational + weekly strategic review [SOURCE-DERIVED]
**Priority:** Unassigned queue size, escalated complaints, SLA risk, workload balance [SOURCE-DERIVED]

### 1. What do they need to know?
- **All department complaints:** Complete overview of department load. [SOURCE-DERIVED]
- **Handler workload distribution:** To assign tasks effectively. [SOURCE-DERIVED]
- **Unassigned queue:** Tasks needing assignment. [SOURCE-DERIVED]
- **Escalated complaints:** Issues requiring intervention. [SOURCE-DERIVED]
- **SLA breach indicators & recurring hotspots:** Risk management. [SOURCE-DERIVED]
- **Internal notes & full audit trail:** For comprehensive oversight. [SOURCE-DERIVED]

### 2. What do they need to do?
- **VIEW, REVIEW, ASSIGN:** Triage and delegate tasks. [SOURCE-DERIVED]
- **FORWARD, ESCALATE, RESOLVE, CLOSE, REJECT, MARK_DUPLICATE:** Full operational control over department tasks. [SOURCE-DERIVED]

### 3. What should be immediately visible?
- **Unassigned queue & Escalated complaints:** Require immediate action. [UX INFERENCE]
- **SLA risks & Workload balance:** Critical for daily operation. [UX INFERENCE]

### 4. What should be secondary?
- **Full audit trail & Internal notes:** Detailed analysis tools. [UX INFERENCE]

### 5. What must remain hidden?
- **Other departments' complaints:** Except those forwarded-to. [SOURCE-DERIVED]
- **Management-only analytics:** Institution-wide view is restricted. [SOURCE-DERIVED]

### 6. What requires confirmation?
- **Assign, Forward, Escalate, Resolve, Reject, Mark Duplicate, Close:** All state-changing actions. [SOURCE-DERIVED]

### 7. What generates audit history?
- **REVIEW and ASSIGN events.** [SOURCE-DERIVED]
- **All state transitions they initiate.** [SOURCE-DERIVED]

---

## ROLE 4: ADMIN (`ROLE_ADMIN`)
**Primary Color:** #9FB4C7
**Frequency:** As-needed administrative tasks [SOURCE-DERIVED]
**Priority:** User management, system health, audit integrity [SOURCE-DERIVED]

### 1. What do they need to know?
- **System health & Error logs:** Technical operation status. [SOURCE-DERIVED]
- **User registry & Role mappings:** For access control. [SOURCE-DERIVED]
- **Category directory:** System configuration data. [SOURCE-DERIVED]
- **Audit trails:** To maintain system integrity. [SOURCE-DERIVED]
- **Cross-department complaints:** Conditional viewing. [SOURCE-DERIVED]

### 2. What do they need to do?
- **Broad administrative purview:** Same access level as Management in AuthorizationPolicy. [SOURCE-DERIVED]
- **Manage user CRUD, role CRUD, dept CRUD.** [PROPOSED] *(Note: No dedicated API endpoints exist yet).* [ARCHITECTURE-DERIVED]

### 3. What should be immediately visible?
- **System health & Critical error alerts:** To maintain uptime. [UX INFERENCE]

### 4. What should be secondary?
- **User management & Configuration settings:** Used as-needed. [UX INFERENCE]
- **Audit trails:** Accessed during investigations. [UX INFERENCE]

### 5. What must remain hidden?
- Specific privacy-restricted data outside the scope of auditing or administration. [UNKNOWN]

### 6. What requires confirmation?
- **Destructive or broad configuration changes:** E.g., User/Role/Dept modifications. [UX INFERENCE]

### 7. What generates audit history?
- **Configuration changes, user access modifications.** [ARCHITECTURE-DERIVED]

---

## ROLE 5: MANAGEMENT (`ROLE_MANAGEMENT`)
**Primary Color:** #E3A6AE
**Frequency:** Weekly strategic review, urgent escalation response [SOURCE-DERIVED]
**Priority:** Institutional trends, chronic issues, escalation queue [SOURCE-DERIVED]

### 1. What do they need to know?
- **Cross-department aggregated KPIs & turnaround times:** Overall performance metrics. [SOURCE-DERIVED]
- **Escalation frequency & recurring complaint clusters:** Identifying systemic issues. [SOURCE-DERIVED]
- **Category/location trends:** Where problems occur. [SOURCE-DERIVED]
- **All complaints across all departments:** Full institutional visibility. [SOURCE-DERIVED]
- *(Note: Many analytics metrics are METRIC DEFINITION REQUIRED — exact KPI formulas not yet specified).* [PROPOSED]

### 2. What do they need to do?
- **Broad purview:** Access analytics and full complaint data. [SOURCE-DERIVED]
- **Intervene in Tier 3 escalations.** [SOURCE-DERIVED]

### 3. What should be immediately visible?
- **Management analytics dashboards:** High-level KPIs and trends. [UX INFERENCE]
- **Escalation queue (Tier 3):** Issues needing top-level attention. [UX INFERENCE]

### 4. What should be secondary?
- **Individual complaint details:** Drill-down capability from dashboards. [UX INFERENCE]

### 5. What must remain hidden?
- **System configuration:** Not an admin role. [SOURCE-DERIVED]
- **User management (CRUD):** Handled by Admin. [SOURCE-DERIVED]

### 6. What requires confirmation?
- **Tier 3 escalation interventions.** [UX INFERENCE]

### 7. What generates audit history?
- **Intervention actions (e.g., state transitions on Tier 3 escalations).** [ARCHITECTURE-DERIVED]
