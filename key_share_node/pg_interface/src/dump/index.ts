import { exec, spawnSync } from "node:child_process";
import chalk from "chalk";
import { promisify } from "node:util";
import fs from "node:fs";
import { join } from "node:path";
import type { Result } from "@keplr-ewallet/stdlib-js";
import { replaceTildeWithHome } from "@keplr-ewallet/stdlib-js/path";

const execAsync = promisify(exec);

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

    console.log("%s", chalk.bold.green("Dumping"));

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpFile = `${pgConfig.database}_${timestamp}.dump`;
    const dumpPath = join(dumpDir, dumpFile);

    console.log("%s dump, path: %s", chalk.bold.green("Finished"), dumpPath);

    //     const command = `pg_dump -h ${pgConfig.host} -p ${pgConfig.port} -U \
    // ${pgConfig.user} -d ${pgConfig.database} -Fc -f ${dumpPath}`;

    const { stdout, stderr } = spawnSync(
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
    const command = `pg_restore -h ${pgConfig.host} -p ${pgConfig.port} -U \
${pgConfig.user} -d ${pgConfig.database} --clean --if-exists --verbose \
${dumpPath}`;

    const { stdout, stderr } = await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: pgConfig.password,
      },
    });

    if (stdout) {
      console.log("pg_restore stdout:", stdout);
    }
    if (stderr) {
      console.log("pg_restore stderr:", stderr);
    }

    return { success: true, data: void 0 };
  } catch (error) {
    return { success: false, err: String(error) };
  }
}
