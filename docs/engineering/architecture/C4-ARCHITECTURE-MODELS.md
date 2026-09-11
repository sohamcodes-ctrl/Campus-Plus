# Campus Plus — C4 Architecture Models (Levels 1, 2, and 3)

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: C4-ARCHITECTURE-MODELS.md  
**Version**: 1.0  
**Status**: Formal Architectural Blueprint  
**Authors**: Enterprise Systems Architect, Lead Software Architect  

---

## 1. Executive Summary

This document specifies the system architecture using the standardized **C4 Model** (Context, Containers, Components). These models define the physical and logical boundaries of **Campus Plus**, illustrating how human actors, external services, containers, and internal domain modules interact while preserving explicit security trust boundaries.

---

## 2. Level 1: System Context Diagram

The System Context diagram illustrates the boundary of the Campus Plus platform, its human stakeholder roles, and genuinely required external systems. No imaginary systems are introduced.

```mermaid
C4Context
    title Level 1: Campus Plus System Context Diagram

    Person(student, "Student / Complainant", "Submits grievances, uploads evidence, tracks real-time status, verifies resolutions.")
    Person(handler, "Complaint Handler", "Assigned authority / staff technician who reviews tasks, updates progress, and resolves complaints.")
    Person(dept_head, "Department Authority", "Head of Department who triages incoming complaints, assigns handlers, forwards misdirected tickets, and manages escalations.")
    Person(admin, "System Administrator", "Manages user roles, institutional directory, category master records, and technical audit logs.")
    Person(management, "Institutional Management", "Principal / Grievance Redressal Committee who monitors campus-wide trends, recurring hotspots, and SLA compliance.")

    System(campus_plus, "Campus Plus Platform", "Centralized, role-based grievance resolution system providing structured workflows, audit trails, dashboards, and institutional intelligence.")

    System_Ext(email_service, "Transactional Email Gateway", "Optional external SMTP / transactional service for outbound notifications (Post-MVP; ADR-007).")
    System_Ext(idp_service, "Institutional Identity Provider", "Campus Google Workspace / Microsoft Entra SSO directory (Post-MVP; ADR-002).")

    Rel(student, campus_plus, "Submits complaints, tracks status, verifies resolution", "HTTPS / Web Browser")
    Rel(handler, campus_plus, "Reviews assigned work, logs progress, submits resolution notes", "HTTPS / Web Browser")
    Rel(dept_head, campus_plus, "Triages departmental complaints, assigns staff, forwards, escalates", "HTTPS / Web Browser")
    Rel(admin, campus_plus, "Configures categories, departments, user roles, system parameters", "HTTPS / Web Browser")
    Rel(management, campus_plus, "Views institutional dashboards, monitors recurring issues, audits SLA", "HTTPS / Web Browser")

    Rel(campus_plus, email_service, "Dispatches external alert notifications", "SMTP / REST API")
    Rel(campus_plus, idp_service, "Federates identity credentials", "OIDC / SAML")
```

---

## 3. Level 2: Container Diagram

The Container diagram decomposes Campus Plus into its executable runtime units, data stores, and private storage subsystems.

```mermaid
C4Container
    title Level 2: Campus Plus Container Architecture Diagram

    Person(user, "Campus Community User", "Student, Handler, Dept Head, Admin, or Executive Management")

    Container_Boundary(c1, "Campus Plus Platform") {
        Container(web_client, "Web Client Application", "TypeScript / Modern Responsive Web SPA/SSR", "Renders role-specific portals, dashboards, and forms on desktop and mobile viewports >= 360px.")
        
        Container(api_gateway, "Application & API Layer", "Node.js / Modular Monolith Server", "Enforces authentication, RBAC authorization, schema validation, state machine rules, and orchestrates domain use cases.")

        ContainerDb(database, "Relational Database", "PostgreSQL 15+ (Managed via Supabase / Portable)", "Stores relational schemas, immutable audit journals, SLA policies, and enforces Row-Level Security (RLS).")

        ContainerDb(storage, "Private Object Storage", "S3-Compatible Object Store", "Stores encrypted supporting evidence and resolution proof attachments with time-limited signed access.")
    }

    System_Ext(email_gw, "Transactional Email Service", "External SMTP Server")

    Rel(user, web_client, "Interacts with platform", "HTTPS")
    Rel(web_client, api_gateway, "Invokes API endpoints / Server Actions", "JSON / HTTPS / Session JWT")
    Rel(web_client, storage, "Direct upload via time-limited presigned URLs", "HTTPS PUT (5MB max)")
    
    Rel(api_gateway, database, "Executes transactional queries, state updates, and audit inserts", "PostgreSQL Wire Protocol / SSL")
    Rel(api_gateway, storage, "Generates presigned upload & read URLs, verifies attachment metadata", "S3 API / HTTPS")
    Rel(api_gateway, email_gw, "Enqueues outbound email notifications (Post-MVP)", "SMTP / HTTPS")
```

---

## 4. Level 3: Component Diagram (Application Layer Decomposition)

The Component diagram reveals the internal modular composition of the **Application & API Layer** (`api_gateway`), demonstrating strict dependency direction and domain module boundaries.

```mermaid
graph TD
    subgraph Presentation_Boundary ["Presentation & Gateway Layer"]
        HTTP_CTRL["HTTP Controllers / Server Actions"]
        AUTH_GUARD["Authentication & RBAC Interceptors (SEC-001, SEC-002)"]
        VAL_GUARD["Input Validation Guards (Zod Schemas)"]
    end

    subgraph Core_Application_Services ["Application Services Layer (Use Cases)"]
        INTAKE_SVC["Complaint Intake Service (FR-001 - FR-006)"]
        ASSIGN_SVC["Assignment & Triage Service (FR-007 - FR-009)"]
        FORWARD_SVC["Forwarding Service (FR-010, ADR-004)"]
        ESCALATE_SVC["Escalation & SLA Service (FR-013, FR-014, ADR-006)"]
        RESOLVE_SVC["Resolution & Closure Service (FR-015 - FR-018)"]
        NOTIF_SVC["Notification Dispatcher (FR-020, ADR-007)"]
        AUDIT_SVC["Audit Journal Query Service (FR-019, ADR-009)"]
        INTEL_SVC["Recurring Issue Intelligence Service (FR-025, ADR-010)"]
    end

    subgraph Domain_Layer ["Core Domain Layer (Zero External Dependencies)"]
        COMPLAINT_AGG["Complaint Aggregate Root"]
        FSM_ENGINE["State Machine Transition Engine (ADR-005)"]
        BIZ_RULES["Business Rules Evaluator (BR-001 - BR-024)"]
        DOMAIN_EVENTS["Domain Events Hub"]
    end

    subgraph Infrastructure_Adapters ["Infrastructure & Persistence Adapters"]
        REPO_COMPLAINT["PostgreSQL Complaint Repository"]
        REPO_AUDIT["Append-Only Audit Repository (REVOKE UPDATE/DELETE)"]
        REPO_USER["User & Department Repository"]
        STORAGE_ADPT["Private Storage Adapter (Signed URL Generator)"]
        INBOX_ADPT["In-App Inbox Adapter (MVP)"]
        EMAIL_ADPT["Email Channel Adapter (Post-MVP)"]
    end

    HTTP_CTRL --> AUTH_GUARD
    AUTH_GUARD --> VAL_GUARD
    VAL_GUARD --> INTAKE_SVC
    VAL_GUARD --> ASSIGN_SVC
    VAL_GUARD --> FORWARD_SVC
    VAL_GUARD --> ESCALATE_SVC
    VAL_GUARD --> RESOLVE_SVC
    VAL_GUARD --> INTEL_SVC

    INTAKE_SVC --> COMPLAINT_AGG
    ASSIGN_SVC --> COMPLAINT_AGG
    FORWARD_SVC --> COMPLAINT_AGG
    ESCALATE_SVC --> COMPLAINT_AGG
    RESOLVE_SVC --> COMPLAINT_AGG

    COMPLAINT_AGG --> FSM_ENGINE
    COMPLAINT_AGG --> BIZ_RULES
    COMPLAINT_AGG --> DOMAIN_EVENTS

    DOMAIN_EVENTS -.-> NOTIF_SVC
    DOMAIN_EVENTS -.-> AUDIT_SVC

    INTAKE_SVC --> REPO_COMPLAINT
    ASSIGN_SVC --> REPO_COMPLAINT
    FORWARD_SVC --> REPO_COMPLAINT
    ESCALATE_SVC --> REPO_COMPLAINT
    RESOLVE_SVC --> REPO_COMPLAINT
    INTEL_SVC --> REPO_COMPLAINT

    AUDIT_SVC --> REPO_AUDIT
    INTAKE_SVC --> STORAGE_ADPT
    RESOLVE_SVC --> STORAGE_ADPT
    NOTIF_SVC --> INBOX_ADPT
    NOTIF_SVC -.-> EMAIL_ADPT
```

---

## 5. Major Application Module Specifications

| Module Name | Core Responsibility | Public Interface / Methods | Downstream Dependencies | Data Owned | Authorization Boundary | Failure & Fallback Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Identity & Access** | Authenticate credentials, issue signed session tokens, resolve role claims. | `authenticate()`, `validateSession()`, `provisionRole()` | PostgreSQL `users` table | `users`, `roles`, `sessions` | Public login; Admin for role provisioning. | Return 401 Unauthorized; log security warning; zero token issuance on failure. |
| **Complaint Intake** | Validate mandatory fields, enforce suggested priority, issue reference ID (`CP-YYYY-XXXXX`). | `submitComplaint(command)` | Domain FSM, Complaint Repo, Audit Repo, Storage Adapter | `complaints` (creation) | `ROLE_STUDENT` only. | Reject invalid input with 422 Unprocessable Entity; atomic rollback on DB failure. |
| **Assignment & Triage** | Manage department queue, assign single responsible handler, execute intra-department reassignments. | `assignHandler(command)`, `reassignHandler(command)` | Domain FSM, Complaint Repo, Audit Repo, Event Hub | `complaints.handler_id`, `complaints.status` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` within department. | Reject cross-department staff assignments with 403 Forbidden. |
| **Forwarding Engine** | Transfer owning department across boundaries with mandatory recorded rationale. | `forwardComplaint(command)` | Domain FSM, Complaint Repo, Audit Repo, Event Hub | `complaints.department_id`, `complaints.status` | Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`. | Validate target department is active; atomic transaction rolls back if audit fails. |
| **Escalation & SLA** | Evaluate manual escalations and execute automated background scans for SLA threshold breaches. | `escalateComplaint(command)`, `evaluateSLABreaches()` | SLA Policy Table, Complaint Repo, Event Hub | `complaints.is_escalated`, `complaints.escalation_tier` | Handler/Dept Head for manual; Scheduled Worker for automated. | Idempotency guard prevents duplicate tier increments or alert storms. |
| **Resolution & Closure** | Validate resolution summary, enforce proof rules per category, manage 5-day dispute window. | `resolveComplaint(command)`, `verifyResolution()`, `reopenComplaint()` | Domain FSM, Complaint Repo, Storage Adapter, Event Hub | `complaints.status`, `complaints.resolution_notes` | Handler for resolve; Student for verify/reopen. | Enforce category proof requirements; reject resolution without text note. |
| **Audit Journal** | Record append-only lifecycle transitions and comments with dual-level visibility partitioning. | `appendAuditEvent(event)`, `queryComplaintTimeline(refId)` | PostgreSQL `action_history` table (REVOKE UPDATE/DELETE) | `action_history` | Internal write-only; Role-filtered read. | If audit insert fails, parent transaction MUST abort completely (zero un-audited state mutations). |
| **Notification Dispatcher** | Consume domain events and deliver in-app inbox alerts to target users. | `dispatch(domainEvent)`, `getUserInbox(userId)` | Relational `notifications` table, Email Adapter | `notifications` | User can only read own notification records. | Notification failure must NOT roll back core complaint state transaction; logged asynchronously. |
| **Recurring Intelligence** | Execute deterministic 30-day multi-attribute clustering to surface chronic campus hotspots. | `getRecurringHotspots(deptId, windowDays)` | PostgreSQL Complaint View (`recurring_complaint_clusters`) | None (read-only analytical view) | `ROLE_DEPT_HEAD`, `ROLE_ADMIN`, `ROLE_MANAGEMENT`. | Fallback to cached view if analytical query exceeds timeout. |

---

## 6. Architecture Verification Checklist

- [x] Level 1 System Context includes all confirmed human roles and zero imaginary systems.
- [x] Level 2 Container Diagram explicitly shows stateless Web Client, Modular Monolith API, PostgreSQL, and Private Object Storage.
- [x] Level 3 Component Diagram cleanly partitions Presentation, Application, Domain, and Persistence layers.
- [x] Public interfaces, dependencies, data ownership, authorization, and failure modes defined for every module.
- [x] Strict dependency direction: Domain layer has zero outgoing dependencies on infrastructure.
