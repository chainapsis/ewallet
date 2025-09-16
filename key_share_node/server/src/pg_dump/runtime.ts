import type { Pool } from "pg";
import { type PgDumpConfig } from "@keplr-ewallet/credential-vault-pg-interface";

import { sleep } from "@keplr-ewallet-cv-server/utils";
import { deleteOldPgDumps, processPgDump } from "./dump";

export interface PgDumpRuntimeOptions {
  sleepTimeSeconds: number;
  retentionDays: number;
}

export async function startPgDumpRuntime(
  pool: Pool,
  pgConfig: PgDumpConfig,
  pgDumpRuntimeOptions: PgDumpRuntimeOptions,
) {
  const sleepTime = pgDumpRuntimeOptions.sleepTimeSeconds * 1000;
  console.log("Starting pg dump runtime with sleep time:", sleepTime);

  while (true) {
    await sleep(sleepTime);

    const processPgDumpRes = await processPgDump(pool, pgConfig);
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
