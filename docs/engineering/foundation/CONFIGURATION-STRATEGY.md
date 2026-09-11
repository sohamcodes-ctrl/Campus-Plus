# Configuration Strategy & Environment Boundary Management

## 1. Principles

Configuration in Campus Plus adheres strictly to **The Twelve-Factor App (Factor III: Config)** and the security principles outlined in **ADR-004 (Supabase Integration Strategy)** and **ADR-009 (Security & Anonymity Architecture)**:

1. **Strict Client / Server Segregation**: Browser client bundles must NEVER receive or have access to server-side secrets (e.g. database credentials, JWT signing secrets, service role keys).
2. **Schema-Driven Validation at Startup**: Environment variables are validated on initial load via Zod. Invalid or missing configurations immediately fail with actionable diagnostic messages.
3. **Safe Development Defaults**: Development environments provide sensible defaults, enabling tests and local builds to run without requiring developer setup of external third-party accounts.
4. **Zero Secrets in Repository**: Real credentials, encryption keys, and tokens are strictly excluded via `.gitignore`. `.env.example` provides non-sensitive template placeholders.

---

## 2. Environment Schema Architecture (`src/config/env.ts`)

The environment parser separates runtime configuration into two schemas:

### 2.1 Server-Only Schema
```ts
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  APP_SECRET: z.string().min(16).default("dev_insecure_app_secret_at_least_16_chars"),
  CRON_SECRET: z.string().min(8).default("dev_cron_secret_min_8_chars"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  STORAGE_BUCKET_ATTACHMENTS: z.string().default("campus-plus-attachments"),
  STORAGE_MAX_FILE_SIZE_BYTES: z.coerce.number().default(10485760),
});
```

### 2.2 Client-Exposed Schema
```ts
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});
```

### 2.3 Client Boundary Runtime Guard (Proxy)
When running on the browser (`typeof window !== "undefined"`), the exported `env` object wraps client configuration in a JavaScript `Proxy`. Any attempt to access a server-only variable triggers an immediate runtime exception:
```ts
if (!isServer) {
  return new Proxy(clientResult.data as AppEnv, {
    get(target, prop: string) {
      if (!prop.startsWith("NEXT_PUBLIC_") && prop !== "NODE_ENV") {
        throw new Error(`Security Violation: Access to server-only env variable '${prop}' on client bundle.`);
      }
      return (target as Record<string, unknown>)[prop];
    },
  });
}
```

---

## 3. Environment Lifecycle Matrix

| Variable | Scope | Dev Default | Production Requirement |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Shared | `"development"` | `"production"` |
| `PORT` | Server | `3000` | Cloud provider port |
| `LOG_LEVEL` | Server | `"info"` | `"info"` or `"warn"` |
| `APP_SECRET` | Server | Dev fallback string | Required 32+ char secret |
| `CRON_SECRET` | Server | Dev fallback string | Required random token |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Optional in Phase 03 | Required in Phase 04+ |
| `SUPABASE_JWT_SECRET` | Server | Optional in Phase 03 | Required in Phase 04+ |
| `STORAGE_BUCKET_ATTACHMENTS`| Server | `"campus-plus-attachments"` | Institutional S3 bucket |
| `STORAGE_MAX_FILE_SIZE_BYTES`| Server | `10485760` (10MB) | Institutional quota |
| `NEXT_PUBLIC_APP_URL` | Client | `"http://localhost:3000"` | Production FQDN |
| `NEXT_PUBLIC_APP_ENV` | Client | `"development"` | `"production"` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Optional in Phase 03 | Institutional endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Optional in Phase 03 | Institutional anon key |
