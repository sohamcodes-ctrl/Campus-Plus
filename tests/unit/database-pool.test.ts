import { afterEach, describe, expect, it } from "vitest";
import { buildPostgresPoolConfig, getDatabaseClient } from "@/infrastructure/database/pool";

const originalNodeEnv = process.env.NODE_ENV;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
  else Reflect.set(process.env, "NODE_ENV", originalNodeEnv);
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("PostgreSQL connection safety", () => {
  it("enables certificate-verified TLS for remote database hosts", () => {
    const config = buildPostgresPoolConfig("postgresql://campus:secret@db.example.test:5432/campus");

    expect(config.ssl).toEqual({ rejectUnauthorized: true });
  });

  it("does not mistake a hostname containing localhost for a loopback host", () => {
    const config = buildPostgresPoolConfig("postgresql://campus:secret@notlocalhost.example.test:5432/campus");

    expect(config.ssl).toEqual({ rejectUnauthorized: true });
  });

  it("rejects remote connection strings that disable certificate verification", () => {
    expect(() =>
      buildPostgresPoolConfig("postgresql://campus:secret@db.example.test:5432/campus?sslmode=no-verify")
    ).toThrow(/certificate verification enabled/);
    expect(() =>
      buildPostgresPoolConfig("postgresql://campus:secret@db.example.test:5432/campus?sslmode=disable")
    ).toThrow(/certificate verification enabled/);
    expect(() =>
      buildPostgresPoolConfig("postgresql://campus:secret@db.example.test:5432/campus?ssl=0")
    ).toThrow(/certificate verification enabled/);
    expect(() =>
      buildPostgresPoolConfig(
        "postgresql://campus:secret@db.example.test:5432/campus?uselibpqcompat=true&sslmode=require"
      )
    ).toThrow(/certificate verification enabled/);
  });

  it("uses the effective PostgreSQL host when deciding whether TLS may be disabled", () => {
    expect(() =>
      buildPostgresPoolConfig(
        "postgresql://campus:secret@localhost:5432/campus?host=remote.example.test"
      )
    ).not.toThrow();
    expect(
      buildPostgresPoolConfig(
        "postgresql://campus:secret@localhost:5432/campus?host=remote.example.test"
      ).ssl
    ).toEqual({ rejectUnauthorized: true });
    expect(() =>
      buildPostgresPoolConfig(
        "postgresql://campus:secret@localhost:5432/campus?host=127.0.0.1&host=remote.example.test"
      )
    ).not.toThrow();
    expect(
      buildPostgresPoolConfig(
        "postgresql://campus:secret@localhost:5432/campus?host=127.0.0.1&host=remote.example.test"
      ).ssl
    ).toEqual({ rejectUnauthorized: true });
    expect(() =>
      buildPostgresPoolConfig(
        "postgresql://campus:secret@db.example.test:5432/campus?sslmode=verify-full&sslmode=disable"
      )
    ).toThrow(/certificate verification enabled/);
  });

  it("allows unencrypted connections to exact loopback hosts for local development", () => {
    expect(buildPostgresPoolConfig("postgresql://campus:secret@localhost:5432/campus").ssl).toBe(false);
    expect(buildPostgresPoolConfig("postgresql://campus:secret@[::1]:5432/campus").ssl).toBe(false);
  });

  it("fails closed when production has no DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    Reflect.set(process.env, "NODE_ENV", "production");

    await expect(getDatabaseClient()).rejects.toThrow("DATABASE_URL is required in production");
  });
});
