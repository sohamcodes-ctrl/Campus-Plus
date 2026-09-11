# Request Validation & Schema Governance

## 1. Validation Doctrine

All incoming payloads are strictly validated before any application use case or domain model is instantiated.
Validation is handled via **Zod schemas** in `src/presentation/schemas/complaintSchemas.ts`.

## 2. Mass-Assignment & Schema Poisoning Protection

Every mutation schema enforces `.strict()`.
If a client attempts to inject unapproved properties (such as `status`, `version`, `isEscalated`, `officialPriority`, or internal database fields), Zod instantly rejects the request with `400 Bad Request` and `VALIDATION_FAILED`:

```typescript
export const SubmitComplaintSchema = z
  .object({
    title: z.string().trim().min(10).max(120),
    description: z.string().trim().min(30),
    categoryId: uuidField,
    departmentId: uuidField,
    locationDetails: z.string().trim().min(1).max(255),
    locationId: uuidField.optional(),
    suggestedPriority: z.nativeEnum(ComplaintPriority).optional(),
  })
  .strict(); // Rejects any extra keys
```

## 3. Authoritative Constraint Inventory

All validation rules are 100% traceably aligned with database constraints established in Phase 04:

| Schema Field | Constraint Rule | Authoritative Source |
|---|---|---|
| `title` | Length: 10 - 120 chars | `chk_complaint_title_len`, BR-001 |
| `description` | Min length: 30 chars | `chk_complaint_desc_len`, BR-001 |
| `locationDetails`| Length: 1 - 255 chars | `chk_location_details_len` |
| `resolutionSummary`| Min length: 20 chars | `chk_resolution_summary_len`, BR-015 |
| `rationale` (Forwarding)| Min length: 10 chars | `chk_forward_rationale_len`, BR-010 |
| `disputeReason`| Min length: 10 chars | BR-016 |
| `fileSizeBytes`| Max: 5,242,880 bytes (5 MB) | BR-012, Phase 04 Attachment rule |
| `mimeType`| `image/jpeg`, `image/png`, `application/pdf` | BR-012 |
| `expectedVersion`| Positive Integer >= 1 | `chk_complaint_version` |
