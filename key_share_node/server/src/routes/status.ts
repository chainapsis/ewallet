import type { Express, Response } from "express";
import type { ServerStatus } from "@keplr-ewallet/ksn-interface/status";

export function addStatusRoutes(app: Express) {
  app.get("/status", async (req, res: Response<ServerStatus>) => {
    const locals = req.app.locals;

    let is_db_connected = false;
    try {
      await locals.db.query("SELECT 1");
      is_db_connected = true;
    } catch (err) {
      console.log("Error querying db");
    }

    const status: ServerStatus = {
      is_db_connected,
      is_db_backup_checked: locals.is_db_backup_checked,
      latest_backup_time: locals.latest_backup_time,
      ks_node_public_key: process.env.KS_NODE_PUBLIC_KEY,
      launch_time: locals.launch_time,
      git_hash: locals.git_hash,
    };

    res.status(200).json(status);
  });
}
