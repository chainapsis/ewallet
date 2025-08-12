import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";
import { getPkgName } from "src/pkg_name";

export function buildPkgs(..._args: any[]) {
  doBuildPkgs();
}

export function doBuildPkgs() {
  // Order matters!
  const pkgsInOrder = [
    [paths.stdlib],
    [paths.sdk_core],
    [paths.sdk_cosmos],
    [paths.sdk_eth],
    [paths.crypto_bytes],
    [paths.cv_interface],
  ];

  console.log("Building packages, total (%s)", pkgsInOrder.length);

  for (const [path] of pkgsInOrder) {
    console.log("Building %s", path);

    const coreRet = spawnSync("yarn", ["run", "build"], {
      cwd: path,
      stdio: "inherit",
    });

    const name = getPkgName(path);

    expectSuccess(coreRet, `build ${name} failed`);
    console.log("%s %s", chalk.bold.green("Done"), name);
  }

  console.log(
    "%s All (%s) done!",
    chalk.bold.green("Success"),
    pkgsInOrder.length,
  );
}
