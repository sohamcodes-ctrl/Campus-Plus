# 11. Error Handling, Status Codes & Envelope Sanitization

## 1. Overview & Principles

The Campus Plus API implements a **deterministic, non-leaking, RFC-aligned error response mechanism**. Errors originating anywhere in the stack (presentation validation, application orchestration, domain invariant violations, or infrastructure persistence failures) are captured, categorized, mapped to appropriate HTTP status codes, sanitized of internal operational details, and enveloped in a standardized JSON structure.

### Core Tenets
1. **Zero Information Leakage**: Database schema details, SQL syntax errors, PGlite/Postgres driver stack traces, and internal server file paths are **never** returned to the caller.
2. **Deterministic Status Codes**: Every operational error maps strictly to a semantically accurate HTTP status code (RFC 9110).
3. **Structured Machine-Readable Codes**: The envelope always provides a constant string `code` (e.g. `CONCURRENCY_CONFLICT`, `FORBIDDEN`, `VALIDATION_ERROR`) alongside human-readable `message` strings.
4. **Actionable Validation Diagnostics**: Validation errors (HTTP 422) provide structured field-level paths and error details to enable clients to highlight offending input fields.

---

## 2. Standardized Error Envelope Structure

All non-2xx responses follow the standardized error envelope schema:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation suitable for presentation.",
    "details": [ /* Optional structured diagnostics (e.g. Zod validation errors) */ ]
  },
  "timestamp": "2026-09-11T10:00:00.000Z",
  "requestId": "req_uuid_or_generated_id"
}
```

---

## 3. Status Code Taxonomy & Error Code Catalog

| HTTP Status | HTTP Reason | Error Code | Source Exception | Description & Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **400** | Bad Request | `INVALID_JSON` | `SyntaxError` | Ill-formed JSON body in HTTP request payload. |
| **400** | Bad Request | `BAD_REQUEST` | `AppError(BAD_REQUEST)` | Malformed query parameters, invalid parameter format, missing required HTTP headers. |
| **401** | Unauthorized | `UNAUTHORIZED` | `AppError(UNAUTHORIZED)` | Missing or invalid authentication token / actor context. Caller identity is unverified. |
| **403** | Forbidden | `FORBIDDEN` | `AppError(FORBIDDEN)` | Valid actor, but unauthorized for this resource/action (BOLA, cross-department leakage, missing permission). |
| **404** | Not Found | `NOT_FOUND` | `AppError(NOT_FOUND)` | Complaint, attachment, timeline, or related entity does not exist. |
| **409** | Conflict | `CONCURRENCY_CONFLICT` | `AppError(CONFLICT)` | Optimistic Concurrency Control (OCC) version mismatch. Expected version does not match current state. |
| **409** | Conflict | `IDEMPOTENCY_CONFLICT` | `AppError(CONFLICT)` | Reused `Idempotency-Key` with a different payload or while a concurrent request is `IN_PROGRESS`. |
| **422** | Unprocessable Content | `VALIDATION_ERROR` | `ZodError` | Request body failed schema validation (missing required fields, out-of-range lengths, unexpected fields). |
| **422** | Unprocessable Content | `UNPROCESSABLE_ENTITY` | `DomainError` | Domain invariant or state machine transition violation (e.g. illegal status transition, missing proof). |
| **500** | Internal Server Error | `INTERNAL_SERVER_ERROR`| `Error` (Generic) | Unhandled system exception, database connection failure, unexpected filesystem/driver error. Sanitized. |

---

## 4. Error Mapping Implementation

The global error boundary function `handleApiError` in `src/presentation/utils/errorHandler.ts` evaluates incoming exceptions in order of specificity:

```typescript
export function handleApiError(error: unknown, req?: NextRequest): NextResponse {
  const requestId = req?.headers.get('x-request-id') || crypto.randomUUID();

  // 1. Zod Validation Errors (422 Unprocessable Content)
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: formattedErrors
      },
      timestamp: new Date().toISOString(),
      requestId
    }, { status: 422 });
  }

  // 2. Application Errors (Specific HTTP status codes)
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      timestamp: new Date().toISOString(),
      requestId
    }, { status: error.statusCode });
  }

  // 3. Domain Model Invariant & State Machine Violations (422 Unprocessable Content)
  if (error instanceof DomainError) {
    return NextResponse.json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId
    }, { status: 422 });
  }

  // 4. JSON Body Parse Errors (400 Bad Request)
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed or invalid JSON payload in request body'
      },
      timestamp: new Date().toISOString(),
      requestId
    }, { status: 400 });
  }

  // 5. Unhandled / System / Database Errors (500 Internal Server Error)
  console.error(`[Unhandled Error] [Request: ${requestId}]`, error);
  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please contact system administrators.'
    },
    timestamp: new Date().toISOString(),
    requestId
  }, { status: 500 });
}
```

---

## 5. Security Sanitization & Safe Degradation

### Production Sanitization
- In production (`process.env.NODE_ENV === 'production'`), error details for 500 status codes never include:
  - SQL query fragments or table names.
  - Driver connection strings or file system paths.
  - Stack traces or module paths.
- Each 500 response generates a unique `requestId` which is logged server-side alongside the full stack trace for observability, allowing operations teams to correlate client bug reports with server logs without leaking internal details.

### Client-Side Handling Recommendations
Clients interacting with the Campus Plus API should branch based on the HTTP status and `error.code`:
- On **401**: Redirect user to institutional login portal.
- On **403**: Display unauthorized notice (access denied to this ticket or action).
- On **409**:
  - `CONCURRENCY_CONFLICT`: Notify user that the complaint was updated by another officer, reload the latest complaint state, and re-attempt action.
  - `IDEMPOTENCY_CONFLICT`: Alert user that this operation is already processing or was submitted with conflicting parameters.
- On **422**:
  - `VALIDATION_ERROR`: Render inline field validation highlights using `error.details`.
  - State machine violation (e.g. `CANNOT_ASSIGN_CLOSED`): Display institutional policy dialog explaining why the requested state transition is forbidden.
