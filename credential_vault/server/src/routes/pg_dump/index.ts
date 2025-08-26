import express from "express";

import { setPgDumpRoutes } from "./pg_dump";

export function makePgDumpRouter() {
  const router = express.Router();

  setPgDumpRoutes(router);

  return router;
}
