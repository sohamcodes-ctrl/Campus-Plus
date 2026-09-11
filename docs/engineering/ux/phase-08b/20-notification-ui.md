# Phase 08-B: Notification Experience & Drawer UI Specification

**Document Identifier:** `20-notification-ui.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Scope:** Global notification bell, badge counter, slide-over inbox, and missing API strategy (`SHR-001`).

---

## 1. Global Bell & Badge Component (`SHR-001`)

Located in the global TopBar:
- **Default State:** Bell icon with subtle border hover effect.
- **Unread State:** Bell icon with vibrant red numeric pill badge (e.g. `[3]` or `[9+]`).
- **Trigger:** Clicking bell opens the slide-over notification drawer (`CMP-BASE-05`).

```text
+-------------------------------------------------------------+
| Notifications                              [Mark all read]  |
+-------------------------------------------------------------+
| [!] Urgent Assignment                                       |
| You were assigned complaint CP-2026-00924 (Server Failure)  |
| 10 minutes ago | Unread                                     |
+-------------------------------------------------------------+
| [*] Resolution Verified                                     |
| Student S. Sharma verified resolution for CP-2026-00842     |
| 1 hour ago | Read                                           |
+-------------------------------------------------------------+
| [^] Tier 2 Escalation                                       |
| Complaint CP-2026-00810 was escalated by Handler A. Rao     |
| 3 hours ago | Read                                          |
+-------------------------------------------------------------+
| [ View All Historical Notifications -> ]                    |
+-------------------------------------------------------------+
```

---

## 2. API Gap Strategy (GAP-001 Resolution)

As cataloged in `20-frontend-api-gaps.md`, the backend currently lacks a `GET /api/v1/notifications` endpoint despite having the database table and RLS policies configured.
- **Phase 08-B UI Blueprint:**
  - Standardizes the notification data interface:
    ```typescript
    interface NotificationItem {
      id: string;
      recipientId: string;
      complaintId: string;
      trackingCode: string;
      title: string;
      message: string;
      type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'ESCALATION' | 'SLA_WARNING';
      isRead: boolean;
      createdAt: string;
    }
    ```
  - Specifies mock state fallback and contract requirement for Phase 08-C frontend implementation.
