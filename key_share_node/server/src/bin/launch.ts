import { program } from "commander";

import { createPgDatabase } from "@keplr-ewallet-ksn-server/database";
import { makeApp } from "@keplr-ewallet-ksn-server/app";
import { loadEnv, verifyEnv } from "@keplr-ewallet-ksn-server/envs";
import { startPgDumpRuntime } from "@keplr-ewallet-ksn-server/pg_dump/runtime";
import { loadEncSecret } from "@keplr-ewallet-ksn-server/bin/load_enc_secret";

const ONE_DAY_MS = 1 * 86400;

function parseCLIArgs() {
  const command = program.version("0.0.1").description("Key share node server");

  command.requiredOption("--node-id <id>");

  command.parse(process.argv);

  const opts = program.opts();

  return opts;
}

async function main() {
  const opts = parseCLIArgs();
  console.log("CLI opts: %j", opts);

  const loadEnvRes = loadEnv(opts.nodeId);
  if (!loadEnvRes.success) {
    console.warn("ENV didn't exist, but we will continue");
  }

  const verifyEnvRes = verifyEnv(process.env);
  if (!verifyEnvRes.success) {
    console.error("ENV variables invalid, err: %s", verifyEnvRes.err);
    process.exit(1);
  }

  const env = verifyEnvRes.data;

  console.log("ENV: %j", env);

  const loadEncSecretRes = loadEncSecret(env.ENCRYPTION_SECRET_PATH);
  if (!loadEncSecretRes.success) {
    console.error("Encryption secret invalid, err: %s", loadEncSecretRes.err);
    process.exit(1);
  }

  const createPostgresRes = await createPgDatabase({
    database: env.DB_NAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    port: Number(env.DB_PORT),
    ssl: env.DB_SSL === "true" ? true : false,
  });

  if (createPostgresRes.success === false) {
    console.error(createPostgresRes.err);
    return createPostgresRes;
  }

  const app = makeApp();

  app.locals = {
    db: createPostgresRes.data,
    env,
    encryptionSecret: loadEncSecretRes.data,
  };

  startPgDumpRuntime(
    app.locals.db,
    {
      database: env.DB_NAME,
      host: env.DB_HOST,
      password: env.DB_PASSWORD,
      user: env.DB_USER,
      port: Number(env.DB_PORT),
    },
    {
      sleepTimeSeconds: ONE_DAY_MS, // 1 day
      retentionDays: 7,
      dumpDir: env.DUMP_DIR,
    },
  );

  app.listen(env.PORT, () => {
    console.log(`Server listening on port: %s`, env.PORT);
  });

  return;
}

main().then();
