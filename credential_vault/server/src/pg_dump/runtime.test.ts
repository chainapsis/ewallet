import { Pool } from "pg";
import fs from "node:fs/promises";
import { getAllPgDumps } from "@keplr-ewallet/credential-vault-pg-interface";

import {
  createPgDatabase,
  resetPgDatabase,
} from "@keplr-ewallet-cv-server/database";
import { testPgConfig } from "@keplr-ewallet-cv-server/database/test_config";
import { startPgDumpRuntime } from "@keplr-ewallet-cv-server/pg_dump/runtime";
import { processPgDump } from "@keplr-ewallet-cv-server/pg_dump/dump";

describe("pg_dump_runtime_test", () => {
  let pool: Pool;

  beforeAll(async () => {
    const config = testPgConfig;
    const createPostgresRes = await createPgDatabase({
      database: config.database,
      host: config.host,
      password: config.password,
      user: config.user,
      port: config.port,
      ssl: config.ssl,
    });

    if (createPostgresRes.success === false) {
      console.error(createPostgresRes.err);
      throw new Error("Failed to create postgres database");
    }

    pool = createPostgresRes.data;
  });

  beforeEach(async () => {
    await resetPgDatabase(pool);
  });

  describe("startPgDumpRuntime", () => {
    const mockPgConfig = {
      database: testPgConfig.database,
      host: testPgConfig.host,
      port: testPgConfig.port,
      user: testPgConfig.user,
      password: testPgConfig.password,
    };

    it("should run complete runtime workflow with multiple scenarios", async () => {
      const dump1 = await processPgDump(pool, mockPgConfig);
      expect(dump1.success).toBe(true);
      const dump2 = await processPgDump(pool, mockPgConfig);
      expect(dump2.success).toBe(true);
      const dump3 = await processPgDump(pool, mockPgConfig);
      expect(dump3.success).toBe(true);

      const initialDumpIds = [
        dump1.success ? dump1.data.dumpId : null,
        dump2.success ? dump2.data.dumpId : null,
        dump3.success ? dump3.data.dumpId : null,
      ].filter((id) => id !== null);

      // update dump created_at to 2 days ago
      await pool.query(
        `
        UPDATE pg_dumps 
        SET created_at = created_at - INTERVAL '2 days'
        WHERE dump_id IN (${initialDumpIds.map((_, i) => `$${i + 1}`).join(", ")})
      `,
        initialDumpIds,
      );

      // check if old dumps are set correctly
      const oldDumps = await getAllPgDumps(pool);
      expect(oldDumps.success).toBe(true);
      if (oldDumps.success === false) {
        throw new Error(`getAllPgDumps failed: ${oldDumps.err}`);
      }

      const oldCompletedDumps = oldDumps.data.filter(
        (dump) =>
          dump.status === "COMPLETED" && initialDumpIds.includes(dump.dump_id),
      );
      expect(oldCompletedDumps.length).toBe(3);

      // start runtime (1 day retention)
      const runtimeOptions = {
        sleepTimeSeconds: 1,
        retentionDays: 1,
      };

      startPgDumpRuntime(pool, mockPgConfig, runtimeOptions);

      // wait for 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // check if new dumps are created
      const allDumps = await getAllPgDumps(pool);
      expect(allDumps.success).toBe(true);
      if (allDumps.success === false) {
        throw new Error(`getAllPgDumps failed: ${allDumps.err}`);
      }

      // check if new dumps are created
      const newCompletedDumps = allDumps.data.filter(
        (dump) =>
          dump.status === "COMPLETED" && !initialDumpIds.includes(dump.dump_id),
      );
      expect(newCompletedDumps.length).toBeGreaterThanOrEqual(2);

      // check if new dumps are created
      for (const dump of newCompletedDumps) {
        if (dump.dump_path) {
          const fileExists = await fs
            .access(dump.dump_path)
            .then(() => true)
            .catch(() => false);
          expect(fileExists).toBe(true);

          const fileBuffer = await fs.readFile(dump.dump_path);
          expect(fileBuffer.toString("ascii", 0, 5)).toBe("PGDMP");
        }
      }

      // check if old dumps are deleted
      const deletedDumps = allDumps.data.filter(
        (dump) =>
          dump.status === "DELETED" && initialDumpIds.includes(dump.dump_id),
      );
      expect(deletedDumps.length).toBe(3);

      // check if deleted dumps are deleted
      for (const dump of deletedDumps) {
        if (dump.dump_path) {
          const fileExists = await fs
            .access(dump.dump_path)
            .then(() => true)
            .catch(() => false);
          expect(fileExists).toBe(false);
        }
      }

      // check if total dump count is correct
      expect(allDumps.data.length).toBeGreaterThanOrEqual(5);
    }, 15000);
  });
});
