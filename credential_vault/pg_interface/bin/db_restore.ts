import { loadEnvs } from "./migrate/envs";
import { restore } from "@keplr-ewallet-credential-vault-pg-interface/dump";

const COMMITTEE_ID = parseInt(process.env.COMMITTEE_ID || "1", 10);
const DUMP_PATH = process.env.DUMP_PATH;

async function main() {
  console.log("Starting db restore... DUMP_PATH: %s", DUMP_PATH);

  if (!DUMP_PATH) {
    throw new Error("DUMP_PATH is not set");
  }

  const env = loadEnvs(COMMITTEE_ID);

  const pgConfig = {
    host: env.host,
    port: Number(env.port),
    database: env.database,
    password: env.password,
    user: env.user,
  };

  const restoreResult = await restore(pgConfig, DUMP_PATH);
  if (restoreResult.success === false) {
    throw new Error(`Failed to restore database: ${restoreResult.err}`);
  }

  console.log("DB restore completed successfully");
}

main().then();
