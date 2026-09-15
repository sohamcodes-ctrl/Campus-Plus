# 08 — Authentication Error Mapping & Taxonomy

**Product:** Campus Plus  
**Subsystem:** User-Facing Auth Error Mapping  
**Date:** 2026-09-13  
**Classification:** MICROCOPY & SECURITY SPECIFICATION  

---

## 1. Auth Error Code Taxonomy

The client now differentiates authentication failure modes using structured classification:

| Error Code | Detection Pattern / Underlying Exception | User-Facing Display Message | Security & UX Rationale |
| :--- | :--- | :--- | :--- |
| **`INVALID_CREDENTIALS`** | `invalid login credentials`, `invalid credentials`, `wrong password`, `user not found` | `"The email or password is incorrect."` | Clear, standard feedback; does not leak whether email exists. |
| **`EMAIL_NOT_CONFIRMED`** | `email not confirmed`, `email_not_confirmed` | `"Please verify your institutional email before signing in."` | Explicitly informs user to check their email verification link. |
| **`ACCOUNT_INACTIVE`** | `deactivated`, `disabled`, `inactive` | `"This account is currently inactive. Please contact your institution."` | Distinguishes disabled accounts from incorrect password attempts. |
| **`IDENTITY_NOT_PROVISIONED`** | `does not map to any active user record`, `not provisioned` | `"Your account exists, but institutional access has not yet been provisioned."` | Informs user that Supabase identity exists but campus directory record is pending. |
| **`NETWORK_FAILURE`** | `network`, `failed to fetch`, `timeout` | `"We couldn't reach Campus Plus. Please check your connection and try again."` | Clearly indicates client connectivity issues rather than wrong credentials. |
| **`SERVER_FAILURE`** | `internal server error`, `500`, `not configured` | `"Campus Plus could not complete authentication right now. Please try again."` | Reassures user that the issue is server-side and temporary. |
| **`UNKNOWN_AUTH_FAILURE`** | Any unclassified exception or string | `"Unable to verify campus credentials. Please check your details and try again."` | Safe fallback preventing raw exception or stack trace leakage. |

---

## 2. Leakage Prevention Guarantees

The implementation guarantees:
1. Zero SQL queries or schema table names (`users`, `user_roles`) are ever visible in the UI.
2. Raw Supabase Auth tokens, JWT payloads, and internal API error envelopes are stripped before rendering.
3. Network error banners never display system hostnames or cloud endpoints.
