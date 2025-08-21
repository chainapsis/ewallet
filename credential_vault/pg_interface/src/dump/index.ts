import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Result } from "@keplr-ewallet/stdlib-js";

const execAsync = promisify(exec);

export interface DumpOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export async function dump(
  options: DumpOptions,
  outputPath: string,
): Promise<Result<void, string>> {
  const command = `pg_dump -h ${options.host} -p ${options.port} -U ${options.user} -d ${options.database} -Fc -f ${outputPath}`;

  const { stdout, stderr } = await execAsync(command, {
    env: {
      PGPASSWORD: options.password,
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

export async function restore(
  options: DumpOptions,
  inputPath: string,
): Promise<Result<void, string>> {
  const command = `pg_restore -h ${options.host} -p ${options.port} -U ${options.user} -d ${options.database} --clean --if-exists --verbose ${inputPath}`;

  const { stdout, stderr } = await execAsync(command, {
    env: {
      PGPASSWORD: options.password,
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
