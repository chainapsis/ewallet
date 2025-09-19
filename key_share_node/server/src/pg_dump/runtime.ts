import type { Pool } from "pg";
import chalk from "chalk";
import { type PgDumpConfig } from "@keplr-ewallet/ksn-pg-interface";

import { sleep } from "@keplr-ewallet-ksn-server/utils/time";
import { deleteOldPgDumps, processPgDump } from "./dump";

export interface PgDumpRuntimeOptions {
  dumpDir: string;
  sleepTimeSeconds: number;
  retentionDays: number;
}

export async function startPgDumpRuntime(
  pool: Pool,
  pgConfig: PgDumpConfig,
  pgDumpRuntimeOptions: PgDumpRuntimeOptions,
) {
  const sleepTime = pgDumpRuntimeOptions.sleepTimeSeconds * 1000;

  console.log(
    "%s pg dump runtime, sleep time: %s",
    chalk.bold.green("Start"),
    sleepTime,
  );

  while (true) {
    await sleep(sleepTime);

    const processPgDumpRes = await processPgDump(
      pool,
      pgConfig,
      pgDumpRuntimeOptions.dumpDir,
    );
    if (processPgDumpRes.success === false) {
      console.error("Error processing pg dump:", processPgDumpRes.err);
    } else {
      const { dumpId, dumpPath, dumpSize, dumpDuration } =
        processPgDumpRes.data;
      console.log(
        `Completed pg dump ${dumpId} in ${dumpDuration}s, path: ${dumpPath}, size: ${dumpSize} bytes`,
      );
    }

    const deleteOldPgDumpsRes = await deleteOldPgDumps(
      pool,
      pgDumpRuntimeOptions.retentionDays,
    );
    if (deleteOldPgDumpsRes.success === false) {
      console.error("Error deleting old pg dumps:", deleteOldPgDumpsRes.err);
    } else {
      console.log(`Deleted ${deleteOldPgDumpsRes.data} old pg dumps`);
    }
  }
}
