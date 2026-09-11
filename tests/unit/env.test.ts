import { describe, it, expect } from "vitest";
import { env } from "@/config/env";

describe("Environment Configuration Foundation", () => {
  it("should have loaded the default environment values safely", () => {
    expect(env.NODE_ENV).toBeDefined();
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
  });

  it("should have default port configured as number", () => {
    expect(typeof env.PORT).toBe("number");
    expect(env.PORT).toBeGreaterThan(0);
  });

  it("should have configured valid log level", () => {
    expect(["debug", "info", "warn", "error"]).toContain(env.LOG_LEVEL);
  });
});
