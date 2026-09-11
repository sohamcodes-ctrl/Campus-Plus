# Phase 08-B: Complaint Timeline & Lifecycle State UI Specification

**Document Identifier:** `18-timeline-and-lifecycle-ui.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Scope:** Design tokens, component anatomy, and state machine rendering for the 13 complaint lifecycle states.

---

## 1. The 13 Finite State Machine (FSM) States

Every complaint strictly adheres to the 13 domain lifecycle states:

| State Token | Semantic Label | Token Classes (Background / Border / Text) | Dot Indicator | Terminal? |
| :--- | :--- | :--- | :--- | :---: |
| `DRAFT` | Draft | `bg-slate-100 border-slate-300 text-slate-700` | Gray | No |
| `SUBMITTED` | Submitted | `bg-blue-50 border-blue-200 text-blue-800` | Blue | No |
| `REVIEWED` | Triaged | `bg-indigo-50 border-indigo-200 text-indigo-800` | Indigo | No |
| `ASSIGNED` | Assigned | `bg-teal-50 border-teal-200 text-teal-800` | Teal | No |
| `IN_PROGRESS`| In Progress | `bg-emerald-50 border-emerald-200 text-emerald-800` | Emerald Pulsing | No |
| `FORWARDED` | Forwarded | `bg-amber-50 border-amber-200 text-amber-800` | Amber | No |
| `ESCALATED` | Escalated | `bg-rose-50 border-rose-200 text-rose-800` | Rose Pulsing | No |
| `RESOLVED` | Resolved | `bg-green-50 border-green-200 text-green-800` | Green | No |
| `CLOSED` | Closed | `bg-gray-100 border-gray-300 text-gray-700` | Gray Check | **YES** |
| `REOPENED` | Reopened | `bg-amber-50 border-amber-300 text-amber-900` | Amber Alert | No |
| `REJECTED` | Rejected | `bg-red-50 border-red-200 text-red-800` | Red Cross | No |
| `DUPLICATE` | Duplicate | `bg-gray-100 border-gray-300 text-gray-700` | Gray Link | No |
| `CANCELLED` | Cancelled | `bg-gray-100 border-gray-300 text-gray-700` | Gray Slash | No |

---

## 2. Timeline Feed Component Anatomy (`CMP-DOM-04`)

```text
+-----------------------------------------------------------------------------+
| TIMELINE FEED (Chronological Order)                                         |
|                                                                             |
| (o) Feb 20, 2026 - 14:30:15                                                |
|  |  RESOLVED by Handler R. Verma (IT Infrastructure)                        |
|  |  Summary: "Repaired fiber optic junction box in basement duct."          |
|  |  Proof: [ junction_box_repaired.jpg ]                                   |
|  |                                                                          |
| (o) Feb 19, 2026 - 09:15:00                                                |
|  |  IN PROGRESS updated by Handler R. Verma                                 |
|  |  Remarks: "Testing network throughput across all lab drops."              |
|  |                                                                          |
| (o) Feb 18, 2026 - 16:00:22                                                |
|  |  ASSIGNED to Handler R. Verma by HOD Dr. K. Patel                        |
|  |  Instruction: "High lab priority. Coordinate with lab assistant."       |
|  |                                                                          |
| (o) Feb 18, 2026 - 11:30:00                                                |
|     SUBMITTED by Student S. Sharma                                          |
|     Tracking Code Issued: CP-2026-00891                                     |
+-----------------------------------------------------------------------------+
```

### Visual Specifications:
- **Connector Line:** `w-[2px] bg-border-subtle` running vertically between event dots.
- **Event Node:** `w-3 h-3 rounded-full border-2 border-white shadow-xs` with color reflecting the transition state.
- **Actor Attribution:** Clear role and actor name (e.g. `HOD Dr. K. Patel`).
- **Timestamp:** Formatted as `MMM dd, yyyy - HH:mm` with relative time tooltip (e.g. "2 hours ago").
