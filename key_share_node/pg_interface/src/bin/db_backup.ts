import { loadEnvs } from "@oko-wallet-ksn-pg-interface/bin/db_aux/envs";
import { dump } from "@oko-wallet-ksn-pg-interface/dump";

const NODE_ID = parseInt(process.env.NODE_ID || "1", 10);
const DUMP_DIR = process.env.DUMP_DIR;

async function main() {
  console.log(
    "Starting db backup... NODE_ID: %s, DUMP_DIR: %s",
    NODE_ID,
    DUMP_DIR,
  );

  if (!DUMP_DIR) {
    throw new Error("DUMP_DIR is not set");
  }

  const env = loadEnvs(NODE_ID);

  const pgConfig = {
    host: env.host,
    port: Number(env.port),
    database: env.database,
    password: env.password,
    user: env.user,
  };

  const dumpResult = await dump(pgConfig, DUMP_DIR);
  if (dumpResult.success === false) {
    throw new Error(`Failed to dump database: ${dumpResult.err}`);
  }

  console.log(
    "DB backup completed successfully, dump path: %s, dump size: %s",
    dumpResult.data.dumpPath,
    dumpResult.data.dumpSize,
  );
}

main().then();
