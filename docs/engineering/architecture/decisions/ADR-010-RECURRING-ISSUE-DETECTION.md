# ADR-010: Recurring Issue Detection & Intelligence Strategy

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Systems Analyst  
**Traceability**: Resolves `OD-013`, satisfies `FR-025`, `BR-023`, `BR-024`  

---

## 1. Context & Problem Statement

Level 1 Source Synopsis states: *"enabling administrators to identify recurring campus issues and improve campus services."*
In traditional campus operations, identical issues (e.g., water filter breakdown in hostel wing B, or Wi-Fi disconnection in lab 2) recur repeatedly without administrative awareness because complaints are handled as isolated tickets by different individuals.

`OD-013` evaluated whether this capability requires machine learning/AI models or deterministic rule-based algorithms. Prematurely deploying complex AI clustering in MVP introduces vector database costs, non-deterministic false positives, and operational brittleness.

We must define an architecture for recurring issue detection that delivers reliable intelligence for MVP while architecting a clean extension point for AI-assisted semantic clustering post-MVP.

---

## 2. Considered Options

1. **Option 1: Vector Embeddings & LLM Semantic Clustering (AI Approach)**:
   - Compute text embeddings for complaint descriptions and cluster via cosine similarity in pgvector.
   - *Flaw for MVP*: Requires external LLM API keys or local embedding model compute, high latency, complex threshold calibration, violates the "No premature AI" protocol rule.
2. **Option 2: Pure Free-Text Search**:
   - Ad-hoc keyword search by administrators.
   - *Flaw*: Manual, error-prone, fails to actively surface hidden patterns automatically.
3. **Option 3: Deterministic Multi-Attribute Aggregation (MVP) with Pluggable Vector Extension (Post-MVP)**:
   - Group active and recent historical complaints by structured dimensions (`category_id`, `department_id`, normalized `location_details`) within a rolling time window (e.g. 30 days).
   - Flag clusters where count $\ge$ threshold (e.g. 3 or more complaints).
   - Isolate query logic behind an `IssueIntelligenceService` interface so vector embeddings can be added post-MVP.

---

## 3. Decision

We **adopt Option 3: Deterministic Multi-Attribute Aggregation for MVP**.

### 3.1 Aggregation Algorithm & Heuristic Rules (`BR-023`)
A cluster is identified as a **"Recurring Grievance Hotspot"** when:
1. **Dimension Match**: At least **3 complaints** share identical:
   - `department_id`, AND
   - `category_id`, AND
   - Normalized `location_details` (e.g., "Hostel 2", "Lab 3", "Library 1st Floor").
2. **Temporal Window**: All matching complaints were submitted within a **rolling 30-day window**.
3. **Non-Destructive Invariant (`BR-024`)**: Identifying a recurring cluster does NOT merge or delete individual complaint records. Each complaint retains its own reference ID, assigned handler, and audit history.

### 3.2 SQL View & Analytical Query Architecture

```sql
-- Conceptual database view (Not deployed in Phase 02)
CREATE VIEW recurring_complaint_clusters AS
SELECT 
    department_id,
    category_id,
    LOWER(TRIM(location_details)) AS normalized_location,
    COUNT(*) AS incident_count,
    ARRAY_AGG(ref_id ORDER BY created_at DESC) AS complaint_ref_ids,
    MIN(created_at) AS first_reported_at,
    MAX(created_at) AS last_reported_at,
    COUNT(CASE WHEN status NOT IN ('RESOLVED', 'CLOSED') THEN 1 END) AS active_unresolved_count
FROM complaints
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY department_id, category_id, LOWER(TRIM(location_details))
HAVING COUNT(*) >= 3;
```

### 3.3 Dashboard Integration (`FR-024`, `FR-025`)
- Surfaced prominently on the Executive Management Dashboard (`ROLE_MANAGEMENT`) and Department Authority Dashboard (`ROLE_DEPT_HEAD`).
- Hotspot cards display: Location, Category, Incident Count, and direct clickable links to all constituent tickets.

---

## 4. Consequences

### Positive
- 100% deterministic, explainable, and instantaneous: zero inference latency or token costs.
- Completely executable within standard relational PostgreSQL indexes.
- Directly satisfies academic synopsis requirements without vibe-coding or premature AI hype.

### Negative / Tradeoffs
- Relies on students typing reasonably standard location names (mitigated by dropdown/structured location pickers where available).

---

## 5. Phase Isolation
No database views, AI models, or analytics scripts are implemented in Phase 02.
