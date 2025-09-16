import { join } from "node:path";
import os from "node:os";

import { loadEnvs } from "./migrate/envs";
import { dump } from "@keplr-ewallet-ksn-pg-interface/dump";

const DUMP_DIR = join(os.homedir(), "keplr_ewallet_data");

const NODE_ID = parseInt(process.env.NODE_ID || "1", 10);

async function main() {
  console.log("Starting db backup... NODE_ID: %s", NODE_ID);

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
