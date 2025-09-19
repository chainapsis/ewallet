import * as dotenv from "dotenv";
import path from "path";
import { z, type ZodObject } from "zod";
import os from "node:os";
import fs from "node:fs";
import { type Result } from "@keplr-ewallet/stdlib-js";

const CONFIG_DIR_NAME = ".keplr_ewallet";

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
    console.log("Loading env, path: %s", envPath);
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
