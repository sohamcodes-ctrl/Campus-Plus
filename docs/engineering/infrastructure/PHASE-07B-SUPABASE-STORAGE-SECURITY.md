# PHASE 07-B: Supabase Storage Integration & Private Attachment Security

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Status:** **VERIFIED & SECURED (Private Bucket Enclosure)**  

---

## 1. Storage Architecture & Privacy Boundaries

Grievance attachments often contain sensitive evidence, such as medical notes, disciplinary incident reports, hostel room damage photos, or financial receipts. Under no circumstances may the storage bucket be publicly accessible.

### Storage Enclosure Architecture
- **Bucket Identifier**: `campus-plus-attachments`
- **Bucket Visibility**: `public = FALSE` (Strictly private)
- **Access Pattern**: Pre-signed URLs with cryptographic signatures and time-limited expiration (3600 seconds).
- **Direct Upload Flow**: Clients obtain a signed upload URL from `/api/v1/attachments/presign-upload` and upload directly to Supabase Storage via `PUT` request without proxying heavy binary data through Next.js server memory.

---

## 2. Server-Side Attachment Constraints & Guards

In [`src/infrastructure/storage/SupabaseStorageAdapter.ts`](file:///d:/Deparment%20Project/department%20project/src/infrastructure/storage/SupabaseStorageAdapter.ts), the following server-side validations are enforced before generating any signed upload URL:

```typescript
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 5242880; // 5 MB strictly enforced

// 1. File size verification
if (metadata.sizeBytes <= 0 || metadata.sizeBytes > MAX_FILE_SIZE_BYTES) {
  throw new Error(`File size violation: File size must be between 1 and 5242880 bytes.`);
}

// 2. MIME type whitelist verification
if (!ALLOWED_MIME_TYPES.has(metadata.contentType)) {
  throw new Error(`MIME type violation: '${metadata.contentType}' is not permitted.`);
}

// 3. Directory traversal sanitization
const sanitizedFilename = metadata.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
const fileUuid = crypto.randomUUID();
const fileKey = `complaints/temp/${fileUuid}-${sanitizedFilename}`;
```

---

## 3. Threat Vector Analysis & Verification Evidence

| Threat Vector | Attack Scenario | Defense & Mitigation | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Oversized Upload** | Attacker attempts to upload a 50 MB video or binary blob. | Server validates `sizeBytes <= 5242880` and rejects with error. | Tested in `tests/integration/supabase-infrastructure.test.ts:171` (*rejects uploads exceeding 5 MB*). |
| **Malicious Executable** | Attacker attempts to upload `.sh`, `.exe`, `.js`, or `.php` file. | Strict MIME whitelist permits only `image/jpeg`, `image/png`, and `application/pdf`. | Tested in `tests/integration/supabase-infrastructure.test.ts:184` (*rejects uploads with disallowed MIME types*). |
| **Directory Traversal** | Attacker submits filename `../../etc/passwd.pdf`. | Regex sanitizer replaces `/` and unsafe characters with `_`, producing `.._.._etc_passwd.pdf`. | Tested in `tests/integration/supabase-infrastructure.test.ts:197` (*sanitizes filenames and resists directory traversal*). |
| **Public Disclosure** | Unauthenticated user attempts direct object URL fetch. | Bucket is private; object requests without a valid Supabase HMAC signature return HTTP 403. | Enforced by private bucket configuration. |
| **Complaint Quota Bypass** | User attempts to attach >3 files to a complaint. | Domain model aggregate (`Complaint.addAttachment`) and DB trigger limit maximum attachments to 3 per ticket. | Verified by domain invariant suite (`tests/unit/domain-complaint-aggregate.test.ts`). |

---

## 4. Orphaned Attachment Defense & Lifecycle Strategy (Section 32)

### The Staged Upload Architecture
The presign endpoint (`POST /api/v1/attachments/presign-upload`) issues temporary signed URLs targeting the staging prefix:
`complaints/temp/{uuid}-{sanitized_filename}`

### Binding & Quarantine Protocol
1. **Binding Phase**: When the user submits the complaint (`POST /api/v1/complaints`), the provided `storageKey` is validated and bound to the newly created `complaint_id` inside the `attachments` table within an atomic transaction.
2. **Quota Enforcement**: A maximum of 3 attachments can be bound per complaint.
3. **Orphan Quarantine Strategy**: Any file uploaded to `complaints/temp/` that is not bound to a complaint in the database within 24 hours is considered abandoned. A scheduled maintenance job or Supabase Storage lifecycle rule can safely purge unreferenced objects in `complaints/temp/` older than 24 hours without impacting verified complaint attachments.
