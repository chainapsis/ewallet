import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";

export async function typeCheck(..._args: any[]) {
  const pkgPaths = [
    paths.sdk_core,
    paths.sdk_cosmos,
    paths.sdk_eth,
    paths.sandbox_simple_host,
  ];

  console.info("Type checking, pkgPaths: %j", pkgPaths);

  for (const pkg of pkgPaths) {
    console.info("Checking %s", pkg);

    const ret = spawnSync("yarn", ["run", "tsc", "--noEmit"], {
      cwd: pkg,
      stdio: "inherit",
    });

    if (ret.status === 0) {
      console.info("%s %s", chalk.bold.green("Ok"), pkg);
    } else {
      console.error("Error type checking, pkg: %s", pkg);

      process.exit(ret.status);
    }
  }

  console.info(`All ${pkgPaths.length} ok!`);
}
