# Dependency Inventory & Supply Chain Evaluation

## 1. Production Dependencies

| Package | Version | Purpose | Security / Licensing Audit |
| :--- | :--- | :--- | :--- |
| **`next`** | `16.3.4` | Full-stack web framework, App Router, SSR, Turbopack compiler | MIT License. Official framework maintained by Vercel. Zero known vulnerabilities. |
| **`react`** | `19.2.8` | Declarative UI component library | MIT License. Maintained by Meta. Verified production baseline. |
| **`react-dom`** | `19.2.8` | DOM rendering engine for React | MIT License. Maintained by Meta. |
| **`zod`** | `4.5.4` | Schema declaration and environment validation | MIT License. Zero-dependency TypeScript-first validation library. |

---

## 2. Development Dependencies

| Package | Version | Purpose | Security / Licensing Audit |
| :--- | :--- | :--- | :--- |
| **`typescript`** | `5.9.3` | Static type checking and compiler | Apache-2.0 License. Microsoft. |
| **`vitest`** | `5.0.0` | Native ESM test framework | MIT License. Fast, Vite-native test runner with out-of-the-box TypeScript support. |
| **`eslint`** | `9.39.5` | Code quality and static analysis linter | MIT License. OpenJS Foundation. |
| **`eslint-config-next`** | `16.3.4` | Next.js and Core Web Vitals ESLint rules | MIT License. Maintained by Next.js team. |
| **`tailwindcss`** | `4.3.3` | Utility-first CSS engine | MIT License. Tailwind Labs. |
| **`@tailwindcss/postcss`** | `4.3.3` | PostCSS integration for Tailwind v4 | MIT License. Tailwind Labs. |
| **`@types/node`** | `20.19.43` | TypeScript definitions for Node.js APIs | MIT License. DefinitelyTyped. |
| **`@types/react`** | `19.2.18` | TypeScript definitions for React | MIT License. DefinitelyTyped. |
| **`@types/react-dom`** | `19.2.7` | TypeScript definitions for React DOM | MIT License. DefinitelyTyped. |

---

## 3. Supply Chain Security Verification

- **Package Manager**: pnpm `11.22.0` with content-addressable hash verification (`D:\.pnpm-store\v11`).
- **Audit Verification**: Lockfile verified against supply-chain policies on install.
- **Transitive Depth**: Minimal direct dependency footprint (4 production dependencies). Zero heavy or deprecated utilities.
