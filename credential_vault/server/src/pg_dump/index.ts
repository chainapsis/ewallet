import { join } from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import cron from "node-cron";
import type { Pool } from "pg";
import type { Result } from "@keplr-ewallet/stdlib-js";

import {
  dump,
  createPgDumpLog,
  getOldPgDumpLogs,
  markPgDumpLogAsDeleted,
  type DumpOptions,
} from "@keplr-ewallet/credential-vault-pg-interface";

const DUMP_DIR = join(os.homedir(), "pg_dumps");

interface PgDumpResult {
  logId: string;
  dumpPath: string;
  dumpSize: number;
  timestamp: Date;
}

export async function runPgDump(
  pool: Pool,
  dumpOptions: DumpOptions,
): Promise<Result<PgDumpResult, string>> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dumpFile = `${dumpOptions.database}_${timestamp}.dump`;

    const dumpResult = await dump(dumpOptions, DUMP_DIR, dumpFile);
    if (dumpResult.success === false) {
      return {
        success: false,
        err: dumpResult.err,
      };
    }

    const stats = await fs.stat(dumpResult.data.dumpPath);
    const dumpSize = stats.size;

    const logResult = await createPgDumpLog(
      pool,
      dumpResult.data.dumpPath,
      dumpSize,
    );
    if (logResult.success === false) {
      return {
        success: false,
        err: logResult.err,
      };
    }

    return {
      success: true,
      data: {
        logId: logResult.data.log_id,
        dumpPath: dumpResult.data.dumpPath,
        dumpSize,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function cleanupOldPgDumps(
  pool: Pool,
  retentionDays: number,
): Promise<Result<number, string>> {
  try {
    const oldLogsResult = await getOldPgDumpLogs(pool, retentionDays);
    if (oldLogsResult.success === false) {
      return {
        success: false,
        err: oldLogsResult.err,
      };
    }

    for (const log of oldLogsResult.data) {
      try {
        await fs.unlink(log.dump_path);
        await markPgDumpLogAsDeleted(pool, log.log_id);
      } catch {
        await markPgDumpLogAsDeleted(pool, log.log_id);
      }
    }

    return {
      success: true,
      data: oldLogsResult.data.length,
    };
  } catch (error) {
    return {
      success: false,
      err: String(error),
    };
  }
}

export async function runPgDumpScheduler(
  pool: Pool,
  dumpOptions: DumpOptions,
  retentionDays: number,
): Promise<Result<{ dumpResult: PgDumpResult; cleanupCount: number }, string>> {
  const dumpResult = await runPgDump(pool, dumpOptions);
  if (dumpResult.success === false) {
    return {
      success: false,
      err: dumpResult.err,
    };
  }

  const cleanupResult = await cleanupOldPgDumps(pool, retentionDays);
  if (cleanupResult.success === false) {
    return {
      success: false,
      err: cleanupResult.err,
    };
  }

  return {
    success: true,
    data: {
      dumpResult: dumpResult.data,
      cleanupCount: cleanupResult.data,
    },
  };
}

export async function registerPgDumpScheduler(
  pool: Pool,
  dumpOptions: DumpOptions,
  intervalDays: number,
  retentionDays: number,
): Promise<Result<void, string>> {
  if (intervalDays <= 0) {
    return { success: false, err: "intervalDays must be > 0" };
  }

  const cronExpression = `0 0 */${intervalDays} * *`;
  // const cronExpression = `*/${intervalDays} * * * *`; // for testing
  const scheduler = cron.schedule(cronExpression, () => {
    runPgDumpScheduler(pool, dumpOptions, retentionDays)
      .then((result) => {
        if (result.success === false) {
          console.error("Error running pg dump scheduler:", result.err);
        } else {
          console.log(
            `Completed pg dump. dumpPath: ${result.data.dumpResult.dumpPath}, dumpSize: ${result.data.dumpResult.dumpSize}, cleanup count: ${result.data.cleanupCount}`,
          );
        }
      })
      .catch((error) => {
        console.error("Error running pg dump scheduler:", error);
      });
  });
  scheduler.start();

  return {
    success: true,
    data: void 0,
  };
}
