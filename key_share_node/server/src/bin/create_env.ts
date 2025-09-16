import path from "path";
import os from "node:os";
import fs from "node:fs";
import chalk from "chalk";

import {
  ENV_FILE_NAME,
  EXAMPLE_ENV_FILE,
  ENV_FILE_NAME_2,
  EXAMPLE_ENV_FILE_2,
} from "@keplr-ewallet-ksn-server/envs";

const CONFIG_DIR_NAME = ".keplr_ewallet";

function copyEnv(envFileName: string, exampleEnvFileName: string) {
  const cwd = process.cwd();
  const forceOverwrite = process.argv.includes("--force");

  console.log("Create an env file, cwd: %s", cwd);
  if (forceOverwrite) {
    console.log("Force overwrite mode enabled");
  }

  createConfigDir();

  const envExamplePath = path.resolve(cwd, exampleEnvFileName);
  const envPath = getEnvPath(envFileName);

  if (fs.existsSync(envPath) && !forceOverwrite) {
    console.log(`Abort creating env. File already exists, path: ${envPath}`);
    console.log(`Use --force flag to overwrite existing file`);
    return;
  }

  if (fs.existsSync(envPath) && forceOverwrite) {
    console.log(`Overwriting existing env file, path: ${envPath}`);
  }

  console.log(
    "Copying env file, srcPath: %s, destPath: %s",
    envExamplePath,
    envPath,
  );

  fs.copyFileSync(envExamplePath, envPath);

  const env = fs.readFileSync(envPath).toString();
  console.log("%s", env);

  console.log("Create env done!, path: %s", envPath);
}

function main() {
  console.log("\nenv file - base (1)");
  copyEnv(ENV_FILE_NAME, EXAMPLE_ENV_FILE);

  console.log("\nenv file - 2");
  copyEnv(ENV_FILE_NAME_2, EXAMPLE_ENV_FILE_2);

  console.log("%s creating env", chalk.green("Done"));
}

main();

/////////////////////////////////////////////////////////////////////////////////
// Utils
/////////////////////////////////////////////////////////////////////////////////

function createConfigDir() {
  const configPath = path.join(os.homedir(), CONFIG_DIR_NAME);

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }

  return configPath;
}

function getEnvPath(envFileName: string) {
  const envPath = path.join(os.homedir(), CONFIG_DIR_NAME, envFileName);
  return envPath;
}
