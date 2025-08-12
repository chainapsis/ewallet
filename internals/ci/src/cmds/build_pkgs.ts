import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { expectSuccess } from "../expect";

export function buildPkgs(..._args: any[]) {
  doBuildPkgs();
}

export function doBuildPkgs() {
  console.log("Start building packages");

  // Order matters!
  const pkgsInOrder = [
    [paths.stdlib, "stdlib-js"],
    [paths.sdk_core, "sdk core"],
    [paths.sdk_cosmos, "sdk cosmos"],
    [paths.sdk_eth, "sdk eth"],
    [paths.crypto_bytes, "crypto/bytes"],
    [paths.cv_interface, "cv interface"],
  ];

  for (const [path, name] of pkgsInOrder) {
    console.log("Building %s, path: %s", name, path);

    const coreRet = spawnSync("yarn", ["run", "build"], {
      cwd: path,
      stdio: "inherit",
    });

    expectSuccess(coreRet, `build ${name} failed`);
    console.log("%s %s", chalk.bold.green("Done"), name);
  }

  console.log(
    "%s All (%s) done!",
    chalk.bold.green("Success"),
    pkgsInOrder.length,
  );
}
