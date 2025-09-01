import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "path";
import { z, ZodObject } from "zod";
import os from "node:os";
import type { Result } from "@keplr-ewallet/stdlib-js";
// import { getEnvPath } from "./bin/create_env";

const ENV_FILE_NAME_STEM = "credential_vault";

export const ENV_FILE_NAME = "credential_vault.env";
export const EXAMPLE_ENV_FILE = "credential_vault.env.example";

export const ENV_FILE_NAME_2 = "credential_vault_2.env";
export const EXAMPLE_ENV_FILE_2 = "credential_vault_2.env.example";

export interface EnvType {
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SSL: boolean;
  ENCRYPTION_SECRET: string;
  ADMIN_PASSWORD: string;
}

const envSchema = z.object({
  PORT: z.number().min(1),
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z.number().min(1),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_SSL: z.boolean(),
  ENCRYPTION_SECRET: z.string().min(1, "ENCRYPTION_SECRET is required"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
});

// export function loadEnv(envFileName: string): Result<void, string> {
//   const envPath = getEnvPath(envFileName);
//
//   if (!fs.existsSync(envPath)) {
//     console.log("Env file does not exist, path: %s", envPath);
//
//     return { success: false, err: `Env file does not exist, path: ${envPath}` };
//   } else {
//     console.info("Loading env, path: %s", envPath);
//   }
//
//   dotenv.config({
//     path: envPath,
//     override: false,
//     quiet: true,
//   });
//
//   return { success: true, data: void 0 };
// }

export function loadEnvs(committeeId: string): Result<void, string> {
  const committeeIdSuffix =
    committeeId === "1" ? "" : `_${process.env.COMMITTEE_ID}`;

  const envFileName = `${ENV_FILE_NAME_STEM}${committeeIdSuffix}.env`;

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

  // const rawEnv: EnvType = {
  //   PORT: parseInt(process.env.PORT || "4201", 10),
  //   DB_HOST: process.env.DB_HOST || "localhost",
  //   DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  //   DB_USER: process.env.DB_USER || "postgres",
  //   DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  //   DB_NAME: process.env.DB_NAME || "credential_vault_dev",
  //   DB_SSL: (process.env.DB_SSL || "false") === "true",
  //   ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET || "temp_enc_secret",
  //   ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin_password",
  // };
  //
  // const envs = envSchema.parse(rawEnv);
  // console.log("Loaded envs: %j", envs);
}

export function verifyEnv(
  // schema: ZodObject,
  envs: Record<string, any>,
): Result<void, string> {
  const res = envSchema.safeParse(envs);

  if (res.success) {
    return { success: true, data: void 0 };
  } else {
    return { success: false, err: z.prettifyError(res.error) };
  }
}
