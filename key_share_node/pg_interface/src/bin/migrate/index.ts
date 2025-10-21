import { Pool } from "pg";
import { dropAllTablesIfExist } from "@keplr-ewallet-ksn-pg-interface/postgres";

import { createDBConn, readMigrateSql, type PgDatabaseConfig } from "./utils";
import { loadEnvs } from "./envs";

const DEFAULT_DB_NAME = "key_share_node_dev";

async function createDBIfNotExists(pgConfig: PgDatabaseConfig, dbName: string) {
  console.log(`Creating database ${dbName} if not exists...`);

  console.log("Connecting to db (postgres), config: %j", pgConfig);
  const connRet = await createDBConn(pgConfig);
  if (connRet.success === true) {
    const pool = connRet.data;
    const res = await pool.query(
      `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`,
    );

    if (res.rowCount === 0) {
      console.log(`${dbName} database not found, creating it.`);
      await pool.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Created database ${dbName}`);
    } else {
      console.log(`${dbName} database exists.`);
    }

    await pool.end();
  } else {
    throw new Error("Cannot connect to postgres");
  }
}

async function createTables(pool: Pool): Promise<void> {
  const sql = readMigrateSql();
  const results = await pool.query(sql);

  console.log("Created tables, query count: %s", (results as any).length);
}

async function migrateAll(useEnvFile: boolean, nodeCount: number) {
  console.log("connecting pg...");

  const dbName = process.env.DB_NAME || DEFAULT_DB_NAME;

  const pgConfigs: PgDatabaseConfig[] = [];
  for (let i = 1; i <= nodeCount; i++) {
    if (useEnvFile) {
      pgConfigs.push(loadEnvs(i));
    } else {
      pgConfigs.push({
        database: i === 1 ? dbName : `${dbName}${i}`,
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: 5432,
        ssl: false,
      });
    }
  }

  for (const pgConfig of pgConfigs) {
    await createDBIfNotExists(
      { ...pgConfig, database: "postgres" },
      pgConfig.database,
    );
  }

  for (const pgConfig of pgConfigs) {
    console.log(
      `Connecting to db (${pgConfig.database}), config: %j`,
      pgConfig,
    );
    const connRet = await createDBConn(pgConfig);
    if (connRet.success === true) {
      const pool = connRet.data;

      console.log(`Dropping tables in db (${pgConfig.database})...`);
      await dropAllTablesIfExist(pool);
      await createTables(pool);
      await pool.end();
    }
  }
}

async function migrateOne(useEnv: boolean, nodeId: number) {
  const dbName = process.env.DB_NAME || DEFAULT_DB_NAME;

  const pgConfig: PgDatabaseConfig = useEnv
    ? loadEnvs(nodeId)
    : {
        database: nodeId === 1 ? dbName : `${dbName}${nodeId}`,
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: 5432,
        ssl: false,
      };

  await createDBIfNotExists(
    { ...pgConfig, database: "postgres" },
    pgConfig.database,
  );

  console.log(`Connecting to db (${pgConfig.database}), config: %j`, pgConfig);
  const connRet = await createDBConn(pgConfig);
  if (connRet.success === true) {
    const pool = connRet.data;

    console.log(`Dropping tables in db (${pgConfig.database})...`);
    await dropAllTablesIfExist(pool);

    await createTables(pool);
  }
}

async function main() {
  const migrateMode = process.env.MIGRATE_MODE || "all"; // "all" or "one"
  const useEnvFile = process.env.USE_ENV_FILE === "true";

  const nodeId = parseInt(process.env.NODE_ID || "1", 10);
  const nodeCount = parseInt(process.env.NODE_COUNT || "2", 10);

  switch (migrateMode) {
    case "all": {
      await migrateAll(useEnvFile, nodeCount);
      break;
    }
    case "one": {
      await migrateOne(useEnvFile, nodeId);
      break;
    }
    default: {
      throw new Error(`Invalid migrate mode: ${migrateMode}`);
    }
  }
}

main().then();
