import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "path";
import { z } from "zod";
import os from "node:os";
import type { Result } from "@keplr-ewallet/stdlib-js";

const ENV_FILE_NAME_STEM = "key_share_node";

export const ENV_FILE_NAME = "key_share_node.env";
export const EXAMPLE_ENV_FILE = "key_share_node.env.example";

export const ENV_FILE_NAME_2 = "key_share_node_2.env";
export const EXAMPLE_ENV_FILE_2 = "key_share_node_2.env.example";

const envSchema = z.object({
  PORT: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string(),
  ENCRYPTION_SECRET: z.string(),
  ADMIN_PASSWORD: z.string(),
  DUMP_DIR: z.string(),
});

export function loadEnv(nodeId: string): Result<void, string> {
  const nodeIdSuffix = nodeId === "1" ? "" : `_${nodeId}`;

  const envFileName = `${ENV_FILE_NAME_STEM}${nodeIdSuffix}.env`;

  const envPath = path.join(os.homedir(), ".keplr_ewallet", envFileName);

  if (!fs.existsSync(envPath)) {
    console.log("Env file does not exist, path: %s", envPath);

    return { success: false, err: `Env file does not exist, path: ${envPath}` };
  } else {
    console.info("Loading env, path: %s", envPath);
  }

  dotenv.config({
    path: envPath,
    override: false,
  });

  return { success: true, data: void 0 };
}

export function verifyEnv(envs: Record<string, any>): Result<void, string> {
  const res = envSchema.safeParse(envs);

  if (res.success) {
    return { success: true, data: void 0 };
  } else {
    return { success: false, err: z.prettifyError(res.error) };
  }
}
