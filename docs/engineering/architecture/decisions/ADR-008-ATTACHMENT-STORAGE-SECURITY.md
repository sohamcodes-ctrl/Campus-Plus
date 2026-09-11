# ADR-008: Attachment Storage Security & File Management

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Security Engineer, Lead Software Architect  
**Traceability**: Resolves `OD-010`, satisfies `FR-004`, `FR-016`, `BR-021`, `BR-022`, `NFR-007`, `SEC-005`  

---

## 1. Context & Problem Statement

Users upload file attachments as supporting evidence during complaint submission (`FR-004`) and handlers upload resolution proof (`FR-016`).
Grievance attachments present distinct security risks:
- Malicious file uploads (executable scripts, malware, HTML/SVG payload XSS).
- Unrestricted public file indexing (violating student privacy and confidentiality).
- Storage exhaustion from excessively large files.

`OD-010` required resolving attachment size and quota constraints. `SEC-005` requires private storage with signed URL access, and `NFR-007` mandates strict MIME-type validation.

---

## 2. Decision: Private Object Storage with Presigned URLs and Strict Boundary Quotas

We architect a **Private Object Storage Pipeline** with client-direct presigned uploads and server-side verification.

### 2.1 Quota & Boundary Enforcement (`OD-010`, `BR-022`)
- **Maximum File Size**: Exactly **5 MB** per individual file.
- **Maximum File Count**: Up to **3 files** per complaint submission; up to **2 files** per resolution proof.
- **Permitted MIME Types**: Whitelist restricted to:
  - `image/jpeg` (`.jpg`, `.jpeg`)
  - `image/png` (`.png`)
  - `application/pdf` (`.pdf`)
  - *All executable types (`.exe`, `.sh`, `.bat`, `.js`, `.php`), archives (`.zip`), and scriptable formats (`.svg`, `.html`) are strictly rejected.*

### 2.2 Storage Pipeline & Secure Access Protocol (`SEC-005`)

```text
  [Client Browser]
        │
        │ (1) Requests Upload Ticket (filename, MIME, size)
        ▼
  [Application API] ────> Validates size <= 5MB, MIME in whitelist
        │
        │ (2) Generates time-limited Pre-Signed Upload URL (e.g. S3 / Supabase Storage)
        ▼
  [Client Browser] ─────> (3) PUT File Directly to Storage Bucket (Private)
        │
        │ (4) Confirms Upload & Attaches Storage Key to Complaint
        ▼
  [Application API] ────> Validates file exists in bucket; creates `attachments` DB record
```

### 2.3 Access Security & Privacy Invariants
1. **Zero Public Buckets**: The storage bucket is 100% private. Direct HTTP requests to raw storage URLs return 403 Forbidden.
2. **Time-Limited Signed URLs**: When an authorized user views a complaint, the application generates a temporary read-signed URL valid for **15 minutes**.
3. **Immutability Invariant (`BR-021`)**: Once a complaint progresses beyond `SUBMITTED`, attached file references cannot be deleted by users.

---

## 3. Consequences

### Positive
- Heavy file payloads bypass the application server directly into scalable object storage.
- Strict MIME and size boundaries prevent storage bloat and server-side resource starvation.
- Complete privacy protection: Only users authorized by RBAC/RLS can obtain signed view URLs.

### Negative / Tradeoffs
- Requires S3-compatible or managed bucket storage (e.g., Supabase Storage, AWS S3, MinIO).

---

## 4. Phase Isolation
No cloud storage buckets, SDKs, or upload handlers are created in Phase 02.
