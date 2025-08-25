import { Pool } from "pg";
import fs from "node:fs/promises";
import {
  getPgDumpById,
  getAllPgDumps,
  type PgDumpConfig,
} from "@keplr-ewallet/credential-vault-pg-interface";

import {
  createPgDatabase,
  resetPgDatabase,
} from "@keplr-ewallet-cv-server/database";
import { testPgConfig } from "@keplr-ewallet-cv-server/database/test_config";
import { processPgDump } from "@keplr-ewallet-cv-server/pg_dump/dump";

describe("pg_dump_test", () => {
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

  describe("processPgDump", () => {
    const mockPgConfig: PgDumpConfig = {
      database: testPgConfig.database,
      host: testPgConfig.host,
      port: testPgConfig.port,
      user: testPgConfig.user,
      password: testPgConfig.password,
    };

    it("should successfully create pg dump and save to database", async () => {
      const result = await processPgDump(pool, mockPgConfig);

      expect(result.success).toBe(true);
      if (result.success === false) {
        throw new Error(`processPgDump failed: ${result.err}`);
      }

      expect(result.data.dumpId).toBeDefined();
      expect(result.data.dumpPath).toBeDefined();
      expect(result.data.dumpSize).toBeGreaterThan(0);
      expect(result.data.dumpDuration).toBeGreaterThanOrEqual(0);

      const fileExists = await fs
        .access(result.data.dumpPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      const stats = await fs.stat(result.data.dumpPath);
      expect(stats.size).toBe(result.data.dumpSize);

      const dump = await getPgDumpById(pool, result.data.dumpId);
      if (dump.success === false) {
        throw new Error(`getPgDumpById failed: ${dump.err}`);
      }
      expect(dump.data?.status).toBe("COMPLETED");
      expect(dump.data?.dump_path).toBe(result.data.dumpPath);
      expect(dump.data?.meta.dump_size).toBe(result.data.dumpSize);
      expect(dump.data?.meta.dump_duration).toBe(result.data.dumpDuration);
    });

    it("should fail with invalid database configuration", async () => {
      const invalidConfig: PgDumpConfig = {
        database: "non_existent_db",
        host: testPgConfig.host,
        port: testPgConfig.port,
        user: testPgConfig.user,
        password: testPgConfig.password,
      };

      const result = await processPgDump(pool, invalidConfig);

      expect(result.success).toBe(false);
      if (result.success === true) {
        throw new Error(`processPgDump should fail: ${result.data}`);
      }

      const getAllPgDumpsRes = await getAllPgDumps(pool);
      if (getAllPgDumpsRes.success === false) {
        throw new Error(`getAllPgDumps failed: ${getAllPgDumpsRes.err}`);
      }

      expect(getAllPgDumpsRes.data.length).toBe(1);
      expect(getAllPgDumpsRes.data[0].status).toBe("FAILED");
      expect(getAllPgDumpsRes.data[0].dump_path).toBeNull();
      expect(getAllPgDumpsRes.data[0].meta.dump_size).toBeUndefined();
      expect(getAllPgDumpsRes.data[0].meta.dump_duration).toBeUndefined();
    });
  });
});
