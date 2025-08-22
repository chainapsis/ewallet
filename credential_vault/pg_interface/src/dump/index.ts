import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import { join } from "node:path";
import type { Result } from "@keplr-ewallet/stdlib-js";

const execAsync = promisify(exec);

export interface PgDumpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export async function dump(
  pgConfig: PgDumpConfig,
  dumpDir: string,
): Promise<Result<{ dumpPath: string; dumpSize: number }, string>> {
  try {
    await fs.mkdir(dumpDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpFile = `${pgConfig.database}_${timestamp}.dump`;
    const dumpPath = join(dumpDir, dumpFile);
    const command = `pg_dump -h ${pgConfig.host} -p ${pgConfig.port} -U ${pgConfig.user} -d ${pgConfig.database} -Fc -f ${dumpPath}`;

    await execAsync(command, {
      env: {
        ...process.env,
        PGPASSWORD: pgConfig.password,
      },
    });

    const stats = await fs.stat(dumpPath);
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
  const command = `pg_restore -h ${pgConfig.host} -p ${pgConfig.port} -U ${pgConfig.user} -d ${pgConfig.database} --clean --if-exists --verbose ${dumpPath}`;

  const { stdout, stderr } = await execAsync(command, {
    env: {
      ...process.env,
      PGPASSWORD: pgConfig.password,
    },
  });

  if (stderr.length > 0) {
    return { success: false, err: stderr };
  }

  if (stdout.length > 0) {
    return { success: true, data: void 0 };
  }

  return { success: false, err: "Unknown error" };
}
