import { Pool } from "pg";
import type { Result } from "@keplr-ewallet/stdlib-js";

export interface PgDumpLog {
  log_id: string;
  dump_path: string;
  dump_size: number;
  meta: Record<string, unknown> | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function createPgDumpLog(
  db: Pool,
  dumpPath: string,
  dumpSize: number,
): Promise<Result<PgDumpLog, string>> {
  try {
    const query = `
INSERT INTO pg_dump_logs (
  dump_path, dump_size
) VALUES (
  $1, $2
)
RETURNING *
`;

    const values = [dumpPath, dumpSize];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "Failed to create pg dump log" };
    }

    return { success: true, data: row as PgDumpLog };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getOldPgDumpLogs(
  db: Pool,
  retentionDays: number,
): Promise<Result<PgDumpLog[], string>> {
  try {
    const retentionSeconds = Math.max(0, Math.trunc(retentionDays)) * 86400;

    const query = `
        SELECT *
        FROM pg_dump_logs
        WHERE deleted_at IS NULL
          AND created_at < NOW() - ($1 * INTERVAL '1 second')
        ORDER BY created_at ASC
      `;

    const result = await db.query(query, [retentionSeconds]);
    return { success: true, data: result.rows as PgDumpLog[] };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function markPgDumpLogAsDeleted(
  db: Pool,
  logId: string,
): Promise<Result<void, string>> {
  try {
    const query = `
UPDATE pg_dump_logs 
SET deleted_at = NOW(), updated_at = NOW()
WHERE log_id = $1
`;

    await db.query(query, [logId]);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getPgDumpLogByPath(
  db: Pool,
  dumpPath: string,
): Promise<Result<PgDumpLog | null, string>> {
  try {
    const query = `
SELECT * FROM pg_dump_logs 
WHERE dump_path = $1 AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1
`;

    const result = await db.query(query, [dumpPath]);

    return {
      success: true,
      data: result.rows[0] ? (result.rows[0] as PgDumpLog) : null,
    };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
