import { spawnSync } from "node:child_process";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export async function dbMigrate(options: { useEnv: boolean }) {
  console.log(
    "db_migrate, useEnv: %j, cv pg interface path: %s",
    options.useEnv,
    paths.credential_vault_pg_interface,
  );

  const env = {
    ...process.env,
    USE_ENV: options.useEnv ? "true" : "false",
  };

  const dbMigrateRet = spawnSync("yarn", ["run", "migrate"], {
    cwd: paths.credential_vault_pg_interface,
    stdio: "inherit",
    env,
  });

  expectSuccess(dbMigrateRet, "db migrate failed");
}
