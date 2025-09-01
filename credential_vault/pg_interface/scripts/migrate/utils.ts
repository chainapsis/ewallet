import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

export type PgDatabaseConfig = {
  database: string;
  host: string;
  password: string;
  user: string;
  port: number;
  ssl: boolean;
};

export function readMigrateSql() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(join(currentDir, "./migrate.sql"), "utf-8");
  return sql;
}

export async function createDBConn(config: PgDatabaseConfig) {
  const resolvedConfig = {
    ...config,
    ssl: config.ssl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  };

  const pool = new Pool(resolvedConfig);

  return {
    success: true,
    data: pool,
  };
}
