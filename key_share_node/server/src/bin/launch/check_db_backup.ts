import type { Result } from "@keplr-ewallet/stdlib-js";
import { dump, restore } from "@keplr-ewallet/ksn-pg-interface";
import type { Pool } from "pg";

import {
  connectPG,
  type PgDatabaseConfig,
} from "@keplr-ewallet-ksn-server/database";

const DUMP_TEST_DB = "dump_test_db";

export type CheckDBBackupError =
  | {
    type: "connect_db_fail";
    error: string;
  }
  | {
    type: "dump_fail";
    error: string;
  }
  | {
    type: "restore_fail";
    error: string;
  }
  | {
    type: "restored_data_mismatch";
    error: string;
  };

export async function checkDBBackup(
  pgConfig: PgDatabaseConfig,
  dumpDir: string,
): Promise<Result<void, CheckDBBackupError>> {
  let originalPool: Pool | null = null;
  let masterPool: Pool | null = null;
  let restorePool: Pool | null = null;

  try {
    const originalPoolRes = await connectPG(pgConfig);
    if (originalPoolRes.success === false) {
      return {
        success: false,
        err: { type: "connect_db_fail", error: originalPoolRes.err },
      };
    }
    originalPool = originalPoolRes.data;

    await originalPool.query(`
INSERT INTO users (
  email
) 
VALUES 
( 'test1@test.com' ), 
( 'test2@test.com' )
`);

    const dumpRes = await dump(pgConfig, dumpDir);
    if (!dumpRes.success) {
      return {
        success: false,
        err: {
          type: "dump_fail",
          error: `Failed to dump database: ${dumpRes.err}`,
        },
      };
    }

    const masterPoolRes = await connectPG({
      ...pgConfig,
      database: "postgres",
    });
    if (masterPoolRes.success === false) {
      return {
        success: false,
        err: {
          type: "connect_db_fail",
          error: `Failed to create master pool: ${masterPoolRes.err}`,
        },
      };
    }

    masterPool = masterPoolRes.data;

    const { rows: existingDbs } = await masterPool.query(
      `
SELECT 1 
FROM pg_database 
WHERE datname = $1
`,
      [DUMP_TEST_DB],
    );
    if (existingDbs.length === 0) {
      await masterPool.query(`CREATE DATABASE "${DUMP_TEST_DB}"`);
    }

    const restoreRes = await restore(
      { ...pgConfig, database: DUMP_TEST_DB },
      dumpRes.data.dumpPath,
    );
    if (restoreRes.success === false) {
      return {
        success: false,
        err: {
          type: "restore_fail",
          error: `Failed to restore database: ${restoreRes.err}`,
        },
      };
    }

    const restorePoolRes = await connectPG({
      ...pgConfig,
      database: DUMP_TEST_DB,
    });
    if (restorePoolRes.success === false) {
      return {
        success: false,
        err: {
          type: "connect_db_fail",
          error: `Failed to create restore pool: ${restorePoolRes.err}`,
        },
      };
    }
    restorePool = restorePoolRes.data;

    const { rows: result } = await restorePool.query(`
SELECT email 
FROM users
`);
    const expectedEmails = ["test1@test.com", "test2@test.com"];

    if (result.length !== 2) {
      return {
        success: false,
        err: {
          type: "restored_data_mismatch",
          error: `Failed to restore database, result len: ${result.length}`,
        },
      };
    }

    //     ||
    //   !result.every((row) => expectedEmails.includes(row.email))
    // ) {
    //   return {
    //     success: false,
    //     err: { type: "restore_fail", error: "Failed to restore database" },
    //   };
    // }

    return { success: true, data: void 0 };
  } finally {
    if (restorePool) {
      await restorePool.end();
    }

    if (masterPool) {
      const { rows: existingDbs } = await masterPool.query(
        `
SELECT 1 
FROM pg_database 
WHERE datname = $1
`,
        [DUMP_TEST_DB],
      );
      if (existingDbs.length > 0) {
        await masterPool.query(`DROP DATABASE "${DUMP_TEST_DB}"`);
      }
      await masterPool.end();
    }

    if (originalPool) {
      await originalPool.query(`
DELETE FROM users 
WHERE email IN ('test1@test.com', 'test2@test.com')
`);

      await originalPool.end();
    }
  }
}
