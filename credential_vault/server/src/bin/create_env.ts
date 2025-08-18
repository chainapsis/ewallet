import * as dotenv from "dotenv";
import path from "path";
import { z, ZodObject } from "zod";
import os from "node:os";
import fs from "node:fs";
import { type Result } from "@keplr-ewallet/stdlib-js";

import {
  ENV_FILE_NAME,
  EXAMPLE_ENV_FILE,
  ENV_FILE_NAME_2,
  EXAMPLE_ENV_FILE_2,
} from "@keplr-ewallet-cv-server/envs";

const CONFIG_DIR_NAME = ".keplr_ewallet";

function copyEnv(envFileName: string, exampleEnvFileName: string) {
  const cwd = process.cwd();
  const forceOverwrite = process.argv.includes("--force");

  console.info("Create an env file, cwd: %s", cwd);
  if (forceOverwrite) {
    console.info("Force overwrite mode enabled");
  }

  createConfigDir();

  const envExamplePath = path.resolve(cwd, exampleEnvFileName);
  const envPath = getEnvPath(envFileName);

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

function main() {
  copyEnv(ENV_FILE_NAME, EXAMPLE_ENV_FILE);
  copyEnv(ENV_FILE_NAME_2, EXAMPLE_ENV_FILE_2);
}

main();

/////////////////////////////////////////////////////////////////////////////////
// Utils
/////////////////////////////////////////////////////////////////////////////////

export function createConfigDir() {
  const configPath = path.join(os.homedir(), CONFIG_DIR_NAME);

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath);
  }

  return configPath;
}

export function getEnvPath(envFileName: string) {
  const envPath = path.join(os.homedir(), CONFIG_DIR_NAME, envFileName);
  return envPath;
}

export function loadEnv(envFileName: string): Result<void, string> {
  const envPath = getEnvPath(envFileName);

  if (!fs.existsSync(envPath)) {
    console.log("Env file does not exist, path: %s", envPath);

    return { success: false, err: `Env file does not exist, path: ${envPath}` };
  } else {
    console.info("Loading env, path: %s", envPath);
  }

  dotenv.config({
    path: envPath,
    override: false,
    quiet: true,
  });

  return { success: true, data: void 0 };
}

export function verifyEnv(
  schema: ZodObject,
  envs: Record<string, any>,
): Result<void, string> {
  const res = schema.safeParse(envs);

  if (res.success) {
    return { success: true, data: void 0 };
  } else {
    return { success: false, err: z.prettifyError(res.error) };
  }
}
