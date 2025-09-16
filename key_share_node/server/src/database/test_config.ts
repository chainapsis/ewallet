import type { PgDatabaseConfig } from ".";

export const testPgConfig: PgDatabaseConfig = {
  database: "key_share_node_dev",
  host: "localhost",
  password: "postgres",
  user: "postgres",
  port: 5432,
  ssl: false,
};

export const createTestPgConfig = (nodeId: number): PgDatabaseConfig => {
  return {
    database: `key_share_node_dev${nodeId}`,
    host: "localhost",
    password: "postgres",
    user: "postgres",
    port: 5432,
    ssl: false,
  };
};
