import type { Express, Response } from "express";
import type { ServerStatus } from "@keplr-ewallet/ksn-interface/status";
import { getLatestCompletedPgDump } from "@keplr-ewallet/ksn-pg-interface";
import dayjs from "dayjs";

import { logger } from "@keplr-ewallet-ksn-server/logger";

export function addStatusRoutes(app: Express) {
  app.get("/status", async (req, res: Response<ServerStatus>) => {
    const state = req.app.locals;
    const { db } = state;

    let isDbConnected = false;
    try {
      await db.query("SELECT 1");
      isDbConnected = true;
    } catch (err) {
      logger.error("Database connection check failed, err: %s", err);
    }

    let latestBackupTime: string | null = null;
    try {
      const getLatestDumpRes = await getLatestCompletedPgDump(db);
      if (getLatestDumpRes.success) {
        if (getLatestDumpRes.data?.created_at) {
          latestBackupTime = dayjs(
            getLatestDumpRes.data?.created_at,
          ).toISOString();
        }
      } else {
        console.error("Failed to get latest dump:", getLatestDumpRes.err);
      }
    } catch (err: any) {
      logger.error("Get latest pg dump, err: %s", err);
    }

    const status: ServerStatus = {
      is_db_connected: isDbConnected,
      is_db_backup_checked: state.is_db_backup_checked,
      latest_backup_time: latestBackupTime,
      ks_node_public_key: process.env.KS_NODE_PUBLIC_KEY || "to-be-upgraded",
      launch_time: state.launch_time,
      git_hash: state.git_hash,
      version: state.version,
    };

    res.status(200).json(status);
  });
}
