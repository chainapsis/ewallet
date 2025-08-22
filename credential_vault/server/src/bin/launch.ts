import { createPgDatabase } from "@keplr-ewallet-cv-server/database";
import { makeApp } from "@keplr-ewallet-cv-server/app";
import { loadEnvs } from "@keplr-ewallet-cv-server/envs";
import { startPgDumpRuntime } from "@keplr-ewallet-cv-server/pg_dump/runtime";

async function main() {
  const env = loadEnvs();

  const createPostgresRes = await createPgDatabase({
    database: env.DB_NAME,
    host: env.DB_HOST,
    password: env.DB_PASSWORD,
    user: env.DB_USER,
    port: env.DB_PORT,
    ssl: env.DB_SSL,
  });

  if (createPostgresRes.success === false) {
    console.error(createPostgresRes.err);
    return createPostgresRes;
  }

  const app = makeApp();

  app.locals = {
    db: createPostgresRes.data,
    env,
  };

  startPgDumpRuntime(
    app.locals.db,
    {
      database: env.DB_NAME,
      host: env.DB_HOST,
      password: env.DB_PASSWORD,
      user: env.DB_USER,
      port: env.DB_PORT,
    },
    {
      intervalDays: 1,
      retentionDays: 7,
    },
  );

  app.listen(env.PORT, () => {
    console.log(`Server listening on port: %s`, env.PORT);
  });

  return;
}

main().then();
