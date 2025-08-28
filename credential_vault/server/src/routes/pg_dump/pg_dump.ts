import { Router, type Response } from "express";
import type { CVApiResponse } from "@keplr-ewallet/credential-vault-interface/response";
import {
  getAllPgDumps,
  getPgDumpById,
  restore,
  type PgDump,
} from "@keplr-ewallet/credential-vault-pg-interface";

import {
  processPgDump,
  type PgDumpResult,
} from "@keplr-ewallet-cv-server/pg_dump/dump";
import {
  adminAuthMiddleware,
  type AdminAuthenticatedRequest,
} from "@keplr-ewallet-cv-server/middlewares/admin_auth";

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
   *         description: Invalid admin password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               code: UNAUTHORIZED
   *               msg: "Invalid admin password"
   */
  router.post(
    "/",
    adminAuthMiddleware,
    async (
      req: AdminAuthenticatedRequest,
      res: Response<CVApiResponse<PgDumpResult>>,
    ) => {
      const state = req.app.locals as any;

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
    },
  );

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

  router.post(
    "/restore",
    adminAuthMiddleware,
    async (
      req: AdminAuthenticatedRequest<{ dump_id: string }>,
      res: Response<CVApiResponse<{ dump_id: string }>>,
    ) => {
      const state = req.app.locals as any;

      const dumpId = req.body.dump_id;

      const getPgDumpRes = await getPgDumpById(state.db, dumpId);
      if (getPgDumpRes.success === false) {
        return res.status(500).json({
          success: false,
          code: "UNKNOWN_ERROR",
          msg: `getPgDumpById failed: ${getPgDumpRes.err}`,
        });
      }

      if (getPgDumpRes.data === null) {
        return res.status(404).json({
          success: false,
          code: "PG_DUMP_NOT_FOUND",
          msg: `Pg dump not found: ${dumpId}`,
        });
      }

      const pgDump = getPgDumpRes.data;

      if (pgDump.status !== "COMPLETED" || pgDump.dump_path === null) {
        return res.status(404).json({
          success: false,
          code: "INVALID_PG_DUMP",
          msg: `Invalid pg dump: ${dumpId}`,
        });
      }

      const restoreRes = await restore(
        {
          database: state.env.DB_NAME,
          host: state.env.DB_HOST,
          password: state.env.DB_PASSWORD,
          user: state.env.DB_USER,
          port: state.env.DB_PORT,
        },
        pgDump.dump_path,
      );
      if (restoreRes.success === false) {
        return res.status(500).json({
          success: false,
          code: "PG_RESTORE_FAILED",
          msg: restoreRes.err,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          dump_id: pgDump.dump_id,
        },
      });
    },
  );
}
