import type { Result } from "@keplr-ewallet/stdlib-js";
import {
  createTables,
  dropAllTablesIfExist,
} from "@keplr-ewallet/ksn-pg-interface";
import type { PgDatabaseConfig } from "@keplr-ewallet-ksn-server/database";

import { connectPG } from "@keplr-ewallet-ksn-server/database";

export async function resetDB(
  pgConfig: PgDatabaseConfig,
): Promise<Result<void, string>> {
  const createPostgresRes = await connectPG(pgConfig);
  if (!createPostgresRes.success) {
    return {
      success: false,
      err: createPostgresRes.err,
    };
  }
  const pool = createPostgresRes.data;

  try {
    await dropAllTablesIfExist(pool);
    await createTables(pool);

    return { success: true, data: void 0 };
  } catch (error) {
    return {
      success: false,
      err: `Failed to reset db: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
