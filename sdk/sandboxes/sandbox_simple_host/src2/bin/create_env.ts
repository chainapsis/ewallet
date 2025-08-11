import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import { CONFIG_DIR_NAME, getEnvPath } from "@keplr-ewallet-attached/envs";

const EXAMPLE_ENV_FILE = "ewallet_attached.env.example";

function createConfigDir() {
  const configPath = path.join(os.homedir(), CONFIG_DIR_NAME);

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }

  return configPath;
}

function main() {
  const cwd = process.cwd();
  const forceOverwrite = process.argv.includes("--force");

  console.info("Create an env file, cwd: %s", cwd);
  if (forceOverwrite) {
    console.info("Force overwrite mode enabled");
  }

  createConfigDir();

  const envExamplePath = path.resolve(cwd, EXAMPLE_ENV_FILE);
  const envPath = getEnvPath();

  if (fs.existsSync(envPath) && !forceOverwrite) {
    console.info(`Abort creating env. File already exists, path: ${envPath}`);
    console.info(`Use --force flag to overwrite existing file`);
    return;
  }

  if (fs.existsSync(envPath) && forceOverwrite) {
    console.info(`Overwriting existing env file, path: ${envPath}`);
  }

  console.info(
    "Copying env file, srcPath: %s, destPath: %s",
    envExamplePath,
    envPath,
  );

  fs.copyFileSync(envExamplePath, envPath);

  const env = fs.readFileSync(envPath).toString();
  console.log("%s", env);

  console.info("Create env done!, path: %s", envPath);
}

main();
