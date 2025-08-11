import * as dotenv from "dotenv";
import path from "path";
import { z } from "zod";
import os from "node:os";
import fs from "node:fs";
import type { Result } from "@keplr-ewallet/stdlib-js";

const ENV_FILE_NAME = "ewallet_attached.env";
export const CONFIG_DIR_NAME = ".keplr_ewallet";

export interface EnvType {
  SERVER_PORT: string;
  VITE_EWALLET_API_ENDPOINT: string;
  VITE_CREDENTIAL_VAULT_API_ENDPOINT: string;
  VITE_CREDENTIAL_VAULT_API_ENDPOINT_2: string;
  VITE_DEMO_WEB_ORIGIN: string;
}

export function getEnvPath() {
  const envPath = path.join(os.homedir(), CONFIG_DIR_NAME, ENV_FILE_NAME);
  return envPath;
}

export function loadEnv(): Result<void, string> {
  const envPath = getEnvPath();

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

export function verifyEnv(): Result<void, string> {
  const envSchema = z.object({
    SERVER_PORT: z.string(),
    VITE_EWALLET_API_ENDPOINT: z.string(),
    VITE_CREDENTIAL_VAULT_API_ENDPOINT: z.string(),
    VITE_CREDENTIAL_VAULT_API_ENDPOINT_2: z.string(),
    VITE_DEMO_WEB_ORIGIN: z.string(),
  });

  const res = envSchema.safeParse(process.env);

  if (res.success) {
    return { success: true, data: void 0 };
  } else {
    return { success: false, err: z.prettifyError(res.error) };
  }
}

export function verifyPublicEnv(): Result<void, string> {
  const envSchema = z.object({
    VITE_EWALLET_API_ENDPOINT: z.string(),
    VITE_CREDENTIAL_VAULT_API_ENDPOINT: z.string(),
    VITE_CREDENTIAL_VAULT_API_ENDPOINT_2: z.string(),
    VITE_DEMO_WEB_ORIGIN: z.string(),
  });

  const res = envSchema.safeParse(import.meta.env);

  if (res.success) {
    return { success: true, data: void 0 };
  } else {
    return { success: false, err: z.prettifyError(res.error) };
  }
}
