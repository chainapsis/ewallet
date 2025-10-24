import { Pool } from "pg";

import { readMigrateSql } from "../bin/db_aux/utils";

export async function dropAllTablesIfExist(pool: Pool) {
  const tableNameRet = await pool.query<{ table_name: string }>(
    `
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND table_type='BASE TABLE'
`,
    [],
  );

  if (tableNameRet.rows.length > 0) {
    const tableNames = tableNameRet.rows.map((r) => r.table_name);
    console.log("Existing tables: %j", tableNames);

    for (let idx = 0; idx < tableNames.length; idx += 1) {
      await pool.query<{ table_name: string }>(
        `
DROP TABLE IF EXISTS ${tableNames[idx]} CASCADE
`,
        [],
      );
    }

    console.log("Dropped tables, count: %s", tableNames.length);
  }
}

export async function createTables(pool: Pool): Promise<void> {
  const sql = readMigrateSql();
  const results = await pool.query(sql);

  console.log("Created tables, query count: %s", (results as any).length);
}
