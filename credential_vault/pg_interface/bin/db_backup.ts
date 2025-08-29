import { join } from "path";
import os from "node:os";

import { loadEnvs } from "./migrate/envs";
import { dump } from "@keplr-ewallet-credential-vault-pg-interface/dump";

const DUMP_DIR = join(os.homedir(), "keplr_ewallet_data");

async function main() {
  console.log("dump!");
  return;

  // TODO: @chihun
  // const env = loadEnvs();

  // const createPostgresRes = await createPgDatabase({
  //   database: env.DB_NAME,
  //   host: env.DB_HOST,
  //   password: env.DB_PASSWORD,
  //   user: env.DB_USER,
  //   port: env.DB_PORT,
  //   ssl: env.DB_SSL,
  // });
  //
  // if (createPostgresRes.success === false) {
  //   console.error(createPostgresRes.err);
  //   return createPostgresRes;
  // }

  // const db = createPostgresRes.data;

  const pgConfig = {
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    password: process.env.DB_PASSWORD!,
    user: process.env.DB_USER!,
    port: Number(process.env.DB_PORT!),
  };

  const dumpResult = await dump(pgConfig, DUMP_DIR);
  console.log(1, dumpResult);

  return;
}

main().then();
