import { Router, type Response } from "express";
import type { CVApiResponse } from "@keplr-ewallet/credential-vault-interface/response";

import {
  processPgDump,
  type PgDumpResult,
} from "@keplr-ewallet-cv-server/pg_dump/dump";

export function setPgDumpRoutes(router: Router) {
  /**
   * @swagger
   * /pg_dump/v1/:
   *   post:
   *     tags:
   *       - PG Dump
   *     summary: Request a pg dump
   *     description: Request a pg dump
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               password:
   *                 type: string
   *                 description: The admin password
   *     responses:
   *       200:
   *         description: Successfully requested pg dump
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: "object"
   *                       description: The pg dump result
   *                       properties:
   *                         dump_id:
   *                           type: string
   *                           description: The id of the pg dump
   *                         dump_path:
   *                           type: string
   *                           description: The path to the pg dump
   *                         dump_size:
   *                           type: number
   *                           description: The size of the pg dump
   *                         dump_duration:
   *                           type: number
   *                           description: The duration of the pg dump
   *       500:
   *         description: Failed to process pg dump
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: PG_DUMP_FAILED
   *               msg: "Failed to process pg dump"
   *       401:
   *         description: Invalid password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: INVALID_PASSWORD
   *               msg: "Invalid password"
   */
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
      return res.status(500).json({
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
