import { spawnSync } from "node:child_process";
import chalk from "chalk";
import fs from "node:fs";
import { join } from "node:path";
import type { Result } from "@keplr-ewallet/stdlib-js";
import { replaceTildeWithHome } from "@keplr-ewallet/stdlib-js/path";

export interface PgDumpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface PgDumpResult {
  dumpPath: string;
  dumpSize: number;
}

export async function dump(
  pgConfig: PgDumpConfig,
  _dumpDir: string,
): Promise<Result<PgDumpResult, string>> {
  try {
    const dumpDir = replaceTildeWithHome(_dumpDir);

    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });

      console.log(
        "%s dump dir, path: %s",
        chalk.bold.green("Created"),
        dumpDir,
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpFile = `${pgConfig.database}_${timestamp}.dump`;
    const dumpPath = join(dumpDir, dumpFile);

    spawnSync(
      "pg_dump",
      [
        "-h",
        pgConfig.host,
        "-p",
        String(pgConfig.port),
        "-U",
        pgConfig.user,
        "-d",
        pgConfig.database,
        "-Fc",
        "-f",
        dumpPath,
      ],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      },
    );

    const stats = fs.statSync(dumpPath);
    const dumpSize = stats.size;

    console.log(
      "%s dump, path: %s, dumpSize: %s",
      chalk.bold.green("Finished"),
      dumpPath,
      dumpSize,
    );

    return { success: true, data: { dumpPath, dumpSize } };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}

export async function restore(
  pgConfig: PgDumpConfig,
  dumpPath: string,
): Promise<Result<void, string>> {
  try {
    const result = spawnSync(
      "pg_restore",
      [
        "-h",
        pgConfig.host,
        "-p",
        String(pgConfig.port),
        "-U",
        pgConfig.user,
        "-d",
        pgConfig.database,
        "--clean",
        "--if-exists",
        "--verbose",
        dumpPath,
      ],
      {
        stdio: "inherit",
        env: {
          ...process.env,
          PGPASSWORD: pgConfig.password,
        },
      },
    );

    if (result.error) {
      return { success: false, err: String(result.error) };
    }

    if (result.status !== 0) {
      const errorMsg = result.stderr
        ? result.stderr.toString()
        : `pg_restore failed with exit code ${result.status}`;
      return { success: false, err: errorMsg };
    }

    console.log("%s pg_restore completed", chalk.bold.green("Finished"));

    return { success: true, data: void 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
