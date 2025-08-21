import { exec } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import os from "node:os";

import { loadEnvs } from "@keplr-ewallet-cv-server/envs";

const execAsync = promisify(exec);

interface DumpOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

async function dump(options: DumpOptions, outputPath: string): Promise<void> {
  const command = `pg_dump -h ${options.host} -p ${options.port} -U ${options.user} -d ${options.database} -Fc -f ${outputPath}`;

  const { stdout, stderr } = await execAsync(command, {
    env: {
      ...process.env,
      PGPASSWORD: options.password,
    },
  });

  if (stderr) {
    console.error("pg_dump stderr:", stderr);
  }

  if (stdout) {
    console.log("pg_dump stdout:", stdout);
  }
}

async function restore(options: DumpOptions, inputPath: string): Promise<void> {
  const command = `pg_restore -h ${options.host} -p ${options.port} -U ${options.user} -d ${options.database} --clean --if-exists --verbose ${inputPath}`;

  const { stdout, stderr } = await execAsync(command, {
    env: {
      ...process.env,
      PGPASSWORD: options.password,
    },
  });

  if (stderr) {
    console.error("pg_restore stderr:", stderr);
  }

  if (stdout) {
    console.log("pg_restore stdout:", stdout);
  }
}

async function main() {
  try {
    const env = loadEnvs();

    console.log("Starting pg_dump...");
    console.log(`Database: ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);

    const dumpDir = process.env.DUMP_DIR || join(os.homedir(), "pg_dumps");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpPath = join(dumpDir, `${env.DB_NAME}_${timestamp}.dump`);

    const options: DumpOptions = {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    };

    await dump(options, dumpPath);

    console.log(`Dump completed successfully: ${dumpPath}`);
  } catch (error) {
    console.error("Dump failed:", error);
    process.exit(1);
  }
}

main();
