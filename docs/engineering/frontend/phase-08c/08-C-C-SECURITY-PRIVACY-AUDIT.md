# Campus Plus — Phase 08-C: Stage 08-C-C Security & Privacy Audit

**Authority:** Application Security Engineer, Security Architect  
**Stage:** 08-C-C  
**Status:** 100% VERIFIED  

---

## 1. Zero-Trust UI & Privacy Architecture

In alignment with Phase 02 Architecture, Phase 06 API Security, and Phase 07-B verification:

1. **Client UI Never Serves as a Security Boundary:**
   - Visual controls (`Button`, `Modal`, `StatusPill`, `TimelineFeed`) present data and actions, but **NEVER** act as an authorization gate.
   - The backend `AuthorizationPolicy.ts` and Supabase PostgreSQL Row Level Security (RLS) policies are the sole authorities governing permissions and data visibility.

2. **Public vs Internal Audit Privacy (`TimelineFeed`):**
   - In accordance with `INV-012` and `BR-020`, internal staff notes must never be leaked to students.
   - The backend DTO projection (`GetTimelineUseCase` and `toComplaintDTO`) strips `isInternal` events for non-staff actors.
   - `TimelineFeed` strictly consumes public event items (`TimelineEventItem`), rendering public remarks safely without exposure of private handler metadata.

3. **Attachment Validation & Size Protection (`FileUploader`):**
   - Client-side validation in `FileUploader` enforces:
     - Maximum 3 files total.
     - Maximum 5MB (5,242,880 bytes) per file.
     - Strict MIME types: `image/jpeg`, `image/png`, `application/pdf`.
   - This provides immediate user feedback before initiating presigned upload requests to Supabase Storage, preventing bandwidth exhaustion and API abuse.

4. **XSS & Content Injection Prevention:**
   - All user-supplied strings (titles, descriptions, tracking codes, actor names, remarks) are rendered via standard React 19 JSX text nodes, which automatically escape HTML entities and prevent Cross-Site Scripting (XSS).
   - Zero use of `dangerouslySetInnerHTML`.
