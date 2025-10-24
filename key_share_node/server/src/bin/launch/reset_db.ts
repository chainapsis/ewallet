import type { Result } from "@oko-wallet/stdlib-js";
import {
  createTables,
  dropAllTablesIfExist,
} from "@oko-wallet/ksn-pg-interface";

import type { PgDatabaseConfig } from "@oko-wallet-ksn-server/database";
import { connectPG } from "@oko-wallet-ksn-server/database";

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
