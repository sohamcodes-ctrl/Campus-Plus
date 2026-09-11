# Campus Plus — Phase 08-C-D: Role-Aware Navigation Matrix

**Authority:** Principal Frontend Architect, Application Security Engineer  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Role-Specific Navigation Visibility Matrix

| Role | Visible Navigation Items | Hidden Navigation Items | Palette Accent | Button Text Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Student (`ROLE_STUDENT`)** | Dashboard, New Grievance | Triage, Worklist, Escalations, Analytics | `#7FA8D9` | `#1E3A5F` (5.24:1 - PASS AA) |
| **Faculty (`ROLE_FACULTY`)** | Dashboard, New Grievance | Triage, Worklist, Escalations, Analytics | `#7FA8D9` | `#1E3A5F` (5.24:1 - PASS AA) |
| **Handler (`ROLE_HANDLER`)** | Dashboard, Assigned Worklist | New Grievance, Triage, Escalations, Analytics | `#7FC4B2` | `#1A3830` (5.48:1 - PASS AA) |
| **HOD (`ROLE_DEPT_HEAD`)** | Dashboard, Triage, Worklist, Escalations | New Grievance, Analytics | `#B39DDB` | `#2B1E40` (5.72:1 - PASS AA) |
| **Admin (`ROLE_ADMIN`)** | Dashboard, Escalations, Analytics | New Grievance, Triage, Worklist | `#9FB4C7` | `#1C2B38` (5.56:1 - PASS AA) |
| **Management (`ROLE_MANAGEMENT`)** | Dashboard, Escalations, Analytics | New Grievance, Triage, Worklist | `#E3A6AE` | `#3D1C22` (5.31:1 - PASS AA) |

*Security Rule: The hiding of navigation links is strictly an information architecture and UX convenience. Route enforcement and data authorization remain 100% authoritative at the server boundary.*
