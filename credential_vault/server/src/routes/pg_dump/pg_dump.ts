import { Router, type Response } from "express";
import type { CVApiResponse } from "@keplr-ewallet/credential-vault-interface/response";

import {
  processPgDump,
  type PgDumpResult,
} from "@keplr-ewallet-cv-server/pg_dump/dump";
import {
  getAllPgDumps,
  type PgDump,
} from "@keplr-ewallet/credential-vault-pg-interface";

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
   *             $ref: '#/components/schemas/PgDumpRequestBody'
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
   *                       $ref: '#/components/schemas/PgDumpResponse'
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

  /**
   * @swagger
   * /pg_dump/v1/:
   *   get:
   *     tags:
   *       - PG Dump
   *     summary: Get pg dump history
   *     description: Get pg dump history for the specified number of days
   *     parameters:
   *       - in: query
   *         name: days
   *         required: false
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 1000
   *         description: Number of days to look back for dump history (1-1000 days). If not specified, returns all dumps.
   *         example: 30
   *     responses:
   *       200:
   *         description: Successfully retrieved pg dump history
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/PgDump'
   *       400:
   *         description: Invalid days parameter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: INVALID_DAYS
   *               msg: "Days parameter must be between 1 and 1000"
   *       500:
   *         description: Failed to retrieve pg dump history
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNKNOWN_ERROR
   *               msg: "Failed to retrieve pg dump history"
   */
  router.get("/", async (req, res: Response<CVApiResponse<PgDump[]>>) => {
    const { days } = req.query;
    const state = req.app.locals as any;

    let daysNum: number | undefined;
    if (days !== undefined) {
      daysNum = parseInt(days as string, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 1000) {
        return res.status(400).json({
          success: false,
          code: "INVALID_DAYS",
          msg: "Days parameter must be between 1 and 1000",
        });
      }
    }

    const dumpsResult = await getAllPgDumps(state.db, daysNum);
    if (dumpsResult.success === false) {
      return res.status(500).json({
        success: false,
        code: "UNKNOWN_ERROR",
        msg: dumpsResult.err,
      });
    }

    return res.status(200).json({
      success: true,
      data: dumpsResult.data,
    });
  });
}
