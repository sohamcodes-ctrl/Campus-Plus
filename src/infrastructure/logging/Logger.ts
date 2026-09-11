import { sanitizeLogData } from "@/shared/utils/pii";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  correlationId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    details?: unknown;
  };
}

export interface LoggerOptions {
  level?: LogLevel;
  defaultContext?: Record<string, unknown>;
  isProduction?: boolean;
}

export class Logger {
  private level: LogLevel;
  private defaultContext: Record<string, unknown>;
  private isProduction: boolean;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? "info";
    this.defaultContext = options.defaultContext ?? {};
    this.isProduction =
      options.isProduction ??
      (typeof process !== "undefined" && process.env.NODE_ENV === "production");
  }

  public child(context: Record<string, unknown>): Logger {
    return new Logger({
      level: this.level,
      defaultContext: { ...this.defaultContext, ...context },
      isProduction: this.isProduction,
    });
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[targetLevel] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): void {
    if (!this.shouldLog(level)) return;

    const mergedContext = {
      ...this.defaultContext,
      ...(context ? (sanitizeLogData(context) as Record<string, unknown>) : {}),
    };

    const correlationId = (mergedContext.correlationId as string | undefined) ?? undefined;
    delete mergedContext.correlationId;

    let serializedError: LogEntry["error"] | undefined;
    if (error instanceof Error) {
      serializedError = {
        name: error.name,
        message: error.message,
        stack: this.isProduction ? undefined : error.stack,
        details: "details" in error ? (error as { details?: unknown }).details : undefined,
      };
    } else if (error) {
      serializedError = {
        name: "UnknownError",
        message: String(error),
      };
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId,
      context: Object.keys(mergedContext).length > 0 ? mergedContext : undefined,
      error: serializedError,
    };

    if (this.isProduction) {
      const json = JSON.stringify(entry);
      if (level === "error") {
        console.error(json);
      } else if (level === "warn") {
        console.warn(json);
      } else {
        console.log(json);
      }
    } else {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${correlationId ? ` [${correlationId}]` : ""}`;
      const payload = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : "";
      const errOut = entry.error ? ` | Error: ${entry.error.message}` : "";
      const logLine = `${prefix}: ${message}${payload}${errOut}`;

      if (level === "error") {
        console.error(logLine, error ?? "");
      } else if (level === "warn") {
        console.warn(logLine);
      } else {
        console.log(logLine);
      }
    }
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.write("debug", message, context);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.write("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>, error?: unknown): void {
    this.write("warn", message, context, error);
  }

  public error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    this.write("error", message, context, error);
  }
}

export const logger = new Logger({
  level: (typeof process !== "undefined" && (process.env.LOG_LEVEL as LogLevel)) || "info",
});
