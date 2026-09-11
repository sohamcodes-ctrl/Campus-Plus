# ADR-007: Event-Driven Notification Architecture

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Systems Analyst  
**Traceability**: Resolves `OD-011`, satisfies `FR-020`  

---

## 1. Context & Problem Statement

Stakeholders require timely awareness of grievance events:
- Students need alerts when a complaint is assigned, updated, or resolved.
- Handlers need alerts when a task is assigned.
- Department Heads and Management need immediate alerts when complaints are escalated or breach SLA thresholds.

`OD-011` evaluated whether notifications should be limited to in-app inbox or include transactional email / SMS. External gateway integrations introduce third-party billing, SMTP configuration, and DNS verification risks that could derail MVP delivery.

We must design a decoupled notification subsystem that fulfills the core requirement natively while providing an extensible adapter pattern for external channels.

---

## 2. Decision: Decoupled Domain Event Bus with Native In-App Inbox

We architect an **Event-Driven Asynchronous Notification Subsystem** based on the Publisher-Subscriber pattern.

### 2.1 Domain Events
State changes in the Core Domain emit lightweight domain events:
- `ComplaintSubmittedEvent`
- `ComplaintAssignedEvent`
- `ComplaintForwardedEvent`
- `ComplaintEscalatedEvent`
- `ComplaintResolvedEvent`
- `ComplaintReopenedEvent`

### 2.2 Event Dispatcher & Channel Adapters

```text
  [Core Domain Service]
           │
           │ emits DomainEvent (e.g. ComplaintAssignedEvent)
           ▼
  [Notification Dispatcher]
           │
           ├── (1) [In-App Inbox Channel Adapter] ────> Writes to `notifications` table (MVP)
           │
           └── (2) [Transactional Email Adapter]  ────> Pluggable (SMTP / Resend / Postmark) (Post-MVP)
```

### 2.3 MVP Scope vs. Post-MVP Scope (`OD-011`)
- **MVP Channel (In-Scope)**: **Native In-App Notification Inbox**.
  - Notifications are persisted in a relational `notifications` table:
    `(id, recipient_id, complaint_id, title, message, is_read, created_at)`.
  - Displayed in the user's navigation header with unread count badges and real-time polling / WebSocket subscription.
- **Post-MVP Channel (Extensible Interface)**: **Transactional Email**.
  - The `EmailNotificationAdapter` implements the generic `NotificationChannel` interface.
  - Activated simply by configuring SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`) without modifying domain logic.
- **Out of Scope**: SMS and WhatsApp gateways.

---

## 3. Consequences

### Positive
- Zero external vendor dependencies for MVP operation.
- Non-blocking: Notification failures cannot roll back core complaint state transactions.
- Completely testable in unit and integration environments.

### Negative / Tradeoffs
- Students must log into the web application to view notifications until email adapter is enabled.

---

## 4. Phase Isolation
No notification tables, queues, or email clients are implemented in Phase 02.
