/**
 * Database Client Contract & Placeholder
 * In Phase 03, this acts as an architectural boundary placeholder.
 * Per Phase 03 constraints: No active external database connections or queries are executed.
 */

export interface DatabaseConnectionConfig {
  url?: string;
  isReady: boolean;
}

export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private readonly config: DatabaseConnectionConfig;

  private constructor() {
    this.config = {
      isReady: false,
    };
  }

  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  public getStatus(): { initialized: boolean; provider: string } {
    return {
      initialized: this.config.isReady,
      provider: "Supabase / Postgres (Phase 04+ Ready)",
    };
  }
}
