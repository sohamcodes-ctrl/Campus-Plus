import { z } from "zod";

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

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
export type AppEnv = ServerEnv & ClientEnv;

const isServer = typeof window === "undefined";

function parseEnv(): AppEnv {
  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    APP_SECRET: process.env.APP_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    STORAGE_BUCKET_ATTACHMENTS: process.env.STORAGE_BUCKET_ATTACHMENTS,
    STORAGE_MAX_FILE_SIZE_BYTES: process.env.STORAGE_MAX_FILE_SIZE_BYTES,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const clientResult = clientSchema.safeParse(rawEnv);
  if (!clientResult.success) {
    console.error("❌ Invalid client environment variables:", clientResult.error.format());
    throw new Error("Invalid client environment variables");
  }

  if (!isServer) {
    // Return proxy that throws when accessing server-only properties on the client
    return new Proxy(clientResult.data as AppEnv, {
      get(target, prop: string) {
        if (!prop.startsWith("NEXT_PUBLIC_") && prop !== "NODE_ENV") {
          throw new Error(`Security Violation: Access to server-only env variable '${prop}' on client bundle.`);
        }
        return (target as Record<string, unknown>)[prop];
      },
    });
  }

  const serverResult = serverSchema.safeParse(rawEnv);
  if (!serverResult.success) {
    console.error("❌ Invalid server environment variables:", serverResult.error.format());
    throw new Error("Invalid server environment variables");
  }

  return {
    ...serverResult.data,
    ...clientResult.data,
  };
}

export const env = parseEnv();
