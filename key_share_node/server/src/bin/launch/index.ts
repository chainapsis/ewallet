import chalk from "chalk";
import dayjs from "dayjs";

import { connectPG } from "@keplr-ewallet-ksn-server/database";
import { makeApp } from "@keplr-ewallet-ksn-server/app";
import { loadEnv, verifyEnv } from "@keplr-ewallet-ksn-server/envs";
import { startPgDumpRuntime } from "@keplr-ewallet-ksn-server/pg_dump/runtime";
import { loadEncSecret } from "./load_enc_secret";
import { checkDBBackup } from "./check_db_backup";
import { parseCLIArgs } from "./cli_args";
import type { ServerState } from "@keplr-ewallet-ksn-server/state";
import { getGitCommitHash } from "./git";
import pJson from "@keplr-ewallet-ksn-server/../package.json";
import { logger } from "@keplr-ewallet-ksn-server/logger";

const ONE_DAY_MS = 1 * 86400;

async function main() {
  const opts = parseCLIArgs();
  console.log("Launching ks node server, cli args: %j", opts);
  logger.info("Launching, Logger initialized");

  loadEnv(opts.nodeId);

  const verifyEnvRes = verifyEnv(process.env);
  if (!verifyEnvRes.success) {
    logger.error("ENV variables invalid, err: %s", verifyEnvRes.err);

    process.exit(1);
  }

  const loadEncSecretRes = loadEncSecret(process.env.ENCRYPTION_SECRET_PATH);
  if (!loadEncSecretRes.success) {
    logger.error("Encryption secret invalid, err: %s", loadEncSecretRes.err);

    process.exit(1);
  }

  if (opts.resetDb) {
    logger.info("DB reset flag detected, running migration...");
    // @TODO

    logger.info("DB reset completed");
  }

  if (opts.nodeId === "1") {
    logger.debug("Checking DB backup, nodeId: %s", opts.nodeId);

    const backupRes = await checkDBBackup(
      {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        user: process.env.DB_USER,
        port: Number(process.env.DB_PORT),
        ssl: process.env.DB_SSL === "true" ? true : false,
      },
      process.env.DUMP_DIR,
    );
    if (!backupRes.success) {
      logger.error(
        "%s: Health check failed, exiting process, err: %s",
        chalk.bold.red("Error"),
        backupRes.err,
      );

      process.exit(1);
    } else {
      logger.info("Finished DB backup check");
    }
  } else {
    logger.info("Bypass DB backup checking, nodeId: %s", opts.nodeId);
  }

  const createPostgresRes = await connectPG({
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL === "true" ? true : false,
  });

  if (createPostgresRes.success === false) {
    logger.error(createPostgresRes.err);

    return createPostgresRes;
  }

  const app = makeApp();

  const git_hash = getGitCommitHash();
  const version = pJson.version;

  const now = dayjs();
  const launch_time = now.toISOString();

  const state: ServerState = {
    db: createPostgresRes.data,
    encryptionSecret: loadEncSecretRes.data,

    is_db_backup_checked: true,
    launch_time,
    git_hash,
    version,
  };

  app.locals = state;

  startPgDumpRuntime(
    app.locals.db,
    {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
    },
    {
      sleepTimeSeconds: ONE_DAY_MS,
      retentionDays: 7,
      dumpDir: process.env.DUMP_DIR,
    },
  );

  app.listen(process.env.PORT, () => {
    logger.info("Start server, listening on port: %s", process.env.PORT);
  });

  return;
}

main().then();
