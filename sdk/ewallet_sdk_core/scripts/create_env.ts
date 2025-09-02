// import path from "path";
// import os from "node:os";
// import fs from "node:fs";
//
// const ENV_FILE_NAME = "ewallet_sdk_core.env";
// const EXAMPLE_ENV_FILE = "ewallet_sdk_core.env.example";
//
// const CONFIG_DIR_NAME = ".keplr_ewallet";
//
// function copyEnv(envFileName: string, exampleEnvFileName: string) {
//   const cwd = process.cwd();
//   const forceOverwrite = process.argv.includes("--force");
//   console.info("=====================[run create_env]========================");
//   console.info("Create an env file, cwd: %s", cwd);
//   if (forceOverwrite) {
//     console.info("Force overwrite mode enabled");
//   }
//
//   createConfigDir();
//
//   const envExamplePath = path.resolve(cwd, exampleEnvFileName);
//   const envPath = getEnvPath(envFileName);
//
//   if (fs.existsSync(envPath) && !forceOverwrite) {
//     console.info(`Abort creating env. File already exists, path: ${envPath}`);
//     console.info(`Use --force flag to overwrite existing file`);
//     return;
//   }
//
//   if (fs.existsSync(envPath) && forceOverwrite) {
//     console.info(`Overwriting existing env file, path: ${envPath}`);
//   }
//
//   console.info(
//     "Copying env file, srcPath: %s, destPath: %s",
//     envExamplePath,
//     envPath,
//   );
//
//   fs.copyFileSync(envExamplePath, envPath);
//
//   const env = fs.readFileSync(envPath).toString();
//   console.log("%s", env);
//
//   console.info("Create env done!, path: %s", envPath);
// }
//
// function main() {
//   copyEnv(ENV_FILE_NAME, EXAMPLE_ENV_FILE);
//   console.info("=====================[end create_env]========================");
// }
//
// main();
//
// /////////////////////////////////////////////////////////////////////////////////
// // Utils
// /////////////////////////////////////////////////////////////////////////////////
//
// function createConfigDir() {
//   const configPath = path.join(os.homedir(), CONFIG_DIR_NAME);
//
//   if (!fs.existsSync(configPath)) {
//     fs.mkdirSync(configPath);
//   }
//
//   return configPath;
// }
//
// function getEnvPath(envFileName: string) {
//   const envPath = path.join(os.homedir(), CONFIG_DIR_NAME, envFileName);
//   return envPath;
// }
