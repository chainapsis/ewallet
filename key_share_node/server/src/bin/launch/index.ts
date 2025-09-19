import chalk from "chalk";

import { connectPG } from "@keplr-ewallet-ksn-server/database";
import { makeApp } from "@keplr-ewallet-ksn-server/app";
import { loadEnv, verifyEnv } from "@keplr-ewallet-ksn-server/envs";
import { startPgDumpRuntime } from "@keplr-ewallet-ksn-server/pg_dump/runtime";
import { loadEncSecret } from "./load_enc_secret";
import { checkDBBackup } from "./check_db_backup";
import { parseCLIArgs } from "./cli_args";

const ONE_DAY_MS = 1 * 86400;

async function main() {
  const opts = parseCLIArgs();
  console.log("Launching ks node server, cli args: %j", opts);

  const loadEnvRes = loadEnv(opts.nodeId);
  if (!loadEnvRes.success) {
    console.warn("ENV didn't exist, but we will continue");
  }

  const verifyEnvRes = verifyEnv(process.env);
  if (!verifyEnvRes.success) {
    console.error("ENV variables invalid, err: %s", verifyEnvRes.err);
    process.exit(1);
  }

  const loadEncSecretRes = loadEncSecret(process.env.ENCRYPTION_SECRET_PATH);
  if (!loadEncSecretRes.success) {
    console.error("Encryption secret invalid, err: %s", loadEncSecretRes.err);
    process.exit(1);
  }

  if (opts.nodeId === "1") {
    console.log("Checking DB backup, nodeId: %s", opts.nodeId);

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
      console.error(
        "%s: Health check failed, exiting process, err: %s",
        chalk.bold.red("Error"),
        backupRes.err,
      );

      process.exit(1);
    }
  } else {
    console.log("Bypass DB backup checking, nodeId: %s", opts.nodeId);
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
    console.error(createPostgresRes.err);
    return createPostgresRes;
  }

  const app = makeApp();

  app.locals = {
    db: createPostgresRes.data,
    encryptionSecret: loadEncSecretRes.data,

    is_db_backup_checked: true,
    latest_backup_time: null,
    launch_time: new Date(),
    git_hash: "<to-be-upgraded>",
  };

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
    console.log(
      "%s server, listening on port: %s",
      chalk.bold.green("Start"),
      process.env.PORT,
    );
  });

  return;
}

main().then();
