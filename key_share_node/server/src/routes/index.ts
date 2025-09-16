import type { Express } from "express";

import { makeKeyshareRouter } from "./key_share";
import { makeCommitRouter } from "./commit";
import { makePgDumpRouter } from "./pg_dump";

export function setRoutes(app: Express) {
  const keyshareRouter = makeKeyshareRouter();
  app.use("/keyshare/v1", keyshareRouter);

  const pgDumpRouter = makePgDumpRouter();
  app.use("/pg_dump/v1", pgDumpRouter);

  const commitRouter = makeCommitRouter();
  app.use("/commit/v1", commitRouter);
}
