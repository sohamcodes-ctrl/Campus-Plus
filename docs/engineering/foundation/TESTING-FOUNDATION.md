# Testing Foundation Specification

## 1. Testing Framework Selection: Vitest

As specified in **ADR-007 (Testing Strategy and Quality Gates)**, Vitest was chosen as the test runner for Campus Plus due to:
1. **Speed & Efficiency**: Instant startup using native ESM and worker threads.
2. **TypeScript Support**: Out-of-the-box execution without intermediate compilation steps.
3. **Path Alias Resolution**: Direct synchronization with `tsconfig.json` path mappings (`@/*`).
4. **Isolated Execution**: Zero shared state between test suites.

---

## 2. Test Configuration (`vitest.config.mts`)

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["node_modules", ".next", "out", "build"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
```

---

## 3. Current Test Suite Overview

| Test Suite File | Domain / Scope | Tests Count | Status |
| :--- | :--- | :--- | :--- |
| `tests/unit/smoke.test.ts` | Test runner, Result monad (`ok`/`err`), ID & reference generators | 5 | Passed |
| `tests/unit/errors.test.ts` | Error taxonomy, status codes, correlation IDs, JSON serialization | 8 | Passed |
| `tests/unit/domain-fsm.test.ts` | Complaint status transitions, terminal states, illegal transitions, SLA hours | 10 | Passed |
| `tests/unit/pii-and-logger.test.ts` | Email masking, phone masking, deep object redaction, child logger | 4 | Passed |
| `tests/unit/env.test.ts` | Environment parsing, default validation, port configuration | 3 | Passed |
| **Total** | **All Phase 03 Foundation Modules** | **30** | **100% Passed** |

---

## 4. Test Execution Commands

- Run full test suite once: `pnpm test`
- Interactive watch mode during development: `pnpm test:watch`
- Comprehensive gate verification: `pnpm verify`
