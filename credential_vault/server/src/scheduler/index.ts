// import cron from "node-cron";
// import type { Pool } from "pg";
// import type { Result } from "@keplr-ewallet/stdlib-js";
// import { type DumpOptions } from "@keplr-ewallet/credential-vault-pg-interface";

// import type { PgDumpResult } from "@keplr-ewallet-cv-server/pg_dump";
// import { runPgDump, cleanupOldPgDumps } from "@keplr-ewallet-cv-server/pg_dump";

// export async function registerPgDumpScheduler(
//   pool: Pool,
//   dumpOptions: DumpOptions,
//   intervalDays: number,
//   retentionDays: number,
// ): Promise<Result<void, string>> {
//   if (intervalDays <= 0) {
//     return { success: false, err: "intervalDays must be > 0" };
//   }

//   const cronExpression = `0 0 */${intervalDays} * *`;
//   // const cronExpression = `*/${intervalDays} * * * *`; // for testing
//   const scheduler = cron.schedule(cronExpression, () => {
//     runPgDumpScheduler(pool, dumpOptions, retentionDays)
//       .then((result) => {
//         if (result.success === false) {
//           console.error("Error running pg dump scheduler:", result.err);
//         } else {
//           console.log(
//             `Completed pg dump. dumpPath: ${result.data.dumpResult.dumpPath}, dumpSize: ${result.data.dumpResult.dumpSize}, cleanup count: ${result.data.cleanupCount}`,
//           );
//         }
//       })
//       .catch((error) => {
//         console.error("Error running pg dump scheduler:", error);
//       });
//   });
//   scheduler.start();

//   return {
//     success: true,
//     data: void 0,
//   };
// }

// export async function runPgDumpScheduler(
//   pool: Pool,
//   dumpOptions: DumpOptions,
//   retentionDays: number,
// ): Promise<Result<{ dumpResult: PgDumpResult; cleanupCount: number }, string>> {
//   const dumpResult = await runPgDump(pool, dumpOptions);
//   if (dumpResult.success === false) {
//     return {
//       success: false,
//       err: dumpResult.err,
//     };
//   }

//   const cleanupResult = await cleanupOldPgDumps(pool, retentionDays);
//   if (cleanupResult.success === false) {
//     return {
//       success: false,
//       err: cleanupResult.err,
//     };
//   }

//   return {
//     success: true,
//     data: {
//       dumpResult: dumpResult.data,
//       cleanupCount: cleanupResult.data,
//     },
//   };
// }
