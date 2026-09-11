import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

function getAllTsFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllTsFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".ts") && !file.endsWith(".d.ts")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function extractImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const importLines: string[] = [];
  const regex = /(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    importLines.push(match[1]);
  }

  // Also check dynamic imports
  const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = dynamicRegex.exec(content)) !== null) {
    importLines.push(match[1]);
  }

  return importLines;
}

describe("Hexagonal Architecture & Clean Dependency Boundaries", () => {
  const domainRoot = path.resolve(__dirname, "../../src/domain");
  const appRoot = path.resolve(__dirname, "../../src/application");

  const FORBIDDEN_DOMAIN_PATTERNS = [
    /infrastructure/i,
    /^next(\/.*)?$/,
    /^@supabase\//,
    /^@electric-sql\//,
    /^pg(-.*)?$/,
    /^fs(\/.*)?$/,
    /^node:fs(\/.*)?$/,
    /^net(\/.*)?$/,
    /^node:net(\/.*)?$/,
    /^http(\/.*)?$/,
    /^node:http(\/.*)?$/,
  ];

  const FORBIDDEN_APP_PATTERNS = [
    /infrastructure/i,
    /^next(\/.*)?$/,
    /^@supabase\//,
    /^@electric-sql\//,
    /^pg(-.*)?$/,
  ];

  describe("Domain Layer Isolation (src/domain/**)", () => {
    const domainFiles = getAllTsFiles(domainRoot);

    it("should have domain files to test", () => {
      expect(domainFiles.length).toBeGreaterThan(5);
    });

    domainFiles.forEach((filePath) => {
      const relPath = path.relative(path.resolve(__dirname, "../.."), filePath).replace(/\\/g, "/");

      it(`should ensure '${relPath}' has zero infrastructure or framework dependencies`, () => {
        const imports = extractImports(filePath);

        for (const imp of imports) {
          for (const pattern of FORBIDDEN_DOMAIN_PATTERNS) {
            const violates = pattern.test(imp);
            expect(
              violates,
              `Architecture Boundary Violation in '${relPath}': Illegal import '${imp}' matching forbidden pattern ${pattern.toString()}`
            ).toBe(false);
          }
        }
      });
    });
  });

  describe("Application Layer Isolation (src/application/**)", () => {
    const appFiles = getAllTsFiles(appRoot);

    it("should have application files to test", () => {
      expect(appFiles.length).toBeGreaterThan(5);
    });

    appFiles.forEach((filePath) => {
      const relPath = path.relative(path.resolve(__dirname, "../.."), filePath).replace(/\\/g, "/");

      it(`should ensure '${relPath}' has zero infrastructure or framework dependencies`, () => {
        const imports = extractImports(filePath);

        for (const imp of imports) {
          for (const pattern of FORBIDDEN_APP_PATTERNS) {
            const violates = pattern.test(imp);
            expect(
              violates,
              `Architecture Boundary Violation in '${relPath}': Illegal import '${imp}' matching forbidden pattern ${pattern.toString()}`
            ).toBe(false);
          }
        }
      });
    });
  });
});
