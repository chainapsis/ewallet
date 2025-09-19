import type { Result } from "@keplr-ewallet/stdlib-js";
import { dump, restore } from "@keplr-ewallet/ksn-pg-interface";

import {
  createPgDatabase,
  type PgDatabaseConfig,
} from "@keplr-ewallet-ksn-server/database";

const DUMP_TEST_DB = "dump_test_db";

export async function launchHealthCheck(
  pgConfig: PgDatabaseConfig,
  dumpDir: string,
): Promise<Result<void, string>> {
  const originalPoolRes = await createPgDatabase(pgConfig);
  if (!originalPoolRes.success) {
    return { success: false, err: originalPoolRes.err };
  }
  const originalPool = originalPoolRes.data;
  await originalPool.query(`
INSERT INTO users (email) 
VALUES ('test1@test.com'), ('test2@test.com')
`);
  const dumpRes = await dump(pgConfig, dumpDir);
  if (!dumpRes.success) {
    await originalPool.end();
    return { success: false, err: `Failed to dump database: ${dumpRes.err}` };
  }

  await originalPool.query(`
DELETE FROM users 
WHERE email IN ('test1@test.com', 'test2@test.com')
`);
  await originalPool.end();

  const masterPoolRes = await createPgDatabase({
    ...pgConfig,
    database: "postgres",
  });
  if (!masterPoolRes.success) {
    return {
      success: false,
      err: `Failed to create master pool: ${masterPoolRes.err}`,
    };
  }
  const masterPool = masterPoolRes.data;
  await masterPool.query(`
CREATE DATABASE "${DUMP_TEST_DB}"
`);

  const restoreRes = await restore(
    { ...pgConfig, database: DUMP_TEST_DB },
    dumpRes.data.dumpPath,
  );
  if (!restoreRes.success) {
    return {
      success: false,
      err: `Failed to restore database: ${restoreRes.err}`,
    };
  }

  const restorePoolRes = await createPgDatabase({
    ...pgConfig,
    database: DUMP_TEST_DB,
  });
  if (!restorePoolRes.success) {
    return {
      success: false,
      err: `Failed to create restore pool: ${restorePoolRes.err}`,
    };
  }
  const restorePool = restorePoolRes.data;

  const { rows: result } = await restorePool.query(`
SELECT email FROM users
`);
  const expectedEmails = ["test1@test.com", "test2@test.com"];

  if (
    result.length !== 2 ||
    !result.every((row) => expectedEmails.includes(row.email))
  ) {
    await restorePool.end();
    return {
      success: false,
      err: "Failed to restore database",
    };
  }
  await restorePool.end();

  await masterPool.query(`DROP DATABASE "${DUMP_TEST_DB}"`);
  await masterPool.end();

  return { success: true, data: void 0 };
}
