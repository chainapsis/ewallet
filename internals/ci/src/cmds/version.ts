import { spawnSync } from "node:child_process";
import chalk from "chalk";

import { paths } from "../paths";
import { doBuildPkgs } from "./build_pkgs";
import { expectSuccess } from "../expect";

export async function version(..._args: any[]) {
  console.log("Start versioning packages...");

  console.log("We will re-build the packages here just to make sure");
  doBuildPkgs();

  console.log("Testing type definition in sandbox simple host");
  const testSandboxRet = spawnSync("yarn", ["tsc"], {
    cwd: paths.sandbox_simple_host,
    stdio: "inherit",
  });
  expectSuccess(testSandboxRet, "publish failed");
  console.log("%s %s", chalk.green.bold("Ok"), "sandbox_simple_host");

  console.log("Fetching the Git repository at 'origin' to sync with the local");
  const fetchRet = spawnSync("git", ["fetch", "origin"], {
    cwd: paths.root,
    stdio: "inherit",
  });
  expectSuccess(fetchRet, "publish failed");

  spawnSync("yarn", ["lerna", "version", "--no-private"], {
    cwd: paths.root,
    stdio: "inherit",
  });
}
