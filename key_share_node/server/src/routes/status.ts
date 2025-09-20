import type { Express, Response } from "express";
import type { ServerStatus } from "@keplr-ewallet/ksn-interface/status";
import { getLatestCompletedPgDump } from "@keplr-ewallet/ksn-pg-interface";

export function addStatusRoutes(app: Express) {
  app.get("/status", async (req, res: Response<ServerStatus>) => {
    const state = req.app.locals;
    const { db } = state;

    let isDbConnected = false;
    try {
      await db.query("SELECT 1");
      isDbConnected = true;
    } catch (error) {
      console.error("Database connection check failed:", error);
    }

    let latestBackupTime: Date | null = null;
    const getLatestDumpRes = await getLatestCompletedPgDump(db);
    if (getLatestDumpRes.success) {
      latestBackupTime = getLatestDumpRes.data?.created_at || null;
    } else {
      console.error("Failed to get latest dump:", getLatestDumpRes.err);
    }

    const status: ServerStatus = {
      is_db_connected: isDbConnected,
      is_db_backup_checked: state.is_db_backup_checked,
      latest_backup_time: latestBackupTime,
      ks_node_public_key: process.env.KS_NODE_PUBLIC_KEY || "to-be-upgraded",
      launch_time: state.launch_time,
      git_hash: state.git_hash,
    };

    res.status(200).json(status);
  });
}
