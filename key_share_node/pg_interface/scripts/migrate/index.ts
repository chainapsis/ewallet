import { Pool } from "pg";
import { dropAllTablesIfExist } from "@keplr-ewallet-ksn-pg-interface/postgres";

import { createDBConn, readMigrateSql, type PgDatabaseConfig } from "./utils";
import { loadEnvs } from "./envs";

const DEFAULT_DB_NAME = process.env.DB_NAME || "key_share_node_dev";

const USE_ENV = process.env.USE_ENV === "true";
const MIGRATE_MODE = process.env.MIGRATE_MODE || "all"; // "all" or "one"
const NODE_ID = parseInt(process.env.NODE_ID || "1", 10);
const NODE_COUNT = parseInt(process.env.NODE_COUNT || "2", 10);

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

async function migrateAll(useEnv: boolean) {
  console.log("connecting pg...");

  const pgConfigs: PgDatabaseConfig[] = [];
  for (let i = 1; i <= NODE_COUNT; i++) {
    if (useEnv) {
      pgConfigs.push(loadEnvs(i));
    } else {
      pgConfigs.push({
        database: i === 1 ? DEFAULT_DB_NAME : `${DEFAULT_DB_NAME}${i}`,
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

async function migrateOne(useEnv: boolean) {
  const pgConfig: PgDatabaseConfig = useEnv
    ? loadEnvs(NODE_ID)
    : {
        database:
          NODE_ID === 1 ? DEFAULT_DB_NAME : `${DEFAULT_DB_NAME}${NODE_ID}`,
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

async function migrate() {
  if (MIGRATE_MODE === "all") {
    await migrateAll(USE_ENV);
  } else if (MIGRATE_MODE === "one") {
    await migrateOne(USE_ENV);
  } else {
    throw new Error(`Invalid migrate mode: ${MIGRATE_MODE}`);
  }
}

migrate().then();
