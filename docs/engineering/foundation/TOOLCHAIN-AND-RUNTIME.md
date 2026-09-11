# Toolchain and Runtime Specification

## 1. Environment & Runtime Baseline

The Campus Plus project foundation has been verified against the following verified runtime components:

| Tool | Version | Architecture / Platform | Role |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.13.0` | Windows x64 | Primary server JavaScript/TypeScript execution runtime |
| **pnpm** | `v11.22.0` | Content-Addressable Store (`D:\.pnpm-store\v11`) | Deterministic, fast, link-based dependency package manager |
| **Git** | `2.54.0.windows.1` | Master branch, LF normalized | Source version control |
| **TypeScript** | `v5.9.3` | Native Node compiler (`tsc`) | Static type checking and compiler verification |
| **Next.js** | `16.3.4` | Turbopack engine | Full-stack application framework (App Router) |
| **React** | `19.2.8` | Server & Client components | Component model |
| **Vitest** | `5.0.0` | Native ESM test runner | Unit and integration test suite |

---

## 2. Package Management Standards (`pnpm`)

1. **Deterministic Lockfile**:
   - `pnpm-lock.yaml` is strictly tracked in version control.
   - All installs in CI or testing must use `pnpm install --frozen-lockfile`.

2. **Workspace & Modules Configuration (`.npmrc`)**:
   - Configured `confirmModulesPurge=false` to permit smooth non-interactive execution across build agents and CI/CD pipelines without hanging on TTY confirmation prompts.

3. **Dependency Isolation**:
   - pnpm uses hard links and symbolic links to isolate dependencies, preventing accidental "phantom dependencies" (importing packages not declared in `package.json`).

---

## 3. Compiler Configuration (`tsconfig.json`)

Key TypeScript compiler options enforced:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- `strict: true`: Enables all strict type-checking flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`).
- `paths`: Configures `@/*` mapped to `./src/*`, ensuring clean import syntax without relative traversing (`../../`).
