import request from "supertest";
import express from "express";
import { Pool } from "pg";
import fs from "node:fs/promises";
import {
  getPgDumpById,
  getAllPgDumps,
} from "@keplr-ewallet/credential-vault-pg-interface";

import {
  createPgDatabase,
  resetPgDatabase,
} from "@keplr-ewallet-cv-server/database";
import { testPgConfig } from "@keplr-ewallet-cv-server/database/test_config";
import { setPgDumpRoutes } from "@keplr-ewallet-cv-server/routes/pg_dump/pg_dump";

describe("pg_dump_route_test", () => {
  let pool: Pool;
  let app: express.Application;
  const testAdminPassword = "test_admin_password";

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

    app = express();
    app.use(express.json());

    const router = express.Router();
    setPgDumpRoutes(router);
    app.use("/pg_dump/v1", router);

    app.locals = {
      db: pool,
      env: {
        ADMIN_PASSWORD: testAdminPassword,
        DB_NAME: testPgConfig.database,
        DB_HOST: testPgConfig.host,
        DB_PASSWORD: testPgConfig.password,
        DB_USER: testPgConfig.user,
        DB_PORT: testPgConfig.port,
      },
    };
  });

  beforeEach(async () => {
    await resetPgDatabase(pool);
  });

  describe("POST /pg_dump/v1/", () => {
    it("should successfully create pg dump with valid password", async () => {
      const response = await request(app)
        .post("/pg_dump/v1/")
        .send({ password: testAdminPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.dumpId).toBeDefined();
      expect(response.body.data.dumpPath).toBeDefined();
      expect(response.body.data.dumpSize).toBeGreaterThan(0);
      expect(response.body.data.dumpDuration).toBeGreaterThanOrEqual(0);

      const dbDump = await getPgDumpById(pool, response.body.data.dumpId);
      expect(dbDump.success).toBe(true);
      if (dbDump.success === false) {
        throw new Error(`getPgDumpById failed: ${dbDump.err}`);
      }
      expect(dbDump.data?.status).toBe("COMPLETED");
      expect(dbDump.data?.dump_path).toBe(response.body.data.dumpPath);
      expect(dbDump.data?.meta.dump_size).toBe(response.body.data.dumpSize);
      expect(dbDump.data?.meta.dump_duration).toBe(
        response.body.data.dumpDuration,
      );

      const fileExists = await fs
        .access(response.body.data.dumpPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      const stats = await fs.stat(response.body.data.dumpPath);
      expect(stats.size).toBe(response.body.data.dumpSize);

      const fileBuffer = await fs.readFile(response.body.data.dumpPath);
      expect(fileBuffer.toString("ascii", 0, 5)).toBe("PGDMP");
    });

    it("should fail with invalid password", async () => {
      const response = await request(app)
        .post("/pg_dump/v1/")
        .send({ password: "wrong_password" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_PASSWORD");
      expect(response.body.msg).toBe("Invalid password");
    });

    it("should fail with missing password", async () => {
      const response = await request(app)
        .post("/pg_dump/v1/")
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_PASSWORD");
      expect(response.body.msg).toBe("Invalid password");
    });

    it("should fail with empty password", async () => {
      const response = await request(app)
        .post("/pg_dump/v1/")
        .send({ password: "" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("INVALID_PASSWORD");
      expect(response.body.msg).toBe("Invalid password");
    });

    it("should handle database configuration errors", async () => {
      const invalidApp = express();
      invalidApp.use(express.json());

      const router = express.Router();
      setPgDumpRoutes(router);
      invalidApp.use("/pg_dump/v1", router);

      invalidApp.locals = {
        db: pool,
        env: {
          ADMIN_PASSWORD: testAdminPassword,
          DB_NAME: "non_existent_db",
          DB_HOST: testPgConfig.host,
          DB_PASSWORD: testPgConfig.password,
          DB_USER: testPgConfig.user,
          DB_PORT: testPgConfig.port,
        },
      };

      const response = await request(invalidApp)
        .post("/pg_dump/v1/")
        .send({ password: testAdminPassword })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("PG_DUMP_FAILED");
      expect(response.body.msg).toContain("database");

      const allDumps = await getAllPgDumps(pool);
      expect(allDumps.success).toBe(true);
      if (allDumps.success === false) {
        throw new Error(`getAllPgDumps failed: ${allDumps.err}`);
      }

      const failedDumps = allDumps.data.filter(
        (dump) => dump.status === "FAILED",
      );
      expect(failedDumps.length).toBe(1);
      expect(failedDumps[0].dump_path).toBeNull();
      expect(failedDumps[0].meta.error).toContain("database");
    });

    it("should handle authentication errors", async () => {
      const invalidApp = express();
      invalidApp.use(express.json());

      const router = express.Router();
      setPgDumpRoutes(router);
      invalidApp.use("/pg_dump/v1", router);

      invalidApp.locals = {
        db: pool,
        env: {
          ADMIN_PASSWORD: testAdminPassword,
          DB_NAME: testPgConfig.database,
          DB_HOST: testPgConfig.host,
          DB_PASSWORD: "wrong_password",
          DB_USER: testPgConfig.user,
          DB_PORT: testPgConfig.port,
        },
      };

      const response = await request(invalidApp)
        .post("/pg_dump/v1/")
        .send({ password: testAdminPassword })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe("PG_DUMP_FAILED");
      expect(response.body.msg).toContain("authentication");

      const allDumps = await getAllPgDumps(pool);
      expect(allDumps.success).toBe(true);
      if (allDumps.success === false) {
        throw new Error(`getAllPgDumps failed: ${allDumps.err}`);
      }

      const failedDumps = allDumps.data.filter(
        (dump) => dump.status === "FAILED",
      );
      expect(failedDumps.length).toBe(1);
      expect(failedDumps[0].dump_path).toBeNull();
      expect(failedDumps[0].meta.error).toContain("authentication");
    });

    it("should handle multiple concurrent requests", async () => {
      const promises = Array.from({ length: 3 }, () =>
        request(app)
          .post("/pg_dump/v1/")
          .send({ password: testAdminPassword })
          .expect(200),
      );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.dumpId).toBeDefined();
        expect(response.body.data.dumpPath).toBeDefined();
      });

      const dumpIds = responses.map((r) => r.body.data.dumpId);
      const uniqueDumpIds = new Set(dumpIds);
      expect(uniqueDumpIds.size).toBe(3);

      for (const response of responses) {
        const dbDump = await getPgDumpById(pool, response.body.data.dumpId);
        expect(dbDump.success).toBe(true);
        if (dbDump.success) {
          expect(dbDump.data?.status).toBe("COMPLETED");
          expect(dbDump.data?.dump_path).toBe(response.body.data.dumpPath);
        }

        const fileExists = await fs
          .access(response.body.data.dumpPath)
          .then(() => true)
          .catch(() => false);
        expect(fileExists).toBe(true);

        const fileBuffer = await fs.readFile(response.body.data.dumpPath);
        expect(fileBuffer.toString("ascii", 0, 5)).toBe("PGDMP");
      }
    });
  });
});
