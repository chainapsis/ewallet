import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { Result } from "@keplr-ewallet/stdlib-js";

export type PgDumpStatus = "IN_PROGRESS" | "COMPLETED" | "FAILED" | "DELETED";

export type PgDumpMeta = {
  dump_duration?: number;
  dump_size?: number;
  error?: string;
};

export interface PgDump {
  dump_id: string;
  status: PgDumpStatus;
  dump_path: string | null;
  meta: PgDumpMeta;
  created_at: Date;
  updated_at: Date;
}

export async function createPgDump(db: Pool): Promise<Result<PgDump, string>> {
  try {
    const query = `
INSERT INTO pg_dumps (
  dump_id, status
) VALUES (
  $1, $2
)
RETURNING *
`;

    const values = [uuidv4(), "IN_PROGRESS"];

    const result = await db.query(query, values);

    const row = result.rows[0];
    if (!row) {
      return { success: false, err: "Failed to create pg dump" };
    }

    return { success: true, data: row as PgDump };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function updatePgDump(
  db: Pool,
  dumpId: string,
  status: PgDumpStatus,
  dumpPath: string | null,
  meta: PgDumpMeta | null,
): Promise<Result<void, string>> {
  try {
    const query = `
UPDATE pg_dumps
SET status = $1, dump_path = $2, meta = $3, updated_at = NOW()
WHERE dump_id = $4
`;

    const values = [status, dumpPath, meta, dumpId];

    await db.query(query, values);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function updatePgDumpStatus(
  db: Pool,
  dumpId: string,
  status: PgDumpStatus,
): Promise<Result<void, string>> {
  try {
    const query = `
UPDATE pg_dumps
SET status = $1, updated_at = NOW()
WHERE dump_id = $2
`;

    await db.query(query, [status, dumpId]);

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function getOldPgDumps(
  db: Pool,
  retentionDays: number,
): Promise<Result<PgDump[], string>> {
  try {
    if (retentionDays <= 0) {
      return { success: true, data: [] };
    }

    const retentionSeconds = Math.trunc(retentionDays) * 86400;
    // const retentionSeconds = retentionDays * 60; // for testing

    const query = `
        SELECT *
        FROM pg_dumps
        WHERE status = 'COMPLETED'
          AND created_at < NOW() - ($1 * INTERVAL '1 second')
        ORDER BY created_at ASC
      `;

    const result = await db.query(query, [retentionSeconds]);
    return { success: true, data: result.rows as PgDump[] };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
