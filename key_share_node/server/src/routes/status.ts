import type { Express, Response } from "express";
import type { ServerStatus } from "@keplr-ewallet/ksn-interface/status";

export function addStatusRoutes(app: Express) {
  app.get<any, Response<ServerStatus>>("/status", async (req, res) => {
    res.status(200).json({
      power: 1,
    });
  });
}
