// import fs from "node:fs";
// import path from "path";
// import { z } from "zod";
// import os from "node:os";
//
// const ENV_FILE_NAME = "ewallet_sdk_core.env";
//
// const envSchema = z.object({
//   GOOGLE_CLIENT_ID: z.string(),
// });
//
// /**
//  * @typedef {Object} EnvVars
//  * @property {string} GOOGLE_CLIENT_ID - Google OAuth Client ID
//  */
// /**
//  * Load env file from the ${HOME}/.keplr_ewallet directory
//  * @returns {EnvVars} Environment variables
//  */
// export function loadEnv() {
//   console.info("=====================[run loadEnv]========================");
//   const envPath = path.join(os.homedir(), ".keplr_ewallet", ENV_FILE_NAME);
//   if (!fs.existsSync(envPath)) {
//     console.log("Env file does not exist, path: %s", envPath);
//     console.info("=====================[end loadEnv]========================");
//     throw new Error(`Env file does not exist, path: ${envPath}`);
//   } else {
//     console.info("Loading env, path: %s", envPath);
//   }
//
//   try {
//     const envContent = fs.readFileSync(envPath, "utf8");
//
//     const envs = {};
//
//     envContent.split("\n").forEach((line) => {
//       const trimmedLine = line.trim();
//
//       if (!trimmedLine || trimmedLine.startsWith("#")) {
//         return;
//       }
//
//       const [key, ...valueParts] = trimmedLine.split("=");
//       if (key && valueParts.length > 0) {
//         const value = valueParts
//           .join("=")
//           .trim()
//           .replace(/^["']|["']$/g, "");
//         envs[key.trim()] = value;
//       }
//     });
//
//     const res = envSchema.safeParse(envs);
//     console.log("Loaded env content:\n%s", res.data);
//
//     if (res.success) {
//       console.info(
//         "=====================[end loadEnv]========================",
//       );
//       return envs;
//     } else {
//       console.error(
//         "Failed to load env file, err: %s",
//         z.prettifyError(res.error),
//       );
//       console.info(
//         "=====================[end loadEnv]========================",
//       );
//       throw new Error(
//         `Failed to load env file, err: ${z.prettifyError(res.error)}`,
//       );
//     }
//   } catch (error) {
//     console.error("Failed to load env file:", error);
//     console.info("=====================[end loadEnv]========================");
//     throw new Error(`Failed to load env file, err: ${error}`);
//   }
// }
