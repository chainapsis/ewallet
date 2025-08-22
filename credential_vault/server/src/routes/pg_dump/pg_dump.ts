import { Router, type Response } from "express";
import type { CVApiResponse } from "@keplr-ewallet/credential-vault-interface/response";

import {
  processPgDump,
  type PgDumpResult,
} from "@keplr-ewallet-cv-server/pg_dump/dump";

export function setPgDumpRoutes(router: Router) {
  router.post("/", async (req, res: Response<CVApiResponse<PgDumpResult>>) => {
    const { password } = req.body;
    const state = req.app.locals as any;

    if (password !== state.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        code: "INVALID_PASSWORD",
        msg: "Invalid password",
      });
    }

    const processPgDumpRes = await processPgDump(state.db, {
      database: state.env.DB_NAME,
      host: state.env.DB_HOST,
      password: state.env.DB_PASSWORD,
      user: state.env.DB_USER,
      port: state.env.DB_PORT,
    });
    if (processPgDumpRes.success === false) {
      return res.status(400).json({
        success: false,
        code: "PG_DUMP_FAILED",
        msg: processPgDumpRes.err,
      });
    }

    return res.status(200).json({
      success: true,
      data: processPgDumpRes.data,
    });
  });
}
