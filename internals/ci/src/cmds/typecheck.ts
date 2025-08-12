import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { getPkgName } from "src/pkg_name";

export async function typeCheck(..._args: any[]) {
  const pkgPaths = [
    paths.sdk_core,
    paths.sdk_cosmos,
    paths.sdk_eth,
    paths.cv_server,
    paths.sandbox_simple_host,
  ];

  console.log("Type checking, total (%s)", pkgPaths.length);

  for (const pkg of pkgPaths) {
    console.log("Checking %s", pkg);

    const ret = spawnSync("yarn", ["run", "tsc", "--noEmit"], {
      cwd: pkg,
      stdio: "inherit",
    });

    const name = getPkgName(pkg);

    if (ret.status === 0) {
      console.log("%s %s", chalk.bold.green("Ok"), name);
    } else {
      console.error("Error type checking, pkg: %s", name);

      process.exit(ret.status);
    }
  }

  console.log("%s", chalk.bold.green("Success"), `All ${pkgPaths.length} ok!`);
}
